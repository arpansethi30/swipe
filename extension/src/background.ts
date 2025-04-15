import { CardDetails, getCardDetails } from './utils';

// No need to redeclare Window interface as it's now in utils.ts

// API endpoint for recommendations
const API_URL = 'http://localhost:5001/api/recommend';
const API_CARDS_URL = 'http://localhost:5001/api/cards';
const API_SEARCH_URL = 'http://localhost:5001/api/search';

// User preferences (will be loaded from storage)
interface UserPreferences {
  preferred_issuers?: string[];
  preferred_networks?: string[];
  max_annual_fee?: number;
}

// Cache for storing recommendations to prevent excessive API calls
interface CacheEntry {
  timestamp: number;
  data: any;
}

const recommendationsCache: Record<string, CacheEntry> = {};
let cardsCache: CacheEntry | null = null;
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load user preferences from storage
let userPreferences: UserPreferences = {};

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
    } else {
      console.warn('Permissions not granted, some features may not work properly');
    }
  });
});

// Backend API URL
const BACKEND_URL = 'http://localhost:5001';

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle different message actions
  switch (message.action) {
    case 'isCheckoutPage':
      handleIsCheckoutPage(sender.tab?.id, sendResponse);
      break;
    case 'getRecommendations':
      handleGetRecommendations(message.merchant, message.amount, message.preferences, sendResponse);
      break;
    case 'fillCardDetails':
      handleFillCardDetails(sender.tab?.id, message.cardName, sendResponse);
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
async function handleIsCheckoutPage(tabId: number | undefined, sendResponse: (response?: any) => void) {
  if (!tabId) {
    sendResponse({ isCheckout: false });
    return;
  }
  
  try {
    // Execute content script to check if it's a checkout page
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // Check if we're on a checkout page
        if (typeof window.isCheckoutPage === 'function') {
          return {
            isCheckout: window.isCheckoutPage(),
            merchant: window.getMerchantName?.() || 'Unknown',
            amount: window.getPurchaseAmount?.() || 40.50
          };
        }
        return { isCheckout: false };
      }
    });
    
    // Send response
    if (results && results[0]?.result) {
      sendResponse(results[0].result);
    } else {
      sendResponse({ isCheckout: false });
    }
  } catch (error) {
    console.error('Error checking checkout page:', error);
    sendResponse({ isCheckout: false });
  }
}

