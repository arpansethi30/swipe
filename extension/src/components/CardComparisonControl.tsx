import React from 'react';
import { Card } from '../types';
import '../styles/CardComparisonControl.css';

interface CardComparisonControlProps {
  compareMode: boolean;
  setCompareMode: (mode: boolean) => void;
  compareCards: Card[];
  setActiveFeature: (feature: string | null) => void;
  resetComparison: () => void;
}

const CardComparisonControl: React.FC<CardComparisonControlProps> = ({
  compareMode,
  setCompareMode,
  compareCards,
  setActiveFeature,
  resetComparison
}) => {
  return (
    <div className="comparison-controls">
      <div className="toggle-section">
        <span>Compare Cards</span>
        <label className="toggle-switch">
          <input 
            type="checkbox" 
            checked={compareMode} 
            onChange={() => {
              if (compareMode) {
                resetComparison();
              } else {
                setCompareMode(true);
              }
            }}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
      
      {compareMode && (
        <div className="comparison-status">
          <p>
            {compareCards.length === 0 && 'Select cards to compare'}
            {compareCards.length === 1 && 'Select one more card'}
            {compareCards.length >= 2 && `${compareCards.length} cards selected`}
          </p>
          {compareCards.length >= 2 && (
            <button 
              className="view-comparison-btn"
              onClick={() => setActiveFeature('comparison')}
            >
              View Comparison
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CardComparisonControl;
