import { useState, useEffect } from 'react'
import './App.css'
import CardList from './components/CardList'
import RecommendedCard from './components/RecommendedCard'
import SiteDetection from './components/SiteDetection'

function App() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSite, setCurrentSite] = useState(null);
  const [recommendedCard, setRecommendedCard] = useState(null);
  const [rewardRate, setRewardRate] = useState(0);
  const [activeTab, setActiveTab] = useState('recommendation');

  useEffect(() => {
    // Get credit card data from storage
    const fetchCardData = async () => {
      try {
        // Check if we're in a Chrome extension environment
        if (chrome?.storage?.local) {
          chrome.storage.local.get(['cards'], (result) => {
            if (result.cards) {
              setCards(result.cards);
            } else {
              // Use mock data if storage is empty
              setCards(mockCards);
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
  }, []);

  useEffect(() => {
    // Find best card when we have both cards and current site
    if (cards.length > 0 && currentSite) {
      findBestCard();
    }
  }, [cards, currentSite]);

  const findBestCard = () => {
    // In a real scenario, this would use more sophisticated logic
    // and potentially call to a backend for merchant category detection
    
    // Simplified logic for demo:
    const siteName = currentSite.name.toLowerCase();
    let category = 'general';
    
    // Simple merchant matching
    if (siteName.includes('amazon')) {
      category = 'amazon';
    } else if (siteName.includes('hotel') || siteName.includes('airline') || siteName.includes('booking')) {
      category = 'travel';
    } else if (siteName.includes('restaurant') || siteName.includes('doordash') || siteName.includes('ubereats')) {
      category = 'dining';
    } else if (siteName.includes('grocery') || siteName.includes('wholefood')) {
      category = 'groceries';
    }
    
    // Find the card with the best reward for this category
    let bestCard = null;
    let bestReward = 0;
    
    for (const card of cards) {
      const reward = card.rewards[category] || card.rewards.general;
      if (reward > bestReward) {
        bestReward = reward;
        bestCard = card;
      }
    }
    
    setRecommendedCard(bestCard);
    setRewardRate(bestReward);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Swipe</h1>
        <div className="tabs">
          <button 
            className={activeTab === 'recommendation' ? 'active' : ''} 
            onClick={() => setActiveTab('recommendation')}
          >
            Recommendation
          </button>
          <button 
            className={activeTab === 'cards' ? 'active' : ''} 
            onClick={() => setActiveTab('cards')}
          >
            My Cards
          </button>
        </div>
      </header>

      <main className="content">
        {loading ? (
          <div className="loading">Loading cards...</div>
        ) : (
          <>
            {activeTab === 'recommendation' ? (
              <div className="recommendation-tab">
                <SiteDetection site={currentSite} />
                {recommendedCard ? (
                  <RecommendedCard 
                    card={recommendedCard} 
                    rewardRate={rewardRate} 
                    category={currentSite?.name || 'this site'} 
                  />
                ) : (
                  <div className="no-recommendation">
                    No card recommendation available for this site.
                  </div>
                )}
              </div>
            ) : (
              <div className="cards-tab">
                <CardList cards={cards} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Mock data for development
const mockCards = [
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

export default App
