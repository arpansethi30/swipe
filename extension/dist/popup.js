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
/* harmony export */   getCardImageUrl: () => (/* binding */ getCardImageUrl),
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
    const name = cardName.toLowerCase();
    if (name.includes('wells fargo') || name.includes('wellsfargo')) {
        return 'wells-fargo';
    }
    else if (name.includes('citi') || name.includes('citibank')) {
        return 'citi';
    }
    else if (name.includes('chase') || name.includes('freedom') || name.includes('sapphire')) {
        return 'chase';
    }
    else if (name.includes('amex') || name.includes('american express')) {
        return 'amex';
    }
    else if (name.includes('discover')) {
        return 'discover';
    }
    else if (name.includes('capital one') || name.includes('capitalOne')) {
        return 'capital-one';
    }
    else if (name.includes('bilt')) {
        return 'bilt';
    }
    return '';
}
/**
 * Get card image URL based on card name
 */
function getCardImageUrl(cardName) {
    const name = cardName.toLowerCase();
    if (name.includes('wells fargo') || name.includes('wellsfargo') || name.includes('active cash')) {
        return 'https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/wf_propel_american_express_card_600x337.png';
    }
    else if (name.includes('citi') || name.includes('citibank')) {
        return 'https://www.citi.com/CRD/images/card-images/citi-double-cash-credit-card.jpg';
    }
    else if (name.includes('freedom') || name.includes('flex')) {
        return 'https://creditcards.chase.com/K-Marketplace/images/cards/cardart_freedom_flex.png';
    }
    else if (name.includes('chase') || name.includes('sapphire')) {
        return 'https://creditcards.chase.com/K-Marketplace/images/cards/cardart_sapphirepreferred.png';
    }
    else if (name.includes('amex') || name.includes('american express')) {
        return 'https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/blue-cash-everyday.png';
    }
    else if (name.includes('discover')) {
        return 'https://www.discover.com/content/dam/discover/en_us/credit-cards/card-art/discover-it-card-img.png';
    }
    else if (name.includes('capital one') || name.includes('capitalOne')) {
        return 'https://ecm.capitalone.com/WCM/card/products/quicksilver-card-art.png';
    }
    else if (name.includes('bilt')) {
        return 'https://www.biltrewards.com/static/media/card-front.fca8eb64.png';
    }
    // Default card image if no match
    return 'https://www.creditcardinsider.com/wp-content/uploads/2019/09/generic-credit-card.png';
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
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// This script handles the popup UI when the user clicks on the extension icon

// DOM elements
const recommendationsEl = document.getElementById('recommendations');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const preferencesEl = document.getElementById('preferences');
const mainContentEl = document.getElementById('main-content');
const showPreferencesBtn = document.getElementById('show-preferences');
const preferencesBackBtn = document.getElementById('preferences-back');
const preferencesForm = document.getElementById('preferences-form');
// Track if a recommendation request is in progress
let isRequestInProgress = false;
// Track the last request parameters to avoid duplicate requests
let lastRequestParams = {
    merchant: '',
    amount: 0
};
// Function to get active tab information
function getActiveTab() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
            return tabs[0] || null;
        }
        catch (error) {
            console.error('Error getting active tab:', error);
            return null;
        }
    });
}
// Function to extract merchant name from URL
function extractMerchantFromUrl(url) {
    try {
        const hostname = new URL(url).hostname;
        const domain = hostname.replace('www.', '').split('.')[0];
        return domain.charAt(0).toUpperCase() + domain.slice(1);
    }
    catch (error) {
        return 'Unknown';
    }
}
// Fill in credit card details on the active tab
function fillCardDetails(cardName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get active tab
            const tabs = yield chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];
            if (!tab || !tab.id)
                return;
            // Execute content script function to fill details
            chrome.tabs.sendMessage(tab.id, {
                action: 'fillCardDetails',
                cardName: cardName
            });
            // Close the popup
            window.close();
        }
        catch (error) {
            console.error('Error filling card details:', error);
        }
    });
}
// Function to show a notification in the popup
function showNotification(message, type = 'info') {
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
    }
    else if (type === 'error') {
        notification.style.backgroundColor = '#F44336';
        notification.style.color = 'white';
    }
    else {
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
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Setup UI elements
            setupEventListeners();
            // Check if we're on a checkout page
            chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, (response) => __awaiter(this, void 0, void 0, function* () {
                if (response && response.isCheckout) {
                    // We're on a checkout page, get recommendations
                    yield getRecommendations(response.merchant, response.amount);
                }
                else {
                    // Show simulation
                    yield simulateRecommendations();
                }
            }));
        }
        catch (error) {
            console.error('Error initializing popup:', error);
            showError('Failed to initialize');
        }
    });
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
                if (cardNameEl)
                    cardName = cardNameEl.textContent || '';
            }
            else if (detailedView && window.getComputedStyle(detailedView).display !== 'none') {
                const cardNameEl = detailedView.querySelector('.card-name');
                if (cardNameEl)
                    cardName = cardNameEl.textContent || '';
            }
            if (cardName) {
                fillCardDetails(cardName);
            }
        });
    });
}
// Toggle between simple and detailed views
function toggleDetailedView(showDetailed) {
    const simpleView = document.getElementById('simple-view');
    const detailedView = document.getElementById('detailed-view');
    if (simpleView && detailedView) {
        if (showDetailed) {
            simpleView.style.display = 'none';
            detailedView.style.display = 'block';
        }
        else {
            simpleView.style.display = 'block';
            detailedView.style.display = 'none';
        }
    }
}
// Get recommendations from backend via background script
function getRecommendations(merchant, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const simpleView = document.getElementById('simple-view');
        const detailedView = document.getElementById('detailed-view');
        const loadingEl = document.getElementById('loading');
        // Skip if a request is already in progress or if it's a duplicate request
        if (isRequestInProgress) {
            console.log('Skipping duplicate request - a request is already in progress');
            return;
        }
        // Check if this is the same as the last request
        if (lastRequestParams.merchant === merchant && lastRequestParams.amount === amount) {
            console.log('Skipping duplicate request - same parameters as last request');
            return;
        }
        if (simpleView && detailedView && loadingEl) {
            simpleView.style.display = 'none';
            detailedView.style.display = 'none';
            loadingEl.style.display = 'block';
            // Set flags
            isRequestInProgress = true;
            lastRequestParams = { merchant, amount };
            try {
                // Send message to background script to get recommendations
                chrome.runtime.sendMessage({
                    action: 'getRecommendations',
                    merchant,
                    amount
                }, (response) => {
                    // Reset flag
                    isRequestInProgress = false;
                    if (response && response.success && response.recommendations) {
                        renderRecommendations(response.recommendations, merchant, amount);
                    }
                    else {
                        showError('Unable to get recommendations');
                    }
                });
            }
            catch (error) {
                // Reset flag
                isRequestInProgress = false;
                console.error('Error getting recommendations:', error);
                showError('Error getting recommendations');
            }
        }
    });
}
// Simulate recommendations for demo
function simulateRecommendations() {
    return __awaiter(this, void 0, void 0, function* () {
        const demoMerchant = 'Amazon';
        const demoAmount = 40.50;
        // Skip if a request is already in progress
        if (isRequestInProgress) {
            console.log('Skipping simulation - a request is already in progress');
            return;
        }
        // Show loading first
        const simpleView = document.getElementById('simple-view');
        const detailedView = document.getElementById('detailed-view');
        const loadingEl = document.getElementById('loading');
        if (simpleView && detailedView && loadingEl) {
            simpleView.style.display = 'none';
            detailedView.style.display = 'none';
            loadingEl.style.display = 'block';
            // Set flag
            isRequestInProgress = true;
            lastRequestParams = { merchant: demoMerchant, amount: demoAmount };
            // Demo delay for loading effect
            setTimeout(() => {
                // Send message to background script to get recommendations
                chrome.runtime.sendMessage({
                    action: 'getRecommendations',
                    merchant: demoMerchant,
                    amount: demoAmount
                }, (response) => {
                    // Reset flag
                    isRequestInProgress = false;
                    if (response && response.success && response.recommendations) {
                        renderRecommendations(response.recommendations, demoMerchant, demoAmount);
                    }
                    else {
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
    });
}
// Render recommendations in the UI
function renderRecommendations(recommendations, merchant, amount) {
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
function updateSimpleView(simpleView, bestCard, alternativeCards) {
    // Update main card
    const cardImageEl = simpleView.querySelector('.card-image');
    if (cardImageEl) {
        // Clear existing classes that might affect the card appearance
        cardImageEl.className = 'card-image';
        // Use actual card image
        const cardImg = document.createElement('img');
        cardImg.src = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardImageUrl)(bestCard.name);
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
        cardImageEl.classList.add((0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(bestCard.name));
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
            thumbImg.src = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardImageUrl)(card.name);
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
function updateDetailedView(detailedView, recommendations) {
    // Clear existing card details
    const detailsContainer = detailedView.querySelector('.card-detail');
    if (!detailsContainer)
        return;
    // Get the first (best) card
    const bestCard = recommendations[0];
    // Update card image
    const cardImageEl = detailedView.querySelector('.card-image');
    if (cardImageEl) {
        // Clear existing classes
        cardImageEl.className = 'card-image';
        // Use actual card image
        const cardImg = document.createElement('img');
        cardImg.src = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardImageUrl)(bestCard.name);
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
    }
    else if (benefitsEl) {
        benefitsEl.innerHTML = 'Extended warranty, Purchase protection' +
            ' <a href="#" class="read-more">read more ›</a>';
    }
}
// Show error message
function showError(message) {
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

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map