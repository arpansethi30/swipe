import React, { useState, useEffect } from 'react';

function BreakEvenCalculator({ card }) {
  const [breakEvenAmount, setBreakEvenAmount] = useState(0);
  const [categoryBreakdowns, setCategoryBreakdowns] = useState([]);
  const [effectiveAnnualFee, setEffectiveAnnualFee] = useState(0);

  useEffect(() => {
    if (card) {
      calculateBreakEven();
    }
  }, [card]);

  const calculateBreakEven = () => {
    // If the card has no annual fee, there's nothing to break even
    if (!card.pointsInfo.annualFee || card.pointsInfo.annualFee <= 0) {
      setBreakEvenAmount(0);
      setEffectiveAnnualFee(0);
      return;
    }

    // Calculate effective annual fee (after credits)
    let effectiveFee = card.pointsInfo.annualFee;
    
    if (card.pointsInfo.travelCredits) {
      effectiveFee -= card.pointsInfo.travelCredits;
    }
    
    // Don't allow negative effective fee
    if (effectiveFee < 0) effectiveFee = 0;
    
    setEffectiveAnnualFee(effectiveFee);

    // If there's no effective fee, nothing to break even
    if (effectiveFee <= 0) {
      setBreakEvenAmount(0);
      return;
    }

    // Calculate break-even spending amounts by category
    const breakdowns = [];
    const baseRate = card.rewards.general || 1;
    
    // For each category with a higher rate than the base rate
    Object.entries(card.rewards)
      .filter(([category, rate]) => category !== 'general' && rate > baseRate)
      .forEach(([category, rate]) => {
        const effectiveRate = (rate - baseRate) / 100; // Convert to decimal and get incremental value
        
        // Calculate how much spending needed in this category to offset the annual fee
        const spendNeeded = Math.ceil(effectiveFee / effectiveRate);
        
        breakdowns.push({
          category,
          rate,
          baseRate,
          spendNeeded
        });
      });
    
    // Sort by spend needed (ascending)
    breakdowns.sort((a, b) => a.spendNeeded - b.spendNeeded);
    
    setCategoryBreakdowns(breakdowns);

    // Calculate the general break-even amount (worst case scenario)
    if (baseRate > 0) {
      const generalBreakEven = Math.ceil((effectiveFee / baseRate) * 100);
      setBreakEvenAmount(generalBreakEven);
    } else {
      setBreakEvenAmount(Infinity);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCategory = (category) => {
    if (category === 'rotatingCategories') return 'Rotating Categories';
    if (category === 'general') return 'Everything';
    if (category === 'wholeFoods') return 'Whole Foods';
    if (category === 'hotels') return 'Hotels';
    if (category === 'airlines') return 'Airlines';
    
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!card || !card.pointsInfo) {
    return <div className="calculator-content">No card data available</div>;
  }

  return (
    <div className="calculator-content">
      <div className="calculator-title">Annual Fee Breakeven Analysis</div>
      
      <div className="fee-summary">
        <div className="fee-row">
          <span>Annual Fee:</span>
          <span className="fee-value">{formatAmount(card.pointsInfo.annualFee)}</span>
        </div>
        
        {card.pointsInfo.travelCredits > 0 && (
          <div className="fee-row credit-row">
            <span>Travel Credits:</span>
            <span className="fee-value">-{formatAmount(card.pointsInfo.travelCredits)}</span>
          </div>
        )}
        
        <div className="fee-row effective-fee">
          <span>Effective Annual Cost:</span>
          <span className="fee-value">{formatAmount(effectiveAnnualFee)}</span>
        </div>
      </div>
      
      {effectiveAnnualFee <= 0 ? (
        <div className="break-even-result positive">
          <div className="result-value">No Break-Even Required</div>
          <div className="result-explanation">
            This card's credits fully offset the annual fee, making it effectively free to hold.
          </div>
        </div>
      ) : (
        <>
          <div className="breakeven-title">Spending Required to Break Even:</div>
          
          {categoryBreakdowns.length > 0 ? (
            <div className="breakeven-categories">
              {categoryBreakdowns.slice(0, 3).map((breakdown, idx) => (
                <div key={idx} className="category-breakeven">
                  <div className="category-name">
                    <span className="category-emoji">{getCategoryEmoji(breakdown.category)}</span>
                    {formatCategory(breakdown.category)}:
                  </div>
                  <div className="category-value">{formatAmount(breakdown.spendNeeded)}</div>
                  <div className="category-detail">
                    at {breakdown.rate}% ({breakdown.rate - breakdown.baseRate}% incremental value)
                  </div>
                </div>
              ))}
              
              <div className="general-breakeven">
                <div className="general-label">OR</div>
                <div className="general-value">{formatAmount(breakEvenAmount)}</div>
                <div className="general-detail">
                  on general spending at {card.rewards.general || 1}%
                </div>
              </div>
            </div>
          ) : (
            <div className="general-breakeven">
              <div className="general-value">{formatAmount(breakEvenAmount)}</div>
              <div className="general-detail">
                on general spending at {card.rewards.general || 1}%
              </div>
            </div>
          )}
          
          {card.spendingCategories && (
            <div className="spending-comparison">
              <div className="spending-title">Based on your annual spending:</div>
              <div className="spending-analysis">
                {Object.entries(card.spendingCategories)
                  .filter(([category]) => 
                    categoryBreakdowns.some(b => b.category === category))
                  .slice(0, 2)
                  .map(([category, amount], idx) => {
                    const breakdown = categoryBreakdowns.find(b => b.category === category);
                    if (!breakdown) return null;
                    
                    const coveragePercent = Math.min(Math.round((amount / breakdown.spendNeeded) * 100), 100);
                    const isCovered = amount >= breakdown.spendNeeded;
                    
                    return (
                      <div key={idx} className={`spending-category ${isCovered ? 'covered' : ''}`}>
                        <div className="spending-category-name">{formatCategory(category)}:</div>
                        <div className="spending-values">
                          <div>You spend: {formatAmount(amount)}/year</div>
                          <div>Need: {formatAmount(breakdown.spendNeeded)}</div>
                        </div>
                        <div className="coverage-bar">
                          <div 
                            className="coverage-fill" 
                            style={{width: `${coveragePercent}%`}}
                          />
                          <span className="coverage-text">{coveragePercent}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getCategoryEmoji(category) {
  const emojiMap = {
    dining: '🍽️',
    travel: '✈️',
    hotels: '🏨',
    airlines: '✈️',
    groceries: '🛒',
    gas: '⛽',
    streaming: '📺',
    entertainment: '🎭',
    retail: '🛍️',
    amazon: '📦',
    wholeFoods: '🥑',
    rotatingCategories: '🔄',
    general: '💳'
  };
  
  return emojiMap[category] || '💳';
}

export default BreakEvenCalculator; 