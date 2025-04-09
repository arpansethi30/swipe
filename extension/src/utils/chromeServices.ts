// Chrome extension messaging services
import { Card, MerchantInfo, Recommendation, ChromeMessage, ChromeResponse } from '../types/app';

interface RecommendationsResult {
  recommendations: Recommendation[];
  merchantInfo: MerchantInfo | null;
}

/**
 * Get card data from chrome storage
 * @returns Promise resolving to card data
 */
export const fetchCardData = (): Promise<Card[]> => {
  return new Promise((resolve, reject) => {
    try {
      if (chrome?.storage?.local) {
        chrome.storage.local.get(['cards'], (result) => {
          if (result.cards) {
            resolve(result.cards);
          } else {
            reject(new Error('No cards found in storage'));
          }
        });
      } else {
        reject(new Error('Chrome storage not available'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get current tab information
 * @returns Promise resolving to current tab
 */
export const getCurrentTab = (): Promise<chrome.tabs.Tab> => {
  return new Promise((resolve, reject) => {
    if (chrome?.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0]) {
          resolve(tabs[0]);
        } else {
          reject(new Error('No active tab found'));
        }
      });
    } else {
      reject(new Error('Chrome tabs API not available'));
    }
  });
};

/**
 * Check API connection status
 * @returns Promise resolving to connection status
 */
export const checkApiStatus = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const message: ChromeMessage = { action: 'checkApiStatus' };
    chrome.runtime.sendMessage(message, (response: ChromeResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response.success && response.data?.status !== undefined) {
        resolve(response.data.status);
      } else {
        resolve(false);
      }
    });
  });
};

/**
 * Clear recommendations cache
 * @returns Promise resolving to success status
 */
export const clearCache = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const message: ChromeMessage = { action: 'clearCache' };
    chrome.runtime.sendMessage(message, (response: any) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.success);
      }
    });
  });
};

/**
 * Get recommendations for current merchant
 * @param merchantInfo Merchant information
 * @returns Promise resolving to recommendations
 */
export const getRecommendations = (merchantInfo: MerchantInfo): Promise<RecommendationsResult> => {
  return new Promise((resolve, reject) => {
    const message: ChromeMessage = { 
      action: 'getRecommendations',
      data: { merchantInfo } 
    };
    
    chrome.runtime.sendMessage(message, (response: ChromeResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response.success && response.data?.recommendations) {
        resolve({
          recommendations: response.data.recommendations,
          merchantInfo: merchantInfo
        });
      } else {
        reject(new Error(response.error || 'Failed to get recommendations'));
      }
    });
  });
};

/**
 * Trigger content script to show overlay
 * @param tabId Tab ID
 * @returns Promise resolving to success status
 */
export const triggerContentScript = (tabId: number): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      { action: 'showRecommendations' },
      (response: ChromeResponse) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success) {
          resolve(true);
        } else {
          reject(new Error(response?.error || 'Failed to trigger content script'));
        }
      }
    );
  });
};

/**
 * Detect purchase amount on page
 * @param tabId Tab ID
 * @returns Promise resolving to detected amount
 */
export const detectPurchaseAmount = (tabId: number): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      { action: 'checkPurchaseAmount' },
      (response: ChromeResponse) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.success && response.data?.amount !== undefined) {
          resolve(response.data.amount);
        } else {
          resolve(null); // No amount detected
        }
      }
    );
  });
};
