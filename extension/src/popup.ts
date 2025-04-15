// This script handles the popup UI when the user clicks on the extension icon
import { getCardClass, getCardDetails, findFormFields, debugLog, testBackendConnection } from './utils';

// DOM elements
const recommendationsEl = document.getElementById('recommendations') as HTMLElement;
const loadingEl = document.getElementById('loading') as HTMLElement;
const errorEl = document.getElementById('error') as HTMLElement;
const preferencesEl = document.getElementById('preferences') as HTMLElement;
const mainContentEl = document.getElementById('main-content') as HTMLElement;
const showPreferencesBtn = document.getElementById('show-preferences') as HTMLElement;
const preferencesBackBtn = document.getElementById('preferences-back') as HTMLElement;
const preferencesForm = document.getElementById('preferences-form') as HTMLFormElement;

// Interface for user preferences
interface UserPreferences {
  preferredIssuers: string[];
  preferredNetworks: string[];
  maxAnnualFee: number | null;
}

// Function to get active tab information
async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0] || null;
  } catch (error) {
    console.error('Error getting active tab:', error);
    return null;
  }
}

// Function to extract merchant name from URL
function extractMerchantFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const domain = hostname.replace('www.', '').split('.')[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return 'Unknown';
  }
}

// Fill in credit card details on the active tab
async function fillCardDetails(cardName: string): Promise<void> {
  const tab = await getActiveTab();
  if (!tab || !tab.id) return;
  
  try {
    // Show loading notification in popup
    showNotification(`Filling in ${cardName} details...`, 'info');
    
    // Execute script in the active tab to fill card details
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (cardName) => {
        // Get the card details function from the injected content script
        // @ts-ignore - This function is defined in content.ts and exposed to window
        const fillCardDetailsFunc = window.fillCardDetails || function() {
          return { success: false, filledCount: 0, message: "Card detail filling is not available" };
        };
        
        // Call the function with the card name
        return fillCardDetailsFunc(cardName);
      },
      args: [cardName]
    }).then((results) => {
      // Handle the results
      const result = results[0]?.result;
      if (result?.success) {
        showNotification(result.message, 'success');
      } else {
        showNotification(result?.message || 'Failed to fill card details', 'error');
      }
      console.log('Card filling results:', results);
    }).catch((error) => {
      showNotification(`Error: ${error.message}`, 'error');
      console.error('Error filling card details:', error);
    });
  } catch (error) {
    showNotification(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    console.error('Error in fillCardDetails:', error);
  }
}

// Function to show a notification in the popup
function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  // Remove any existing notifications
  const existingNotification = document.getElementById('notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.style.position = 'fixed';
  notification.style.top = '10px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.padding = '10px 15px';
  notification.style.borderRadius = '4px';
  notification.style.fontSize = '14px';
  notification.style.textAlign = 'center';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.transition = 'opacity 0.3s';
  
  // Set colors based on type
  if (type === 'success') {
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
  } else if (type === 'error') {
    notification.style.backgroundColor = '#F44336';
    notification.style.color = 'white';
  } else {
    notification.style.backgroundColor = '#2196F3';
    notification.style.color = 'white';
  }
  
  notification.textContent = message;
  
  // Add to DOM
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Wait for document to be ready
document.addEventListener('DOMContentLoaded', init);

// Initialize function
async function init() {
  try {
    // Setup tab navigation
    setupTabs();
    
    // Setup header buttons
    setupHeaderButtons();
    
    // Load user preferences
    const preferences = await loadUserPreferences();
    
    // Update the preferences form with saved values
    updatePreferencesForm(preferences);
    
    // Test backend connection
    const connectionStatus = await testBackendConnection();
    if (!connectionStatus.success) {
      console.warn('Backend connection issue:', connectionStatus.message);
    }
    
    // Check if we're on a checkout page
    chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, async (response) => {
      if (response && response.isCheckout) {
        // We're on a checkout page, get recommendations and switch to recommendations tab
        selectTab('recommendations');
        await getRecommendations(response.merchant, response.amount);
      } else {
        // Show the homepage by default
        selectTab('home');
        
        // Load recommendation simulation in the background
        simulateRecommendations();
      }
    });
    
    // Set up preferences navigation
    setupPreferencesNavigation();
    
    // Setup preferences container
    setupPreferencesContainer();
    
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('An error occurred while initializing');
  }
}

