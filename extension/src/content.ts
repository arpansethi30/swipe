import { ChromeMessage, ChromeResponse, Recommendation, MerchantInfo } from './types/app';

// Constants
const CHECKOUT_PAGE_KEYWORDS = ['checkout', 'cart', 'payment', 'billing', 'order', 'purchase', 'pay', 'credit', 'debit', 'total'];
const AMOUNT_SELECTORS = [
  '.total-amount',
  '.order-total',
  '.payment-amount',
  '[data-testid="total-amount"]',
  '[data-testid="order-total"]',
  '.total',
  '.grand-total',
  '.subtotal',
  '[class*="total"]',
  '[class*="price"]',
  '[class*="amount"]',
  // More generic selectors
  'span:contains("Total")',
  'div:contains("Total")',
  'p:contains("Total")'
];

// State
let isRecommendationsVisible = false;
let recommendationsContainer: HTMLElement | null = null;

// Debug mode
const DEBUG = true;
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Swipe Debug]', ...args);
  }
}

// Initialize content script
debugLog('Content script initialized');
initializeContentScript();

function initializeContentScript() {
  debugLog('Checking if current page is a checkout page');
  
  // Force show popup for demo if URL has force_checkout parameter
  const urlParams = new URLSearchParams(window.location.search);
  const forceCheckout = urlParams.get('force_checkout');
  
  // Check if the current page is a checkout page
  const isCheckout = isCheckoutPage();
  debugLog('Is checkout page?', isCheckout);
  
  if (isCheckout || forceCheckout === 'true') {
    debugLog('Setting up recommendations container');
    setupRecommendationsContainer();
    setupMutationObserver();
    
    // Automatically show recommendations after a short delay
    setTimeout(async () => {
      debugLog('Auto-showing recommendations');
      await showRecommendations();
    }, 1500);
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener(handleMessage);
  
  // Add a manual trigger for testing - press Shift+S to show recommendations
  document.addEventListener('keydown', (event) => {
    if (event.shiftKey && event.key === 'S') {
      debugLog('Manual trigger activated via Shift+S');
      setupRecommendationsContainer();
      showRecommendations();
    }
  });
}

function isCheckoutPage(): boolean {
  const url = window.location.href.toLowerCase();
  const path = window.location.pathname.toLowerCase();
  const title = document.title.toLowerCase();
  const bodyText = document.body.innerText.toLowerCase();
  
  debugLog('Checking URL:', url);
  debugLog('Checking path:', path);
  debugLog('Checking title:', title);
  
  // Check for checkout related content in page text
  const hasCheckoutText = CHECKOUT_PAGE_KEYWORDS.some(keyword => bodyText.includes(keyword));
  debugLog('Has checkout text:', hasCheckoutText);
  
  // Check URL, path, and title for checkout keywords
  const hasCheckoutKeywords = CHECKOUT_PAGE_KEYWORDS.some(keyword => 
    url.includes(keyword) || path.includes(keyword) || title.includes(keyword)
  );
  debugLog('Has checkout keywords:', hasCheckoutKeywords);
  
  const hasPaymentElems = hasPaymentElements();
  debugLog('Has payment elements:', hasPaymentElems);
  
  return hasCheckoutKeywords || hasPaymentElems || hasCheckoutText;
}

function hasPaymentElements(): boolean {
  // Check for common payment form elements
  const ccFields = document.querySelectorAll('input[name*="card"], input[name*="credit"], input[name*="payment"], input[placeholder*="card"], input[type="tel"][pattern]');
  
  if (ccFields.length > 0) {
    debugLog('Found credit card fields:', ccFields.length);
    return true;
  }
  
  const paymentLabels = document.querySelectorAll('label, p, h1, h2, h3, h4, h5, h6, div, span');
  let found = false;
  
  const paymentKeywords = ['payment', 'credit card', 'debit card', 'card number', 'card details', 'payment method', 'pay with'];
  
  for (const label of paymentLabels) {
    const text = label.textContent?.toLowerCase() || '';
    for (const keyword of paymentKeywords) {
      if (text.includes(keyword)) {
        debugLog('Found payment keyword in text:', keyword);
        found = true;
        break;
      }
    }
    if (found) break;
  }
  
  // Also look for payment images and icons
  const paymentImages = document.querySelectorAll('img[src*="payment"], img[src*="visa"], img[src*="mastercard"], img[src*="card"], img[alt*="payment"], img[alt*="visa"], img[alt*="mastercard"]');
  if (paymentImages.length > 0) {
    debugLog('Found payment images:', paymentImages.length);
    return true;
  }
  
  return found;
}

function setupRecommendationsContainer() {
  // Check if the container already exists
  if (recommendationsContainer) {
    debugLog('Recommendations container already exists');
    return;
  }
  
  debugLog('Creating recommendations container');
  recommendationsContainer = document.createElement('div');
  recommendationsContainer.id = 'swipe-recommendations';
  recommendationsContainer.className = 'swipe-recommendations-container';
  document.body.appendChild(recommendationsContainer);
  debugLog('Recommendations container created and appended to the document body');
}

function setupMutationObserver() {
  debugLog('Setting up mutation observer');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        detectPurchaseAmount().then(amount => {
          debugLog('Detected amount from mutation:', amount);
          if (amount && amount > 0 && !isRecommendationsVisible) {
            debugLog('Showing recommendations based on detected amount');
            showRecommendations();
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
  debugLog('Mutation observer set up');
}

async function handleMessage(
  message: ChromeMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ChromeResponse) => void
) {
  debugLog('Received message:', message);
  try {
    switch (message.action) {
      case 'showRecommendations':
        debugLog('Showing recommendations from message');
        await showRecommendations();
        sendResponse({ success: true });
        break;
        
      case 'detectAmount':
        const amount = await detectPurchaseAmount();
        debugLog('Detected amount from message:', amount);
        sendResponse({ success: true, data: { amount } });
        break;
        
      default:
        debugLog('Unknown action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
        break;
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
  
  return true; // Keep channel open for async response
}

async function showRecommendations() {
  debugLog('Attempting to show recommendations');
  if (!recommendationsContainer) {
    debugLog('No recommendations container found, creating one');
    setupRecommendationsContainer();
  }
  
  try {
    const amount = await detectPurchaseAmount();
    debugLog('Detected purchase amount:', amount);
    
    // Use a hardcoded amount for demo purposes if no amount detected
    const finalAmount = amount || 40.00;
    
    // Extract merchant info
    const merchantInfo: MerchantInfo = {
      name: document.title || window.location.hostname,
      category: detectMerchantCategory(),
      amount: finalAmount
    };
    
    debugLog('Merchant info:', merchantInfo);
    
    // Send message to background script to get recommendations
    debugLog('Sending getRecommendations message to background');
    const response = await sendMessageToBackground({
      action: 'getRecommendations',
      data: { merchantInfo }
    });
    
    debugLog('Received response from background:', response);
    
    // Show fallback recommendation if there's any issue
    let recommendationsToUse: Recommendation[] = [];
    
    if (response && response.success === true && response.data && Array.isArray(response.data.recommendations)) {
      debugLog('Using recommendations from response');
      recommendationsToUse = response.data.recommendations;
    } else {
      // Create a fallback recommendation
      debugLog('Using fallback recommendation');
      const fallbackRecommendation: Recommendation = {
        card: {
          id: 'demo-card',
          name: 'Active Cash',
          issuer: 'Wells Fargo',
          imageUrl: 'https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png',
          rewardRate: 2,
          categories: ['general'],
          annualFee: 0
        },
        estimatedReward: merchantInfo.amount * 0.02,
        rewardRate: 2
      };
      
      recommendationsToUse = [fallbackRecommendation];
    }
    
    // Render recommendations (using either real or fallback data)
    renderRecommendations(recommendationsToUse, merchantInfo);
    isRecommendationsVisible = true;
  } catch (error) {
    console.error('Error showing recommendations:', error);
    
    // Create a fallback recommendation for error case
    const fallbackRecommendation: Recommendation = {
      card: {
        id: 'demo-card',
        name: 'Active Cash',
        issuer: 'Wells Fargo',
        imageUrl: 'https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png',
        rewardRate: 2,
        categories: ['general'],
        annualFee: 0
      },
      estimatedReward: 40 * 0.02,
      rewardRate: 2
    };
    
    renderRecommendations([fallbackRecommendation], { name: 'Demo Store', category: 'general', amount: 40 });
    isRecommendationsVisible = true;
  }
}

function renderRecommendations(recommendations: Recommendation[], merchantInfo: MerchantInfo) {
  debugLog('Rendering recommendations:', recommendations);
  if (!recommendationsContainer) {
    debugLog('No container found to render recommendations');
    setupRecommendationsContainer();
    if (!recommendationsContainer) {
      debugLog('Failed to create recommendations container');
      return;
    }
  }
  
  // For demo purposes, show even if we don't have recommendations
  if (recommendations.length === 0) {
    debugLog('No recommendations available, using fallback data');
    
    // Create a fallback recommendation
    const fallbackRecommendation: Recommendation = {
      card: {
        id: 'demo-card',
        name: 'Active Cash',
        issuer: 'Wells Fargo',
        imageUrl: 'https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png',
        rewardRate: 2,
        categories: ['general'],
        annualFee: 0
      },
      estimatedReward: merchantInfo.amount * 0.02,
      rewardRate: 2
    };
    
    recommendations = [fallbackRecommendation];
  }
  
  // Get the best recommendation (first one)
  const bestRecommendation = recommendations[0];
  const cashBackAmount = bestRecommendation.estimatedReward.toFixed(2);
  const cardName = bestRecommendation.card.name;
  const cardIssuer = bestRecommendation.card.issuer;
  
  // Create thumbnail cards for the carousel
  const cardImages = recommendations.slice(0, 3).map(rec => {
    const cardId = rec.card.id;
    const selected = rec === bestRecommendation ? 'selected' : '';
    return `<div class="card-thumbnail ${selected}" data-card-id="${cardId}">
      <img src="${rec.card.imageUrl}" alt="${rec.card.name}" />
    </div>`;
  }).join('');
  
  // Show how many more cards are available
  const moreCardsText = recommendations.length > 3 ? `+${recommendations.length - 3}` : '';
  
  recommendationsContainer.innerHTML = `
    <div class="card-popup">
      <div class="card-popup-header">
        <button class="close-button">×</button>
      </div>
      <div class="card-popup-main">
        <div class="best-card-container">
          <div class="card-image">
            <img src="${bestRecommendation.card.imageUrl}" alt="${cardName}" />
            <div class="checkmark-badge">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <circle cx="12" cy="12" r="12" fill="#3b82f6"/>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white"/>
              </svg>
            </div>
          </div>
          <div class="card-details">
            <div class="cashback-amount">$${cashBackAmount} cash back</div>
            <div class="card-name">${cardIssuer} ${cardName}</div>
          </div>
        </div>
        
        <div class="card-selection-container">
          <div class="card-thumbnails">
            ${cardImages}
            ${moreCardsText ? `<div class="more-cards">${moreCardsText}</div>` : ''}
          </div>
          <a href="#" class="see-all-cards">see all cards &gt;</a>
        </div>
        
        <button class="pay-button">
          <span class="pay-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="white"/>
            </svg>
          </span>
          pay with selected card
        </button>
      </div>
    </div>
  `;
  
  // Add event listeners
  const closeButton = recommendationsContainer.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (recommendationsContainer) {
        recommendationsContainer.style.display = 'none';
        isRecommendationsVisible = false;
      }
    });
  }
  
  // Make sure container is visible
  recommendationsContainer.style.display = 'block';
  // Force a reflow to ensure visibility
  recommendationsContainer.getBoundingClientRect();
  
  // Apply a highlight effect
  recommendationsContainer.style.animation = 'none';
  setTimeout(() => {
    if (recommendationsContainer) {
      recommendationsContainer.style.animation = 'swipePopupAppear 0.3s ease-in-out';
    }
  }, 10);
  
  debugLog('Recommendations container is now visible');
}

function renderError(message: string) {
  if (!recommendationsContainer) return;
  
  recommendationsContainer.innerHTML = `
    <div class="card-popup">
      <div class="card-popup-header">
        <button class="close-button">×</button>
      </div>
      <div class="error-message">
        <p>${message}</p>
      </div>
    </div>
  `;
  
  // Add event listener to close button
  const closeButton = recommendationsContainer.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (recommendationsContainer) {
        recommendationsContainer.style.display = 'none';
      }
    });
  }
  
  recommendationsContainer.style.display = 'block';
}

