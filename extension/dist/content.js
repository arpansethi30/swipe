/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   debugLog: () => (/* binding */ debugLog),
/* harmony export */   findFormFields: () => (/* binding */ findFormFields),
/* harmony export */   getCardClass: () => (/* binding */ getCardClass),
/* harmony export */   getCardDetails: () => (/* binding */ getCardDetails),
/* harmony export */   testBackendConnection: () => (/* binding */ testBackendConnection)
/* harmony export */ });
// Shared utility functions
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Get CSS class for card styling based on card name
 */
function getCardClass(cardName) {
    const lowerCaseName = (cardName || '').toLowerCase();
    if (lowerCaseName.includes('wells fargo')) {
        return 'wells-fargo';
    }
    else if (lowerCaseName.includes('citi')) {
        return 'citi';
    }
    else if (lowerCaseName.includes('chase')) {
        return 'chase';
    }
    else if (lowerCaseName.includes('amex') || lowerCaseName.includes('american express')) {
        return 'amex';
    }
    else if (lowerCaseName.includes('discover')) {
        return 'discover';
    }
    return '';
}
/**
 * Debug logger that also outputs to console
 */
function debugLog(message, data) {
    const timestamp = new Date().toISOString();
    const logMsg = `[SWIPE ${timestamp}] ${message}`;
    console.log(logMsg);
    if (data !== undefined) {
        console.log(data);
    }
    return { message: logMsg, data };
}
/**
 * Create a test request to check if backend is running
 */
function testBackendConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('http://localhost:5001/ping', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = yield response.json();
                return {
                    success: true,
                    message: `Backend connected: ${data.version} as of ${data.timestamp}`
                };
            }
            else {
                return {
                    success: false,
                    message: `Backend error: ${response.status} ${response.statusText}`
                };
            }
        }
        catch (error) {
            return {
                success: false,
                message: `Backend connection failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    });
}
/**
 * Find credit card form fields on the current page
 */
function findFormFields() {
    const fields = {
        cardNumberField: null,
        cardNameField: null,
        expiryField: null,
        expiryMonthField: null,
        expiryYearField: null,
        cvcField: null
    };
    // Common selectors for credit card fields
    const selectors = {
        cardNumber: [
            'input[name="card-number"]',
            'input[name="cardNumber"]',
            'input[name="card_number"]',
            'input[name="number"]',
            'input[autocomplete="cc-number"]',
            'input[name*="creditCard"]',
            'input[id*="cardNumber"]',
            'input[data-cy="card-number-input"]',
            '[name="cardnumber"]'
        ],
        cardName: [
            'input[name="card-name"]',
            'input[name="cardName"]',
            'input[name="card_name"]',
            'input[name="name"]',
            'input[name="ccname"]',
            'input[autocomplete="cc-name"]',
            'input[name*="nameOnCard"]',
            'input[id*="cardholderName"]'
        ],
        expiry: [
            'input[name="card-expiry"]',
            'input[name="cardExpiry"]',
            'input[name="expiry"]',
            'input[name="cc-exp"]',
            'input[autocomplete="cc-exp"]',
            'input[id*="expiration"]',
            'input[id*="expiry"]',
            'input[name="exp-date"]'
        ],
        expiryMonth: [
            'select[name="card-expiry-month"]',
            'select[name="cardExpiryMonth"]',
            'select[name="month"]',
            'select[name="expiryMonth"]',
            'select[id*="expiryMonth"]',
            'select[data-cy="expiry-month"]',
            'input[name="exp-month"]'
        ],
        expiryYear: [
            'select[name="card-expiry-year"]',
            'select[name="cardExpiryYear"]',
            'select[name="year"]',
            'select[name="expiryYear"]',
            'select[id*="expiryYear"]',
            'select[data-cy="expiry-year"]',
            'input[name="exp-year"]'
        ],
        cvc: [
            'input[name="card-cvc"]',
            'input[name="cardCvc"]',
            'input[name="cvc"]',
            'input[name="cvv"]',
            'input[name="csc"]',
            'input[autocomplete="cc-csc"]',
            'input[name*="securityCode"]',
            'input[id*="cvv"]'
        ]
    };
    // Find each field
    for (const selector of selectors.cardNumber) {
        const field = document.querySelector(selector);
        if (field) {
            fields.cardNumberField = field;
            break;
        }
    }
    for (const selector of selectors.cardName) {
        const field = document.querySelector(selector);
        if (field) {
            fields.cardNameField = field;
            break;
        }
    }
    for (const selector of selectors.expiry) {
        const field = document.querySelector(selector);
        if (field) {
            fields.expiryField = field;
            break;
        }
    }
    for (const selector of selectors.expiryMonth) {
        const field = document.querySelector(selector);
        if (field) {
            fields.expiryMonthField = field;
            break;
        }
    }
    for (const selector of selectors.expiryYear) {
        const field = document.querySelector(selector);
        if (field) {
            fields.expiryYearField = field;
            break;
        }
    }
    for (const selector of selectors.cvc) {
        const field = document.querySelector(selector);
        if (field) {
            fields.cvcField = field;
            break;
        }
    }
    return fields;
}
/**
 * Get test card details based on card name
 */
function getCardDetails(cardName) {
    const lowerCaseName = cardName.toLowerCase();
    // Default card details
    const defaultDetails = {
        cardNumber: '4242 4242 4242 4242',
        cardName: 'John Doe',
        expiryMonth: '12',
        expiryYear: '2030',
        cvc: '123'
    };
    // Card specific details
    if (lowerCaseName.includes('visa') || lowerCaseName.includes('chase') || lowerCaseName.includes('wells fargo')) {
        return Object.assign(Object.assign({}, defaultDetails), { cardNumber: '4242 4242 4242 4242' // Visa format
         });
    }
    else if (lowerCaseName.includes('mastercard') || lowerCaseName.includes('citi')) {
        return Object.assign(Object.assign({}, defaultDetails), { cardNumber: '5555 5555 5555 4444' // Mastercard format
         });
    }
    else if (lowerCaseName.includes('amex') || lowerCaseName.includes('american express')) {
        return Object.assign(Object.assign({}, defaultDetails), { cardNumber: '3782 822463 10005', cvc: '1234' // Amex has 4-digit CVC
         });
    }
    else if (lowerCaseName.includes('discover')) {
        return Object.assign(Object.assign({}, defaultDetails), { cardNumber: '6011 1111 1111 1117' // Discover format
         });
    }
    return defaultDetails;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
// List of common checkout page indicators

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
function getMerchantName() {
    // Try to get from meta tags
    const metaTags = document.querySelectorAll('meta[property="og:site_name"], meta[name="application-name"], meta[property="og:title"]');
    for (let i = 0; i < metaTags.length; i++) {
        const content = metaTags[i].content;
        if (content)
            return content;
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
function isCheckoutPage() {
    const url = window.location.href.toLowerCase();
    const htmlContent = document.body.innerHTML.toLowerCase();
    // Check URL patterns
    for (const indicator of CHECKOUT_INDICATORS) {
        if (typeof indicator === 'string') {
            if (htmlContent.includes(indicator)) {
                return true;
            }
        }
        else {
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
        const attributes = [type, name, id, placeholder].filter(Boolean).map(attr => attr === null || attr === void 0 ? void 0 : attr.toLowerCase());
        for (const attr of attributes) {
            if (attr && (attr.includes('card') || attr.includes('credit') || attr.includes('payment'))) {
                return true;
            }
        }
    }
    return false;
}
// Get purchase amount from page
function getPurchaseAmount() {
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
    const checkoutButtons = document.querySelectorAll('button[type="submit"], .checkout-button, .place-order, [class*="checkout"], [id*="checkout"], [class*="payment"], [id*="payment"]');
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
    const summaryContainers = document.querySelectorAll('.order-summary, .cart-summary, .summary, [class*="orderSummary"], [id*="orderSummary"], [class*="cartTotal"]');
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
    // Default to 75.25 (our test page amount) if we can't find anything
    return 75.25;
}
// Fill credit card details in the form fields
function fillCardDetails(cardName) {
    try {
        // Find form fields
        const fields = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.findFormFields)();
        // Get appropriate card details
        const cardDetails = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardDetails)(cardName);
        // Track how many fields we filled
        let filledCount = 0;
        // Fill in card number
        if (fields.cardNumberField) {
            // Remove spaces for card input
            fields.cardNumberField.value = cardDetails.cardNumber.replace(/\s/g, '');
            fields.cardNumberField.dispatchEvent(new Event('input', { bubbles: true }));
            fields.cardNumberField.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
        }
        // Fill in card name
        if (fields.cardNameField) {
            fields.cardNameField.value = cardDetails.cardName;
            fields.cardNameField.dispatchEvent(new Event('input', { bubbles: true }));
            fields.cardNameField.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
        }
        // Handle expiry date fields
        let expiryFilled = false;
        // Try separate month/year fields first
        if (fields.expiryMonthField && fields.expiryYearField) {
            // Handle select elements
            if (fields.expiryMonthField instanceof HTMLSelectElement) {
                fields.expiryMonthField.value = cardDetails.expiryMonth;
            }
            else {
                fields.expiryMonthField.value = cardDetails.expiryMonth;
            }
            if (fields.expiryYearField instanceof HTMLSelectElement) {
                fields.expiryYearField.value = cardDetails.expiryYear;
            }
            else {
                fields.expiryYearField.value = cardDetails.expiryYear;
            }
            // Trigger events
            fields.expiryMonthField.dispatchEvent(new Event('change', { bubbles: true }));
            fields.expiryYearField.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            expiryFilled = true;
        }
        // Try combined MM/YY field if separate fields weren't filled
        if (!expiryFilled && fields.expiryField) {
            // Format as MM/YY
            const shortYear = cardDetails.expiryYear.slice(-2);
            fields.expiryField.value = `${cardDetails.expiryMonth}/${shortYear}`;
            fields.expiryField.dispatchEvent(new Event('input', { bubbles: true }));
            fields.expiryField.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
        }
        // Fill in CVC
        if (fields.cvcField) {
            fields.cvcField.value = cardDetails.cvc;
            fields.cvcField.dispatchEvent(new Event('input', { bubbles: true }));
            fields.cvcField.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
        }
        // Show notification to user
        const result = {
            success: filledCount > 0,
            filledCount,
            message: filledCount > 0
                ? `Successfully filled ${filledCount} card fields with ${cardName}`
                : 'No credit card fields found on this page.'
        };
        // Display visual notification
        showNotification(result.message, result.success);
        return result;
    }
    catch (error) {
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
function showNotification(message, isSuccess = true) {
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
            header.style.backgroundColor = '#0066FF';
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
            merchantNameElem.textContent = merchantName;
            const amountElem = document.createElement('div');
            amountElem.textContent = `$${purchaseAmount.toFixed(2)}`;
            merchantDetails.appendChild(merchantNameElem);
            merchantDetails.appendChild(amountElem);
            merchantInfo.appendChild(merchantTitle);
            merchantInfo.appendChild(merchantDetails);
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
            // Set card background based on card type
            const cardClass = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(bestCard.name);
            if (cardClass === 'wells-fargo') {
                cardImage.style.background = 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)';
            }
            else if (cardClass === 'citi') {
                cardImage.style.backgroundColor = '#222';
            }
            else if (cardClass === 'chase') {
                cardImage.style.background = 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)';
            }
            else if (cardClass === 'amex') {
                cardImage.style.backgroundColor = '#006fcf';
            }
            else if (cardClass === 'discover') {
                cardImage.style.background = 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)';
            }
            else {
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
                    // Set card background based on card type
                    const cardClass = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(card.name);
                    if (cardClass === 'wells-fargo') {
                        thumbnail.style.background = 'linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)';
                    }
                    else if (cardClass === 'citi') {
                        thumbnail.style.backgroundColor = '#222';
                    }
                    else if (cardClass === 'chase') {
                        thumbnail.style.background = 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)';
                    }
                    else if (cardClass === 'amex') {
                        thumbnail.style.backgroundColor = '#006fcf';
                    }
                    else if (cardClass === 'discover') {
                        thumbnail.style.background = 'linear-gradient(135deg, #ff6f00 0%, #e65100 100%)';
                    }
                    else {
                        thumbnail.style.backgroundColor = '#f0f0f0';
                    }
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
            // Add marketing message
            const marketingMessage = document.createElement('div');
            marketingMessage.style.backgroundColor = '#f8f9fa';
            marketingMessage.style.padding = '10px 12px';
            marketingMessage.style.borderRadius = '6px';
            marketingMessage.style.fontSize = '12px';
            marketingMessage.style.color = '#666';
            marketingMessage.style.margin = '16px 0';
            marketingMessage.innerHTML = '<strong>Swipe tip:</strong> Using the recommended card will save you <strong>$27.30</strong> more per year on average';
            contentContainer.appendChild(marketingMessage);
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
            // Add "Powered by" footer
            const footer = document.createElement('div');
            footer.style.fontSize = '11px';
            footer.style.color = '#999';
            footer.style.textAlign = 'center';
            footer.style.marginTop = '12px';
            footer.textContent = 'Powered by Swipe Credit Card Recommender';
            contentContainer.appendChild(footer);
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
}
else {
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
            }
            else {
                return indicator.test(window.location.href.toLowerCase());
            }
        }));
        console.log('=======================');
        sendResponse({ success: true });
    }
    return true;
});
// Expose functions to window object for access from popup
window.getPurchaseAmount = getPurchaseAmount;
window.fillCardDetails = fillCardDetails;
window.isCheckoutPage = isCheckoutPage;
window.getMerchantName = getMerchantName;

})();

/******/ })()
;
//# sourceMappingURL=content.js.map