// Setup tab navigation
function setupTabs() {
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      if (tabId) {
        selectTab(tabId);
      }
    });
  });
}

// Select a tab programmatically
function selectTab(tabId: string) {
  // Remove active class from all tabs and tab contents
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Add active class to selected tab and content
  const selectedTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const selectedContent = document.getElementById(tabId);
  
  if (selectedTab && selectedContent) {
    selectedTab.classList.add('active');
    selectedContent.classList.add('active');
  }
  
  // Special handling for recommendations tab
  if (tabId === 'recommendations') {
    const recommendationsContainer = document.getElementById('recommendations-container');
    const loadingElement = document.getElementById('loading');
    
    if (recommendationsContainer && loadingElement) {
      if (recommendationsContainer.innerHTML === '') {
        // If no recommendations loaded yet, show loading indicator
        loadingElement.style.display = 'block';
        recommendationsContainer.style.display = 'none';
      }
    }
  }
}

// Setup header buttons
function setupHeaderButtons() {
  const refreshBtn = document.getElementById('refresh-btn');
  const settingsBtn = document.getElementById('settings-btn');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      const activeTab = document.querySelector('.tab.active');
      if (activeTab) {
        const tabId = activeTab.getAttribute('data-tab');
        if (tabId === 'recommendations') {
          refreshRecommendations();
        } else if (tabId === 'home') {
          refreshHomeDashboard();
        }
      }
    });
  }
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showPreferences();
    });
  }
}

// Function to refresh the recommendations
async function refreshRecommendations() {
  const recommendationsContainer = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsContainer && loadingElement && errorElement) {
    recommendationsContainer.style.display = 'none';
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    
    try {
      chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, async (response) => {
        if (response && response.isCheckout) {
          await getRecommendations(response.merchant, response.amount);
        } else {
          await simulateRecommendations();
        }
      });
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
      showError('Error refreshing recommendations');
    }
  }
}

// Function to refresh the home dashboard data
function refreshHomeDashboard() {
  // This would typically call an API to get updated stats
  // For now, let's just show a notification
  showNotification('Dashboard refreshed', 'success');
}

// Setup preferences navigation
function setupPreferencesNavigation() {
  const preferencesEl = document.getElementById('preferences');
  const showPreferencesBtn = document.getElementById('settings-btn'); // Now using the header button
  const preferencesBackBtn = document.getElementById('preferences-back');
  const preferencesForm = document.getElementById('preferences-form');
  
  if (preferencesBackBtn) {
    preferencesBackBtn.addEventListener('click', hidePreferences);
  }
  
  if (preferencesForm) {
    preferencesForm.addEventListener('submit', savePreferences);
  }
}

// Show preferences tab
function showPreferences() {
  const recommendationsEl = document.getElementById('recommendations-container');
  const preferencesEl = document.getElementById('preferences-container');
  
  if (recommendationsEl && preferencesEl) {
    (recommendationsEl as HTMLElement).style.display = 'none';
    (preferencesEl as HTMLElement).style.display = 'block';
    
    // Load saved preferences
    loadPreferences();
  }
}

// Hide preferences tab and show recommendations
function hidePreferences() {
  const recommendationsEl = document.getElementById('recommendations-container');
  const preferencesEl = document.getElementById('preferences-container');
  
  if (recommendationsEl && preferencesEl) {
    (recommendationsEl as HTMLElement).style.display = 'block';
    (preferencesEl as HTMLElement).style.display = 'none';
  }
}

