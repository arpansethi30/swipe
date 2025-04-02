import React from 'react';
import CardLogo from './CardLogo';

function CardList({ cards }) {
  if (!cards || cards.length === 0) {
    return (
      <div className="no-cards">
        <p>No credit cards found. Add cards to get started.</p>
      </div>
    );
  }

  return (
    <div className="card-list">
      <h2>Your Cards</h2>
      <div className="cards">
        {cards.map((card) => (
          <div className="card-item" key={card.id} style={{ borderColor: card.color }}>
            <div className="card-header" style={{ backgroundColor: card.color }}>
              <CardLogo type={card.type} />
              <div className="card-type">{card.type}</div>
            </div>
            <div className="card-body">
              <h3>{card.name}</h3>
              <div className="rewards">
                <h4>Rewards</h4>
                <ul>
                  {Object.entries(card.rewards).map(([category, value]) => (
                    <li key={category}>
                      <span className="category">{formatCategory(category)}:</span> 
                      <span className="value">{value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to format category names
function formatCategory(category) {
  if (category === 'rotatingCategories') return 'Rotating Categories';
  
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default CardList; 