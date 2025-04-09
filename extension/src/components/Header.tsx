import React from 'react';

interface HeaderProps {
  apiStatus: string;
}

const Header: React.FC<HeaderProps> = ({ apiStatus }) => {
  return (
    <header className="swipe-header">
      <div className="swipe-logo">
        <img src="/icons/icon48.png" alt="Swipe Logo" />
        <h1>Swipe</h1>
      </div>
      <div className={`api-status ${apiStatus}`}>
        <span className="status-dot"></span>
        <span className="status-text">
          {apiStatus === 'connected' ? 'Connected' : 
           apiStatus === 'checking' ? 'Checking...' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
};

export default Header;