// Load saved preferences from storage
function loadPreferences() {
  chrome.storage.sync.get(['cardPreferences'], (result) => {
    const preferences = result.cardPreferences || {};
    
    // Populate dropdown for default card
    const defaultCardSelect = document.getElementById('defaultCard') as HTMLSelectElement;
    if (defaultCardSelect) {
      defaultCardSelect.value = preferences.defaultCard || '';
    }
    
    // Populate checkboxes for enabled cards
    const enabledCards = preferences.enabledCards || [];
    document.querySelectorAll('.card-checkbox').forEach((checkbox: Element) => {
      const cardCheckbox = checkbox as HTMLInputElement;
      cardCheckbox.checked = enabledCards.includes(cardCheckbox.value);
    });
  });
}

// Save preferences
async function savePreferences(e: Event) {
  e.preventDefault();
  
  // Get all selected issuers
  const issuerCheckboxes = document.querySelectorAll('input[name="issuer"]:checked') as NodeListOf<HTMLInputElement>;
  const preferredIssuers = Array.from(issuerCheckboxes).map(checkbox => checkbox.value);
  
  // Get all selected networks
  const networkCheckboxes = document.querySelectorAll('input[name="network"]:checked') as NodeListOf<HTMLInputElement>;
  const preferredNetworks = Array.from(networkCheckboxes).map(checkbox => checkbox.value);
  
  // Get max annual fee
  const maxFeeInput = document.getElementById('max-annual-fee') as HTMLInputElement;
  const maxAnnualFee = maxFeeInput.value ? parseInt(maxFeeInput.value, 10) : null;
  
  // Save to storage
  const preferences: UserPreferences = {
    preferredIssuers,
    preferredNetworks,
    maxAnnualFee
  };
  
  await new Promise<void>((resolve) => {
    chrome.storage.sync.set(preferences, () => {
      resolve();
    });
  });
  
  // Show notification and hide preferences
  showNotification('Preferences saved', 'success');
  hidePreferences();
  
  // Refresh active content
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const tabId = activeTab.getAttribute('data-tab');
    if (tabId === 'recommendations') {
      refreshRecommendations();
    }
  }
}

// Load user preferences from storage
async function loadUserPreferences(): Promise<UserPreferences> {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      preferredIssuers: [],
      preferredNetworks: [],
      maxAnnualFee: null
    }, (items) => {
      resolve(items as UserPreferences);
    });
  });
}

// Update the preferences form with saved values
function updatePreferencesForm(preferences: UserPreferences) {
  // Update issuer checkboxes
  const issuerCheckboxes = document.querySelectorAll('input[name="issuer"]') as NodeListOf<HTMLInputElement>;
  issuerCheckboxes.forEach(checkbox => {
    checkbox.checked = preferences.preferredIssuers.includes(checkbox.value);
  });
  
  // Update network checkboxes
  const networkCheckboxes = document.querySelectorAll('input[name="network"]') as NodeListOf<HTMLInputElement>;
  networkCheckboxes.forEach(checkbox => {
    checkbox.checked = preferences.preferredNetworks.includes(checkbox.value);
  });
  
  // Update max annual fee
  const maxFeeInput = document.getElementById('max-annual-fee') as HTMLInputElement;
  if (preferences.maxAnnualFee !== null) {
    maxFeeInput.value = preferences.maxAnnualFee.toString();
  } else {
    maxFeeInput.value = '';
  }
}

