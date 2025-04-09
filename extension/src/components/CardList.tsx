import React, { useState, useEffect } from 'react';
import { Card, Offer } from '../types';

interface CardListProps {
  cards: Card[];
  compareMode?: boolean;
  selectedForComparison?: number[];
  onToggleComparison?: (cardId: number) => void;
  limitedOffers?: Record<number, Offer[]>;
}

const CardList: React.FC<CardListProps> = ({ 
  cards, 
  compareMode = false, 
  selectedForComparison = [], 
  onToggleComparison = () => {}, 
  limitedOffers = {} 
}) => {
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [animationClass, setAnimationClass] = useState<boolean>(false);

  // Handle card expansion with animation timing
  useEffect(() => {
    if (expandedCard) {
      setTimeout(() => {
        setAnimationClass(true);
      }, 50);
    } else {
      setAnimationClass(false);
    }
  }, [expandedCard]);

  if (!cards || cards.length === 0) {
    return (
      <div className="card-list">
        <div className="no-recommendation">
          No credit cards found. Add cards to get started.
        </div>
        <button className="add-card-btn">+ Add a New Card</button>
      </div>
    );
  }

  // Get correct image path based on the environment
  const getImagePath = (imageName: string): string => {
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

  // Toggle expanded card view
  const toggleCardExpand = (cardId: number): void => {
    if (compareMode) return; // Don't expand in compare mode
    
    if (expandedCard === cardId) {
      // Allow animation to complete before closing
      setAnimationClass(false);
      setTimeout(() => {
        setExpandedCard(null);
      }, 300);
    } else {
      if (expandedCard) {
        // Close current card first
        setAnimationClass(false);
        setTimeout(() => {
          setExpandedCard(cardId);
        }, 300);
      } else {
        setExpandedCard(cardId);
      }
    }
  };

  // Get top reward categories for a card
  const getTopRewards = (card: Card, limit = 3): [string, number][] => {
    return Object.entries(card.rewards)
      .filter(([category, _]) => category !== 'general')
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  // Handle card selection for comparison
  const handleCardClick = (card: Card): void => {
    if (compareMode) {
      onToggleComparison(card.id);
    } else {
      toggleCardExpand(card.id);
    }
  };

  // Check if a card is selected for comparison
  const isCardSelected = (cardId: number): boolean => {
    return selectedForComparison.includes(cardId);
  };

  // Get number of offers for a card
  const getCardOfferCount = (cardId: number): number => {
    return limitedOffers[cardId] ? limitedOffers[cardId].length : 0;
  };

  // Check if a card has any new offers
  const hasNewOffers = (cardId: number): boolean => {
    return limitedOffers[cardId] ? limitedOffers[cardId].some(offer => offer.isNew) : false;
  };

  return (
    <div className="card-list">
      {cards.map((card) => (
        <React.Fragment key={card.id}>
          <div 
            className={`card-item ${expandedCard === card.id ? 'expanded' : ''} ${compareMode ? 'compare-mode' : ''} ${isCardSelected(card.id) ? 'selected-for-compare' : ''}`}
            onClick={() => handleCardClick(card)}
          >
            {compareMode && (
              <div className="compare-checkbox">
                <div className="checkbox-inner">
                  {isCardSelected(card.id) && '✓'}
                </div>
              </div>
            )}
            
            <div className="mini-card">
              <img 
                src={getImagePath(card.image)} 
                alt={card.name}
                className="mini-card-img"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  console.error(`Failed to load card image: ${e.currentTarget.src}`);
                  e.currentTarget.src = `https://via.placeholder.com/45x30?text=${encodeURIComponent(card.name.substring(0, 3))}`;
                }}
              />
            </div>
            
            <div className="card-info">
              <div className="card-name">
                {card.name}
                {getCardOfferCount(card.id) > 0 && (
                  <span className={`offers-count-badge ${hasNewOffers(card.id) ? 'new' : ''}`}>
                    {getCardOfferCount(card.id)}
                  </span>
                )}
              </div>
              <div className="card-type">{card.type}</div>
              
              <div className="card-rewards">
                {getTopRewards(card).map(([category, value]) => (
                  <span key={category} className="reward-tag">
                    {value}% on {formatCategory(category)}
                  </span>
                ))}
                {Object.keys(card.rewards).length > 3 && (
                  <span className="more-rewards">+{Object.keys(card.rewards).length - 3} more</span>
                )}
              </div>
            </div>
            
            {!compareMode && <div className="card-expand-icon"></div>}
          </div>
          
          {expandedCard === card.id && card.pointsInfo && !compareMode && (
            <div className={`card-details-expanded ${animationClass ? 'visible' : ''}`}>
              <div className="details-section">
                <h3>All Reward Categories</h3>
                <div className="details-rewards-grid">
                  {Object.entries(card.rewards)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, value]) => (
                      <div key={category} className="detail-reward-item">
                        <span className="reward-category">{formatCategory(category)}</span>
                        <span className="reward-value">{value}%</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              
              <div className="details-section">
                <h3>Card Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Currency:</span>
                  <span className="detail-value">{card.pointsInfo.currency}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Annual Fee:</span>
                  <span className="detail-value">${card.pointsInfo.annualFee}</span>
                </div>
                {card.pointsInfo.travelCredits && (
                  <div className="detail-row highlight">
                    <span className="detail-label">Travel Credit:</span>
                    <span className="detail-value">${card.pointsInfo.travelCredits}/year</span>
                  </div>
                )}
                {card.pointsInfo.transferValue > 1 && (
                  <div className="detail-row">
                    <span className="detail-label">Point Value:</span>
                    <span className="detail-value">~${card.pointsInfo.transferValue.toFixed(2)} per point</span>
                  </div>
                )}
                
                {card.pointsInfo.signupBonus && (
                  <div className="detail-row highlight">
                    <span className="detail-label">Sign-up Bonus:</span>
                    <span className="detail-value">{card.pointsInfo.signupBonus}</span>
                  </div>
                )}
              </div>
              
              {card.pointsInfo.transferPartners.length > 0 && (
                <div className="details-section">
                  <h3>Transfer Partners</h3>
                  <div className="transfer-partners">
                    {card.pointsInfo.transferPartners.map((partner, index) => (
                      <span key={index} className="partner-tag">{partner}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {card.pointsInfo.redemptionOptions && card.pointsInfo.redemptionOptions.length > 0 && (
                <div className="details-section">
                  <h3>Redemption Options</h3>
                  <ul className="redemption-list">
                    {card.pointsInfo.redemptionOptions.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {limitedOffers[card.id] && limitedOffers[card.id].length > 0 && (
                <div className="details-section">
                  <h3>Limited-Time Offers <span className="offers-count">{limitedOffers[card.id].length}</span></h3>
                  <div className="card-offers-list">
                    {limitedOffers[card.id].slice(0, 2).map((offer, idx) => (
                      <div key={idx} className="card-offer-item">
                        <div className="offer-header">
                          <span className="offer-title">{offer.title}</span>
                          {offer.isNew && <span className="new-badge">NEW</span>}
                        </div>
                        <div className="offer-validity">{offer.validUntil}</div>
                      </div>
                    ))}
                    {limitedOffers[card.id].length > 2 && (
                      <div className="more-offers">+ {limitedOffers[card.id].length - 2} more offers</div>
                    )}
                  </div>
                </div>
              )}
              
              {card.pointsInfo.specialFeature && (
                <div className="details-section">
                  <h3>Special Feature</h3>
                  <div className="special-feature">
                    {card.pointsInfo.specialFeature}
                  </div>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      ))}
      
      <button className="add-card-btn">+ Add a New Card</button>
    </div>
  );
};

// Helper function to format category names
const formatCategory = (category: string): string => {
  if (category === 'rotatingCategories') return 'Rotating Categories';
  if (category === 'general') return 'Everything';
  if (category === 'wholeFoods') return 'Whole Foods';
  if (category === 'hotels') return 'Hotels';
  if (category === 'airlines') return 'Airlines';
  
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export default CardList;