async function detectPurchaseAmount(): Promise<number | null> {
  // First try common selectors
  for (const selector of AMOUNT_SELECTORS) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      const text = element.textContent || '';
      const amount = extractAmount(text);
      if (amount !== null) {
        return amount;
      }
    }
  }
  
  // If that fails, try to find any text with $ and a number
  const allText = document.body.innerText;
  const totalMatches = allText.match(/total:?\s*\$?\d+(?:,\d{3})*(?:\.\d{2})?/gi);
  
  if (totalMatches && totalMatches.length > 0) {
    for (const match of totalMatches) {
      const amount = extractAmount(match);
      if (amount !== null && amount > 0) {
        return amount;
      }
    }
  }
  
  return null;
}

function extractAmount(text: string): number | null {
  const match = text.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (match) {
    const amount = match[1].replace(/[^0-9.]/g, '');
    return parseFloat(amount);
  }
  return null;
}

function detectMerchantCategory(): string {
  // Simple implementation - this could be expanded with the import of CATEGORY_KEYWORDS
  const url = window.location.href.toLowerCase();
  const hostname = window.location.hostname.toLowerCase();
  const pageContent = document.body.innerText.toLowerCase();
  
  if (url.includes('travel') || url.includes('hotel') || url.includes('flight') || 
      pageContent.includes('travel') || pageContent.includes('flight')) {
    return 'travel';
  } else if (url.includes('food') || url.includes('restaurant') || 
            hostname.includes('doordash') || hostname.includes('ubereats') ||
            pageContent.includes('restaurant') || pageContent.includes('delivery')) {
    return 'dining';
  } else if (url.includes('store') || url.includes('shop') || hostname.includes('amazon') ||
            hostname.includes('walmart') || hostname.includes('target')) {
    return 'retail';
  } else if (hostname.includes('apple') || hostname.includes('bestbuy') || 
            hostname.includes('newegg') || pageContent.includes('electronics')) {
    return 'electronics';
  }
  
  return 'general';
}

