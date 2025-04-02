// Checkout page detection keywords
const checkoutKeywords = [
  'checkout', 'payment', 'cart', 'billing', 'order', 'basket',
  'pay now', 'place order', 'purchase', 'buy now'
];

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
  const pageText = document.body.innerText.toLowerCase();
  const pageUrl = window.location.href.toLowerCase();
  
  // Check URL for checkout indicators
  if (checkoutKeywords.some(keyword => pageUrl.includes(keyword))) {
    return true;
  }
  
  // Check page content for checkout indicators
  if (checkoutKeywords.some(keyword => pageText.includes(keyword))) {
    // Look for payment-related form elements
    const paymentInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
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
        return true;
      }
    }
  }
  
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