import { ChromeMessage, ChromeResponse, Recommendation, Card, MerchantInfo } from './types/app';
import * as apiService from './utils/apiService';

// Debug mode
const DEBUG = true;
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Swipe Background]', ...args);
  }
}

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  debugLog('Extension installed/updated');
  
  // Set up context menu
  chrome.contextMenus.create({
    id: 'showRecommendations',
    title: 'Show Card Recommendations',
    contexts: ['page']
  });
  
  // Initialize with sample card data for fallback
  initializeSampleCardData();
  
  // Check API status on installation
  checkAndCacheApiStatus();
  
  // Log success
  debugLog('Extension initialized');
});

// Cache the API status to avoid too many calls
let isApiAvailable = false;
async function checkAndCacheApiStatus() {
  try {
    isApiAvailable = await apiService.checkApiStatus();
    debugLog('API status cached:', isApiAvailable);
    
    // Set a periodic check every 5 minutes
    setTimeout(checkAndCacheApiStatus, 5 * 60 * 1000);
  } catch (error) {
    debugLog('Error checking API status:', error);
    isApiAvailable = false;
  }
}

// Sample card data for demo/testing (used when API is unavailable)
function initializeSampleCardData() {
  const sampleCards: Card[] = [
    {
      id: "card-1",
      name: "Active Cash",
      issuer: "Wells Fargo",
      imageUrl: "https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png",
      rewardRate: 2, // 2% cash back
      categories: ["general"],
      annualFee: 0
    },
    {
      id: "card-2",
      name: "Freedom Unlimited",
      issuer: "Chase",
      imageUrl: "https://creditcards.chase.com/K-Marketplace/images/cardart/freedom_unlimited_card.png",
      rewardRate: 1.5, // 1.5% cash back
      categories: ["general", "dining", "travel"],
      annualFee: 0
    },
    {
      id: "card-3",
      name: "Sapphire Preferred",
      issuer: "Chase",
      imageUrl: "https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png",
      rewardRate: 1, // 1% base, but 2x on travel
      categories: ["travel", "dining"],
      annualFee: 95
    },
    {
      id: "card-4",
      name: "Gold Card",
      issuer: "American Express",
      imageUrl: "https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/open/category/cardarts/gold-card.png",
      rewardRate: 1,
      categories: ["dining", "groceries"],
      annualFee: 250
    }
  ];
  
  // Save to storage
  chrome.storage.local.set({ 'cards': sampleCards });
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, sender, sendResponse: (response: ChromeResponse) => void) => {
    debugLog('Received message:', message, 'from sender:', sender);
    
    const handleMessage = async () => {
      try {
        switch (message.action) {
          case 'getRecommendations':
            debugLog('Getting recommendations with merchant info:', message.data?.merchantInfo);
            
            let recommendations: Recommendation[] = [];
            
            if (isApiAvailable) {
              // Try getting recommendations from API first
              try {
                recommendations = await apiService.getRecommendations(message.data?.merchantInfo);
                debugLog('Recommendations from API:', recommendations);
              } catch (apiError) {
                debugLog('API request failed, using fallback:', apiError);
                recommendations = await getFallbackRecommendations(message.data?.merchantInfo);
              }
            } else {
              // Use fallback if API is known to be unavailable
              debugLog('API known to be unavailable, using fallback');
              recommendations = await getFallbackRecommendations(message.data?.merchantInfo);
            }
            
            // Make sure to properly structure the response object
            const response = { 
              success: true, 
              data: { 
                recommendations: recommendations || [] 
              } 
            };
            
            debugLog('Sending formatted response:', response);
            return response;
            
          case 'detectPurchaseAmount':
            debugLog('Detecting purchase amount for tab:', sender.tab?.id);
            let amount = null;
            
            if (isApiAvailable && sender.tab?.url) {
              try {
                // Get the page's HTML content
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.id) {
                  amount = await apiService.detectPurchaseAmount(tab.url);
                }
              } catch (error) {
                debugLog('API purchase detection failed:', error);
              }
            }
            
            // Fallback to content script detection if API fails
            if (amount === null) {
              amount = await detectPurchaseAmountFromTab(sender.tab?.id);
            }
            
            debugLog('Detected amount:', amount);
            return { 
              success: true, 
              data: { amount } 
            };
            
          case 'checkApiStatus':
            debugLog('Checking API status');
            // Force a fresh check rather than using cached value
            const status = await apiService.checkApiStatus();
            // Update our cached value
            isApiAvailable = status;
            debugLog('API status:', status);
            return { 
              success: true, 
              data: { status } 
            };
            
          default:
            debugLog('Unknown action:', message.action);
            return { success: false, error: 'Unknown action' };
        }
      } catch (error) {
        console.error('Error handling message:', error);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    };

    // Handle async response
    handleMessage().then(response => {
      debugLog('Sending response:', response);
      try {
        sendResponse(response);
      } catch (e) {
        console.error('Error sending response:', e);
        // Send a minimal response that won't cause errors
        sendResponse({ 
          success: false, 
          error: 'Error sending response'
        });
      }
    }).catch(error => {
      console.error('Error in handleMessage:', error);
      sendResponse({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    });
    
    return true; // Keep the message channel open for async response
  }
);

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'showRecommendations' && tab?.id) {
    debugLog('Context menu clicked, sending message to tab:', tab.id);
    chrome.tabs.sendMessage(tab.id, { action: 'showRecommendations' });
  }
});

