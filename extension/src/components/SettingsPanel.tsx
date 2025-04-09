import React from 'react';

interface SettingsPanelProps {
  apiStatus: string;
  checkApiStatus: () => void;
  clearCache: () => void; 
  cacheStatus: string;
  currentUrl: string;
  refreshTab: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  apiStatus, 
  checkApiStatus, 
  clearCache, 
  cacheStatus,
  currentUrl,
  refreshTab
}) => {
  return (
    <div className="settings-tab">
      <h2>Settings</h2>
      
      <div className="settings-section">
        <h3>API Connection</h3>
        <div className="setting-item">
          <div className="setting-details">
            <p>Backend API Status</p>
            <div className={`api-status ${apiStatus}`}>
              <span className="status-dot"></span>
              <span className="status-text">
                {apiStatus === 'connected' ? 'Connected' : 
                apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
              </span>
            </div>
          </div>
          <button 
            onClick={checkApiStatus}
            className="secondary-button"
          >
            Check Now
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Cache Management</h3>
        <div className="setting-item">
          <div className="setting-details">
            <p>Clear Recommendations Cache</p>
            <p className="setting-description">
              Clears stored recommendations data to get fresh results
            </p>
          </div>
          <button 
            onClick={clearCache}
            className="secondary-button"
          >
            {cacheStatus === 'cleared' ? 'Cleared!' : 'Clear Cache'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Current Page</h3>
        <div className="setting-item">
          <div className="setting-details">
            <p>Active URL</p>
            <p className="setting-description truncate-text">
              {currentUrl || 'No active page'}
            </p>
          </div>
          <button 
            onClick={refreshTab}
            className="secondary-button"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>About Swipe</h3>
        <div className="about-info">
          <p>Version: 0.1.0</p>
          <p>© 2023 Swipe Team</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
