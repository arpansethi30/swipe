// Checkout page detection keywords
const checkoutKeywords = [
  'checkout', 'payment', 'cart', 'billing', 'order', 'basket',
  'pay now', 'place order', 'purchase', 'buy now', 'complete order',
  'confirm order', 'credit card', 'card details', 'shipping',
  'payment method', 'pay with', 'proceed to payment'
];

// E-commerce and merchant category detection patterns
const merchantCategories = {
  amazon: ['amazon', 'amzn', 'prime'],
  travel: ['hotel', 'booking', 'airline', 'flight', 'expedia', 'kayak', 'airbnb', 'hostel', 'travel', 'reservation'],
  dining: ['restaurant', 'food', 'menu', 'doordash', 'ubereats', 'grubhub', 'postmates', 'seamless', 'delivery'],
  groceries: ['grocery', 'wholefood', 'safeway', 'kroger', 'albertsons', 'supermarket', 'market'],
  gas: ['gas', 'fuel', 'gasoline', 'shell', 'exxon', 'chevron', 'mobil'],
  entertainment: ['movie', 'theatre', 'cinema', 'ticket', 'concert', 'event'],
  streaming: ['netflix', 'hulu', 'disney+', 'spotify', 'prime video', 'youtube', 'streaming'],
  retail: ['walmart', 'target', 'costco', 'bestbuy', 'macys', 'kohls', 'nordstrom', 'shopping']
};

// Fake card details for demonstration
const fakeCardDetails = {
  'Wells Fargo Active Cash': {
    cardNumber: '4111 1111 1111 1111',
    expiryDate: '11/25',
    cvv: '123',
    cardholderName: 'John Doe'
  },
  'Chase Sapphire Reserve': {
    cardNumber: '5555 5555 5555 4444',
    expiryDate: '04/26',
    cvv: '456',
    cardholderName: 'Jane Smith'
  },
  'American Express Gold': {
    cardNumber: '3782 822463 10005',
    expiryDate: '06/27',
    cvv: '1234',
    cardholderName: 'Alex Johnson'
  },
  'Citi Double Cash': {
    cardNumber: '6011 0009 9013 9424',
    expiryDate: '08/24',
    cvv: '789',
    cardholderName: 'Sam Wilson'
  },
  'Discover it Cash Back': {
    cardNumber: '6011 0000 0000 0004',
    expiryDate: '12/26',
    cvv: '321',
    cardholderName: 'Emily Davis'
  }
};

