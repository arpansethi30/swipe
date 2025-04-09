import { MerchantInfo, Recommendation, Card } from '../types/app';
import { GetRecommendationsRequest, GetRecommendationsResponse, CheckApiStatusResponse } from '../types/api';

// API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://swipe-backend.herokuapp.com/api'  // Replace with your actual production URL when deployed
  : 'http://localhost:8000/api';
const API_TIMEOUT = 5000; // 5 seconds

// Debug mode 
const DEBUG = true;
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log('[Swipe API]', ...args);
  }
}

/**
 * Wrapper for fetch with timeout and error handling
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = API_TIMEOUT): Promise<Response> {
  debugLog(`Fetching ${url}`);
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    debugLog('Fetch error:', error);
    throw error;
  }
}

/**
 * Get recommendations for a merchant
 */
export async function getRecommendations(merchantInfo: MerchantInfo): Promise<Recommendation[]> {
  try {
    debugLog('Getting recommendations for:', merchantInfo);
    
    const request: GetRecommendationsRequest = {
      merchantInfo,
      amount: merchantInfo.amount
    };
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    const data: GetRecommendationsResponse = await response.json();
    debugLog('Received recommendations response:', data);
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get recommendations');
    }
    
    return data.data || [];
  } catch (error) {
    debugLog('Error getting recommendations:', error);
    throw error;
  }
}

/**
 * Get all available cards
 */
export async function getCards(): Promise<Card[]> {
  try {
    debugLog('Getting all cards');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/cards`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get cards');
    }
    
    return data.data?.cards || [];
  } catch (error) {
    debugLog('Error getting cards:', error);
    throw error;
  }
}

/**
 * Check if API is available
 */
export async function checkApiStatus(): Promise<boolean> {
  try {
    debugLog('Checking API status');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/status`, {}, 2000);
    const data: CheckApiStatusResponse = await response.json();
    
    debugLog('API status response:', data);
    return data.success && data.data?.status === true;
  } catch (error) {
    debugLog('API status check failed:', error);
    return false;
  }
}

/**
 * Detect purchase amount on page
 */
export async function detectPurchaseAmount(url: string, html?: string): Promise<number | null> {
  try {
    debugLog('Detecting purchase amount for:', url);
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/detect-amount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, html }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to detect amount');
    }
    
    return data.data?.amount || null;
  } catch (error) {
    debugLog('Error detecting purchase amount:', error);
    return null;
  }
} 