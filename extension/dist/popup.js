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
        const tab = yield getActiveTab();
        if (!tab || !tab.id)
            return;
        try {
            // Show loading notification in popup
            showNotification(`Filling in ${cardName} details...`, 'info');
            // Execute script in the active tab to fill card details
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: (cardName) => {
                    // Get the card details function from the injected content script
                    // @ts-ignore - This function is defined in content.ts and exposed to window
                    const fillCardDetailsFunc = window.fillCardDetails || function () {
                        return { success: false, filledCount: 0, message: "Card detail filling is not available" };
                    };
                    // Call the function with the card name
                    return fillCardDetailsFunc(cardName);
                },
                args: [cardName]
            }).then((results) => {
                var _a;
                // Handle the results
                const result = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.result;
                if (result === null || result === void 0 ? void 0 : result.success) {
                    showNotification(result.message, 'success');
                }
                else {
                    showNotification((result === null || result === void 0 ? void 0 : result.message) || 'Failed to fill card details', 'error');
                }
                console.log('Card filling results:', results);
            }).catch((error) => {
                showNotification(`Error: ${error.message}`, 'error');
                console.error('Error filling card details:', error);
            });
        }
        catch (error) {
            showNotification(`Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
            console.error('Error in fillCardDetails:', error);
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
            // Setup tab navigation
            setupTabs();
            // Setup header buttons
            setupHeaderButtons();
            // Load user preferences
            const preferences = yield loadUserPreferences();
            // Update the preferences form with saved values
            updatePreferencesForm(preferences);
            // Test backend connection
            const connectionStatus = yield (0,_utils__WEBPACK_IMPORTED_MODULE_0__.testBackendConnection)();
            if (!connectionStatus.success) {
                console.warn('Backend connection issue:', connectionStatus.message);
            }
            // Check if we're on a checkout page
            chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, (response) => __awaiter(this, void 0, void 0, function* () {
                if (response && response.isCheckout) {
                    // We're on a checkout page, get recommendations and switch to recommendations tab
                    selectTab('recommendations');
                    yield getRecommendations(response.merchant, response.amount);
                }
                else {
                    // Show the homepage by default
                    selectTab('home');
                    // Load recommendation simulation in the background
                    simulateRecommendations();
                }
            }));
            // Set up preferences navigation
            setupPreferencesNavigation();
            // Setup preferences container
            setupPreferencesContainer();
        }
        catch (error) {
            console.error('Error initializing popup:', error);
            showError('An error occurred while initializing');
        }
    });
}
// Setup tab navigation
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            if (tabId) {
                selectTab(tabId);
            }
        });
    });
}
// Select a tab programmatically
function selectTab(tabId) {
    // Remove active class from all tabs and tab contents
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    // Add active class to selected tab and content
    const selectedTab = document.querySelector(`.tab[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(tabId);
    if (selectedTab && selectedContent) {
        selectedTab.classList.add('active');
        selectedContent.classList.add('active');
    }
    // Special handling for recommendations tab
    if (tabId === 'recommendations') {
        const recommendationsContainer = document.getElementById('recommendations-container');
        const loadingElement = document.getElementById('loading');
        if (recommendationsContainer && loadingElement) {
            if (recommendationsContainer.innerHTML === '') {
                // If no recommendations loaded yet, show loading indicator
                loadingElement.style.display = 'block';
                recommendationsContainer.style.display = 'none';
            }
        }
    }
}
// Setup header buttons
function setupHeaderButtons() {
    const refreshBtn = document.getElementById('refresh-btn');
    const settingsBtn = document.getElementById('settings-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const activeTab = document.querySelector('.tab.active');
            if (activeTab) {
                const tabId = activeTab.getAttribute('data-tab');
                if (tabId === 'recommendations') {
                    refreshRecommendations();
                }
                else if (tabId === 'home') {
                    refreshHomeDashboard();
                }
            }
        });
    }
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            showPreferences();
        });
    }
}
// Function to refresh the recommendations
function refreshRecommendations() {
    return __awaiter(this, void 0, void 0, function* () {
        const recommendationsContainer = document.getElementById('recommendations-container');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        if (recommendationsContainer && loadingElement && errorElement) {
            recommendationsContainer.style.display = 'none';
            loadingElement.style.display = 'block';
            errorElement.style.display = 'none';
            try {
                chrome.runtime.sendMessage({ action: 'isCheckoutPage' }, (response) => __awaiter(this, void 0, void 0, function* () {
                    if (response && response.isCheckout) {
                        yield getRecommendations(response.merchant, response.amount);
                    }
                    else {
                        yield simulateRecommendations();
                    }
                }));
            }
            catch (error) {
                console.error('Error refreshing recommendations:', error);
                showError('Error refreshing recommendations');
            }
        }
    });
}
// Function to refresh the home dashboard data
function refreshHomeDashboard() {
    // This would typically call an API to get updated stats
    // For now, let's just show a notification
    showNotification('Dashboard refreshed', 'success');
}
// Setup preferences navigation
function setupPreferencesNavigation() {
    const preferencesEl = document.getElementById('preferences');
    const showPreferencesBtn = document.getElementById('settings-btn'); // Now using the header button
    const preferencesBackBtn = document.getElementById('preferences-back');
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesBackBtn) {
        preferencesBackBtn.addEventListener('click', hidePreferences);
    }
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', savePreferences);
    }
}
// Show preferences tab
function showPreferences() {
    const recommendationsEl = document.getElementById('recommendations-container');
    const preferencesEl = document.getElementById('preferences-container');
    if (recommendationsEl && preferencesEl) {
        recommendationsEl.style.display = 'none';
        preferencesEl.style.display = 'block';
        // Load saved preferences
        loadPreferences();
    }
}
// Hide preferences tab and show recommendations
function hidePreferences() {
    const recommendationsEl = document.getElementById('recommendations-container');
    const preferencesEl = document.getElementById('preferences-container');
    if (recommendationsEl && preferencesEl) {
        recommendationsEl.style.display = 'block';
        preferencesEl.style.display = 'none';
    }
}
// Load saved preferences from storage
function loadPreferences() {
    chrome.storage.sync.get(['cardPreferences'], (result) => {
        const preferences = result.cardPreferences || {};
        // Populate dropdown for default card
        const defaultCardSelect = document.getElementById('defaultCard');
        if (defaultCardSelect) {
            defaultCardSelect.value = preferences.defaultCard || '';
        }
        // Populate checkboxes for enabled cards
        const enabledCards = preferences.enabledCards || [];
        document.querySelectorAll('.card-checkbox').forEach((checkbox) => {
            const cardCheckbox = checkbox;
            cardCheckbox.checked = enabledCards.includes(cardCheckbox.value);
        });
    });
}
// Save preferences
function savePreferences(e) {
    return __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // Get all selected issuers
        const issuerCheckboxes = document.querySelectorAll('input[name="issuer"]:checked');
        const preferredIssuers = Array.from(issuerCheckboxes).map(checkbox => checkbox.value);
        // Get all selected networks
        const networkCheckboxes = document.querySelectorAll('input[name="network"]:checked');
        const preferredNetworks = Array.from(networkCheckboxes).map(checkbox => checkbox.value);
        // Get max annual fee
        const maxFeeInput = document.getElementById('max-annual-fee');
        const maxAnnualFee = maxFeeInput.value ? parseInt(maxFeeInput.value, 10) : null;
        // Save to storage
        const preferences = {
            preferredIssuers,
            preferredNetworks,
            maxAnnualFee
        };
        yield new Promise((resolve) => {
            chrome.storage.sync.set(preferences, () => {
                resolve();
            });
        });
        // Show notification and hide preferences
        showNotification('Preferences saved', 'success');
        hidePreferences();
        // Refresh active content
        const activeTab = document.querySelector('.tab.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('data-tab');
            if (tabId === 'recommendations') {
                refreshRecommendations();
            }
        }
    });
}
// Load user preferences from storage
function loadUserPreferences() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            chrome.storage.sync.get({
                preferredIssuers: [],
                preferredNetworks: [],
                maxAnnualFee: null
            }, (items) => {
                resolve(items);
            });
        });
    });
}
// Update the preferences form with saved values
function updatePreferencesForm(preferences) {
    // Update issuer checkboxes
    const issuerCheckboxes = document.querySelectorAll('input[name="issuer"]');
    issuerCheckboxes.forEach(checkbox => {
        checkbox.checked = preferences.preferredIssuers.includes(checkbox.value);
    });
    // Update network checkboxes
    const networkCheckboxes = document.querySelectorAll('input[name="network"]');
    networkCheckboxes.forEach(checkbox => {
        checkbox.checked = preferences.preferredNetworks.includes(checkbox.value);
    });
    // Update max annual fee
    const maxFeeInput = document.getElementById('max-annual-fee');
    if (preferences.maxAnnualFee !== null) {
        maxFeeInput.value = preferences.maxAnnualFee.toString();
    }
    else {
        maxFeeInput.value = '';
    }
}
// Get recommendations from backend via background script
function getRecommendations(merchant, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const recommendationsContainer = document.getElementById('recommendations-container');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        if (recommendationsContainer && loadingElement && errorElement) {
            recommendationsContainer.style.display = 'none';
            loadingElement.style.display = 'block';
            errorElement.style.display = 'none';
            try {
                // Load user preferences
                const preferences = yield loadUserPreferences();
                // Send message to background script to get recommendations
                chrome.runtime.sendMessage({
                    action: 'getRecommendations',
                    merchant,
                    amount,
                    preferences
                }, (response) => {
                    if (response && response.success && response.recommendations) {
                        renderRecommendations(response.recommendations, merchant, amount);
                    }
                    else {
                        showError('Unable to get recommendations');
                    }
                });
            }
            catch (error) {
                console.error('Error getting recommendations:', error);
                showError('Error getting recommendations');
            }
        }
    });
}
// Simulate recommendations for demo
function simulateRecommendations() {
    return __awaiter(this, void 0, void 0, function* () {
        const recommendationsContainer = document.getElementById('recommendations-container');
        const loadingElement = document.getElementById('loading');
        const errorElement = document.getElementById('error');
        if (recommendationsContainer && loadingElement && errorElement) {
            try {
                const demoMerchant = 'Amazon';
                const demoAmount = 40.50;
                // Load user preferences
                const preferences = yield loadUserPreferences();
                // Send message to background script to get recommendations
                chrome.runtime.sendMessage({
                    action: 'getRecommendations',
                    merchant: demoMerchant,
                    amount: demoAmount,
                    preferences
                }, (response) => {
                    if (response && response.success && response.recommendations) {
                        renderRecommendations(response.recommendations, demoMerchant, demoAmount);
                    }
                    else {
                        showError('Unable to get recommendations');
                    }
                });
            }
            catch (error) {
                console.error('Error getting recommendations:', error);
                showError('Error getting recommendations');
            }
        }
    });
}
// Render recommendations in the UI
function renderRecommendations(recommendations, merchant, amount) {
    var _a, _b;
    const recommendationsEl = document.getElementById('recommendations-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    if (recommendationsEl && loadingElement && errorElement) {
        // Hide loading indicator
        loadingElement.style.display = 'none';
        errorElement.style.display = 'none';
        // Clear recommendations container
        recommendationsEl.innerHTML = '';
        if (!recommendations || !recommendations.length) {
            showError('No recommendations found');
            return;
        }
        // Sort recommendations by cashback percentage (descending)
        recommendations.sort((a, b) => b.cashback_percentage - a.cashback_percentage);
        let html = '<div class="recommendations-container">';
        // Display the best recommendation prominently
        const bestRec = recommendations[0];
        html += `
      <div class="best-card">
        <h3>Best Card for this Purchase</h3>
        <div class="card ${(0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(bestRec.name)}">
          <div class="card-info">
            <h4>${bestRec.name}</h4>
            <p class="cashback">${bestRec.cashback_percentage}% cashback</p>
            <p class="category">${bestRec.category || 'General Purchase'}</p>
          </div>
        </div>
      </div>
    `;
        // Display other recommendations
        if (recommendations.length > 1) {
            html += '<div class="other-cards"><h3>Other Options</h3><div class="cards-grid">';
            for (let i = 1; i < Math.min(recommendations.length, 4); i++) {
                const rec = recommendations[i];
                html += `
          <div class="card-small ${(0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(rec.name)}">
            <div class="card-info-small">
              <h5>${rec.name}</h5>
              <p class="cashback-small">${rec.cashback_percentage}%</p>
            </div>
          </div>
        `;
            }
            html += '</div></div>';
        }
        html += `
      <div class="action-buttons">
        <button id="useCardBtn" class="primary-button">Use ${bestRec.name}</button>
        <button id="editPrefsBtn" class="secondary-button">Edit Preferences</button>
      </div>
    `;
        html += '</div>';
        recommendationsEl.innerHTML = html;
        // Add event listeners
        (_a = document.getElementById('useCardBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            fillCardDetails(bestRec.name);
        });
        (_b = document.getElementById('editPrefsBtn')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            showPreferences();
        });
    }
}
// Show loading indicator
function showLoading() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    if (recommendationsContainer && loadingElement && errorElement) {
        recommendationsContainer.style.display = 'none';
        errorElement.style.display = 'none';
        loadingElement.style.display = 'block';
    }
}
// Show error message
function showError(message) {
    const recommendationsContainer = document.getElementById('recommendations-container');
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    if (recommendationsContainer && loadingElement && errorElement) {
        recommendationsContainer.style.display = 'none';
        loadingElement.style.display = 'none';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}
// Setup preferences container event listeners
function setupPreferencesContainer() {
    const preferencesEl = document.getElementById('preferences-container');
    if (!preferencesEl)
        return;
    // Add save button listener
    const saveBtn = document.getElementById('save-preferences');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            savePreferences(e);
        });
    }
    // Add back button listener
    const backBtn = document.getElementById('back-to-recommendations');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            hidePreferences();
        });
    }
}

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map