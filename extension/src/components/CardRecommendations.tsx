import React from 'react';
import { MerchantInfo, Site } from '../types';
import { CARD_NETWORK_LOGOS, CREDIT_SCORE_COLORS } from '../utils/constants';

interface RecommendedCard {
  card_id: number;
  card_name: string;
  issuer: string;
  image_url?: string;
  reward_percentage: number;
  reward_currency: string;
  estimated_reward?: number;
  points_value?: number;
  reason?: string;
  annual_fee: number;
  annual_credits?: number;
  sign_up_bonus?: string;
  sign_up_bonus_value?: number;
  additional_benefits?: string[];
  credit_score_recommended?: string;
  card_network?: string;
  is_limited_time_offer?: boolean;
  offer_end_date?: string;
}

interface CardRecommendationsProps {
  recommendations: RecommendedCard[];
  merchantInfo: MerchantInfo | null;
  currentSite: Site | null;
  detectedAmount: number | null;
}

const CardRecommendations: React.FC<CardRecommendationsProps> = ({ 
  recommendations,
  merchantInfo,
  currentSite,
  detectedAmount 
}) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }
  
  return (
    <div className="recommendations">
      <h2>Recommended Cards</h2>
      <div className="card-list">
        {recommendations.map((card, index) => (
          <div 
            key={card.card_id} 
            className={`card-item ${index === 0 ? 'best-card' : ''}`}
          >
            {index === 0 && <div className="best-card-badge">Best Card</div>}
            {card.is_limited_time_offer && (
              <div className="limited-time-badge">
                Limited Time
                {card.offer_end_date && (
                  <span className="offer-expiry">
                    {' '}(until {new Date(card.offer_end_date).toLocaleDateString()})
                  </span>
                )}
              </div>
            )}
            
            <div className="card-header">
              <div className="card-image">
                {card.image_url ? (
                  <img src={card.image_url} alt={card.card_name} />
                ) : (
                  <div className="card-image-placeholder">{card.issuer.charAt(0)}</div>
                )}
              </div>
              <div className="card-title">
                <h3>{card.card_name}</h3>
                <p className="card-issuer">{card.issuer}</p>
              </div>
            </div>
            
            <div className="card-details">
              <div className="reward-info">
                <div className="reward-percentage">
                  {card.reward_percentage.toFixed(1)}%
                </div>
                <div className="reward-type">
                  {card.reward_currency === "cash back" ? "cash back" : card.reward_currency}
                </div>
              </div>
              
              {card.estimated_reward && (
                <div className="estimated-reward">
                  Est. reward: <span className="amount">${card.estimated_reward.toFixed(2)}</span>
                </div>
              )}
              
              {card.points_value && card.reward_currency !== "cash back" && (
                <div className="points-value">
                  {Math.round(card.points_value)} {card.reward_currency}
                </div>
              )}
              
              {card.reason && (
                <div className="reward-reason">{card.reason}</div>
              )}
              
              <div className="card-meta">
                <div className="annual-fee">
                  {card.annual_fee > 0 ? (
                    <>
                      Annual fee: ${card.annual_fee.toFixed(0)}
                      {card.annual_credits && card.annual_credits > 0 && (
                        <span className="annual-credits">
                          {` (${card.annual_credits} in credits)`}
                        </span>
                      )}
                    </>
                  ) : (
                    "No annual fee"
                  )}
                </div>
                
                {card.sign_up_bonus && (
                  <div className="sign-up-bonus">
                    Bonus: {card.sign_up_bonus}
                    {card.sign_up_bonus_value && (
                      <span className="bonus-value">
                        {` ($${card.sign_up_bonus_value} value)`}
                      </span>
                    )}
                  </div>
                )}
                
                {card.additional_benefits && card.additional_benefits.length > 0 && (
                  <div className="card-benefits">
                    <span className="benefits-label">Benefits:</span> {card.additional_benefits.join(', ')}
                  </div>
                )}
                
                <div className="card-footer">
                  {card.credit_score_recommended && (
                    <div 
                      className="credit-score" 
                      style={{
                        backgroundColor: card.credit_score_recommended in CREDIT_SCORE_COLORS 
                          ? CREDIT_SCORE_COLORS[card.credit_score_recommended as keyof typeof CREDIT_SCORE_COLORS] 
                          : '#757575'
                      }}
                    >
                      {card.credit_score_recommended}
                    </div>
                  )}
                  
                  {card.card_network && card.card_network in CARD_NETWORK_LOGOS && (
                    <div className="card-network">
                      <img 
                        src={CARD_NETWORK_LOGOS[card.card_network as keyof typeof CARD_NETWORK_LOGOS]} 
                        alt={card.card_network} 
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardRecommendations;