// Function to detect merchant category based on URL and page content
function detectMerchantCategory() {
  const pageUrl = window.location.href.toLowerCase();
  const pageText = document.body.innerText.toLowerCase();
  const hostname = window.location.hostname.toLowerCase();
  
  // First check the hostname (most reliable)
  for (const [category, keywords] of Object.entries(merchantCategories)) {
    for (const keyword of keywords) {
      if (hostname.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Then check URL
  for (const [category, keywords] of Object.entries(merchantCategories)) {
    for (const keyword of keywords) {
      if (pageUrl.includes(keyword)) {
        return category;
      }
    }
  }
  
  // Finally check page content (least reliable but most comprehensive)
  for (const [category, keywords] of Object.entries(merchantCategories)) {
    for (const keyword of keywords) {
      if (pageText.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'general'; // Default category if no match found
}

// Function to fill credit card details on the checkout page
function fillCardDetails(cardName) {
  if (!fakeCardDetails[cardName]) {
    console.error(`No details found for card: ${cardName}`);
    return false;
  }

  const cardDetails = fakeCardDetails[cardName];
  let filledAnyField = false;

  // Function to find and fill an input field
  const fillField = (selectors, value) => {
    for (const selector of selectors) {
      const fields = document.querySelectorAll(selector);
      if (fields.length > 0) {
        for (const field of fields) {
          // Skip fields that are hidden, disabled, or readonly
          if (field.offsetParent === null || field.disabled || field.readOnly) {
            continue;
          }
          
          // Set value and dispatch events to trigger validation
          field.value = value;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
          filledAnyField = true;
          return true; // Field found and filled
        }
      }
    }
    return false; // No field found
  };

  // Try to fill card number
  fillField([
    'input[name*="card_number"]',
    'input[id*="card_number"]',
    'input[name*="cardnumber"]',
    'input[id*="cardnumber"]',
    'input[name*="ccnumber"]',
    'input[id*="ccnumber"]',
    'input[name*="number"]',
    'input[id*="number"]',
    'input[autocomplete="cc-number"]',
    'input[placeholder*="card number"]',
    'input[placeholder*="Card Number"]',
    'input[aria-label*="card number"]',
    'input[aria-label*="Card Number"]'
  ], cardDetails.cardNumber);

  // Try to fill expiry date
  // First check if there's a single field for expiry
  const expiryFilled = fillField([
    'input[name*="expiry"]',
    'input[id*="expiry"]',
    'input[name*="expiration"]',
    'input[id*="expiration"]',
    'input[autocomplete="cc-exp"]',
    'input[placeholder*="expiry"]',
    'input[placeholder*="Expiry"]',
    'input[placeholder*="MM/YY"]',
    'input[aria-label*="expiration date"]',
    'input[aria-label*="Expiration Date"]'
  ], cardDetails.expiryDate);

  // If no single expiry field, try to fill month and year separately
  if (!expiryFilled) {
    const [month, year] = cardDetails.expiryDate.split('/');
    
    // Fill month
    fillField([
      'input[name*="exp_month"]',
      'input[id*="exp_month"]',
      'input[name*="expmonth"]',
      'input[id*="expmonth"]',
      'input[name*="expirymonth"]',
      'input[id*="expirymonth"]',
      'input[name*="expiry_month"]',
      'input[id*="expiry_month"]',
      'input[autocomplete="cc-exp-month"]',
      'select[name*="month"]',
      'select[id*="month"]',
      'input[placeholder*="MM"]',
      'input[aria-label*="expiration month"]'
    ], month);

    // Fill year
    fillField([
      'input[name*="exp_year"]',
      'input[id*="exp_year"]',
      'input[name*="expyear"]',
      'input[id*="expyear"]',
      'input[name*="expiryyear"]',
      'input[id*="expiryyear"]',
      'input[name*="expiry_year"]',
      'input[id*="expiry_year"]',
      'input[autocomplete="cc-exp-year"]',
      'select[name*="year"]',
      'select[id*="year"]',
      'input[placeholder*="YY"]',
      'input[aria-label*="expiration year"]'
    ], year.length === 2 ? year : year.slice(-2));
  }

  // Try to fill CVV/CVC
  fillField([
    'input[name*="cvv"]',
    'input[id*="cvv"]',
    'input[name*="cvc"]',
    'input[id*="cvc"]',
    'input[name*="security"]',
    'input[id*="security"]',
    'input[name*="code"]',
    'input[id*="code"]',
    'input[autocomplete="cc-csc"]',
    'input[placeholder*="CVV"]',
    'input[placeholder*="CVC"]',
    'input[placeholder*="security code"]',
    'input[aria-label*="security code"]',
    'input[aria-label*="CVV"]',
    'input[aria-label*="CVC"]'
  ], cardDetails.cvv);

  // Try to fill cardholder name
  fillField([
    'input[name*="cardholder"]',
    'input[id*="cardholder"]',
    'input[name*="card_holder"]',
    'input[id*="card_holder"]',
    'input[name*="name_on_card"]',
    'input[id*="name_on_card"]',
    'input[name*="ccname"]',
    'input[id*="ccname"]',
    'input[autocomplete="cc-name"]',
    'input[placeholder*="name on card"]',
    'input[placeholder*="Name on card"]',
    'input[aria-label*="cardholder name"]',
    'input[aria-label*="Cardholder Name"]'
  ], cardDetails.cardholderName);

  return filledAnyField;
}

// Function to check if the current page is likely a checkout page
function isCheckoutPage() {
  // First try the URL-based check as it's faster
  console.log("Testing URL-based checkout detection...");
  if (isCheckoutPageByUrl()) {
    console.log("URL-based detection: This is a checkout page");
    return true;
  }

  // Fall back to content-based check
  console.log("Testing content-based checkout detection...");
  const pageText = document.body.innerText.toLowerCase();
  const pageUrl = window.location.href.toLowerCase();
  
  // Check URL for checkout indicators
  for (const keyword of checkoutKeywords) {
    if (pageUrl.includes(keyword)) {
      console.log(`Found checkout keyword in URL: ${keyword}`);
      return true;
    }
  }
  
  // Check page content for checkout indicators
  let foundKeywords = false;
  for (const keyword of checkoutKeywords) {
    if (pageText.includes(keyword)) {
      console.log(`Found checkout keyword in content: ${keyword}`);
      foundKeywords = true;
      break;
    }
  }
  
  if (foundKeywords) {
    // Look for payment-related form elements
    const paymentInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    console.log(`Found ${paymentInputs.length} potential payment inputs`);
    
    for (const input of paymentInputs) {
      const inputId = (input.id || '').toLowerCase();
      const inputName = (input.name || '').toLowerCase();
      const inputPlaceholder = (input.placeholder || '').toLowerCase();
      
      // Check if input field is related to payment
      if (
        inputId.includes('card') || inputName.includes('card') || inputPlaceholder.includes('card') ||
        inputId.includes('credit') || inputName.includes('credit') || inputPlaceholder.includes('credit') ||
        inputId.includes('payment') || inputName.includes('payment') || inputPlaceholder.includes('payment')
      ) {
        console.log("Found payment-related input field:", input);
        return true;
      }
    }
  }
  
  console.log("Not detected as a checkout page");
  return false;
}

// Function to create and show the recommendation notification
function showRecommendation() {
  // Remove any existing recommendation popups
  const existingPopup = document.getElementById('swipe-recommendation');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create wrapper element
  const wrapper = document.createElement('div');
  wrapper.id = 'swipe-recommendation';
  wrapper.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 360px;
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #333;
    overflow: hidden;
    padding: 20px;
  `;

  // Create close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #777;
    padding: 0;
  `;
  closeBtn.onclick = () => wrapper.remove();
  wrapper.appendChild(closeBtn);

  // Define selected card 
  const selectedCard = 'Wells Fargo Active Cash';

  // Create card container
  const cardContainer = document.createElement('div');
  cardContainer.style.cssText = `
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
  `;

  // Card image
  const cardImage = document.createElement('div');
  cardImage.style.cssText = `
    width: 80px;
    height: 48px;
    background-color: #f2f2f2;
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  `;
  const cardImg = document.createElement('img');
  cardImg.src = 'https://via.placeholder.com/80x48?text=VISA';
  cardImg.alt = selectedCard;
  cardImg.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
  `;
  cardImage.appendChild(cardImg);
  
  // Card verification checkmark
  const checkmark = document.createElement('div');
  checkmark.style.cssText = `
    position: absolute;
    top: -5px;
    right: -5px;
    width: 20px;
    height: 20px;
    background-color: #007bff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
  `;
  checkmark.innerHTML = '✓';
  cardImage.appendChild(checkmark);
  
  // Cash back info
  const cashbackInfo = document.createElement('div');
  cashbackInfo.style.cssText = `
    flex: 1;
  `;
  
  const cashbackAmount = document.createElement('div');
  cashbackAmount.textContent = '$0.81 cash back';
  cashbackAmount.style.cssText = `
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  `;
  
  const cardName = document.createElement('div');
  cardName.textContent = selectedCard;
  cardName.style.cssText = `
    font-size: 14px;
    color: #555;
  `;
  
  cashbackInfo.appendChild(cashbackAmount);
  cashbackInfo.appendChild(cardName);
  
  cardContainer.appendChild(cardImage);
  cardContainer.appendChild(cashbackInfo);
  wrapper.appendChild(cardContainer);

  // Create other cards section
  const otherCards = document.createElement('div');
  otherCards.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  `;
  
  const cardsList = document.createElement('div');
  cardsList.style.cssText = `
    display: flex;
    gap: 4px;
  `;
  
  // Add 3 mini card thumbnails
  for (let i = 0; i < 3; i++) {
    const miniCard = document.createElement('div');
    miniCard.style.cssText = `
      width: 32px;
      height: 20px;
      background-color: ${i === 0 ? '#000' : i === 1 ? '#1a478d' : '#333'};
      border-radius: 3px;
    `;
    cardsList.appendChild(miniCard);
  }
  
  const plusMore = document.createElement('div');
  plusMore.textContent = '+5';
  plusMore.style.cssText = `
    font-size: 14px;
    color: #777;
    margin-left: 8px;
  `;
  
  const seeAllCards = document.createElement('a');
  seeAllCards.textContent = 'see all cards >';
  seeAllCards.href = '#';
  seeAllCards.style.cssText = `
    color: #777;
    font-size: 14px;
    text-decoration: none;
  `;
  seeAllCards.onclick = (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: 'openPopup' });
  };
  
  cardsList.appendChild(plusMore);
  otherCards.appendChild(cardsList);
  otherCards.appendChild(seeAllCards);
  wrapper.appendChild(otherCards);

  // Create pay button
  const payButton = document.createElement('button');
  payButton.style.cssText = `
    width: 100%;
    background-color: #000;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 16px;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
  `;
  
  const cardIcon = document.createElement('span');
  cardIcon.innerHTML = '&#9642;'; // Credit card icon placeholder
  cardIcon.style.cssText = `
    font-size: 20px;
  `;
  
  const buttonText = document.createElement('span');
  buttonText.textContent = 'pay with selected card';
  
  payButton.appendChild(cardIcon);
  payButton.appendChild(buttonText);

  // Add functionality to automatically fill credit card details
  payButton.onclick = () => {
    // Hide the popup
    wrapper.style.display = 'none';
    
    // Attempt to fill the card details
    const filled = fillCardDetails(selectedCard);
    
    if (filled) {
      // Create a success notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #28a745;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: fadeOut 0.5s ease 3s forwards;
      `;
      notification.textContent = `✓ ${selectedCard} details auto-filled!`;
      document.body.appendChild(notification);
      
      // Remove the notification after 3.5 seconds
      setTimeout(() => {
        notification.remove();
      }, 3500);
    } else {
      // Show the popup again with an error message if filling failed
      wrapper.style.display = 'block';
      alert('Could not find payment form fields to fill. Please enter card details manually.');
    }
  };
  
  wrapper.appendChild(payButton);
  
  // Add style for fade out animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
  
  // Append to document
  document.body.appendChild(wrapper);
}

// Main initialization
function init() {
  // Only check for checkout pages after the page is fully loaded
  if (document.readyState === 'complete') {
    // Small delay to ensure all elements are properly loaded
    setTimeout(() => {
      if (isCheckoutPage()) {
        showRecommendation();
      }
    }, 1500);
  }
}

// Run init when page is loaded
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkPageType') {
    sendResponse({ isCheckout: isCheckoutPage() });
  }
});

// Content script for Swipe extension

// Check if we're on a checkout page based on the URL pattern
function isCheckoutPageByUrl() {
  const checkoutPatterns = [
    '/checkout',
    '/payment',
    '/order',
    '/cart/checkout',
    '/gp/buy',
    '/purchase',
    '/pay',
    '/confirmation'
  ];
  
  return checkoutPatterns.some(pattern => 
    window.location.pathname.toLowerCase().includes(pattern)
  );
}

// Try to find the purchase amount on the page
function findPurchaseAmount() {
  // Common selectors for total amounts on checkout pages
  const selectors = [
    // General patterns
    '[data-testid*="total"]',
    '[class*="total"]',
    '[id*="total"]',
    '[class*="summary"]',
    '[id*="summary"]',
    '[class*="price"]',
    '[id*="price"]',
    
    // Specific patterns for major retailers
    '.grand-total-price',
    '.a-color-price',
    '.order-summary-total',
    '.order-summary-toggle__total-summary',
    '.summary-value',
    '.summary-total',
    '#subtotal-amount',
    '.cart-total-value',
    '.checkout-amount',
    '.payment-due__price',
    
    // Common text patterns - these won't work with querySelector
    'span:contains("Total")',
    'div:contains("Total")',
    'td:contains("Total")',
    'th:contains("Total")'
  ];
  
  // First try querySelector for standard selectors
  for (const selector of selectors) {
    try {
      // Skip selectors that use :contains as they're jQuery syntax
      if (selector.includes(':contains')) continue;
      
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Extract text content and look for dollar amounts
        const text = element.textContent;
        const match = text.match(/\$?\s?(\d+(?:[.,]\d{1,2}))/);
        if (match) {
          // Parse the amount, handling commas and currency symbols
          let amount = match[1].replace(/[,$]/g, '');
          amount = parseFloat(amount);
          if (!isNaN(amount) && amount > 0) {
            console.log("Found purchase amount:", amount, "in element:", element);
            return amount;
          }
        }
      }
    } catch (e) {
      console.log("Error with selector:", selector, e);
    }
  }
  
  // Now try a more general approach - find all text nodes and look for dollar amounts
  const textNodes = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  while (walk.nextNode()) {
    textNodes.push(walk.currentNode);
  }
  
  for (const node of textNodes) {
    const text = node.textContent.trim();
    if (text.length > 0 && text.length < 50) { // Avoid very long texts
      const match = text.match(/\$?\s?(\d+(?:[.,]\d{1,2}))/);
      if (match) {
        // Parse the amount
        let amount = match[1].replace(/[,$]/g, '');
        amount = parseFloat(amount);
        if (!isNaN(amount) && amount > 0 && amount < 10000) { // Reasonable amount filter
          // Check if the text contains typical total indicators
          const totalIndicators = ['total', 'sum', 'amount', 'due', 'pay', 'charge'];
          const parentText = node.parentNode?.textContent.toLowerCase() || '';
          if (totalIndicators.some(indicator => parentText.includes(indicator))) {
            console.log("Found amount with text search:", amount, "in:", parentText);
            return amount;
          }
        }
      }
    }
  }
  
  return null;
}

// Send message to background script to get card recommendations
function getCardRecommendations() {
  // Try to find the purchase amount
  const purchaseAmount = findPurchaseAmount();
  console.log("Purchase amount detected:", purchaseAmount);
  
  // Show loading state
  showLoadingPopup();
  
  chrome.runtime.sendMessage({
    action: 'getRecommendation',
    url: window.location.href,
    purchaseAmount: purchaseAmount
  }, (response) => {
    // Remove loading state
    removePopup();
    
    if (response && response.success) {
      showRecommendationPopup(response.recommendations, purchaseAmount);
    } else {
      // Show error popup
      showErrorPopup(response?.error || "Failed to get recommendations");
    }
  });
}

// Format currency amounts
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Remove any existing popup
function removePopup() {
  const existingPopup = document.getElementById('swipe-recommendation-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
}

// Show loading popup
function showLoadingPopup() {
  removePopup();
  
  const popup = document.createElement('div');
  popup.id = 'swipe-recommendation-popup';
  applyPopupStyles(popup);
  
  const loadingContent = document.createElement('div');
  loadingContent.style.display = 'flex';
  loadingContent.style.flexDirection = 'column';
  loadingContent.style.alignItems = 'center';
  loadingContent.style.padding = '20px';
  
  const spinner = document.createElement('div');
  spinner.style.width = '40px';
  spinner.style.height = '40px';
  spinner.style.border = '4px solid #f3f3f3';
  spinner.style.borderTop = '4px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'swipe-spin 1s linear infinite';
  
  const keyframes = document.createElement('style');
  keyframes.textContent = `
    @keyframes swipe-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(keyframes);
  
  const loadingText = document.createElement('div');
  loadingText.textContent = 'Finding the best card for you...';
  loadingText.style.marginTop = '15px';
  loadingText.style.color = '#444';
  loadingText.style.fontWeight = '500';
  
  loadingContent.appendChild(spinner);
  loadingContent.appendChild(loadingText);
  popup.appendChild(loadingContent);
  
  document.body.appendChild(popup);
  
  // Trigger animation
  setTimeout(() => {
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  }, 10);
}

// Show error popup
function showErrorPopup(errorMessage) {
  removePopup();
  
  const popup = document.createElement('div');
  popup.id = 'swipe-recommendation-popup';
  applyPopupStyles(popup);
  
  // Header with close button
  const header = createPopupHeader('Something went wrong');
  popup.appendChild(header);
  
  const errorContent = document.createElement('div');
  errorContent.style.padding = '15px';
  errorContent.style.textAlign = 'center';
  
  const errorIcon = document.createElement('div');
  errorIcon.textContent = '⚠️';
  errorIcon.style.fontSize = '36px';
  errorIcon.style.marginBottom = '10px';
  
  const errorText = document.createElement('div');
  errorText.textContent = errorMessage || 'Unable to get card recommendations';
  errorText.style.color = '#555';
  errorText.style.marginBottom = '15px';
  
  const retryButton = document.createElement('button');
  retryButton.textContent = 'Try Again';
  retryButton.style.backgroundColor = '#3498db';
  retryButton.style.color = 'white';
  retryButton.style.border = 'none';
  retryButton.style.padding = '8px 16px';
  retryButton.style.borderRadius = '4px';
  retryButton.style.cursor = 'pointer';
  retryButton.style.fontWeight = '500';
  retryButton.onclick = getCardRecommendations;
  
  errorContent.appendChild(errorIcon);
  errorContent.appendChild(errorText);
  errorContent.appendChild(retryButton);
  popup.appendChild(errorContent);
  
  document.body.appendChild(popup);
  
  // Trigger animation
  setTimeout(() => {
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  }, 10);
}

// Apply common popup styles
function applyPopupStyles(popup) {
  popup.style.position = 'fixed';
  popup.style.bottom = '20px';
  popup.style.right = '20px';
  popup.style.width = '350px';
  popup.style.backgroundColor = '#ffffff';
  popup.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
  popup.style.borderRadius = '12px';
  popup.style.zIndex = '9999999';
  popup.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif';
  popup.style.transition = 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out';
  popup.style.transform = 'translateY(20px)';
  popup.style.opacity = '0';
  popup.style.overflow = 'hidden';
  popup.style.color = '#333';
}

// Create popup header with close button
function createPopupHeader(title) {
  const header = document.createElement('div');
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '15px 20px';
  header.style.borderBottom = '1px solid #f0f0f0';
  
  const titleElement = document.createElement('div');
  titleElement.style.display = 'flex';
  titleElement.style.alignItems = 'center';
  
  // Swipe logo
  const logo = document.createElement('div');
  logo.textContent = '💳';
  logo.style.fontSize = '20px';
  logo.style.marginRight = '10px';
  
  const titleText = document.createElement('div');
  titleText.textContent = title || 'Best Cards for This Purchase';
  titleText.style.fontSize = '16px';
  titleText.style.fontWeight = '600';
  titleText.style.color = '#333';
  
  titleElement.appendChild(logo);
  titleElement.appendChild(titleText);
  
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.fontSize = '24px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.padding = '0';
  closeButton.style.color = '#666';
  closeButton.style.lineHeight = '1';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.onclick = removePopup;
  
  header.appendChild(titleElement);
  header.appendChild(closeButton);
  
  return header;
}

// Create and show the recommendation popup
function showRecommendationPopup(recommendations, purchaseAmount) {
  removePopup();
  
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'swipe-recommendation-popup';
  applyPopupStyles(popup);
  
  // Create header
  const header = createPopupHeader();
  popup.appendChild(header);
  
  // Container for scrollable content
  const contentContainer = document.createElement('div');
  contentContainer.style.maxHeight = '450px';
  contentContainer.style.overflowY = 'auto';
  contentContainer.style.padding = '0 20px';
  contentContainer.style.scrollBehavior = 'smooth';
  
  // If purchase amount was detected, show it
  if (purchaseAmount) {
    const purchaseInfo = document.createElement('div');
    purchaseInfo.style.margin = '15px 0';
    purchaseInfo.style.fontSize = '14px';
    purchaseInfo.style.display = 'flex';
    purchaseInfo.style.alignItems = 'center';
    purchaseInfo.style.justifyContent = 'space-between';
    
    const purchaseText = document.createElement('div');
    purchaseText.textContent = 'Detected purchase:';
    purchaseText.style.color = '#666';
    
    const purchaseAmount = document.createElement('div');
    purchaseAmount.textContent = formatCurrency(purchaseAmount);
    purchaseAmount.style.fontWeight = '600';
    purchaseAmount.style.color = '#000';
    
    purchaseInfo.appendChild(purchaseText);
    purchaseInfo.appendChild(purchaseAmount);
    contentContainer.appendChild(purchaseInfo);
  }
  
  // Create content
  if (recommendations && recommendations.length > 0) {
    const recommendationsList = document.createElement('div');
    recommendationsList.style.marginBottom = '15px';
    
    recommendations.forEach((rec, index) => {
      const card = document.createElement('div');
      card.style.padding = '16px';
      card.style.marginBottom = '12px';
      card.style.borderRadius = '10px';
      card.style.boxShadow = index === 0 
        ? '0 4px 15px rgba(26, 115, 232, 0.15)' 
        : '0 2px 8px rgba(0, 0, 0, 0.05)';
      card.style.backgroundColor = index === 0 ? '#f7fbff' : '#ffffff';
      card.style.border = index === 0 ? '1px solid #d6e9ff' : '1px solid #f0f0f0';
      card.style.position = 'relative';
      card.style.transition = 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
      card.style.cursor = 'pointer';
      
      // Add hover effect
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-2px)';
        card.style.boxShadow = index === 0 
          ? '0 8px 20px rgba(26, 115, 232, 0.2)' 
          : '0 6px 15px rgba(0, 0, 0, 0.1)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = index === 0 
          ? '0 4px 15px rgba(26, 115, 232, 0.15)' 
          : '0 2px 8px rgba(0, 0, 0, 0.05)';
      });
      
      // Badge for best card
      if (index === 0) {
        const badge = document.createElement('div');
        badge.textContent = 'BEST';
        badge.style.position = 'absolute';
        badge.style.top = '-10px';
        badge.style.right = '10px';
        badge.style.backgroundColor = '#4CAF50';
        badge.style.color = 'white';
        badge.style.fontSize = '11px';
        badge.style.fontWeight = '600';
        badge.style.padding = '4px 8px';
        badge.style.borderRadius = '4px';
        badge.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
        card.appendChild(badge);
      }
      
      // Card header with image
      const cardHeader = document.createElement('div');
      cardHeader.style.display = 'flex';
      cardHeader.style.alignItems = 'center';
      cardHeader.style.marginBottom = '14px';
      
      // Card image if available
      if (rec.image_url) {
        const cardImage = document.createElement('img');
        cardImage.src = rec.image_url;
        cardImage.style.width = '60px';
        cardImage.style.height = '38px';
        cardImage.style.objectFit = 'contain';
        cardImage.style.marginRight = '12px';
        cardImage.style.borderRadius = '4px';
        cardImage.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
        
        // Set up error handling for image loading
        cardImage.onerror = () => {
          // Replace with fallback image or just hide
          cardImage.style.display = 'none';
        };
        
        cardHeader.appendChild(cardImage);
      }
      
      // Card title and issuer
      const cardInfo = document.createElement('div');
      
      const cardTitle = document.createElement('div');
      cardTitle.style.fontWeight = '600';
      cardTitle.style.fontSize = '15px';
      cardTitle.style.color = '#333';
      cardTitle.textContent = rec.card_name;
      
      const cardIssuer = document.createElement('div');
      cardIssuer.style.fontSize = '13px';
      cardIssuer.style.color = '#777';
      cardIssuer.textContent = rec.issuer;
      
      cardInfo.appendChild(cardTitle);
      cardInfo.appendChild(cardIssuer);
      cardHeader.appendChild(cardInfo);
      card.appendChild(cardHeader);
      
      // Main reward info
      const rewardInfo = document.createElement('div');
      rewardInfo.style.display = 'flex';
      rewardInfo.style.justifyContent = 'space-between';
      rewardInfo.style.alignItems = 'center';
      rewardInfo.style.marginBottom = '12px';
      
      // Reward percentage
      const rewardPercent = document.createElement('div');
      rewardPercent.style.fontSize = '22px';
      rewardPercent.style.fontWeight = '700';
      rewardPercent.style.color = index === 0 ? '#1a73e8' : '#333';
      rewardPercent.textContent = `${rec.reward_percentage}%`;
      
      // If we have estimated rewards, show them
      const estimatedRewardContainer = document.createElement('div');
      if (rec.estimated_reward) {
        estimatedRewardContainer.style.textAlign = 'right';
        
        const estimatedLabel = document.createElement('div');
        estimatedLabel.textContent = 'Cash back:';
        estimatedLabel.style.fontSize = '12px';
        estimatedLabel.style.color = '#666';
        
        const estimatedAmount = document.createElement('div');
        estimatedAmount.textContent = formatCurrency(rec.estimated_reward);
        estimatedAmount.style.fontSize = '16px';
        estimatedAmount.style.fontWeight = '600';
        estimatedAmount.style.color = '#2ecc71';
        
        estimatedRewardContainer.appendChild(estimatedLabel);
        estimatedRewardContainer.appendChild(estimatedAmount);
      }
      
      rewardInfo.appendChild(rewardPercent);
      rewardInfo.appendChild(estimatedRewardContainer);
      card.appendChild(rewardInfo);
      
      // Reason for recommendation
      if (rec.reason) {
        const reasonInfo = document.createElement('div');
        reasonInfo.style.fontSize = '13px';
        reasonInfo.style.color = '#555';
        reasonInfo.style.margin = '10px 0';
        reasonInfo.style.lineHeight = '1.4';
        reasonInfo.textContent = rec.reason;
        card.appendChild(reasonInfo);
      }
      
      // Tags container
      const tagsContainer = document.createElement('div');
      tagsContainer.style.display = 'flex';
      tagsContainer.style.flexWrap = 'wrap';
      tagsContainer.style.gap = '6px';
      tagsContainer.style.marginTop = '12px';
      
      // Limited time offer badge
      if (rec.is_limited_time_offer) {
        const limitedTimeTag = document.createElement('div');
        limitedTimeTag.textContent = 'LIMITED TIME';
        limitedTimeTag.style.display = 'inline-block';
        limitedTimeTag.style.backgroundColor = '#ff6b6b';
        limitedTimeTag.style.color = 'white';
        limitedTimeTag.style.fontSize = '11px';
        limitedTimeTag.style.fontWeight = '600';
        limitedTimeTag.style.padding = '3px 8px';
        limitedTimeTag.style.borderRadius = '4px';
        tagsContainer.appendChild(limitedTimeTag);
      }
      
      // Annual fee if any
      if (rec.annual_fee > 0) {
        const feeTag = document.createElement('div');
        feeTag.textContent = `Annual fee: ${formatCurrency(rec.annual_fee)}`;
        feeTag.style.display = 'inline-block';
        feeTag.style.backgroundColor = '#f0f0f0';
        feeTag.style.color = '#666';
        feeTag.style.fontSize = '11px';
        feeTag.style.fontWeight = '500';
        feeTag.style.padding = '3px 8px';
        feeTag.style.borderRadius = '4px';
        tagsContainer.appendChild(feeTag);
      } else if (rec.annual_fee === 0) {
        const noFeeTag = document.createElement('div');
        noFeeTag.textContent = 'No annual fee';
        noFeeTag.style.display = 'inline-block';
        noFeeTag.style.backgroundColor = '#e8f5e9';
        noFeeTag.style.color = '#388e3c';
        noFeeTag.style.fontSize = '11px';
        noFeeTag.style.fontWeight = '500';
        noFeeTag.style.padding = '3px 8px';
        noFeeTag.style.borderRadius = '4px';
        tagsContainer.appendChild(noFeeTag);
      }
      
      if (tagsContainer.children.length > 0) {
        card.appendChild(tagsContainer);
      }
      
      recommendationsList.appendChild(card);
    });
    
    contentContainer.appendChild(recommendationsList);
  } else {
    const noRecommendations = document.createElement('div');
    noRecommendations.textContent = 'No card recommendations available';
    noRecommendations.style.padding = '30px 0';
    noRecommendations.style.textAlign = 'center';
    noRecommendations.style.color = '#666';
    contentContainer.appendChild(noRecommendations);
  }
  
  popup.appendChild(contentContainer);
  
  // Add footer with powered by
  const footer = document.createElement('div');
  footer.style.fontSize = '12px';
  footer.style.color = '#999';
  footer.style.textAlign = 'center';
  footer.style.padding = '10px';
  footer.style.borderTop = '1px solid #f0f0f0';
  footer.style.backgroundColor = '#f9f9f9';
  
  const footerText = document.createElement('span');
  footerText.textContent = 'Powered by ';
  
  const footerLink = document.createElement('b');
  footerLink.textContent = 'Swipe';
  footerLink.style.color = '#1a73e8';
  
  footer.appendChild(footerText);
  footer.appendChild(footerLink);
  popup.appendChild(footer);
  
  // Add popup to page
  document.body.appendChild(popup);
  
  // Trigger animation
  setTimeout(() => {
    popup.style.transform = 'translateY(0)';
    popup.style.opacity = '1';
  }, 10);
}

// Check if we're on a checkout page and show recommendations
function checkAndShowRecommendations() {
  console.log("Checking if on checkout page...");
  if (isCheckoutPage()) {
    console.log("Checkout page detected, showing recommendations");
    // Wait a bit to make sure page is fully loaded and prices are rendered
    setTimeout(getCardRecommendations, 2000);
  } else {
    console.log("Not a checkout page");
  }
}

// Run on page load
window.addEventListener('load', checkAndShowRecommendations);

// Listen for URL changes (for single-page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkAndShowRecommendations();
  }
}).observe(document, {subtree: true, childList: true});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'manualRecommendation') {
    getCardRecommendations();
    return true;
  }
}); 