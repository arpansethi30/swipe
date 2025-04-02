import React from 'react';
import CardLogo from './CardLogo';

function RecommendedCard({ card, rewardRate, category }) {
  if (!card) return null;

  return (
    <div className="recommended-card">
      <h2>Recommended Card</h2>
      <div className="card-highlight" style={{ borderColor: card.color }}>
        <div className="card-header" style={{ backgroundColor: card.color }}>
          <CardLogo type={card.type} />
          <div className="card-type">{card.type}</div>
        </div>
        <div className="card-body">
          <h3>{card.name}</h3>
          <div className="reward-highlight">
            <span className="reward-rate">{rewardRate}%</span> cash back
            <div className="category-text">
              on {category}
            </div>
          </div>
          <div className="card-use-action">
            <button className="use-card-btn">Use This Card</button>
          </div>
        </div>
      </div>
      <div className="reward-explanation">
        <p>
          Using your <strong>{card.name}</strong> for this purchase
          will earn you <strong>{rewardRate}%</strong> in rewards.
        </p>
        <p className="secondary-text">
          This is the best rate among your cards for purchases on {category}.
        </p>
      </div>
    </div>
  );
}

export default RecommendedCard; 