function sendMessageToBackground(message: ChromeMessage): Promise<ChromeResponse> {
  return new Promise((resolve) => {
    try {
      debugLog('Sending message to background:', message);
      
      // Add a timeout to ensure we don't wait forever
      const timeoutId = setTimeout(() => {
        debugLog('Message timeout - no response received');
        resolve({ 
          success: false, 
          error: 'Timeout waiting for response' 
        });
      }, 5000); // 5 second timeout
      
      chrome.runtime.sendMessage(message, (response: ChromeResponse) => {
        clearTimeout(timeoutId);
        
        debugLog('Received response from background:', response);
        
        // Check if response is valid
        if (!response) {
          debugLog('Empty response received');
          resolve({ 
            success: false, 
            error: chrome.runtime.lastError?.message || 'Empty response' 
          });
          return;
        }
        
        resolve(response);
      });
    } catch (error) {
      debugLog('Error sending message to background:', error);
      resolve({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error sending message' 
      });
    }
  });
}

// Add styles to the page
const styles = document.createElement('style');
styles.textContent = `
  .swipe-recommendations-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647; /* Maximum z-index value */
    display: none;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.25));
  }

  @keyframes swipePopupAppear {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card-popup {
    width: 420px;
    max-width: 95vw;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    transform: translateZ(0);
  }

  .card-popup-header {
    display: flex;
    justify-content: flex-end;
    padding: 8px;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .card-popup-main {
    padding: 0 24px 24px;
  }

  .best-card-container {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
  }

  .card-image {
    width: 120px;
    height: 76px;
    margin-right: 20px;
    position: relative;
    overflow: visible;
  }

  .card-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 8px;
  }

  .checkmark-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 24px;
    height: 24px;
  }

  .card-details {
    flex: 1;
  }

  .cashback-amount {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #000;
  }

  .card-name {
    font-size: 16px;
    color: #333;
  }

  .card-selection-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }

  .card-thumbnails {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-thumbnail {
    width: 56px;
    height: 36px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #ddd;
  }

  .card-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .card-thumbnail.selected {
    border: 2px solid #3b82f6;
  }

  .more-cards {
    font-size: 14px;
    color: #555;
    margin-left: 4px;
  }

  .see-all-cards {
    font-size: 14px;
    color: #555;
    text-decoration: none;
  }

  .see-all-cards:hover {
    text-decoration: underline;
  }

  .pay-button {
    background: #000;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pay-button:hover {
    background: #333;
  }

  .pay-button-icon {
    display: flex;
  }

  .error-message {
    color: #c62828;
    text-align: center;
    padding: 16px;
  }
`;

document.head.appendChild(styles);

// For demo purposes, log that the content script is ready for user interaction
debugLog('✓ Content script fully loaded and ready'); 