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
/* harmony export */   findFormFields: () => (/* binding */ findFormFields),
/* harmony export */   getCardClass: () => (/* binding */ getCardClass),
/* harmony export */   getCardDetails: () => (/* binding */ getCardDetails)
/* harmony export */ });
// Shared utility functions
/**
 * Get CSS class for card styling based on card name
 */
function getCardClass(cardName) {
    const cardNameLower = cardName.toLowerCase();
    if (cardNameLower.includes('wells fargo'))
        return 'wells-fargo';
    if (cardNameLower.includes('citi'))
        return 'citi';
    if (cardNameLower.includes('chase'))
        return 'chase';
    if (cardNameLower.includes('amex') || cardNameLower.includes('american express'))
        return 'amex';
    if (cardNameLower.includes('discover'))
        return 'discover';
    return '';
}
/**
 * Get dummy card details for demonstration purposes
 */
function getCardDetails(cardName) {
    const cardNameLower = cardName.toLowerCase();
    // Demo credit card information (these are fake numbers)
    if (cardNameLower.includes('wells fargo')) {
        return {
            number: '4123456789012345',
            name: 'John Doe',
            expiry: '12/25',
            cvv: '123',
            type: 'visa'
        };
    }
    if (cardNameLower.includes('citi')) {
        return {
            number: '5123456789012345',
            name: 'Jane Smith',
            expiry: '11/26',
            cvv: '456',
            type: 'mastercard'
        };
    }
    if (cardNameLower.includes('chase')) {
        return {
            number: '4987654321098765',
            name: 'Chris Johnson',
            expiry: '06/27',
            cvv: '789',
            type: 'visa'
        };
    }
    if (cardNameLower.includes('amex') || cardNameLower.includes('american express')) {
        return {
            number: '347123456789012',
            name: 'Emily Wilson',
            expiry: '09/26',
            cvv: '1234',
            type: 'amex'
        };
    }
    if (cardNameLower.includes('discover')) {
        return {
            number: '6011123456789012',
            name: 'Michael Brown',
            expiry: '03/28',
            cvv: '321',
            type: 'discover'
        };
    }
    // Default card
    return {
        number: '4111111111111111',
        name: 'Demo User',
        expiry: '12/25',
        cvv: '999',
        type: 'visa'
    };
}
/**
 * Find form fields in the page that match credit card details
 */
