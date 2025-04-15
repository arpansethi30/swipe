// This script handles the popup UI when the user clicks on the extension icon
import { getCardClass, getCardDetails, findFormFields } from './utils';

// Add declaration for global window interface to expose our functions
declare global {
  interface Window {
    fillCardDetails: (cardName: string) => { 
      success: boolean; 
      filledCount: number; 
      message: string 
    };
    getPurchaseAmount: () => number;
  }
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
    // Handle the results if needed
    console.log('Card filling results:', results);
  }).catch((error) => {
    console.error('Error filling card details:', error);
  });
}

// Function to render recommendations in the new UI style
function renderRecommendations(data: any) {
  const contentElement = document.getElementById('content');
  if (!contentElement) return;
  
  // Create popup container
  const popupContainer = document.createElement('div');
  popupContainer.className = 'popup-container';
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '✕';
  closeButton.onclick = window.close;
  popupContainer.appendChild(closeButton);
  
  // Get the best card (first in recommendations)
  const bestCard = data.recommendations && data.recommendations.length > 0 ? 
    data.recommendations[0] : null;
    
  if (bestCard) {
    // Create card display section
    const cardDisplay = document.createElement('div');
    cardDisplay.className = 'card-display';
    
    // Card image
    const cardImage = document.createElement('div');
    cardImage.className = `card-image ${getCardClass(bestCard.name)}`;
    
    // Add checkmark indicator
    const selectedIndicator = document.createElement('div');
    selectedIndicator.className = 'selected-indicator';
    selectedIndicator.innerHTML = '✓';
    cardImage.appendChild(selectedIndicator);
    
    // Card info section
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    
    // Cashback amount
    const cashbackAmount = document.createElement('h2');
    cashbackAmount.className = 'cashback-amount';
    cashbackAmount.textContent = `$${bestCard.cashback.toFixed(2)} cash back`;
    
    // Card name
    const cardName = document.createElement('p');
    cardName.className = 'card-name';
    cardName.textContent = bestCard.name;
    
    // Assemble card info
    cardInfo.appendChild(cashbackAmount);
    cardInfo.appendChild(cardName);
    
    // Assemble card display
    cardDisplay.appendChild(cardImage);
    cardDisplay.appendChild(cardInfo);
    popupContainer.appendChild(cardDisplay);
    
    // Create alternative cards section
    if (data.recommendations.length > 1) {
      const alternativeCards = document.createElement('div');
      alternativeCards.className = 'alternative-cards';
      
      // Thumbnails container
      const thumbnails = document.createElement('div');
      thumbnails.className = 'card-thumbnails';
      
      // Add thumbnails for alternative cards (max 3)
      const maxThumbnails = Math.min(3, data.recommendations.length - 1);
      for (let i = 0; i < maxThumbnails; i++) {
        const card = data.recommendations[i + 1];
        const thumbnail = document.createElement('div');
        thumbnail.className = `card-thumbnail ${getCardClass(card.name)}`;
        
        // Make thumbnails clickable to switch the selected card
        thumbnail.style.cursor = 'pointer';
        thumbnail.addEventListener('click', () => {
          // Update card display
          cardImage.className = `card-image ${getCardClass(card.name)}`;
          
          // Update card info
          cashbackAmount.textContent = `$${card.cashback.toFixed(2)} cash back`;
          cardName.textContent = card.name;
          
          // Update pay button action
          payButton.onclick = () => fillCardDetails(card.name);
        });
        
        thumbnails.appendChild(thumbnail);
      }
      
      // Add "more cards" indicator if needed
      if (data.recommendations.length > 4) {
        const moreCards = document.createElement('span');
        moreCards.className = 'more-cards';
        moreCards.textContent = `+${data.recommendations.length - 4}`;
        thumbnails.appendChild(moreCards);
      }
      
      // Add "see all cards" link
      const seeAll = document.createElement('a');
      seeAll.className = 'see-all';
      seeAll.href = '#';
      seeAll.textContent = 'see all cards';
      seeAll.onclick = (e) => {
        e.preventDefault();
        // In a real implementation, this would show all cards
      };
      
      // Assemble alternative cards section
      alternativeCards.appendChild(thumbnails);
      alternativeCards.appendChild(seeAll);
      popupContainer.appendChild(alternativeCards);
    }
    
    // Add "pay with selected card" button
    const payButton = document.createElement('button');
    payButton.className = 'pay-button';
    payButton.innerHTML = `
      <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" stroke-width="2"/>
        <line x1="1" y1="5" x2="19" y2="5" stroke="white" stroke-width="2"/>
      </svg>
      pay with selected card
    `;
    // Add click handler for pay button
    payButton.onclick = () => fillCardDetails(bestCard.name);
    
    popupContainer.appendChild(payButton);
  } else {
    // No recommendations available
    const noRecommendations = document.createElement('div');
    noRecommendations.className = 'loading';
    noRecommendations.textContent = 'No recommendations available for this merchant.';
    popupContainer.appendChild(noRecommendations);
  }
  
  // Update the content
  contentElement.innerHTML = '';
  contentElement.appendChild(popupContainer);
}

