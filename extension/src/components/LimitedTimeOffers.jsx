import React from 'react';

function LimitedTimeOffers({ offers, currentSite }) {
  if (!offers || offers.length === 0) {
    return (
      <div className="no-offers">
        No limited-time offers available for this card.
      </div>
    );
  }

  const formatCategory = (category) => {
    if (!category) return '';
    
    if (category === 'rotatingCategories') return 'Rotating Categories';
    if (category === 'general') return 'everything';
    if (category === 'wholeFoods') return 'Whole Foods';
    if (category === 'hotels') return 'hotels';
    if (category === 'airlines') return 'airlines';
    
    return category;
  };

  // Check if any offers are relevant to the current site
  const relevantOffers = currentSite ? 
    offers.filter(offer => 
      offer.merchant && currentSite.toLowerCase().includes(offer.merchant.toLowerCase())
    ) : [];

  return (
    <div className="limited-offers">
      {relevantOffers.length > 0 && (
        <div className="relevant-offers">
          <div className="relevant-offers-header">
            <div className="relevant-badge">RELEVANT</div>
            <div className="for-site">for {currentSite}</div>
          </div>
          
          {relevantOffers.map(offer => (
            <div key={offer.id} className="offer-item relevant">
              <div className="offer-header">
                <div className="offer-title">{offer.title}</div>
                {offer.isNew && <div className="new-badge">NEW</div>}
              </div>
              
              <div className="offer-description">{offer.description}</div>
              
              {offer.bonusRate && (
                <div className="offer-bonus">
                  <span className="bonus-rate">{offer.bonusRate}%</span> back
                  {offer.merchant && <span> at {offer.merchant}</span>}
                </div>
              )}
              
              <div className="offer-details">
                <div className="offer-validity">{offer.validUntil}</div>
                <button className="activate-btn">
                  {offer.activationType === 'auto' ? 'Automatically Applied' : 'Activate Offer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="other-offers">
        {offers
          .filter(offer => !relevantOffers.some(r => r.id === offer.id))
          .map(offer => (
            <div key={offer.id} className="offer-item">
              <div className="offer-header">
                <div className="offer-title">{offer.title}</div>
                {offer.isNew && <div className="new-badge">NEW</div>}
              </div>
              
              <div className="offer-description">{offer.description}</div>
              
              {offer.bonusRate && (
                <div className="offer-bonus">
                  <span className="bonus-rate">{offer.bonusRate}%</span> back
                  {offer.category && <span> on {formatCategory(offer.category)}</span>}
                  {offer.merchant && <span> at {offer.merchant}</span>}
                </div>
              )}
              
              <div className="offer-details">
                <div className="offer-validity">{offer.validUntil}</div>
                <button className="activate-btn">
                  {offer.activationType === 'auto' ? 'Automatically Applied' : 'Activate Offer'}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default LimitedTimeOffers; 