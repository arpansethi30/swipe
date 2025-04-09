import React, { useState } from 'react';
import { useCardRecommendations } from './hooks/useCardRecommendations';
import { useChromeServices } from './hooks/useChromeServices';
import { CardRecommendationsProps, MerchantInfoProps } from './types/components';

// Components
import CardRecommendations from './components/CardRecommendations';
import MerchantInfo from './components/MerchantInfo';
import SettingsPanel from './components/SettingsPanel';
import Navigation from './components/Navigation';
import Header from './components/Header';

// Styles
import './styles/App.css';

function App() {
  // Custom hooks for state management
  const {
    cards,
    recommendations,
    loading: cardsLoading,
    error: cardsError,
    merchantInfo,
    currentSite,
    detectedAmount,
    getRecommendations,
    detectPurchaseAmount,
    findBestCardForSite,
    setCurrentSite
  } = useCardRecommendations();

  const {
    apiStatus,
    currentUrl,
    currentTab,
    cacheStatus,
    checkApiStatus,
    getCurrentTabInfo,
    triggerContentScript
  } = useChromeServices();

  // Local state
  const [activeTab, setActiveTab] = useState<string>('cards');
  const [loading, setLoading] = useState<boolean>(true);

  // Handlers
  const handleGetRecommendations = async () => {
    if (!currentUrl) return;
    await getRecommendations(currentUrl);
  };

  const handleTriggerContentScript = async () => {
    if (!currentTab?.id) return;
    await triggerContentScript(currentTab.id, currentUrl);
  };

  const handleDetectPurchaseAmount = async () => {
    if (!currentTab?.id) return;
    await detectPurchaseAmount(currentTab.id);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="app-container">
      <Header title="Swipe" subtitle="Credit Card Rewards Maximizer" />
      
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
      
      <main className="main-content">
        {activeTab === 'cards' && (
          <>
            <MerchantInfo
              merchantInfo={merchantInfo}
              detectedAmount={detectedAmount}
              currentUrl={currentUrl}
              currentSite={currentSite}
              loading={loading}
              apiStatus={apiStatus}
              error={cardsError}
              onGetRecommendations={handleGetRecommendations}
              onTriggerContentScript={handleTriggerContentScript}
              onDetectPurchaseAmount={handleDetectPurchaseAmount}
              onCheckApiStatus={checkApiStatus}
            />
            
            <CardRecommendations
              recommendations={recommendations}
              merchantInfo={merchantInfo}
              currentSite={currentSite}
              detectedAmount={detectedAmount}
              loading={cardsLoading}
              error={cardsError}
            />
          </>
        )}
        
        {activeTab === 'settings' && (
          <SettingsPanel
            apiStatus={apiStatus}
            cacheStatus={cacheStatus}
            onCheckApiStatus={checkApiStatus}
          />
        )}
      </main>
    </div>
  );
}

export default App;