// Function to show loading state
function showLoading() {
  const contentElement = document.getElementById('content');
  if (contentElement) {
    contentElement.innerHTML = '<div class="loading">Loading recommendations...</div>';
  }
}

// Function to show error state
function showError(message: string) {
  const contentElement = document.getElementById('content');
  if (contentElement) {
    contentElement.innerHTML = `<div class="loading">${message}</div>`;
  }
}

// Function to get purchase amount from page
async function getPurchaseAmount(tabId: number): Promise<number> {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Access the getPurchaseAmount function from the content script
        // @ts-ignore - This function is defined in content.ts and exposed to window
        if (typeof window.getPurchaseAmount === 'function') {
          // @ts-ignore
          return window.getPurchaseAmount();
        }
        return 40.50; // Fallback amount
      }
    });
    
    return result[0]?.result || 40.50;
  } catch (error) {
    console.error('Error getting purchase amount:', error);
    return 40.50; // Fallback amount
  }
}

// Main function to check if current page is a checkout and get recommendations
async function init() {
  showLoading();
  
  try {
    const tab = await getActiveTab();
    if (!tab || !tab.url) {
      showError('Unable to access current page information.');
      return;
    }
    
    // Get merchant name from URL
    const merchant = extractMerchantFromUrl(tab.url);
    
    // Request permission for scripting if not already granted
    chrome.permissions.contains({ permissions: ['scripting'] }, (hasPermission) => {
      if (!hasPermission) {
        chrome.permissions.request({ permissions: ['scripting'] });
      }
    });
    
    // Check if current page is a checkout page and tab id is defined
    if (!tab.id) {
      renderSimulatedRecommendations(merchant);
      return;
    }
    
    const tabId = tab.id; // Create a local variable to guarantee it's defined
    
    chrome.tabs.sendMessage(tabId, { action: 'checkCheckoutPage' }, async (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be loaded yet
        renderSimulatedRecommendations(merchant);
        return;
      }
      
      if (response && response.isCheckout) {
        try {
          // Get the purchase amount from the page
          const amount = await getPurchaseAmount(tabId);
          
          // Get recommendations from background script
          chrome.runtime.sendMessage({
            action: 'getRecommendations',
            merchant: merchant,
            amount: amount
          }, (data) => {
            if (data && data.recommendations) {
              renderRecommendations(data);
            } else {
              renderSimulatedRecommendations(merchant, amount);
            }
          });
        } catch (error) {
          console.error('Error getting purchase amount:', error);
          // Fallback to default amount
          renderSimulatedRecommendations(merchant);
        }
      } else {
        // Not a checkout page, show simulated recommendations
        renderSimulatedRecommendations(merchant);
      }
    });
  } catch (error) {
    showError('An error occurred. Please try again.');
    console.error('Error in popup init:', error);
  }
}

// Function to render simulated recommendations (for demo purposes)
function renderSimulatedRecommendations(merchant: string, amount: number = 40.50) {
  // Calculate cashback amounts based on provided amount
  const defaultPercentage = 2;
  const lowerPercentage = 1;
  
  const twoPercentCashback = (amount * defaultPercentage / 100).toFixed(2);
  const onePercentCashback = (amount * lowerPercentage / 100).toFixed(2);
  
  const simulatedData = {
    merchant: merchant,
    category: 'other',
    purchase_amount: amount,
    recommendations: [
      {
        id: 9,
        name: 'Wells Fargo Active Cash',
        image: 'wells_fargo_active_cash.png',
        reward_percentage: 2,
        cashback: parseFloat(twoPercentCashback)
      },
      {
        id: 3,
        name: 'Citi Double Cash',
        image: 'citi_double_cash.png',
        reward_percentage: 2,
        cashback: parseFloat(twoPercentCashback)
      },
      {
        id: 4,
        name: 'Capital One Venture',
        image: 'capital_one_venture.png',
        reward_percentage: 2,
        cashback: parseFloat(twoPercentCashback)
      },
      {
        id: 2,
        name: 'Amex Gold Card',
        image: 'amex_gold.png',
        reward_percentage: 1,
        cashback: parseFloat(onePercentCashback)
      },
      {
        id: 5,
        name: 'Discover It Cash Back',
        image: 'discover_it.png',
        reward_percentage: 1,
        cashback: parseFloat(onePercentCashback)
      }
    ]
  };
  
  renderRecommendations(simulatedData);
}

// Initialize when the popup is loaded
document.addEventListener('DOMContentLoaded', init); 