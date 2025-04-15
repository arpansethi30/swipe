// This script handles the popup UI when the user clicks on the extension icon
import { getCardClass, getCardImageUrl, getCardDetails, findFormFields, debugLog, testBackendConnection } from './utils';

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

// Interface for recommendation
interface CardRecommendation {
  name: string;
  cashback_percentage: number;
  cashback_amount: number;
  category?: string;
  benefits?: string[];
  issuer?: string;
  network?: string;
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
  try {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab || !tab.id) return;
    
    // Execute content script function to fill details
    chrome.tabs.sendMessage(tab.id, {
      action: 'fillCardDetails',
      cardName: cardName
    });
    
    // Close the popup
    window.close();
  } catch (error) {
    console.error('Error filling card details:', error);
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
    // Setup UI elements
    setupEventListeners();
    
    // Check if we're on a checkout page
    chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, async (response) => {
      if (response && response.isCheckout) {
        // We're on a checkout page, get recommendations
        await getRecommendations(response.merchant, response.amount);
      } else {
        // Show simulation
        await simulateRecommendations();
      }
    });
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Header close button
  const headerCloseBtn = document.getElementById('header-close');
  if (headerCloseBtn) {
    headerCloseBtn.addEventListener('click', () => window.close());
  }
  
  // Close buttons in detailed view
  document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => window.close());
  });
  
  // Show detailed view
  const showDetailedLink = document.getElementById('show-detailed');
  if (showDetailedLink) {
    showDetailedLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDetailedView(true);
    });
  }
  
  // Pay buttons
  document.querySelectorAll('.pay-button').forEach(button => {
    button.addEventListener('click', () => {
      // Find the active card name (from either view)
      let cardName = '';
      const simpleView = document.getElementById('simple-view');
      const detailedView = document.getElementById('detailed-view');
      
      if (simpleView && window.getComputedStyle(simpleView).display !== 'none') {
        const cardNameEl = simpleView.querySelector('.card-name');
        if (cardNameEl) cardName = cardNameEl.textContent || '';
      } else if (detailedView && window.getComputedStyle(detailedView).display !== 'none') {
        const cardNameEl = detailedView.querySelector('.card-name');
        if (cardNameEl) cardName = cardNameEl.textContent || '';
      }
      
      if (cardName) {
        fillCardDetails(cardName);
      }
    });
  });
}

// Toggle between simple and detailed views
function toggleDetailedView(showDetailed: boolean) {
  const simpleView = document.getElementById('simple-view');
  const detailedView = document.getElementById('detailed-view');
  
  if (simpleView && detailedView) {
    if (showDetailed) {
      simpleView.style.display = 'none';
      detailedView.style.display = 'block';
    } else {
      simpleView.style.display = 'block';
      detailedView.style.display = 'none';
    }
  }
}

