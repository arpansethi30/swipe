// Background script for Swipe extension

// Listen for installation or update
chrome.runtime.onInstalled.addListener(details => {
  // Initialize default data when the extension is installed
  if (details.reason === 'install') {
    // Set default credit cards data
    const defaultCards = [
      {
        id: 1,
        name: 'Chase Sapphire Reserve',
        type: 'Visa',
        image: 'chase-sapphire-reserve.png',
        rewards: {
          general: 1,
          dining: 3,
          travel: 3,
          groceries: 1,
          gas: 1,
          streaming: 1
        },
        color: '#0A4B9D'
      },
      {
        id: 2,
        name: 'American Express Gold',
        type: 'Amex',
        image: 'amex-gold.png',
        rewards: {
          general: 1,
          dining: 4,
          travel: 3,
          groceries: 4,
          gas: 1,
          streaming: 1
        },
        color: '#C6A44B'
      },
      {
        id: 3,
        name: 'Citi Double Cash',
        type: 'Mastercard',
        image: 'citi-double-cash.png',
        rewards: {
          general: 2,
          dining: 2,
          travel: 2,
          groceries: 2,
          gas: 2,
          streaming: 2
        },
        color: '#007DC3'
      },
      {
        id: 4,
        name: 'Amazon Prime Rewards',
        type: 'Visa',
        image: 'amazon-prime.png',
        rewards: {
          general: 1,
          dining: 2,
          travel: 1,
          groceries: 2,
          gas: 2,
          streaming: 1,
          amazon: 5
        },
        color: '#232F3E'
      },
      {
        id: 5,
        name: 'Discover it Cash Back',
        type: 'Discover',
        image: 'discover-it.png',
        rewards: {
          general: 1,
          rotatingCategories: 5
        },
        color: '#F68121'
      }
    ];

    chrome.storage.local.set({ cards: defaultCards }, () => {
      console.log('Default cards have been initialized');
    });
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle opening the popup
  if (request.action === 'openPopup') {
    chrome.action.openPopup();
  }
  
  // Get the best card for a specific merchant or category
  if (request.action === 'getBestCard') {
    const { merchant, category } = request.data;
    
    chrome.storage.local.get(['cards'], (result) => {
      const cards = result.cards || [];
      let bestCard = null;
      let highestReward = 0;
      
      for (const card of cards) {
        let rewardRate = card.rewards.general; // Default to general rate
        
        // Check if there's a specific merchant rate
        if (merchant && card.rewards[merchant.toLowerCase()]) {
          rewardRate = card.rewards[merchant.toLowerCase()];
        } 
        // Otherwise check category rate
        else if (category && card.rewards[category.toLowerCase()]) {
          rewardRate = card.rewards[category.toLowerCase()];
        }
        
        if (rewardRate > highestReward) {
          highestReward = rewardRate;
          bestCard = card;
        }
      }
      
      sendResponse({ bestCard, rewardRate: highestReward });
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
}); 