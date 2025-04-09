import React from 'react';
import { MerchantInfo as MerchantInfoType, Site } from '../types';

interface MerchantInfoProps {
  merchantInfo: MerchantInfoType | null;
  detectedAmount: number | null;
  currentUrl: string;
  currentSite: Site | null;
  loading: boolean;
  apiStatus: string;
  getRecommendations: () => void;
  triggerContentScript: () => void;
  detectPurchaseAmount: () => void;
  error: string | null;
  checkApiStatus: () => void;
}

const MerchantInfo: React.FC<MerchantInfoProps> = ({ 
  merchantInfo, 
  detectedAmount, 
  currentUrl,
  loading, 
  apiStatus, 
  getRecommendations, 
  triggerContentScript, 
  detectPurchaseAmount,
  error,
  checkApiStatus
}) => {
  return (
    <div className="current-site">
      <h2>Current Site</h2>
      <p className="site-url">{currentUrl}</p>
      
      {merchantInfo && (
        <div className="merchant-info">
          <p>
            <strong>Merchant:</strong> {merchantInfo.merchant_name}
          </p>
          <p>
            <strong>Category:</strong> {merchantInfo.merchant_category}
            {merchantInfo.merchant_subcategory && ` (${merchantInfo.merchant_subcategory})`}
          </p>
          {merchantInfo.average_transaction && (
            <p>
              <strong>Avg. Transaction:</strong> ${merchantInfo.average_transaction.toFixed(2)}
            </p>
          )}
        </div>
      )}
      
      {detectedAmount !== null && (
        <div className="detected-amount">
          <p>
            <strong>Detected Amount:</strong> ${detectedAmount.toFixed(2)}
          </p>
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          onClick={getRecommendations}
          disabled={loading || apiStatus !== 'connected'}
          className="primary-button"
        >
          {loading ? 'Loading...' : 'Get Recommendations'}
        </button>
        <button 
          onClick={triggerContentScript}
          disabled={loading || apiStatus !== 'connected'}
          className="secondary-button"
        >
          Show in Page
        </button>
        <button 
          onClick={detectPurchaseAmount}
          disabled={loading}
          className="secondary-button"
        >
          Detect Amount
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={checkApiStatus}>Retry Connection</button>
        </div>
      )}
    </div>
  );
};

export default MerchantInfo;
