import React, { useState, useEffect } from 'react';

function RecommendedCard({ card, rewardRate, category }) {
  const [showDetails, setShowDetails] = useState(false);
  const [animationClass, setAnimationClass] = useState(false);
  
  // Handle animation timing
  useEffect(() => {
    if (showDetails) {
      setTimeout(() => {
        setAnimationClass(true);
      }, 50);
    } else {
      setAnimationClass(false);
    }
  }, [showDetails]);
  
  if (!card) return null;

  // Calculate cashback amount for display (just a demo value)
  const cashbackAmount = ((rewardRate / 100) * 40.50).toFixed(2);

  // Get correct image path based on the environment
  const getImagePath = () => {
    // Check if it's an SVG file
    const isSvg = card.image.endsWith('.svg');
    const filename = isSvg ? card.image : card.image.replace('.png', '');
    
    // For production build
    if (import.meta.env.PROD) {
      return `/assets/images/${filename}${isSvg ? '' : '.png'}`;
    }
    // For development
    return `/src/assets/images/${filename}${isSvg ? '' : '.png'}`;
  };

  // Format point value for display
  const getPointValueText = () => {
    if (!card.pointsInfo) return '';
    
    if (card.pointsInfo.currency === 'Cash Back') {
      return `${rewardRate}% back`;
    } else {
      return `${rewardRate}x ${card.pointsInfo.currency}`;
    }
  };
  
  // Handle details toggle with animation
  const toggleDetails = () => {
    if (showDetails) {
      setAnimationClass(false);
      setTimeout(() => {
        setShowDetails(false);
      }, 300);
    } else {
      setShowDetails(true);
    }
  };

  return (
    <>
      <div className="recommended-card">
        <div className="card-image">
          <img 
            src={getImagePath()} 
            alt={card.name}
            onError={(e) => {
              console.error(`Failed to load card image: ${e.target.src}`);
              e.target.src = `https://via.placeholder.com/120x75?text=${encodeURIComponent(card.name)}`;
            }}
          />
          <div className="card-checkmark">✓</div>
        </div>
        
        <div className="card-details">
          <div className="reward-rate">${cashbackAmount}</div>
          <div className="reward-category">
            {getPointValueText()} on {category}
          </div>
          <div className="card-name">{card.name}</div>
          <button 
            className="use-card-btn"
            onClick={toggleDetails}
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>
      
      {showDetails && card.pointsInfo && (
        <div className={`card-extended-details ${animationClass ? 'visible' : ''}`}>
          <div className="details-section">
            <h3>Point Details</h3>
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
            
            <div className="detail-row">
              <span className="detail-label">Point Value:</span>
              <span className="detail-value">~${card.pointsInfo.transferValue.toFixed(2)} per point</span>
            </div>
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
          
          <div className="details-section">
            <h3>Redemption Options</h3>
            <ul className="redemption-list">
              {card.pointsInfo.redemptionOptions.map((option, index) => (
                <li key={index}>{option}</li>
              ))}
            </ul>
          </div>
          
          {card.pointsInfo.specialFeature && (
            <div className="special-feature">
              <span className="special-feature-label">Special Offer:</span>
              <span className="special-feature-value">{card.pointsInfo.specialFeature}</span>
            </div>
          )}
          
          <button 
            className="use-card-btn"
          >
            Pay with this card
          </button>
        </div>
      )}
    </>
  );
}

export default RecommendedCard; 