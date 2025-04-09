import React from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="swipe-tabs">
      <button 
        className={activeTab === 'cards' ? 'active' : ''} 
        onClick={() => onTabChange('cards')}
      >
        Cards
      </button>
      <button 
        className={activeTab === 'settings' ? 'active' : ''} 
        onClick={() => onTabChange('settings')}
      >
        Settings
      </button>
      <button 
        className={activeTab === 'about' ? 'active' : ''} 
        onClick={() => onTabChange('about')}
      >
        About
      </button>
    </nav>
  );
};

export default Navigation;
