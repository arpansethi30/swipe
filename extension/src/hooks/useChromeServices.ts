import { useState, useEffect } from 'react';
import * as chromeService from '../utils/chromeServices';

export const useChromeServices = () => {
  const [apiStatus, setApiStatus] = useState<string>('checking');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<chrome.tabs.Tab | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string>('unknown');

  const checkApiStatus = async () => {
    try {
      const connected = await chromeService.checkApiStatus();
      setApiStatus(connected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('disconnected');
    }
  };

  const getCurrentTabInfo = async () => {
    try {
      const tab = await chromeService.getCurrentTab();
      if (tab) {
        setCurrentTab(tab);
        setCurrentUrl(tab.url || '');
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  };

  const triggerContentScript = async (tabId: number, url: string) => {
    try {
      await chromeService.triggerContentScript(tabId, url);
    } catch (error) {
      console.error('Error triggering content script:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkApiStatus();
    getCurrentTabInfo();

    // Listen for status updates
    const statusListener = (message: any) => {
      if (message.action === 'apiStatusUpdate') {
        setApiStatus(message.connected ? 'connected' : 'disconnected');
      }
    };

    if (chrome?.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(statusListener);
      return () => {
        chrome.runtime.onMessage.removeListener(statusListener);
      };
    }
  }, []);

  return {
    apiStatus,
    currentUrl,
    currentTab,
    cacheStatus,
    checkApiStatus,
    getCurrentTabInfo,
    triggerContentScript
  };
}; 