// Handle getting recommendations
async function handleGetRecommendations(
  merchant: string, 
  amount: number, 
  preferences: any,
  sendResponse: (response?: any) => void
) {
  try {
    // Prepare request data
    const requestData: {
      merchant: string;
      amount: number;
      user_preferences: {
        preferred_issuers?: string[];
        preferred_networks?: string[];
        max_annual_fee?: number;
      };
    } = {
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
    const response = await fetch(`${BACKEND_URL}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Received recommendations:', data);
    
    // Send response back with enhanced data from backend
    sendResponse({
      success: true,
      recommendations: data.recommendations || [],
      merchant: data.merchant || merchant,
      confidence: data.confidence || "low",
      amount: amount,
      merchant_categories: data.merchant_categories || []
    });
  } catch (error: any) {
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
        explanation: '2% cashback on all purchases',
        cashback: amount * 0.02
      },
      {
        name: 'Wells Fargo Active Cash',
        issuer: 'Wells Fargo',
        rewardPercentage: 2,
        explanation: '2% cashback on all purchases',
        cashback: amount * 0.02
      }
    ];
    
    sendResponse({
      success: true,
      recommendations: dummyRecommendations,
      merchant: merchant,
      confidence: "low",
      amount: amount,
      merchant_categories: ["other"]
    });
  }
}

// Handle filling card details
async function handleFillCardDetails(
  tabId: number | undefined, 
  cardName: string,
  sendResponse: (response?: any) => void
) {
  if (!tabId) {
    sendResponse({ success: false, error: 'No active tab' });
    return;
  }
  
  try {
    // Get card details
    const cardDetails = getCardDetails(cardName);
    
    // Execute content script to fill card details
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (details: CardDetails) => {
        if (typeof window.fillCardDetails === 'function') {
          window.fillCardDetails(details);
          return { success: true };
        }
        return { success: false, error: 'fillCardDetails not available' };
      },
      args: [cardDetails]
    });
    
    sendResponse({ success: true });
  } catch (error) {
    console.error('Error filling card details:', error);
    sendResponse({ success: false, error: String(error) });
  }
}

// Handle saving user preferences
function handleSaveUserPreferences(preferences: UserPreferences, sendResponse: (response?: any) => void) {
  userPreferences = preferences;
  chrome.storage.sync.set({ userPreferences }, () => {
    console.log('User preferences saved:', userPreferences);
    sendResponse({ success: true });
  });
}

// Handle getting user preferences
function handleGetUserPreferences(sendResponse: (response?: any) => void) {
  sendResponse({ preferences: userPreferences });
}

// Handle getting all cards
async function handleGetAllCards(sendResponse: (response?: any) => void) {
  try {
    const response = await fetch(API_CARDS_URL);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    sendResponse({ cards: data.cards });
  } catch (error) {
    console.error('Error fetching all cards:', error);
    sendResponse({ error: String(error) });
  }
}

// Handle searching cards
async function handleSearchCards(query: string, sendResponse: (response?: any) => void) {
  try {
    const response = await fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    sendResponse({ results: data.results });
  } catch (error) {
    console.error('Error searching cards:', error);
    sendResponse({ error: String(error) });
  }
}

// Fetch recommendations from API
async function fetchRecommendations(merchant: string, amount: number): Promise<any> {
  // Create a cache key
  const cacheKey = `${merchant.toLowerCase()}_${amount}_${JSON.stringify(userPreferences)}`;
  
  // Check cache first
  if (recommendationsCache[cacheKey] && 
      (Date.now() - recommendationsCache[cacheKey].timestamp) < CACHE_EXPIRY) {
    console.log('Using cached recommendations');
    return recommendationsCache[cacheKey].data;
  }
  
  try {
    const response = await fetch(API_URL, {
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
    
    const data = await response.json();
    
    // Cache the result
    recommendationsCache[cacheKey] = {
      timestamp: Date.now(),
      data
    };
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(String(error));
  }
}

// Fetch all cards from API
async function fetchAllCards(): Promise<any> {
  // Check cache first
  if (cardsCache && (Date.now() - cardsCache.timestamp) < CACHE_EXPIRY) {
    console.log('Using cached cards data');
    return cardsCache.data;
  }
  
  try {
    const response = await fetch(API_CARDS_URL);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the result
    const newCache: CacheEntry = {
      timestamp: Date.now(),
      data: data.cards
    };
    
    // Update global cache
    cardsCache = newCache;
    
    return data.cards;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(String(error));
  }
}

// Search cards by query
async function searchCards(query: string): Promise<any> {
  try {
    const response = await fetch(`${API_SEARCH_URL}?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('API request failed:', error);
    throw new Error(String(error));
  }
}

// Fallback recommendations if API is unavailable
function getFallbackRecommendations(merchant: string, amount: number): any {
  const merchantLower = merchant.toLowerCase();
  let category = 'other';
  
  // Simple merchant classification
  if (merchantLower.includes('amazon')) {
    category = 'amazon';
  } else if (merchantLower.includes('airline') || merchantLower.includes('flight') || merchantLower.includes('hotel')) {
    category = 'travel';
  } else if (merchantLower.includes('restaurant') || merchantLower.includes('food')) {
    category = 'dining';
  } else if (merchantLower.includes('grocery') || merchantLower.includes('supermarket')) {
    category = 'groceries';
  } else if (merchantLower.includes('gas') || merchantLower.includes('fuel')) {
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
          score: (amount * 5) / 100 - (95/365),
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
          score: (amount * 5) / 100 - (95/365),
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
          score: (amount * 3) / 100 - (250/365),
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