// Get recommendations from backend via background script
async function getRecommendations(merchant: string, amount: number) {
  const recommendationsContainer = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsContainer && loadingElement && errorElement) {
    recommendationsContainer.style.display = 'none';
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    
    try {
      // Load user preferences
      const preferences = await loadUserPreferences();
      
      // Send message to background script to get recommendations
      chrome.runtime.sendMessage({
        action: 'getRecommendations',
        merchant,
        amount,
        preferences
      }, (response) => {
        if (response && response.success && response.recommendations) {
          renderRecommendations(response.recommendations, merchant, amount);
        } else {
          showError('Unable to get recommendations');
        }
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showError('Error getting recommendations');
    }
  }
}

// Simulate recommendations for demo
async function simulateRecommendations() {
  const recommendationsContainer = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsContainer && loadingElement && errorElement) {
    try {
      const demoMerchant = 'Amazon';
      const demoAmount = 40.50;
      
      // Load user preferences
      const preferences = await loadUserPreferences();
      
      // Send message to background script to get recommendations
      chrome.runtime.sendMessage({
        action: 'getRecommendations',
        merchant: demoMerchant,
        amount: demoAmount,
        preferences
      }, (response) => {
        if (response && response.success && response.recommendations) {
          renderRecommendations(response.recommendations, demoMerchant, demoAmount);
        } else {
          showError('Unable to get recommendations');
        }
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      showError('Error getting recommendations');
    }
  }
}

// Render recommendations in the UI
function renderRecommendations(recommendations: any, merchant: string, amount: number) {
  const recommendationsEl = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsEl && loadingElement && errorElement) {
    // Hide loading indicator
    loadingElement.style.display = 'none';
    errorElement.style.display = 'none';
    
    // Clear recommendations container
    recommendationsEl.innerHTML = '';
    
    if (!recommendations || !recommendations.length) {
      showError('No recommendations found');
      return;
    }
    
    // Sort recommendations by cashback percentage (descending)
    recommendations.sort((a: any, b: any) => b.cashback_percentage - a.cashback_percentage);

    let html = '<div class="recommendations-container">';
    
    // Display the best recommendation prominently
    const bestRec = recommendations[0];
    html += `
      <div class="best-card">
        <h3>Best Card for this Purchase</h3>
        <div class="card ${getCardClass(bestRec.name)}">
          <div class="card-info">
            <h4>${bestRec.name}</h4>
            <p class="cashback">${bestRec.cashback_percentage}% cashback</p>
            <p class="category">${bestRec.category || 'General Purchase'}</p>
          </div>
        </div>
      </div>
    `;
    
    // Display other recommendations
    if (recommendations.length > 1) {
      html += '<div class="other-cards"><h3>Other Options</h3><div class="cards-grid">';
      
      for (let i = 1; i < Math.min(recommendations.length, 4); i++) {
        const rec = recommendations[i];
        html += `
          <div class="card-small ${getCardClass(rec.name)}">
            <div class="card-info-small">
              <h5>${rec.name}</h5>
              <p class="cashback-small">${rec.cashback_percentage}%</p>
            </div>
          </div>
        `;
      }
      
      html += '</div></div>';
    }
    
    html += `
      <div class="action-buttons">
        <button id="useCardBtn" class="primary-button">Use ${bestRec.name}</button>
        <button id="editPrefsBtn" class="secondary-button">Edit Preferences</button>
      </div>
    `;
    
    html += '</div>';
    
    recommendationsEl.innerHTML = html;
    
    // Add event listeners
    document.getElementById('useCardBtn')?.addEventListener('click', () => {
      fillCardDetails(bestRec.name);
    });
    
    document.getElementById('editPrefsBtn')?.addEventListener('click', () => {
      showPreferences();
    });
  }
}

// Show loading indicator
function showLoading() {
  const recommendationsContainer = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsContainer && loadingElement && errorElement) {
    recommendationsContainer.style.display = 'none';
    errorElement.style.display = 'none';
    loadingElement.style.display = 'block';
  }
}

// Show error message
function showError(message: string) {
  const recommendationsContainer = document.getElementById('recommendations-container');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  
  if (recommendationsContainer && loadingElement && errorElement) {
    recommendationsContainer.style.display = 'none';
    loadingElement.style.display = 'none';
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

// Setup preferences container event listeners
function setupPreferencesContainer() {
  const preferencesEl = document.getElementById('preferences-container');
  if (!preferencesEl) return;
  
  // Add save button listener
  const saveBtn = document.getElementById('save-preferences');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      savePreferences(e);
    });
  }
  
  // Add back button listener
  const backBtn = document.getElementById('back-to-recommendations');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      hidePreferences();
    });
  }
} 