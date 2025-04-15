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
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
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

// No need to redeclare Window interface as it's now in utils.ts
// API endpoint for recommendations
const API_URL = 'http://localhost:5001/api/recommend';
const API_CARDS_URL = 'http://localhost:5001/api/cards';
const API_SEARCH_URL = 'http://localhost:5001/api/search';
const recommendationsCache = {};
let cardsCache = null;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
// Load user preferences from storage
let userPreferences = {};
// Load preferences when the extension starts
chrome.storage.sync.get('userPreferences', (result) => {
    if (result.userPreferences) {
        userPreferences = result.userPreferences;
        console.log('Loaded user preferences:', userPreferences);
    }
});
// Request necessary permissions when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    // Request optional permissions
    chrome.permissions.request({
        permissions: ['scripting', 'activeTab']
    }, (granted) => {
        if (granted) {
            console.log('Necessary permissions granted');
        }
        else {
            console.warn('Permissions not granted, some features may not work properly');
        }
    });
});
// Backend API URL
const BACKEND_URL = 'http://localhost:5001';
// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    var _a, _b;
    // Handle different message actions
    switch (message.action) {
        case 'isCheckoutPage':
            handleIsCheckoutPage((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id, sendResponse);
            break;
        case 'getRecommendations':
            handleGetRecommendations(message.merchant, message.amount, message.preferences, sendResponse);
            break;
        case 'fillCardDetails':
            handleFillCardDetails((_b = sender.tab) === null || _b === void 0 ? void 0 : _b.id, message.cardName, sendResponse);
            break;
        case 'saveUserPreferences':
            handleSaveUserPreferences(message.preferences, sendResponse);
            break;
        case 'getUserPreferences':
            handleGetUserPreferences(sendResponse);
            break;
        case 'getAllCards':
            handleGetAllCards(sendResponse);
            break;
        case 'searchCards':
            handleSearchCards(message.query, sendResponse);
            break;
        default:
            console.warn(`Unknown action: ${message.action}`);
            sendResponse({ success: false, error: 'Unknown action' });
    }
    // Return true to indicate we will respond asynchronously
    return true;
});
// Handle checkout page check
function handleIsCheckoutPage(tabId, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!tabId) {
            sendResponse({ isCheckout: false });
            return;
        }
        try {
            // Execute content script to check if it's a checkout page
            const results = yield chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    var _a, _b;
                    // Check if we're on a checkout page
                    if (typeof window.isCheckoutPage === 'function') {
                        return {
                            isCheckout: window.isCheckoutPage(),
                            merchant: ((_a = window.getMerchantName) === null || _a === void 0 ? void 0 : _a.call(window)) || 'Unknown',
                            amount: ((_b = window.getPurchaseAmount) === null || _b === void 0 ? void 0 : _b.call(window)) || 40.50
                        };
                    }
                    return { isCheckout: false };
                }
            });
            // Send response
            if (results && ((_a = results[0]) === null || _a === void 0 ? void 0 : _a.result)) {
                sendResponse(results[0].result);
            }
            else {
                sendResponse({ isCheckout: false });
            }
        }
        catch (error) {
            console.error('Error checking checkout page:', error);
            sendResponse({ isCheckout: false });
        }
    });
}
// Handle getting recommendations
function handleGetRecommendations(merchant, amount, preferences, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Prepare request data
            const requestData = {
                merchant,
                amount,
                user_preferences: {}
            };
            // Add preferences if they exist
            if (preferences) {
                if (preferences.preferredIssuers && preferences.preferredIssuers.length > 0) {
                    requestData.user_preferences.preferred_issuers = preferences.preferredIssuers;
                }
                if (preferences.preferredNetworks && preferences.preferredNetworks.length > 0) {
                    requestData.user_preferences.preferred_networks = preferences.preferredNetworks;
                }
                if (preferences.maxAnnualFee !== null && preferences.maxAnnualFee !== undefined) {
                    requestData.user_preferences.max_annual_fee = preferences.maxAnnualFee;
                }
            }
            console.log('Sending recommendation request:', requestData);
            // Fetch recommendations from API using POST
            const response = yield fetch(`${BACKEND_URL}/api/recommend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            if (!response.ok) {
                const errorText = yield response.text();
                console.error(`API error (${response.status}): ${errorText}`);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            const data = yield response.json();
            console.log('Received recommendations:', data);
            // Send response back
            sendResponse({
                success: true,
                recommendations: data.recommendations || []
            });
        }
        catch (error) {
            console.error('Error getting recommendations:', error);
            // Fallback to dummy data for demo
            const dummyRecommendations = [
                {
                    name: 'Chase Freedom Unlimited',
                    issuer: 'Chase',
                    rewardPercentage: 5,
                    explanation: '5% cashback on travel purchased through Chase',
                    cashback: amount * 0.05
                },
                {
                    name: 'Citi Double Cash',
                    issuer: 'Citi',
                    rewardPercentage: 2,
                    explanation: '2% on all purchases',
                    cashback: amount * 0.02
                },
                {
                    name: 'Discover it Cash Back',
                    issuer: 'Discover',
                    rewardPercentage: 1.5,
                    explanation: '1.5% on all purchases',
                    cashback: amount * 0.015
                },
                {
                    name: 'American Express Blue Cash Preferred',
                    issuer: 'American Express',
                    rewardPercentage: 6,
                    explanation: '6% at U.S. supermarkets',
                    cashback: amount * 0.06
                },
                {
                    name: 'Wells Fargo Active Cash',
                    issuer: 'Wells Fargo',
                    rewardPercentage: 2,
                    explanation: '2% cash back on all purchases',
                    cashback: amount * 0.02
                }
            ];
            sendResponse({
                success: true,
                recommendations: dummyRecommendations,
                error: `Using demo data: ${error.message}`
            });
        }
    });
}
// Handle filling card details
function handleFillCardDetails(tabId, cardName, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tabId) {
            sendResponse({ success: false, error: 'No active tab' });
            return;
        }
        try {
            // Get card details
            const cardDetails = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardDetails)(cardName);
            // Execute content script to fill card details
            yield chrome.scripting.executeScript({
                target: { tabId },
                func: (details) => {
                    if (typeof window.fillCardDetails === 'function') {
                        window.fillCardDetails(details);
                        return { success: true };
                    }
                    return { success: false, error: 'fillCardDetails not available' };
                },
                args: [cardDetails]
            });
            sendResponse({ success: true });
        }
        catch (error) {
            console.error('Error filling card details:', error);
            sendResponse({ success: false, error: String(error) });
        }
    });
}
// Handle saving user preferences
function handleSaveUserPreferences(preferences, sendResponse) {
    userPreferences = preferences;
    chrome.storage.sync.set({ userPreferences }, () => {
        console.log('User preferences saved:', userPreferences);
        sendResponse({ success: true });
    });
}
// Handle getting user preferences
function handleGetUserPreferences(sendResponse) {
    sendResponse({ preferences: userPreferences });
}
// Handle getting all cards
function handleGetAllCards(sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(API_CARDS_URL);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            sendResponse({ cards: data.cards });
        }
        catch (error) {
            console.error('Error fetching all cards:', error);
            sendResponse({ error: String(error) });
        }
    });
}
// Handle searching cards
function handleSearchCards(query, sendResponse) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            sendResponse({ results: data.results });
        }
        catch (error) {
            console.error('Error searching cards:', error);
            sendResponse({ error: String(error) });
        }
    });
}
// Fetch recommendations from API
function fetchRecommendations(merchant, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a cache key
        const cacheKey = `${merchant.toLowerCase()}_${amount}_${JSON.stringify(userPreferences)}`;
        // Check cache first
        if (recommendationsCache[cacheKey] &&
            (Date.now() - recommendationsCache[cacheKey].timestamp) < CACHE_EXPIRY) {
            console.log('Using cached recommendations');
            return recommendationsCache[cacheKey].data;
        }
        try {
            const response = yield fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    merchant,
                    amount,
                    user_preferences: userPreferences
                })
            });
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            // Cache the result
            recommendationsCache[cacheKey] = {
                timestamp: Date.now(),
                data
            };
            return data;
        }
        catch (error) {
            console.error('API request failed:', error);
            throw new Error(String(error));
        }
    });
}
// Fetch all cards from API
function fetchAllCards() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check cache first
        if (cardsCache && (Date.now() - cardsCache.timestamp) < CACHE_EXPIRY) {
            console.log('Using cached cards data');
            return cardsCache.data;
        }
        try {
            const response = yield fetch(API_CARDS_URL);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            // Cache the result
            const newCache = {
                timestamp: Date.now(),
                data: data.cards
            };
            // Update global cache
            cardsCache = newCache;
            return data.cards;
        }
        catch (error) {
            console.error('API request failed:', error);
            throw new Error(String(error));
        }
    });
}
// Search cards by query
function searchCards(query) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = yield response.json();
            return data.results;
        }
        catch (error) {
            console.error('API request failed:', error);
            throw new Error(String(error));
        }
    });
}
// Fallback recommendations if API is unavailable
function getFallbackRecommendations(merchant, amount) {
    const merchantLower = merchant.toLowerCase();
    let category = 'other';
    // Simple merchant classification
    if (merchantLower.includes('amazon')) {
        category = 'amazon';
    }
    else if (merchantLower.includes('airline') || merchantLower.includes('flight') || merchantLower.includes('hotel')) {
        category = 'travel';
    }
    else if (merchantLower.includes('restaurant') || merchantLower.includes('food')) {
        category = 'dining';
    }
    else if (merchantLower.includes('grocery') || merchantLower.includes('supermarket')) {
        category = 'groceries';
    }
    else if (merchantLower.includes('gas') || merchantLower.includes('fuel')) {
        category = 'gas';
    }
    // Determine merchant categories for response
    const merchantCategories = [category];
    if (merchantLower.includes('online') || merchantLower.includes('.com')) {
        merchantCategories.push('online_shopping');
    }
    // Fallback card recommendations based on category
    let recommendations = [];
    switch (category) {
        case 'amazon':
            recommendations = [
                {
                    id: "amazon-prime",
                    name: 'Amazon Prime Rewards',
                    issuer: "Chase",
                    network: "Visa",
                    image: 'amazon_prime.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100,
                    best_category: "amazon",
                    explanation: "5% back at Amazon with Prime membership",
                    annual_fee: 0,
                    score: (amount * 5) / 100,
                    intro_offer: "$100 Amazon Gift Card upon approval",
                    bonus_value: 100
                },
                {
                    id: "citi-double",
                    name: 'Citi Double Cash',
                    issuer: "Citibank",
                    network: "Mastercard",
                    image: 'citi_double_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100,
                    best_category: "other",
                    explanation: "2% cash back (1% when you buy + 1% when you pay)",
                    annual_fee: 0,
                    score: (amount * 2) / 100,
                    intro_offer: "$200 welcome bonus after spending $1500 in first 6 months",
                    bonus_value: 200
                },
                {
                    id: "wells-active",
                    name: 'Wells Fargo Active Cash',
                    issuer: "Wells Fargo",
                    network: "Visa",
                    image: 'wells_fargo_active_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100,
                    best_category: "other",
                    explanation: "2% cash back on all purchases",
                    annual_fee: 0,
                    score: (amount * 2) / 100,
                    intro_offer: "$200 cash rewards bonus after spending $1,000 in first 3 months",
                    bonus_value: 200
                }
            ];
            break;
        case 'travel':
            recommendations = [
                {
                    id: "cap-one-venture",
                    name: 'Capital One Venture',
                    issuer: "Capital One",
                    network: "Visa",
                    image: 'capital_one_venture.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100,
                    best_category: "travel",
                    explanation: "5X miles on travel booked through Capital One Travel",
                    annual_fee: 95,
                    score: (amount * 5) / 100 - (95 / 365),
                    intro_offer: "75,000 bonus miles after spending $4,000 in the first 3 months",
                    bonus_value: 1312.50
                },
                {
                    id: "chase-sapphire",
                    name: 'Chase Sapphire Preferred',
                    issuer: "Chase",
                    network: "Visa",
                    image: 'chase_sapphire_preferred.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100,
                    best_category: "travel",
                    explanation: "5X points on travel purchased through Chase",
                    annual_fee: 95,
                    score: (amount * 5) / 100 - (95 / 365),
                    intro_offer: "60,000 bonus points after spending $4,000 in the first 3 months",
                    bonus_value: 750
                },
                {
                    id: "amex-gold",
                    name: 'Amex Gold Card',
                    issuer: "American Express",
                    network: "American Express",
                    image: 'amex_gold.png',
                    reward_percentage: 3,
                    cashback: (amount * 3) / 100,
                    best_category: "travel",
                    explanation: "3X points on flights booked directly with airlines",
                    annual_fee: 250,
                    score: (amount * 3) / 100 - (250 / 365),
                    intro_offer: "60,000 Membership Rewards points after spending $4,000 in first 6 months",
                    bonus_value: 1200
                }
            ];
            break;
        default:
            recommendations = [
                {
                    id: "citi-double-default",
                    name: 'Citi Double Cash',
                    issuer: "Citibank",
                    network: "Mastercard",
                    image: 'citi_double_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100,
                    best_category: "other",
                    explanation: "2% cash back (1% when you buy + 1% when you pay)",
                    annual_fee: 0,
                    score: (amount * 2) / 100,
                    intro_offer: "$200 welcome bonus after spending $1500 in first 6 months",
                    bonus_value: 200
                },
                {
                    id: "wells-active-default",
                    name: 'Wells Fargo Active Cash',
                    issuer: "Wells Fargo",
                    network: "Visa",
                    image: 'wells_fargo_active_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100,
                    best_category: "other",
                    explanation: "2% cash back on all purchases",
                    annual_fee: 0,
                    score: (amount * 2) / 100,
                    intro_offer: "$200 cash rewards bonus after spending $1,000 in first 3 months",
                    bonus_value: 200
                },
                {
                    id: "cap-one-quick",
                    name: 'Capital One Quicksilver',
                    issuer: "Capital One",
                    network: "Visa",
                    image: 'capital_one_quicksilver.png',
                    reward_percentage: 1.5,
                    cashback: (amount * 1.5) / 100,
                    best_category: "other",
                    explanation: "1.5% cash back on all purchases",
                    annual_fee: 0,
                    score: (amount * 1.5) / 100,
                    intro_offer: "$200 cash bonus after spending $500 in first 3 months",
                    bonus_value: 200
                }
            ];
    }
    // Return formatted response matching API structure
    return {
        merchant: merchant,
        merchant_categories: merchantCategories,
        amount: amount,
        recommendations: recommendations
    };
}

})();

/******/ })()
;
//# sourceMappingURL=background.js.map