// Get recommendations from backend via background script
async function getRecommendations(merchant: string, amount: number) {
  const simpleView = document.getElementById('simple-view');
  const detailedView = document.getElementById('detailed-view');
  const loadingEl = document.getElementById('loading');
  
  if (simpleView && detailedView && loadingEl) {
    simpleView.style.display = 'none';
    detailedView.style.display = 'none';
    loadingEl.style.display = 'block';
    
    try {
      // Send message to background script to get recommendations
      chrome.runtime.sendMessage({
        action: 'getRecommendations',
        merchant,
        amount
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
  const demoMerchant = 'Amazon';
  const demoAmount = 40.50;
  
  // Show loading first
  const simpleView = document.getElementById('simple-view');
  const detailedView = document.getElementById('detailed-view');
  const loadingEl = document.getElementById('loading');
  
  if (simpleView && detailedView && loadingEl) {
    simpleView.style.display = 'none';
    detailedView.style.display = 'none';
    loadingEl.style.display = 'block';
    
    // Demo delay for loading effect
    setTimeout(() => {
      // Send message to background script to get recommendations
      chrome.runtime.sendMessage({
        action: 'getRecommendations',
        merchant: demoMerchant,
        amount: demoAmount
      }, (response) => {
        if (response && response.success && response.recommendations) {
          renderRecommendations(response.recommendations, demoMerchant, demoAmount);
        } else {
          // If backend fails, use some fallback recommendations
          const fallbackRecs = [
            {
              name: 'Wells Fargo Active Cash',
              cashback_percentage: 2,
              cashback_amount: 0.81,
              category: 'General',
              benefits: ['Extended warranty', 'Purchase protection', 'Return protection']
            },
            {
              name: 'Citi Double Cash',
              cashback_percentage: 2,
              cashback_amount: 0.81,
              category: 'General'
            },
            {
              name: 'Chase Freedom Unlimited',
              cashback_percentage: 1.5,
              cashback_amount: 0.61,
              category: 'General'
            },
            {
              name: 'American Express Blue Cash',
              cashback_percentage: 1,
              cashback_amount: 0.41,
              category: 'Online Shopping'
            }
          ];
          renderRecommendations(fallbackRecs, demoMerchant, demoAmount);
        }
      });
    }, 800);
  }
}

// Render recommendations in the UI
function renderRecommendations(recommendations: CardRecommendation[], merchant: string, amount: number) {
  const simpleView = document.getElementById('simple-view');
  const detailedView = document.getElementById('detailed-view');
  const loadingEl = document.getElementById('loading');
  
  if (!recommendations || recommendations.length === 0) {
    showError('No recommendations found');
    return;
  }
  
  if (simpleView && detailedView && loadingEl) {
    loadingEl.style.display = 'none';
    
    // Sort recommendations by cashback percentage (descending)
    recommendations.sort((a, b) => b.cashback_percentage - a.cashback_percentage);
    
    // Get the best recommendation
    const bestCard = recommendations[0];
    
    // Update simple view
    updateSimpleView(simpleView, bestCard, recommendations.slice(1));
    
    // Update detailed view
    updateDetailedView(detailedView, recommendations);
    
    // Show simple view first
    simpleView.style.display = 'block';
    detailedView.style.display = 'none';
  }
}

// Update the simple view with card data
function updateSimpleView(simpleView: HTMLElement, bestCard: CardRecommendation, alternativeCards: CardRecommendation[]) {
  // Update main card
  const cardImageEl = simpleView.querySelector('.card-image');
  if (cardImageEl) {
    // Clear existing classes that might affect the card appearance
    cardImageEl.className = 'card-image';
    
    // Use actual card image
    const cardImg = document.createElement('img');
    cardImg.src = getCardImageUrl(bestCard.name);
    cardImg.alt = bestCard.name;
    
    // Clear any existing content and add image
    cardImageEl.innerHTML = '';
    cardImageEl.appendChild(cardImg);
    
    // Add selected indicator
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'selected-indicator';
    indicatorDiv.textContent = '✓';
    cardImageEl.appendChild(indicatorDiv);
    
    // Add card class for any remaining styling
    cardImageEl.classList.add(getCardClass(bestCard.name));
  }
  
  // Update cashback amount
  const cashbackEl = simpleView.querySelector('.cashback-amount');
  if (cashbackEl) {
    cashbackEl.textContent = `$${bestCard.cashback_amount.toFixed(2)} cash back`;
  }
  
  // Update card name
  const cardNameEl = simpleView.querySelector('.card-name');
  if (cardNameEl) {
    cardNameEl.textContent = bestCard.name;
  }
  
  // Update alternative cards
  const thumbnailsContainer = simpleView.querySelector('.card-thumbnails');
  if (thumbnailsContainer) {
    // Clear existing thumbnails
    thumbnailsContainer.innerHTML = '';
    
    // Add up to 3 alternative cards
    const maxThumbnails = Math.min(alternativeCards.length, 3);
    for (let i = 0; i < maxThumbnails; i++) {
      const card = alternativeCards[i];
      const thumbnail = document.createElement('div');
      thumbnail.className = `card-thumbnail`;
      
      // Add image to thumbnail
      const thumbImg = document.createElement('img');
      thumbImg.src = getCardImageUrl(card.name);
      thumbImg.alt = card.name;
      thumbImg.style.width = '100%';
      thumbImg.style.height = '100%';
      thumbImg.style.objectFit = 'cover';
      thumbnail.appendChild(thumbImg);
      
      thumbnailsContainer.appendChild(thumbnail);
    }
    
    // Add "+X" indicator if there are more cards
    if (alternativeCards.length > 3) {
      const moreCards = document.createElement('div');
      moreCards.className = 'more-cards';
      moreCards.textContent = `+${alternativeCards.length - 3}`;
      thumbnailsContainer.appendChild(moreCards);
    }
  }
}

// Update the detailed view with card data
function updateDetailedView(detailedView: HTMLElement, recommendations: CardRecommendation[]) {
  // Clear existing card details
  const detailsContainer = detailedView.querySelector('.card-detail');
  if (!detailsContainer) return;
  
  // Get the first (best) card
  const bestCard = recommendations[0];
  
  // Update card image
  const cardImageEl = detailedView.querySelector('.card-image');
  if (cardImageEl) {
    // Clear existing classes
    cardImageEl.className = 'card-image';
    
    // Use actual card image
    const cardImg = document.createElement('img');
    cardImg.src = getCardImageUrl(bestCard.name);
    cardImg.alt = bestCard.name;
    
    // Clear any existing content and add image
    cardImageEl.innerHTML = '';
    cardImageEl.appendChild(cardImg);
    
    // Add selected indicator
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'selected-indicator';
    indicatorDiv.textContent = '✓';
    cardImageEl.appendChild(indicatorDiv);
  }
  
  // Update cashback amount
  const cashbackEl = detailedView.querySelector('.cashback-amount');
  if (cashbackEl) {
    cashbackEl.textContent = `$${bestCard.cashback_amount.toFixed(2)}`;
  }
  
  // Update cashback percentage
  const percentEl = detailedView.querySelector('.cashback-percent');
  if (percentEl) {
    percentEl.textContent = `${bestCard.cashback_percentage}% cash back`;
  }
  
  // Update card name
  const cardNameEl = detailedView.querySelector('.card-name');
  if (cardNameEl) {
    cardNameEl.textContent = bestCard.name;
  }
  
  // Update benefits
  const benefitsEl = detailedView.querySelector('.card-benefits');
  if (benefitsEl && bestCard.benefits) {
    benefitsEl.innerHTML = bestCard.benefits.join(', ') + 
      ' <a href="#" class="read-more">read more ›</a>';
  } else if (benefitsEl) {
    benefitsEl.innerHTML = 'Extended warranty, Purchase protection' + 
      ' <a href="#" class="read-more">read more ›</a>';
  }
}

// Show error message
function showError(message: string) {
  const simpleView = document.getElementById('simple-view');
  const detailedView = document.getElementById('detailed-view');
  const loadingEl = document.getElementById('loading');
  
  if (simpleView && detailedView && loadingEl) {
    simpleView.style.display = 'block';
    detailedView.style.display = 'none';
    loadingEl.style.display = 'none';
    
    // Create an error message inside simple view
    const container = simpleView.querySelector('.popup-container');
    if (container) {
      container.innerHTML = `
        <button class="close-button">&times;</button>
        <div style="padding: 40px 20px; text-align: center; color: #F44336;">
          <div style="font-size: 24px; margin-bottom: 8px;">😕</div>
          <div>${message}</div>
        </div>
      `;
      
      // Re-attach close button listener
      const closeBtn = container.querySelector('.close-button');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => window.close());
      }
    }
  }
} 