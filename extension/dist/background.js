/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/***/ (function() {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// API endpoint for recommendations
const API_URL = 'http://localhost:5001/api/recommend';
const recommendationsCache = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds
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
// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getRecommendations') {
        fetchRecommendations(message.merchant, message.amount)
            .then(data => {
            sendResponse(data);
        })
            .catch(error => {
            console.error('Error fetching recommendations:', error);
            // Fallback to hardcoded recommendations if API is unavailable
            sendResponse(getFallbackRecommendations(message.merchant, message.amount));
        });
        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
    if (message.action === 'fillCardDetails') {
        // Request permission if not already granted
        chrome.permissions.contains({
            permissions: ['scripting']
        }, (result) => {
            if (result) {
                // We have the permission, execute the script
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs.length > 0 && tabs[0].id) {
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: (cardName) => {
                                // @ts-ignore - This function is defined in content.ts and exposed to window
                                if (typeof window.fillCardDetails === 'function') {
                                    // @ts-ignore
                                    return window.fillCardDetails(cardName);
                                }
                                return { success: false, message: 'Card filling function not available' };
                            },
                            args: [message.cardName]
                        }).then((results) => {
                            var _a;
                            sendResponse(((_a = results[0]) === null || _a === void 0 ? void 0 : _a.result) || { success: false });
                        }).catch((error) => {
                            console.error('Error executing script:', error);
                            sendResponse({ success: false, error: error.message });
                        });
                    }
                    else {
                        sendResponse({ success: false, error: 'No active tab found' });
                    }
                });
            }
            else {
                // We don't have permission
                sendResponse({ success: false, error: 'Permission not granted' });
            }
        });
        return true;
    }
});
// Fetch recommendations from API
function fetchRecommendations(merchant, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create a cache key
        const cacheKey = `${merchant.toLowerCase()}_${amount}`;
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
                body: JSON.stringify({ merchant, amount })
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
            throw error;
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
    // Fallback card recommendations based on category
    let recommendations = [];
    switch (category) {
        case 'amazon':
            recommendations = [
                {
                    id: 7,
                    name: 'Amazon Prime Rewards',
                    image: 'amazon_prime.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100
                },
                {
                    id: 3,
                    name: 'Citi Double Cash',
                    image: 'citi_double_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                },
                {
                    id: 9,
                    name: 'Wells Fargo Active Cash',
                    image: 'wells_fargo_active_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                }
            ];
            break;
        case 'travel':
            recommendations = [
                {
                    id: 4,
                    name: 'Capital One Venture',
                    image: 'capital_one_venture.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100
                },
                {
                    id: 1,
                    name: 'Chase Sapphire Preferred',
                    image: 'chase_sapphire_preferred.png',
                    reward_percentage: 5,
                    cashback: (amount * 5) / 100
                },
                {
                    id: 2,
                    name: 'Amex Gold Card',
                    image: 'amex_gold.png',
                    reward_percentage: 3,
                    cashback: (amount * 3) / 100
                }
            ];
            break;
        case 'dining':
            recommendations = [
                {
                    id: 2,
                    name: 'Amex Gold Card',
                    image: 'amex_gold.png',
                    reward_percentage: 4,
                    cashback: (amount * 4) / 100
                },
                {
                    id: 1,
                    name: 'Chase Sapphire Preferred',
                    image: 'chase_sapphire_preferred.png',
                    reward_percentage: 3,
                    cashback: (amount * 3) / 100
                },
                {
                    id: 7,
                    name: 'Amazon Prime Rewards',
                    image: 'amazon_prime.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                }
            ];
            break;
        case 'groceries':
            recommendations = [
                {
                    id: 2,
                    name: 'Amex Gold Card',
                    image: 'amex_gold.png',
                    reward_percentage: 4,
                    cashback: (amount * 4) / 100
                },
                {
                    id: 6,
                    name: 'Bank of America Cash Rewards',
                    image: 'bofa_cash_rewards.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                },
                {
                    id: 10,
                    name: 'U.S. Bank Cash+',
                    image: 'us_bank_cash_plus.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                }
            ];
            break;
        case 'gas':
            recommendations = [
                {
                    id: 6,
                    name: 'Bank of America Cash Rewards',
                    image: 'bofa_cash_rewards.png',
                    reward_percentage: 3,
                    cashback: (amount * 3) / 100
                },
                {
                    id: 7,
                    name: 'Amazon Prime Rewards',
                    image: 'amazon_prime.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                },
                {
                    id: 3,
                    name: 'Citi Double Cash',
                    image: 'citi_double_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                }
            ];
            break;
        default:
            recommendations = [
                {
                    id: 3,
                    name: 'Citi Double Cash',
                    image: 'citi_double_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                },
                {
                    id: 9,
                    name: 'Wells Fargo Active Cash',
                    image: 'wells_fargo_active_cash.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                },
                {
                    id: 4,
                    name: 'Capital One Venture',
                    image: 'capital_one_venture.png',
                    reward_percentage: 2,
                    cashback: (amount * 2) / 100
                }
            ];
    }
    return {
        merchant,
        category,
        purchase_amount: amount,
        recommendations
    };
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/background.ts"]();
/******/ 	
/******/ })()
;
//# sourceMappingURL=background.js.map