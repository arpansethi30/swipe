// List of common checkout page indicators
import { getCardClass, getCardDetails, findFormFields, getCardImageUrl } from './utils';

// No need to redeclare Window interface as it's now in utils.ts

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
  
  // Core styles
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
  popupContainer.style.border = '1px solid rgba(0,0,0,0.1)';
  
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

// Get purchase amount from page
function getPurchaseAmount(): number {
  // First try to find dedicated total amount elements
  const totalSelectors = [
    '#total-amount',
    '.total-amount',
    '[data-testid="order-summary-total"]',
    '.total-row .amount',
    '.grand-total',
    '.order-total',
    '.cart-total',
    '[class*="totalAmount"]',
    '[class*="total-amount"]',
    '[id*="totalAmount"]',
    '[id*="total-amount"]',
    '.total',
    '[class*="orderTotal"]',
    '.cart__total'
  ];
  
  // Try each selector
  for (const selector of totalSelectors) {
    const elements = document.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const textContent = element.textContent;
      if (textContent) {
        const match = textContent.match(/\$\s*([\d,]+\.?\d*)/);
        if (match && match[1]) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
  }
  
  // Next, try looking for price patterns near checkout button
  const checkoutButtons = document.querySelectorAll(
    'button[type="submit"], .checkout-button, .place-order, [class*="checkout"], [id*="checkout"], [class*="payment"], [id*="payment"]'
  );
  
  for (let i = 0; i < checkoutButtons.length; i++) {
    const button = checkoutButtons[i];
    // Check the button's text
    const buttonText = button.textContent || '';
    const buttonMatch = buttonText.match(/\$\s*([\d,]+\.?\d*)/);
    if (buttonMatch && buttonMatch[1]) {
      return parseFloat(buttonMatch[1].replace(/,/g, ''));
    }
    
    // Check parent and siblings
    const parent = button.parentElement;
    if (parent) {
      const nearbyText = parent.textContent || '';
      const nearbyMatch = nearbyText.match(/\$\s*([\d,]+\.?\d*)/);
      if (nearbyMatch && nearbyMatch[1]) {
        return parseFloat(nearbyMatch[1].replace(/,/g, ''));
      }
    }
  }
  
  // Try to find order summary or cart total sections
  const summaryContainers = document.querySelectorAll(
    '.order-summary, .cart-summary, .summary, [class*="orderSummary"], [id*="orderSummary"], [class*="cartTotal"]'
  );
  
  for (let i = 0; i < summaryContainers.length; i++) {
    const container = summaryContainers[i];
    // Look for the text with word "total" near a dollar amount
    const rows = container.querySelectorAll('div, tr, p');
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      const text = row.textContent || '';
      if (text.toLowerCase().includes('total')) {
        const match = text.match(/\$\s*([\d,]+\.?\d*)/);
        if (match && match[1]) {
          return parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }
  }
  
  // Fallback: scan the whole page for dollar amounts (less accurate)
  const bodyText = document.body.textContent || '';
  const bodyMatches = bodyText.match(/total.*?\$\s*([\d,]+\.?\d*)/i) || 
                      bodyText.match(/\$\s*([\d,]+\.?\d*)/);
  
  if (bodyMatches && bodyMatches[1]) {
    return parseFloat(bodyMatches[1].replace(/,/g, ''));
  }
  
  // Return 0 if we can't detect an amount
  console.log('Could not detect purchase amount, defaulting to 0');
  return 0;
}

// Fill credit card details in the form fields
function fillCardDetails(cardName: string): { success: boolean; filledCount: number; message: string } {
  try {
    // Find form fields
    const fields = findFormFields();
    
    // Get appropriate card details
    const cardDetails = getCardDetails(cardName);
    
    // Track how many fields we filled
    let filledCount = 0;
    
    // Fill in card number
    if (fields.cardNumberField) {
      const cleanCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      // Only update if the field doesn't already have the correct value
      if (fields.cardNumberField.value !== cleanCardNumber) {
        fields.cardNumberField.value = cleanCardNumber;
        fields.cardNumberField.dispatchEvent(new Event('input', { bubbles: true }));
        fields.cardNumberField.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
    
    // Fill in card name
    if (fields.cardNameField) {
      // Only update if the field doesn't already have the correct value
      if (fields.cardNameField.value !== cardDetails.cardName) {
        fields.cardNameField.value = cardDetails.cardName;
        fields.cardNameField.dispatchEvent(new Event('input', { bubbles: true }));
        fields.cardNameField.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
    
    // Handle expiry date fields
    let expiryFilled = false;
    
    // Try separate month/year fields first
    if (fields.expiryMonthField && fields.expiryYearField) {
      let monthUpdated = false;
      let yearUpdated = false;
      
      // Handle select elements
      if (fields.expiryMonthField instanceof HTMLSelectElement) {
        if (fields.expiryMonthField.value !== cardDetails.expiryMonth) {
          fields.expiryMonthField.value = cardDetails.expiryMonth;
          monthUpdated = true;
        }
      } else {
        if (fields.expiryMonthField.value !== cardDetails.expiryMonth) {
          fields.expiryMonthField.value = cardDetails.expiryMonth;
          monthUpdated = true;
        }
      }
      
      if (fields.expiryYearField instanceof HTMLSelectElement) {
        if (fields.expiryYearField.value !== cardDetails.expiryYear) {
          fields.expiryYearField.value = cardDetails.expiryYear;
          yearUpdated = true;
        }
      } else {
        if (fields.expiryYearField.value !== cardDetails.expiryYear) {
          fields.expiryYearField.value = cardDetails.expiryYear;
          yearUpdated = true;
        }
      }
      
      // Only trigger events if values were updated
      if (monthUpdated) {
        fields.expiryMonthField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (yearUpdated) {
        fields.expiryYearField.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (monthUpdated || yearUpdated) {
        filledCount++;
      }
      
      expiryFilled = true;
    }
    
    // Try combined MM/YY field if separate fields weren't filled
    if (!expiryFilled && fields.expiryField) {
      // Format as MM/YY
      const shortYear = cardDetails.expiryYear.slice(-2);
      const formattedExpiry = `${cardDetails.expiryMonth}/${shortYear}`;
      
      // Only update if the field doesn't already have the correct value
      if (fields.expiryField.value !== formattedExpiry) {
        fields.expiryField.value = formattedExpiry;
        fields.expiryField.dispatchEvent(new Event('input', { bubbles: true }));
        fields.expiryField.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
    
    // Fill in CVC
    if (fields.cvcField) {
      // Only update if the field doesn't already have the correct value
      if (fields.cvcField.value !== cardDetails.cvc) {
        fields.cvcField.value = cardDetails.cvc;
        fields.cvcField.dispatchEvent(new Event('input', { bubbles: true }));
        fields.cvcField.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      }
    }
    
    // Show notification to user
    const result = { 
      success: filledCount > 0, 
      filledCount, 
      message: filledCount > 0 
        ? `Successfully filled ${filledCount} card fields with ${cardName}` 
        : filledCount === 0 && Object.values(fields).some(Boolean)
          ? 'Card details already filled correctly'
          : 'No credit card fields found on this page.' 
    };
    
    // Display visual notification
    showNotification(result.message, result.success);
    
    return result;
  } catch (error) {
    console.error('Error filling card details:', error);
    const errorMessage = `Error filling card details: ${error instanceof Error ? error.message : String(error)}`;
    
    // Show error notification
    showNotification(errorMessage, false);
    
    return { 
      success: false, 
      filledCount: 0, 
      message: errorMessage
    };
  }
}

// Show a notification toast message
function showNotification(message: string, isSuccess: boolean = true): void {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.position = 'fixed';
  notification.style.bottom = '80px';
  notification.style.right = '20px';
  notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#F44336';
  notification.style.color = 'white';
  notification.style.padding = '12px 20px';
  notification.style.borderRadius = '4px';
  notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  notification.style.zIndex = '999999';
  notification.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  notification.style.fontSize = '14px';
  notification.style.transition = 'opacity 0.5s, transform 0.5s';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(20px)';
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    
    // Remove from DOM after fade out
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 500);
  }, 3000);
}

// Show the recommendation popup
function showRecommendationPopup() {
  const merchantName = getMerchantName();
  const purchaseAmount = getPurchaseAmount();
  
  console.log(`Getting recommendations for ${merchantName} with amount ${purchaseAmount}`);
  
  // Send message to background script to get card recommendations
  chrome.runtime.sendMessage({
    action: 'getRecommendations',
    merchant: merchantName,
    amount: purchaseAmount
  }, (response) => {
    if (response && response.recommendations) {
      console.log('Received recommendations:', response.recommendations);
      
      // Create and show popup with recommendations
      const popup = createRecommendationPopup();
      
      // Create header for branding
      const header = document.createElement('div');
      header.style.backgroundColor = '#000000';
      header.style.color = 'white';
      header.style.padding = '12px 16px';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.justifyContent = 'space-between';
      
      // Create logo/brand
      const brand = document.createElement('div');
      brand.style.display = 'flex';
      brand.style.alignItems = 'center';
      
      // Add logo
      const logo = document.createElement('div');
      logo.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#FFFFFF"/>
          <path d="M6 10H18V17C18 17.5523 17.5523 18 17 18H7C6.44772 18 6 17.5523 6 17V10Z" fill="#0066FF"/>
          <rect x="6" y="6" width="12" height="3" rx="1" fill="#FFFFFF"/>
          <rect x="9" y="13" width="6" height="2" rx="1" fill="white"/>
        </svg>
      `;
      
      // Add brand name
      const brandName = document.createElement('span');
      brandName.textContent = 'Swipe';
      brandName.style.marginLeft = '8px';
      brandName.style.fontWeight = '600';
      brandName.style.fontSize = '16px';
      
      brand.appendChild(logo);
      brand.appendChild(brandName);
      
      // Add close button
      const closeButton = document.createElement('button');
      closeButton.textContent = '✕';
      closeButton.style.backgroundColor = 'transparent';
      closeButton.style.border = 'none';
      closeButton.style.fontSize = '16px';
      closeButton.style.color = 'white';
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
      
      header.appendChild(brand);
      header.appendChild(closeButton);
      
      popup.appendChild(header);
      
      // Create inner container for content
      const contentContainer = document.createElement('div');
      contentContainer.style.padding = '16px';
      contentContainer.style.position = 'relative';
      
      // Add merchant and amount info
      const merchantInfo = document.createElement('div');
      merchantInfo.style.marginBottom = '16px';
      merchantInfo.style.padding = '8px 12px';
      merchantInfo.style.backgroundColor = '#f8f9fa';
      merchantInfo.style.borderRadius = '6px';
      merchantInfo.style.fontSize = '13px';
      
      const merchantTitle = document.createElement('div');
      merchantTitle.style.color = '#666';
      merchantTitle.textContent = 'Purchase Details';
      
      const merchantDetails = document.createElement('div');
      merchantDetails.style.display = 'flex';
      merchantDetails.style.justifyContent = 'space-between';
      merchantDetails.style.fontWeight = '500';
      merchantDetails.style.marginTop = '4px';
      
      const merchantNameElem = document.createElement('div');
      merchantNameElem.textContent = response.merchant || merchantName;
      
      const amountElem = document.createElement('div');
      amountElem.textContent = `$${purchaseAmount.toFixed(2)}`;
      
      merchantDetails.appendChild(merchantNameElem);
      merchantDetails.appendChild(amountElem);
      
      merchantInfo.appendChild(merchantTitle);
      merchantInfo.appendChild(merchantDetails);
      
      // Add confidence indicator
      if (response.confidence) {
        const confidenceRow = document.createElement('div');
        confidenceRow.style.display = 'flex';
        confidenceRow.style.justifyContent = 'space-between';
        confidenceRow.style.alignItems = 'center';
        confidenceRow.style.marginTop = '8px';
        confidenceRow.style.fontSize = '11px';
        
        const confidenceLabel = document.createElement('div');
        confidenceLabel.textContent = 'Merchant detection:';
        confidenceLabel.style.color = '#666';
        
        const confidenceBadge = document.createElement('div');
        confidenceBadge.style.padding = '2px 6px';
        confidenceBadge.style.borderRadius = '10px';
        confidenceBadge.style.fontSize = '10px';
        confidenceBadge.style.fontWeight = '500';
        confidenceBadge.style.textTransform = 'uppercase';
        
        // Style based on confidence level
        switch(response.confidence) {
          case 'high':
            confidenceBadge.textContent = 'High confidence';
            confidenceBadge.style.backgroundColor = '#e6f7ed';
            confidenceBadge.style.color = '#1e7e45';
            break;
          case 'medium':
            confidenceBadge.textContent = 'Medium confidence';
            confidenceBadge.style.backgroundColor = '#fff8e6';
            confidenceBadge.style.color = '#b17520';
            break;
          case 'low':
          default:
            confidenceBadge.textContent = 'Best guess';
            confidenceBadge.style.backgroundColor = '#f8f9fa';
            confidenceBadge.style.color = '#666';
            break;
        }
        
        confidenceRow.appendChild(confidenceLabel);
        confidenceRow.appendChild(confidenceBadge);
        merchantInfo.appendChild(confidenceRow);
      }
      
      contentContainer.appendChild(merchantInfo);
      
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
      
      // Add card image
      const cardImg = document.createElement('img');
      cardImg.src = getCardImageUrl(bestCard.name);
      cardImg.style.width = '100%';
      cardImg.style.height = '100%';
      cardImg.style.objectFit = 'cover';
      cardImage.appendChild(cardImg);
      
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
      
      // Best card label
      const bestCardLabel = document.createElement('div');
      bestCardLabel.style.fontSize = '12px';
      bestCardLabel.style.color = '#0066FF';
      bestCardLabel.style.fontWeight = '600';
      bestCardLabel.style.marginBottom = '2px';
      bestCardLabel.textContent = 'BEST CARD FOR YOU';
      cardInfo.appendChild(bestCardLabel);
      
      // Cashback amount
      const cashbackAmount = document.createElement('div');
      cashbackAmount.style.fontSize = '20px';
      cashbackAmount.style.fontWeight = '600';
      cashbackAmount.style.margin = '0 0 4px 0';
      cashbackAmount.textContent = `$${bestCard.cashback.toFixed(2)} cash back`;
      
      // Card name
      const cardName = document.createElement('div');
      cardName.style.fontSize = '15px';
      cardName.style.color = '#333';
      cardName.style.margin = '0';
      cardName.textContent = bestCard.name;
      
      // Reward percentage
      const rewardPercentage = document.createElement('div');
      rewardPercentage.style.fontSize = '13px';
      rewardPercentage.style.color = '#666';
      rewardPercentage.style.marginTop = '2px';
      rewardPercentage.textContent = `${bestCard.reward_percentage}% on this purchase`;
      
      // Assemble card info
      cardInfo.appendChild(cashbackAmount);
      cardInfo.appendChild(cardName);
      cardInfo.appendChild(rewardPercentage);
      
      // Assemble card display
      cardDisplay.appendChild(cardImage);
      cardDisplay.appendChild(cardInfo);
      contentContainer.appendChild(cardDisplay);
      
      // Create alternative cards section
      if (response.recommendations.length > 1) {
        // Section divider
        const divider = document.createElement('div');
        divider.style.height = '1px';
        divider.style.backgroundColor = '#eee';
        divider.style.margin = '8px 0 16px 0';
        contentContainer.appendChild(divider);
        
        // Alternative cards title
        const alternativeTitle = document.createElement('div');
        alternativeTitle.style.fontSize = '14px';
        alternativeTitle.style.fontWeight = '500';
        alternativeTitle.style.marginBottom = '10px';
        alternativeTitle.textContent = 'Other Options';
        contentContainer.appendChild(alternativeTitle);
        
        const alternativeCards = document.createElement('div');
        alternativeCards.style.display = 'flex';
        alternativeCards.style.alignItems = 'center';
        alternativeCards.style.justifyContent = 'space-between';
        alternativeCards.style.margin = '12px 0';
        
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
          thumbnail.style.transition = 'transform 0.2s ease';
          
          // Add card image
          const thumbImg = document.createElement('img');
          thumbImg.src = getCardImageUrl(card.name);
          thumbImg.style.width = '100%';
          thumbImg.style.height = '100%';
          thumbImg.style.objectFit = 'cover';
          thumbnail.appendChild(thumbImg);
          
          // Add tooltip with card name and cashback
          thumbnail.title = `${card.name}: $${card.cashback.toFixed(2)} cashback`;
          
          // Add hover effect
          thumbnail.addEventListener('mouseover', () => {
            thumbnail.style.transform = 'translateY(-2px)';
          });
          
          thumbnail.addEventListener('mouseout', () => {
            thumbnail.style.transform = 'translateY(0)';
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
        seeAll.style.color = '#0066FF';
        seeAll.style.fontSize = '14px';
        seeAll.style.textDecoration = 'none';
        seeAll.style.display = 'flex';
        seeAll.style.alignItems = 'center';
        seeAll.textContent = 'see all cards';
        seeAll.href = '#';
        seeAll.style.fontWeight = '500';
        
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
      payButton.style.fontSize = '15px';
      payButton.style.fontWeight = '500';
      payButton.style.cursor = 'pointer';
      payButton.style.transition = 'background-color 0.2s ease, transform 0.1s ease';
      
      // Add hover and active effects
      payButton.addEventListener('mouseover', () => {
        payButton.style.backgroundColor = '#333';
      });
      
      payButton.addEventListener('mouseout', () => {
        payButton.style.backgroundColor = '#000';
      });
      
      payButton.addEventListener('mousedown', () => {
        payButton.style.transform = 'scale(0.98)';
      });
      
      payButton.addEventListener('mouseup', () => {
        payButton.style.transform = 'scale(1)';
      });
      
      payButton.addEventListener('click', () => {
        // Call fillCardDetails function
        const result = fillCardDetails(bestCard.name);
        
        // Close popup if filling was successful
        if (result.success) {
          setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transform = 'translateY(20px)';
            setTimeout(() => {
              popup.remove();
            }, 300);
          }, 2000); // Give time for notification to be seen
        }
      });
      
      payButton.innerHTML = `
        <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 10px;">
          <rect x="1" y="1" width="18" height="14" rx="2" stroke="white" stroke-width="2"/>
          <line x1="1" y1="5" x2="19" y2="5" stroke="white" stroke-width="2"/>
        </svg>
        Pay with ${bestCard.name}
      `;
      
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
  else if (message.action === 'forceShowRecommendations') {
    console.log('Force showing recommendations...');
    showRecommendationPopup();
    sendResponse({ success: true });
  }
  else if (message.action === 'logDebugInfo') {
    console.log('=== SWIPE DEBUG INFO ===');
    console.log('Is checkout page:', isCheckoutPage());
    console.log('Merchant name:', getMerchantName());
    console.log('Purchase amount:', getPurchaseAmount());
    console.log('URL:', window.location.href);
    console.log('Document title:', document.title);
    console.log('Checkout indicators found:', CHECKOUT_INDICATORS.filter(indicator => {
      if (typeof indicator === 'string') {
        return document.body.innerHTML.toLowerCase().includes(indicator);
      } else {
        return indicator.test(window.location.href.toLowerCase());
      }
    }));
    console.log('=======================');
    sendResponse({ success: true });
  }
  return true;
});

// Expose functions to window object for access from popup
(window as any).getPurchaseAmount = getPurchaseAmount;
(window as any).fillCardDetails = fillCardDetails;
(window as any).isCheckoutPage = isCheckoutPage;
(window as any).getMerchantName = getMerchantName; 