function findFormFields() {
    const selectors = {
        cardNumber: [
            // Card number selectors
            'input[name*="card"][name*="number"]',
            'input[id*="card"][id*="number"]',
            'input[autocomplete="cc-number"]',
            'input[name*="cardnumber"]',
            'input[id*="cardnumber"]',
            'input[name*="creditcard"]',
            'input[placeholder*="card"][placeholder*="number"]',
            // Generic credit card field patterns
            'input[name*="cc-number"]',
            'input[id*="cc-number"]',
            'input[name*="ccnumber"]',
            'input[id*="ccnumber"]'
        ],
        cardName: [
            // Cardholder name selectors
            'input[name*="card"][name*="name"]',
            'input[id*="card"][id*="name"]',
            'input[autocomplete="cc-name"]',
            'input[name*="cardholder"]',
            'input[id*="cardholder"]',
            'input[name*="name"][name*="card"]',
            'input[id*="name"][id*="card"]',
            'input[placeholder*="name"][placeholder*="card"]'
        ],
        expiryMonth: [
            // Expiry month selectors
            'select[name*="month"]',
            'select[id*="month"]',
            'input[name*="month"]',
            'input[id*="month"]',
            'select[name*="exp"][name*="month"]',
            'select[id*="exp"][id*="month"]',
            'input[autocomplete="cc-exp-month"]'
        ],
        expiryYear: [
            // Expiry year selectors
            'select[name*="year"]',
            'select[id*="year"]',
            'input[name*="year"]',
            'input[id*="year"]',
            'select[name*="exp"][name*="year"]',
            'select[id*="exp"][id*="year"]',
            'input[autocomplete="cc-exp-year"]'
        ],
        expiryDate: [
            // Combined expiry date selectors
            'input[name*="expiry"]',
            'input[id*="expiry"]',
            'input[name*="expiration"]',
            'input[id*="expiration"]',
            'input[autocomplete="cc-exp"]',
            'input[placeholder*="MM"][placeholder*="YY"]',
            'input[placeholder*="MM"][placeholder*="/"][placeholder*="YY"]'
        ],
        cvv: [
            // CVV/CVC selectors
            'input[name*="cvv"]',
            'input[id*="cvv"]',
            'input[name*="cvc"]',
            'input[id*="cvc"]',
            'input[name*="security"][name*="code"]',
            'input[id*="security"][id*="code"]',
            'input[autocomplete="cc-csc"]',
            'input[placeholder*="cvv"]',
            'input[placeholder*="cvc"]',
            'input[placeholder*="security code"]'
        ]
    };
    const formFields = {};
    // Find each field in the document
    for (const [fieldType, selectorList] of Object.entries(selectors)) {
        for (const selector of selectorList) {
            const field = document.querySelector(selector);
            if (field) {
                formFields[fieldType] = field;
                break; // Use the first matching field
            }
        }
    }
    return formFields;
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
            // Handle the results if needed
            console.log('Card filling results:', results);
        }).catch((error) => {
            console.error('Error filling card details:', error);
        });
    });
}
// Function to render recommendations in the new UI style
function renderRecommendations(data) {
    const contentElement = document.getElementById('content');
    if (!contentElement)
        return;
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
        cardImage.className = `card-image ${(0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(bestCard.name)}`;
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
                thumbnail.className = `card-thumbnail ${(0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(card.name)}`;
                // Make thumbnails clickable to switch the selected card
                thumbnail.style.cursor = 'pointer';
                thumbnail.addEventListener('click', () => {
                    // Update card display
                    cardImage.className = `card-image ${(0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCardClass)(card.name)}`;
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
    }
    else {
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
function showError(message) {
    const contentElement = document.getElementById('content');
    if (contentElement) {
        contentElement.innerHTML = `<div class="loading">${message}</div>`;
    }
}
// Function to get purchase amount from page
function getPurchaseAmount(tabId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = yield chrome.scripting.executeScript({
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
            return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.result) || 40.50;
        }
        catch (error) {
            console.error('Error getting purchase amount:', error);
            return 40.50; // Fallback amount
        }
    });
}
// Main function to check if current page is a checkout and get recommendations
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        showLoading();
        try {
            const tab = yield getActiveTab();
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
            chrome.tabs.sendMessage(tabId, { action: 'checkCheckoutPage' }, (response) => __awaiter(this, void 0, void 0, function* () {
                if (chrome.runtime.lastError) {
                    // Content script might not be loaded yet
                    renderSimulatedRecommendations(merchant);
                    return;
                }
                if (response && response.isCheckout) {
                    try {
                        // Get the purchase amount from the page
                        const amount = yield getPurchaseAmount(tabId);
                        // Get recommendations from background script
                        chrome.runtime.sendMessage({
                            action: 'getRecommendations',
                            merchant: merchant,
                            amount: amount
                        }, (data) => {
                            if (data && data.recommendations) {
                                renderRecommendations(data);
                            }
                            else {
                                renderSimulatedRecommendations(merchant, amount);
                            }
                        });
                    }
                    catch (error) {
                        console.error('Error getting purchase amount:', error);
                        // Fallback to default amount
                        renderSimulatedRecommendations(merchant);
                    }
                }
                else {
                    // Not a checkout page, show simulated recommendations
                    renderSimulatedRecommendations(merchant);
                }
            }));
        }
        catch (error) {
            showError('An error occurred. Please try again.');
            console.error('Error in popup init:', error);
        }
    });
}
// Function to render simulated recommendations (for demo purposes)
function renderSimulatedRecommendations(merchant, amount = 40.50) {
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

})();

/******/ })()
;
//# sourceMappingURL=popup.js.map