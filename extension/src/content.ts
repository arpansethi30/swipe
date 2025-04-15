// List of common checkout page indicators
import { getCardClass, getCardDetails, findFormFields } from './utils';

// Add declaration for global window interface to expose our functions
declare global {
  interface Window {
    fillCardDetails: typeof fillCardDetails;
    getPurchaseAmount: typeof getPurchaseAmount;
  }
}

const CHECKOUT_INDICATORS = [
  // URLs
  /checkout/, /payment/, /cart/, /billing/, /order/,
  // DOM elements 
  'credit-card', 'card-number', 'cc-number', 'payment-method', 'checkout-button'
];

// Create the recommendation popup element
function createRecommendationPopup() {
  const popupContainer = document.createElement('div');
  popupContainer.id = 'swipe-card-recommender';
  popupContainer.style.position = 'fixed';
  popupContainer.style.bottom = '20px';
  popupContainer.style.right = '20px';
  popupContainer.style.width = '340px';
  popupContainer.style.backgroundColor = 'white';
  popupContainer.style.borderRadius = '12px';
  popupContainer.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
  popupContainer.style.zIndex = '999999';
  popupContainer.style.transform = 'translateY(20px)';
  popupContainer.style.opacity = '0';
  popupContainer.style.transition = 'all 0.3s ease-in-out';
  popupContainer.style.overflow = 'hidden';
  popupContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif';
  
  return popupContainer;
}

// Get merchant name from current page
function getMerchantName(): string {
  // Try to get from meta tags
  const metaTags = document.querySelectorAll('meta[property="og:site_name"], meta[name="application-name"], meta[property="og:title"]');
  for (let i = 0; i < metaTags.length; i++) {
    const content = (metaTags[i] as HTMLMetaElement).content;
    if (content) return content;
  }
  
  // Try to get from document title
  const titleParts = document.title.split(/[-–—|]/);
  if (titleParts.length > 1) {
    return titleParts[titleParts.length - 1].trim();
  }
  
  // Fall back to hostname
  const hostname = window.location.hostname.replace('www.', '');
  const domainParts = hostname.split('.');
  if (domainParts.length > 0) {
    return domainParts[0];
  }
  
  return hostname;
}

// Check if current page looks like a checkout page
function isCheckoutPage(): boolean {
  const url = window.location.href.toLowerCase();
  const htmlContent = document.body.innerHTML.toLowerCase();
  
  // Check URL patterns
  for (const indicator of CHECKOUT_INDICATORS) {
    if (typeof indicator === 'string') {
      if (htmlContent.includes(indicator)) {
        return true;
      }
    } else {
      // Regexp
      if (indicator.test(url)) {
        return true;
      }
    }
  }
  
  // Check for credit card input fields
  const inputs = document.querySelectorAll('input');
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const type = input.getAttribute('type');
    const name = input.getAttribute('name');
    const id = input.getAttribute('id');
    const placeholder = input.getAttribute('placeholder');
    
    const attributes = [type, name, id, placeholder].filter(Boolean).map(attr => attr?.toLowerCase());
    
    for (const attr of attributes) {
      if (attr && (attr.includes('card') || attr.includes('credit') || attr.includes('payment'))) {
        return true;
      }
    }
  }
  
  return false;
}

