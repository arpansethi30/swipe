import { useState, useEffect } from 'react'
import './App.css'
import CardList from './components/CardList'
import RecommendedCard from './components/RecommendedCard'
import SiteDetection from './components/SiteDetection'
import BreakEvenCalculator from './components/BreakEvenCalculator'
import LimitedTimeOffers from './components/LimitedTimeOffers'

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSite, setCurrentSite] = useState(null);
  const [recommendedCard, setRecommendedCard] = useState(null);
  const [rewardRate, setRewardRate] = useState(0);
  const [activeTab, setActiveTab] = useState('cards');
  const [loadingMessage, setLoadingMessage] = useState('Loading cards...');
  const [compareMode, setCompareMode] = useState(false);
  const [compareCards, setCompareCards] = useState([]);
  const [spendAmount, setSpendAmount] = useState(100);
  const [showCalculator, setShowCalculator] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [showOffers, setShowOffers] = useState(false);
  const [availableOffers, setAvailableOffers] = useState([]);
  const [cardLimitedOffers, setCardLimitedOffers] = useState({});
  const [apiStatus, setApiStatus] = useState('checking');
  const [recommendations, setRecommendations] = useState([]);
  const [currentUrl, setCurrentUrl] = useState('');

  // Handle spend amount change
  const handleSpendChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setSpendAmount(value);
    }
  };

  // Calculate rewards for a specific spend amount
  const calculateRewards = (rate, amount) => {
    return ((rate / 100) * amount).toFixed(2);
  };

  useEffect(() => {
    // Get credit card data from storage
    const fetchCardData = async () => {
      try {
        setLoadingMessage('Loading your cards...');
        // Check if we're in a Chrome extension environment
        if (chrome?.storage?.local) {
          chrome.storage.local.get(['cards'], (result) => {
            if (result.cards) {
              setCards(result.cards);
            } else {
              // Use mock data if storage is empty
              setCards(mockCards);
              // Also store mock data for future use
              chrome.storage.local.set({ cards: mockCards });
            }
            setLoading(false);
          });
        } else {
          // Use mock data for development outside of Chrome extension
          setCards(mockCards);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching card data:', error);
        setCards(mockCards);
        setLoading(false);
      }
    };

    // Detect current site (if in extension context)
    const detectCurrentSite = async () => {
      try {
        setLoadingMessage('Detecting current site...');
        if (chrome?.tabs) {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.url) {
              const url = new URL(tabs[0].url);
              setCurrentSite({
                name: url.hostname.replace('www.', ''),
                url: tabs[0].url,
              });
            }
          });
        } else {
          // Mock site for development
          setCurrentSite({
            name: 'amazon.com',
            url: 'https://www.amazon.com/checkout',
          });
        }
      } catch (error) {
        console.error('Error detecting current site:', error);
      }
    };

    fetchCardData();
    detectCurrentSite();
    fetchLimitedTimeOffers();

    // Check API status on load
    chrome.runtime.sendMessage({ action: 'checkApiStatus' }, (response) => {
      setApiStatus(response?.connected ? 'connected' : 'disconnected');
    });

    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentUrl(tabs[0].url);
      }
    });
    
    // Listen for status updates
    const statusListener = (message) => {
      if (message.action === 'apiStatusUpdate') {
        setApiStatus(message.connected ? 'connected' : 'disconnected');
      }
    };
    
    chrome.runtime.onMessage.addListener(statusListener);
    return () => {
      chrome.runtime.onMessage.removeListener(statusListener);
    };
  }, []);

  // Fetch limited time offers
  const fetchLimitedTimeOffers = () => {
    // In a real app, this would be an API call
    // For now, we'll use mock data
    setAvailableOffers(mockOffers);
    
    // Create a map of card ID to offers for easier lookup
    const offersMap = {};
    mockOffers.forEach(offer => {
      if (!offersMap[offer.cardId]) {
        offersMap[offer.cardId] = [];
      }
      offersMap[offer.cardId].push(offer);
    });
    
    setCardLimitedOffers(offersMap);
  };

  useEffect(() => {
    // Find best card when we have both cards and current site
    if (cards.length > 0 && currentSite) {
      setLoadingMessage('Finding the best card for you...');
      findBestCard();
    }
  }, [cards, currentSite]);

  // Handle card comparison
  const toggleCardComparison = (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    setCompareCards(prev => {
      // If card is already in comparison, remove it
      if (prev.some(c => c.id === cardId)) {
        return prev.filter(c => c.id !== cardId);
      }
      
      // Otherwise add it, but limit to 3 cards max
      if (prev.length < 3) {
        return [...prev, card];
      }
      
      return prev;
    });
  };

  const resetComparison = () => {
    setCompareCards([]);
    setCompareMode(false);
  };

  // Toggle feature visibility
  const toggleFeature = (feature) => {
    if (activeFeature === feature) {
      setActiveFeature(null);
    } else {
      setActiveFeature(feature);
    }
  };

  const findBestCard = () => {
    try {
      setLoadingMessage('Calculating rewards...');
      
      // Skip if no cards or current site
      if (!cards.length || !currentSite) return;
      
      // Extract domain from URL
      const domain = currentSite.name.toLowerCase();
      const url = currentSite.url.toLowerCase();
      
      // Determine the site's category
      let detectedCategory = 'general';
      let siteCategory = '';
      
      // Check for specific merchants first (most specific matches)
      if (domain.includes('amazon')) {
        detectedCategory = 'amazon';
        siteCategory = 'Amazon';
      } else if (domain.includes('wholefood')) {
        detectedCategory = 'wholeFoods';
        siteCategory = 'Whole Foods';
      } else {
        // Check for broader categories
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
          for (const keyword of keywords) {
            if (domain.includes(keyword) || url.includes(keyword)) {
              detectedCategory = category;
              siteCategory = formatCategoryName(category);
              break;
            }
          }
          if (detectedCategory !== 'general') break;
        }
      }
      
      // Now find the card with the highest reward for this category
      let highestReward = 0;
      let bestCard = null;
      
      cards.forEach(card => {
        // Get the reward rate for the detected category
        let rewardRate = card.rewards[detectedCategory] || card.rewards.general || 1;
        
        // Apply point value multipliers for travel-focused categories
        if (detectedCategory === 'travel' || detectedCategory === 'hotels' || detectedCategory === 'airlines') {
          // If the card has point transfer options that increase value, apply those for travel
          if (card.pointsInfo && card.pointsInfo.transferValue > 1) {
            rewardRate = rewardRate * card.pointsInfo.transferValue;
          }
          
          // If the site is a specific travel partner of the card, boost the value
          if (card.pointsInfo && card.pointsInfo.transferPartners) {
            for (const partner of card.pointsInfo.transferPartners) {
              if (domain.includes(partner.toLowerCase())) {
                rewardRate = rewardRate * 1.2; // 20% boost for direct partners
                break;
              }
            }
          }
        }
        
        // Check for limited-time offers that might apply
        if (cardLimitedOffers[card.id]) {
          const relevantOffers = cardLimitedOffers[card.id].filter(offer => {
            // Check if the offer applies to this category or merchant
            return (offer.category === detectedCategory || 
                   (offer.merchant && domain.includes(offer.merchant.toLowerCase())));
          });
          
          if (relevantOffers.length > 0) {
            // Use the highest applicable bonus
            const maxBonus = Math.max(...relevantOffers.map(o => o.bonusRate));
            rewardRate = maxBonus > rewardRate ? maxBonus : rewardRate;
          }
        }
        
        if (rewardRate > highestReward) {
          highestReward = rewardRate;
          bestCard = card;
        }
      });
      
      if (bestCard) {
        setRecommendedCard(bestCard);
        setRewardRate(highestReward);
      } else {
        // If no specific card is best, recommend the best general card
        const bestGeneralCard = cards.reduce((best, card) => {
          return (card.rewards.general || 1) > (best.rewards.general || 1) ? card : best;
        }, cards[0]);
        
        setRecommendedCard(bestGeneralCard);
        setRewardRate(bestGeneralCard.rewards.general || 1);
      }
    } catch (error) {
      console.error('Error finding best card:', error);
    }
  };
  
  // Format category names for display
  const formatCategoryName = (category) => {
    if (category === 'general') return 'all purchases';
    if (category === 'wholeFoods') return 'Whole Foods';
    if (category === 'rotatingCategories') return 'current bonus category';
    
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Category keywords for detection
  const categoryKeywords = {
    travel: ['hotel', 'booking', 'airline', 'flight', 'expedia', 'kayak', 'airbnb', 'hostel', 'trip', 'vacation', 'rental'],
    dining: ['restaurant', 'food', 'menu', 'doordash', 'ubereats', 'grubhub', 'postmates', 'seamless', 'delivery'],
    groceries: ['grocery', 'wholefood', 'safeway', 'kroger', 'albertsons', 'supermarket', 'market'],
    gas: ['gas', 'fuel', 'gasoline', 'shell', 'exxon', 'chevron', 'mobil'],
    entertainment: ['movie', 'theatre', 'cinema', 'ticket', 'concert', 'event'],
    streaming: ['netflix', 'hulu', 'disney+', 'spotify', 'prime video', 'youtube', 'streaming'],
    retail: ['walmart', 'target', 'costco', 'bestbuy', 'macys', 'kohls', 'nordstrom', 'shopping'],
    airlines: ['united', 'delta', 'american airlines', 'southwest', 'jetblue', 'british airways', 'air france', 'emirates', 'turkish'],
    hotels: ['hilton', 'marriott', 'hyatt', 'wyndham', 'ihg', 'accor', 'radisson', 'choice', 'best western']
  };

  const getRecommendations = () => {
    setLoading(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.runtime.sendMessage(
          { 
            action: 'getRecommendation', 
            url: tabs[0].url,
            purchaseAmount: null // We don't know the amount in the popup
          }, 
          (response) => {
            setLoading(false);
            if (response && response.success) {
              setRecommendations(response.recommendations);
            } else {
              console.error('Failed to get recommendations:', response?.error);
            }
          }
        );
      }
    });
  };

  const triggerContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'manualRecommendation' });
        window.close(); // Close the popup
      }
    });
  };

  const clearCache = () => {
    chrome.runtime.sendMessage({ action: 'clearCache' }, (response) => {
      if (response?.success) {
        alert('Cache cleared successfully!');
      }
    });
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <div className="logo">
          <span className="logo-emoji">💳</span>
          <h1>Swipe</h1>
        </div>
        <div className="api-status">
          <span 
            className={`status-indicator ${apiStatus === 'connected' ? 'connected' : apiStatus === 'checking' ? 'checking' : 'disconnected'}`}
          ></span>
          {apiStatus === 'connected' ? 'Connected' : apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
        </div>
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'cards' ? 'active' : ''} 
          onClick={() => setActiveTab('cards')}
        >
          My Cards
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
        <button 
          className={activeTab === 'about' ? 'active' : ''} 
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </nav>

      <main className="popup-content">
        {activeTab === 'cards' && (
          <div className="cards-tab">
            <div className="action-buttons">
              <button 
                className="primary-button" 
                onClick={triggerContentScript}
                disabled={apiStatus !== 'connected'}
              >
                Show Card Recommendations
              </button>
              <button 
                className="secondary-button" 
                onClick={getRecommendations}
                disabled={apiStatus !== 'connected' || loading}
              >
                {loading ? 'Loading...' : 'View in Popup'}
              </button>
            </div>

            {recommendations.length > 0 && (
              <div className="recommendations-list">
                <h3>Recommended Cards</h3>
                {recommendations.map((rec, index) => (
                  <div key={index} className={`card-item ${index === 0 ? 'best-card' : ''}`}>
                    <div className="card-header">
                      {rec.image_url && (
                        <img src={rec.image_url} alt={rec.card_name} className="card-image" />
                      )}
                      <div className="card-title">
                        <strong>{rec.card_name}</strong>
                        <span className="issuer">{rec.issuer}</span>
                      </div>
                    </div>
                    <div className="reward-info">
                      <span className="reward-percentage">{rec.reward_percentage}%</span>
                      <div className="reward-category">{rec.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recommendations.length === 0 && !loading && (
              <div className="empty-state">
                <p>Click "Show Card Recommendations" to see which card is best for your current checkout.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="setting-item">
              <label className="setting-label">Popup Behavior</label>
              <select className="setting-control">
                <option value="auto">Show automatically on checkout</option>
                <option value="manual">Manual activation only</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-label">API Connection</label>
              <div className="setting-value">
                {apiStatus === 'connected' ? (
                  <span className="connected-status">Connected to Swipe API</span>
                ) : (
                  <span className="disconnected-status">Disconnected - Is your server running?</span>
                )}
              </div>
            </div>

            <div className="setting-item">
              <label className="setting-label">Cache Control</label>
              <button className="text-button" onClick={clearCache}>Clear Recommendations Cache</button>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-tab">
            <h3>Swipe - Credit Card Rewards Maximizer</h3>
            <p>Version 0.1.0</p>
            <p>Swipe helps you choose the best credit card to maximize rewards during checkout.</p>
            <p className="current-url">
              Current URL: <span className="url-text">{currentUrl}</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function for image path
const getImagePath = (imageName) => {
  // Check if it's an SVG file
  const isSvg = imageName.endsWith('.svg');
  const filename = isSvg ? imageName : imageName.replace('.png', '');
  
  // For production build
  if (import.meta.env?.PROD) {
    return `/assets/images/${filename}${isSvg ? '' : '.png'}`;
  }
  // For development
  return `/src/assets/images/${filename}${isSvg ? '' : '.png'}`;
};

// Mock data for development
const mockCards = [
  {
    id: 1,
    name: 'Chase Sapphire Reserve',
    type: 'Visa',
    image: 'chase-sapphire-reserve.svg',
    rewards: {
      general: 1,
      dining: 3,
      travel: 3,
      groceries: 1,
      gas: 1,
      streaming: 1,
      retail: 1,
      entertainment: 2
    },
    pointsInfo: {
      currency: 'Ultimate Rewards Points',
      transferPartners: ['United', 'Southwest', 'Hyatt', 'Marriott', 'JetBlue', 'British Airways', 'Singapore Airlines'],
      transferValue: 1.5,
      redemptionOptions: ['Travel Portal (1.5x)', 'Transfer to Partners', 'Cash Back (1x)', 'Pay Yourself Back (1.5x)'],
      annualFee: 550,
      travelCredits: 300,
      signupBonus: '75,000 points after spending $4,000 in 3 months',
      specialFeature: '10x points on hotels and car rentals through Chase Travel'
    },
    color: '#0A4B9D',
    spendingCategories: {
      dining: 10000,
      travel: 15000,
      groceries: 6000,
      gas: 2000,
      streaming: 500,
      general: 12000
    }
  },
  {
    id: 2,
    name: 'American Express Gold',
    type: 'Amex',
    image: 'amex-gold.svg',
    rewards: {
      general: 1,
      dining: 4,
      travel: 3,
      groceries: 4,
      gas: 1,
      streaming: 1,
      retail: 1,
      entertainment: 1
    },
    pointsInfo: {
      currency: 'Membership Rewards Points',
      transferPartners: ['Delta', 'British Airways', 'Hilton', 'Marriott', 'ANA', 'Emirates', 'Etihad', 'Air France KLM'],
      transferValue: 1.2,
      redemptionOptions: ['Transfer to Partners', 'Travel (1x)', 'Statement Credit (0.6x)', 'Gift Cards (variable)'],
      annualFee: 250,
      travelCredits: 120,
      signupBonus: '60,000 points after spending $4,000 in 6 months',
      specialFeature: '$120 dining credit at select restaurants and services'
    },
    color: '#C6A44B',
    spendingCategories: {
      dining: 8000,
      travel: 5000,
      groceries: 8400,
      gas: 1800,
      streaming: 600,
      general: 10000
    }
  },
  {
    id: 3,
    name: 'Citi Double Cash',
    type: 'Mastercard',
    image: 'citi-double-cash.svg',
    rewards: {
      general: 2,
      dining: 2,
      travel: 2,
      groceries: 2,
      gas: 2,
      streaming: 2,
      retail: 2,
      entertainment: 2,
      amazon: 2
    },
    pointsInfo: {
      currency: 'Cash Back',
      transferPartners: [],
      transferValue: 1.0,
      redemptionOptions: ['Statement Credit', 'Direct Deposit', 'Check'],
      annualFee: 0,
      signupBonus: '$200 cash back after spending $1,500 in 6 months',
      specialFeature: '1% when you buy + 1% when you pay'
    },
    color: '#007DC3',
    spendingCategories: {
      dining: 4000,
      travel: 2000,
      groceries: 6000,
      gas: 2000,
      streaming: 500,
      general: 20000
    }
  },
  {
    id: 4,
    name: 'Amazon Prime Rewards',
    type: 'Visa',
    image: 'amazon-prime.svg',
    rewards: {
      general: 1,
      dining: 2,
      travel: 1,
      groceries: 2,
      gas: 2,
      streaming: 1,
      retail: 1,
      entertainment: 1,
      amazon: 5,
      wholeFoods: 5
    },
    pointsInfo: {
      currency: 'Cash Back',
      transferPartners: [],
      transferValue: 1.0,
      redemptionOptions: ['Statement Credit', 'Amazon Purchase Credit', 'Gift Cards'],
      annualFee: 0,
      signupBonus: '$150 Amazon Gift Card upon approval',
      specialFeature: 'Prime membership required ($139/year)'
    },
    color: '#232F3E',
    spendingCategories: {
      dining: 2000,
      travel: 500,
      groceries: 3000,
      gas: 1000,
      amazon: 6000,
      general: 4000
    }
  },
  {
    id: 5,
    name: 'Discover it Cash Back',
    type: 'Discover',
    image: 'discover-it.svg',
    rewards: {
      general: 1,
      rotatingCategories: 5,
      retail: 1,
      entertainment: 1
    },
    pointsInfo: {
      currency: 'Cash Back',
      transferPartners: [],
      transferValue: 1.0,
      redemptionOptions: ['Statement Credit', 'Direct Deposit', 'Pay with Cashback at Amazon'],
      annualFee: 0,
      signupBonus: 'Cashback Match for first year',
      specialFeature: 'Cashback Match for first year - all earnings doubled'
    },
    color: '#F68121',
    spendingCategories: {
      dining: 2000,
      travel: 1000,
      groceries: 4800,
      gas: 1500,
      entertainment: 1200,
      general: 6000
    }
  },
  {
    id: 6,
    name: 'Capital One Venture X',
    type: 'Visa',
    image: 'capital-one-venture-x.svg',
    rewards: {
      general: 2,
      dining: 2,
      travel: 5,
      groceries: 2,
      gas: 2,
      streaming: 2,
      retail: 2,
      entertainment: 2,
      hotels: 10
    },
    pointsInfo: {
      currency: 'Capital One Miles',
      transferPartners: ['Avianca', 'Air Canada', 'Emirates', 'Air France KLM', 'British Airways', 'Turkish Airlines', 'Accor'],
      transferValue: 1.85,
      redemptionOptions: ['Transfer to Partners', 'Travel Portal (1x)', 'Statement Credit for Travel (1x)', 'Gift Cards (0.8x)'],
      annualFee: 395,
      travelCredits: 300,
      signupBonus: '75,000 miles after spending $4,000 in 3 months',
      specialFeature: '10,000 bonus miles on account anniversary'
    },
    color: '#004977',
    spendingCategories: {
      dining: 6000,
      travel: 12000,
      groceries: 5000,
      gas: 2000,
      streaming: 500,
      general: 10000
    }
  }
];

// Mock offers data
const mockOffers = [
  {
    id: 101,
    cardId: 1, // Chase Sapphire Reserve
    title: "5% Bonus at Marriott Hotels",
    description: "Earn additional rewards when you book direct with Marriott",
    bonusRate: 5,
    category: "hotels",
    merchant: "Marriott",
    validUntil: "Valid through Dec 31, 2023",
    isNew: true,
    activationType: "auto",
  },
  {
    id: 102,
    cardId: 1, 
    title: "10% Back on Lyft Rides",
    description: "Limited time offer for all Lyft rides",
    bonusRate: 10,
    category: "travel",
    merchant: "Lyft",
    validUntil: "Valid through Nov 30, 2023",
    isNew: false,
    activationType: "auto",
  },
  {
    id: 103,
    cardId: 2, // Amex Gold
    title: "8% at Restaurants This Weekend",
    description: "Double points at restaurants this weekend only",
    bonusRate: 8,
    category: "dining",
    validUntil: "Valid Oct 15-17, 2023",
    isNew: true,
    activationType: "activation",
    additionalInfo: "Must activate by Oct 14"
  },
  {
    id: 104,
    cardId: 2,
    title: "$30 off $100+ at Best Buy",
    description: "Use your Amex Gold at Best Buy for instant savings",
    merchant: "Best Buy",
    validUntil: "Valid through Oct 31, 2023",
    isNew: false,
    activationType: "activation",
  },
  {
    id: 105,
    cardId: 4, // Amazon Prime
    title: "10% Back on Home Goods",
    description: "Double rewards on Amazon Home category",
    bonusRate: 10,
    category: "retail",
    merchant: "Amazon",
    validUntil: "Valid through Nov 15, 2023",
    isNew: true,
    activationType: "auto",
  },
  {
    id: 106,
    cardId: 6, // Capital One Venture X
    title: "15% Back on Airbnb",
    description: "Triple points on Airbnb bookings",
    bonusRate: 15,
    category: "travel",
    merchant: "Airbnb",
    validUntil: "Valid through Jan 15, 2024",
    isNew: true,
    activationType: "activation",
  }
];

export default App
