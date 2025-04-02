// Background script for Swipe extension

// API endpoint (local development)
const API_BASE_URL = 'http://localhost:8000';

// Cache for recommendations to reduce API calls
const recommendationCache = {};
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes in milliseconds

// Connection status
let apiConnected = false;

// Test API connection on extension load
function testApiConnection() {
  fetch(`${API_BASE_URL}/health`)
    .then(response => {
      if (response.ok) {
        apiConnected = true;
        console.log('Connected to Swipe API successfully');
      } else {
        apiConnected = false;
        console.error('API returned error status:', response.status);
      }
    })
    .catch(error => {
      apiConnected = false;
      console.error('Failed to connect to Swipe API:', error);
    });
}

// Test connection on startup
testApiConnection();

// Periodically check connection status
setInterval(testApiConnection, 5 * 60 * 1000); // Check every 5 minutes

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getRecommendation') {
    // Check if we're connected to the API
    if (!apiConnected) {
      testApiConnection(); // Try to reconnect
      sendResponse({
        success: false,
        error: 'Not connected to Swipe API. Please make sure the backend server is running.'
      });
      return true;
    }
    
    // Generate cache key - combine URL host and purchase amount (if available)
    const urlObj = new URL(request.url);
    const cacheKey = `${urlObj.hostname}_${request.purchaseAmount ? Math.round(request.purchaseAmount) : 'none'}`;
    
    // Check if we have a valid cached response
    const cachedData = recommendationCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRY)) {
      console.log('Using cached recommendations for', urlObj.hostname);
      sendResponse({
        success: true,
        recommendations: cachedData.recommendations,
        cached: true
      });
      return true;
    }
    
    console.log('Fetching recommendations for', urlObj.hostname, 'with amount', request.purchaseAmount);
    
    // Set up timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    // Call the API to get card recommendations
    fetch(`${API_BASE_URL}/recommendations/recommend-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: request.url,
        purchase_amount: request.purchaseAmount 
      }),
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId); // Clear the timeout
        if (!response.ok) {
          throw new Error('API request failed with status ' + response.status);
        }
        return response.json();
      })
      .then(data => {
        // Validate response data
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from API');
        }
        
        // Update connection status
        apiConnected = true;
        
        // Cache the response
        recommendationCache[cacheKey] = {
          recommendations: data,
          timestamp: Date.now()
        };
        
        sendResponse({
          success: true,
          recommendations: data,
          cached: false
        });
      })
      .catch(error => {
        clearTimeout(timeoutId); // Ensure timeout is cleared
        console.error('Error fetching recommendations:', error);
        
        // Update connection status if it's a network error
        if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
          apiConnected = false;
        }
        
        sendResponse({
          success: false,
          error: `Failed to fetch recommendations: ${error.message}`
        });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // Handle clearing cache
  if (request.action === 'clearCache') {
    Object.keys(recommendationCache).forEach(key => delete recommendationCache[key]);
    sendResponse({ success: true, message: 'Cache cleared' });
    return true;
  }
  
  // Handle API status check
  if (request.action === 'checkApiStatus') {
    testApiConnection();
    setTimeout(() => {
      sendResponse({ connected: apiConnected });
    }, 500); // Give the test a moment to complete
    return true;
  }
  
  // Handle manual recommendation request
  if (request.action === 'manualRecommendationRequest') {
    chrome.tabs.sendMessage(sender.tab.id, { action: 'manualRecommendation' });
    return true;
  }
});

// Add context menu item for manually showing recommendations
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'show-card-recommendations',
    title: 'Show card recommendations',
    contexts: ['page']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'show-card-recommendations') {
    chrome.tabs.sendMessage(tab.id, { action: 'manualRecommendation' });
  }
}); 