// Fallback recommendations function
async function getFallbackRecommendations(merchantInfo?: MerchantInfo): Promise<Recommendation[]> {
  try {
    if (!merchantInfo) {
      debugLog('No merchant info provided, using dummy data');
      // Return a fallback recommendation
      return [{
        card: {
          id: "card-1",
          name: "Active Cash",
          issuer: "Wells Fargo",
          imageUrl: "https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png",
          rewardRate: 2,
          categories: ["general"],
          annualFee: 0
        },
        estimatedReward: 40 * 0.02, // Assume $40 as the default amount
        rewardRate: 2
      }];
    }
    
    // For demo purposes, use local card data instead of API call
    const { cards } = await chrome.storage.local.get(['cards']);
    debugLog('Retrieved cards from storage:', cards);
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      debugLog('No cards found in storage, fallback to demo data');
      // If no cards in storage, initialize demo data
      initializeSampleCardData();
      const { cards: fallbackCards } = await chrome.storage.local.get(['cards']);
      return generateRecommendations(fallbackCards || [], merchantInfo);
    }
    
    return generateRecommendations(cards, merchantInfo);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    // Return a fallback recommendation in case of error
    return [{
      card: {
        id: "error-card",
        name: "Active Cash",
        issuer: "Wells Fargo",
        imageUrl: "https://www.wellsfargo.com/assets/images/photography/product-photography/credit-cards/card-active-cash-visa-signature.png",
        rewardRate: 2,
        categories: ["general"],
        annualFee: 0
      },
      estimatedReward: 40 * 0.02, // Assume $40 as the default amount
      rewardRate: 2
    }];
  }
}

function generateRecommendations(cards: Card[], merchantInfo: MerchantInfo): Recommendation[] {
  const category = merchantInfo.category || 'general';
  const amount = merchantInfo.amount || 0;
  
  debugLog('Generating recommendations with:', { category, amount });
  
  // Get rewards based on card and category
  return cards.map(card => {
    let rewardRate = card.rewardRate;
    
    // Adjust reward rate based on category
    if (card.categories?.includes(category)) {
      // Bonus for category spending
      rewardRate = category === 'travel' ? rewardRate * 2 : rewardRate * 1.5;
    }
    
    // Calculate estimated rewards
    const estimatedReward = (rewardRate / 100) * amount;
    
    return {
      card,
      estimatedReward,
      rewardRate
    };
  })
  // Sort by highest reward first
  .sort((a, b) => b.estimatedReward - a.estimatedReward);
}

async function detectPurchaseAmountFromTab(tabId?: number): Promise<number | null> {
  if (!tabId) {
    debugLog('No tab ID provided for detectPurchaseAmount');
    return null;
  }
  
  try {
    debugLog('Sending detectAmount message to tab:', tabId);
    const response = await chrome.tabs.sendMessage(tabId, { action: 'detectAmount' });
    debugLog('Response from tab:', response);
    return response?.data?.amount || null;
  } catch (error) {
    console.error('Error detecting purchase amount:', error);
    return null;
  }
} 