// Get purchase amount from page with improved detection
function getPurchaseAmount(): number {
  // Priority selectors for total amount
  const prioritySelectors = [
    '[data-testid="order-summary-total"]',
    '.order-summary-total',
    '#order-summary-total',
    '.cart-total',
    '#cart-total',
    '.grand-total',
    '#grand-total'
  ];
  
  // Regular price selectors as fallback
  const priceSelectors = [
    // Specific total amount selectors
    '.total', '#total', '.subtotal', '#subtotal', 
    'span[class*="total"]', 'div[class*="total"]',
    'p[class*="total"]', 'h3[class*="total"]',
    'h4[class*="total"]', 'h2[class*="total"]',
    
    // Price and amount selectors
    '.price', '#price', '[class*="price"]', '[id*="price"]',
    '[class*="amount"]', '[id*="amount"]',
    
    // Checkout/Order specific selectors
    '[class*="checkout-total"]', '[id*="checkout-total"]',
    '[class*="order-total"]', '[id*="order-total"]',
    
    // Payment-related selectors
    '[class*="payment"][class*="amount"]',
    '[id*="payment"][id*="amount"]'
  ];
  
  // First try priority selectors
  for (const selector of prioritySelectors) {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = element.textContent;
      if (text) {
        // Look for dollar sign followed by numbers and decimal
        const match = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
        if (match && match[1]) {
          // Remove commas and parse as float
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
  }
  
  // If not found, try the regular selectors
  for (const selector of priceSelectors) {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const text = element.textContent;
      if (text) {
        // Look for dollar sign followed by numbers and decimal
        const match = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
        if (match && match[1]) {
          // Remove commas and parse as float
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
  }
  
  // If we still can't find a price, scan the entire page for dollar amounts
  const allTextNodes = document.createTreeWalker(
    document.body, 
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  let largestAmount = 0;
  
  while (node = allTextNodes.nextNode()) {
    const text = node.textContent || '';
    const matches = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/g);
    
    if (matches) {
      matches.forEach(match => {
        const amountStr = match.replace('$', '').trim().replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > largestAmount) {
          largestAmount = amount;
        }
      });
    }
  }
  
  if (largestAmount > 0) {
    return largestAmount;
  }
  
  // Default to $40.50 if we can't find a price (for demo consistency)
  return 40.50;
}

// Fill in credit card details
function fillCardDetails(cardName: string) {
  // Get card details
  const cardDetails = getCardDetails(cardName);
  
  // Find form fields
  const fields = findFormFields();
  
  // Set up a function to update field value and trigger events
  const updateField = (element: HTMLElement, value: string) => {
    if (element instanceof HTMLInputElement) {
      element.value = value;
      
      // Trigger events to notify form validation
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('blur', { bubbles: true }));
    } else if (element instanceof HTMLSelectElement) {
      element.value = value;
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };
  
  // Fill card number
  if (fields.cardNumber) {
    updateField(fields.cardNumber, cardDetails.number);
  }
  
  // Fill cardholder name
  if (fields.cardName) {
    updateField(fields.cardName, cardDetails.name);
  }
  
  // Fill expiry date - either as combined MM/YY or separate month/year
  if (fields.expiryDate) {
    updateField(fields.expiryDate, cardDetails.expiry);
  } else {
    // Handle separate month/year fields if available
    if (fields.expiryMonth) {
      const month = cardDetails.expiry.split('/')[0];
      updateField(fields.expiryMonth, month);
    }
    
    if (fields.expiryYear) {
      const year = cardDetails.expiry.split('/')[1];
      // Some forms need 4-digit years, others need 2-digit
      if (fields.expiryYear instanceof HTMLSelectElement && 
          Array.from(fields.expiryYear.options).some(opt => opt.value.length === 4)) {
        updateField(fields.expiryYear, `20${year}`);
      } else {
        updateField(fields.expiryYear, year);
      }
    }
  }
  
  // Fill CVV/CVC code
  if (fields.cvv) {
    updateField(fields.cvv, cardDetails.cvv);
  }
  
  // Return a success message with the number of fields filled
  const filledCount = Object.values(fields).filter(Boolean).length;
  return {
    success: filledCount > 0,
    filledCount,
    message: filledCount > 0 
      ? `Successfully filled ${filledCount} credit card fields`
      : 'Could not find credit card form fields'
  };
}

// Show the recommendation popup
function showRecommendationPopup() {
  const merchantName = getMerchantName();
  const purchaseAmount = getPurchaseAmount();
  
  // Send message to background script to get card recommendations
  chrome.runtime.sendMessage({
    action: 'getRecommendations',
    merchant: merchantName,
    amount: purchaseAmount
  }, (response) => {
    if (response && response.recommendations) {
      // Create and show popup with recommendations
      const popup = createRecommendationPopup();
      
      // Create inner container for content
      const contentContainer = document.createElement('div');
      contentContainer.style.padding = '24px';
      contentContainer.style.position = 'relative';
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '✕';
      closeButton.style.position = 'absolute';
      closeButton.style.top = '16px';
      closeButton.style.right = '16px';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '20px';
      closeButton.style.color = '#555';
      closeButton.style.cursor = 'pointer';
      closeButton.style.padding = '4px';
      closeButton.style.lineHeight = '1';
      
      closeButton.addEventListener('click', () => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(20px)';
        setTimeout(() => {
          popup.remove();
        }, 300);
      });
      
      contentContainer.appendChild(closeButton);
      
      // Get the best card (first in recommendations)
      const bestCard = response.recommendations[0];
      
      // Create card display section
      const cardDisplay = document.createElement('div');
      cardDisplay.style.display = 'flex';
      cardDisplay.style.alignItems = 'center';
      cardDisplay.style.marginBottom = '16px';
      
      // Card image
      const cardImage = document.createElement('div');
      cardImage.style.width = '80px';
      cardImage.style.height = '50px';
      cardImage.style.borderRadius = '6px';
      cardImage.style.marginRight = '16px';
      cardImage.style.position = 'relative';
      cardImage.style.overflow = 'hidden';
      cardImage.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      
      // Set card background based on card type
      const cardClass = getCardClass(bestCard.name);
      if (cardClass === 'wells-fargo') {
        cardImage.style.background = 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)';
      } else if (cardClass === 'citi') {
        cardImage.style.backgroundColor = '#222';
      } else if (cardClass === 'chase') {
        cardImage.style.background = 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)';
      } else if (cardClass === 'amex') {
        cardImage.style.backgroundColor = '#006fcf';
      } else if (cardClass === 'discover') {
        cardImage.style.background = 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)';
      } else {
        cardImage.style.backgroundColor = '#f0f0f0';
      }
      
      // Add checkmark indicator
      const selectedIndicator = document.createElement('div');
      selectedIndicator.style.position = 'absolute';
      selectedIndicator.style.top = '-10px';
      selectedIndicator.style.right = '-10px';
      selectedIndicator.style.width = '24px';
      selectedIndicator.style.height = '24px';
      selectedIndicator.style.backgroundColor = '#0066FF';
      selectedIndicator.style.borderRadius = '50%';
      selectedIndicator.style.display = 'flex';
      selectedIndicator.style.alignItems = 'center';
      selectedIndicator.style.justifyContent = 'center';
      selectedIndicator.style.color = 'white';
      selectedIndicator.style.fontSize = '14px';
      selectedIndicator.innerHTML = '✓';
      cardImage.appendChild(selectedIndicator);
      
      // Card info section
      const cardInfo = document.createElement('div');
      cardInfo.style.flex = '1';
      
      // Cashback amount
      const cashbackAmount = document.createElement('div');
      cashbackAmount.style.fontSize = '24px';
      cashbackAmount.style.fontWeight = '600';
      cashbackAmount.style.margin = '0 0 4px 0';
      cashbackAmount.textContent = `$${bestCard.cashback.toFixed(2)} cash back`;
      
      // Card name
      const cardName = document.createElement('div');
      cardName.style.fontSize = '16px';
      cardName.style.color = '#333';
      cardName.style.margin = '0';
      cardName.textContent = bestCard.name;
      
      // Assemble card info
      cardInfo.appendChild(cashbackAmount);
      cardInfo.appendChild(cardName);
      
      // Assemble card display
      cardDisplay.appendChild(cardImage);
      cardDisplay.appendChild(cardInfo);
      contentContainer.appendChild(cardDisplay);
      
      // Create alternative cards section
      if (response.recommendations.length > 1) {
        const alternativeCards = document.createElement('div');
        alternativeCards.style.display = 'flex';
        alternativeCards.style.alignItems = 'center';
        alternativeCards.style.justifyContent = 'space-between';
        alternativeCards.style.margin = '12px 0';
        alternativeCards.style.paddingTop = '12px';
        alternativeCards.style.borderTop = '1px solid #eee';
        
        // Thumbnails container
        const thumbnails = document.createElement('div');
        thumbnails.style.display = 'flex';
        
        // Add thumbnails for alternative cards (max 3)
        const maxThumbnails = Math.min(3, response.recommendations.length - 1);
        for (let i = 0; i < maxThumbnails; i++) {
          const card = response.recommendations[i + 1];
          const thumbnail = document.createElement('div');
          thumbnail.style.width = '40px';
          thumbnail.style.height = '28px';
          thumbnail.style.borderRadius = '4px';
          thumbnail.style.marginRight = '6px';
          thumbnail.style.position = 'relative';
          thumbnail.style.overflow = 'hidden';
          thumbnail.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
          thumbnail.style.cursor = 'pointer';
          
          // Set card background based on card type
          const cardClass = getCardClass(card.name);
          if (cardClass === 'wells-fargo') {
            thumbnail.style.background = 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)';
          } else if (cardClass === 'citi') {
            thumbnail.style.backgroundColor = '#222';
          } else if (cardClass === 'chase') {
            thumbnail.style.background = 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)';
          } else if (cardClass === 'amex') {
            thumbnail.style.backgroundColor = '#006fcf';
          } else if (cardClass === 'discover') {
            thumbnail.style.background = 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)';
          } else {
            thumbnail.style.backgroundColor = '#f0f0f0';
          }
          
          // Add click handler for selecting this card
          thumbnail.addEventListener('click', () => {
            // Update selected card in UI
            cardImage.className = `card-image ${getCardClass(card.name)}`;
            cardImage.style.background = thumbnail.style.background;
            cardImage.style.backgroundColor = thumbnail.style.backgroundColor;
            
            // Update card info
            cashbackAmount.textContent = `$${card.cashback.toFixed(2)} cash back`;
            cardName.textContent = card.name;
            
            // Update pay button to use this card
            payButton.onclick = () => {
              const result = fillCardDetails(card.name);
              
              // Show notification
              const notification = document.createElement('div');
              notification.style.position = 'fixed';
              notification.style.bottom = '20px';
              notification.style.left = '50%';
              notification.style.transform = 'translateX(-50%)';
              notification.style.padding = '10px 20px';
              notification.style.borderRadius = '4px';
              notification.style.backgroundColor = result.success ? '#4CAF50' : '#F44336';
              notification.style.color = 'white';
              notification.style.zIndex = '99999';
              notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
              notification.textContent = result.message;
              
              document.body.appendChild(notification);
              
              // Close popup
              popup.style.opacity = '0';
              popup.style.transform = 'translateY(20px)';
              
              // Remove elements after animation
              setTimeout(() => {
                popup.remove();
                
                // Auto-remove notification after 3 seconds
                setTimeout(() => {
                  notification.style.opacity = '0';
                  setTimeout(() => notification.remove(), 300);
                }, 3000);
              }, 300);
            };
          });
          
          thumbnails.appendChild(thumbnail);
        }
        
        // Add "more cards" indicator if needed
        if (response.recommendations.length > 4) {
          const moreCards = document.createElement('span');
          moreCards.style.fontSize = '14px';
          moreCards.style.color = '#888';
          moreCards.style.marginLeft = '6px';
          moreCards.textContent = `+${response.recommendations.length - 4}`;
          thumbnails.appendChild(moreCards);
        }
        
        // Add "see all cards" link
        const seeAll = document.createElement('a');
        seeAll.style.color = '#888';
        seeAll.style.fontSize = '14px';
        seeAll.style.textDecoration = 'none';
        seeAll.style.display = 'flex';
        seeAll.style.alignItems = 'center';
        seeAll.textContent = 'see all cards';
        seeAll.href = '#';
        
        // Add arrow to "see all cards"
        const arrow = document.createElement('span');
        arrow.style.marginLeft = '4px';
        arrow.style.fontSize = '18px';
        arrow.textContent = '›';
        seeAll.appendChild(arrow);
        
        // Assemble alternative cards section
        alternativeCards.appendChild(thumbnails);
        alternativeCards.appendChild(seeAll);
        contentContainer.appendChild(alternativeCards);
      }
      
      // Add "pay with selected card" button
      const payButton = document.createElement('button');
      payButton.style.display = 'flex';
      payButton.style.alignItems = 'center';
      payButton.style.justifyContent = 'center';
      payButton.style.width = '100%';
      payButton.style.padding = '15px';
      payButton.style.backgroundColor = '#000';
      payButton.style.color = 'white';
      payButton.style.border = 'none';
      payButton.style.borderRadius = '8px';
      payButton.style.fontSize = '16px';
      payButton.style.fontWeight = '500';
      payButton.style.cursor = 'pointer';
      payButton.style.marginTop = '20px';
      
      payButton.innerHTML = `
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
          <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" stroke-width="2"/>
          <line x1="1" y1="5" x2="19" y2="5" stroke="white" stroke-width="2"/>
        </svg>
        pay with selected card
      `;
      
      // Add click handler for the pay button
      payButton.onclick = () => {
        const result = fillCardDetails(bestCard.name);
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '4px';
        notification.style.backgroundColor = result.success ? '#4CAF50' : '#F44336';
        notification.style.color = 'white';
        notification.style.zIndex = '99999';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        notification.textContent = result.message;
        
        document.body.appendChild(notification);
        
        // Close popup
        popup.style.opacity = '0';
        popup.style.transform = 'translateY(20px)';
        
        // Remove elements after animation
        setTimeout(() => {
          popup.remove();
          
          // Auto-remove notification after 3 seconds
          setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
          }, 3000);
        }, 300);
      };
      
      contentContainer.appendChild(payButton);
      
      // Add container to popup
      popup.appendChild(contentContainer);
      
      // Add to page
      document.body.appendChild(popup);
      
      // Animate popup
      setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateY(0)';
      }, 100);
    }
  });
}

// Main function to detect checkout and show recommendations
function main() {
  // Check if we're on a checkout page
  if (isCheckoutPage()) {
    // Wait a moment to ensure the page is fully loaded
    setTimeout(() => {
      showRecommendationPopup();
    }, 1500);
  }
}

// Run main function when page is fully loaded
if (document.readyState === 'complete') {
  main();
} else {
  window.addEventListener('load', main);
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkCheckoutPage') {
    sendResponse({ isCheckout: isCheckoutPage() });
  }
  return true;
});

// Expose the functions globally so they can be accessed by the popup script
window.fillCardDetails = fillCardDetails;
window.getPurchaseAmount = getPurchaseAmount; 