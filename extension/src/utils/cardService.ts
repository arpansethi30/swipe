import { CATEGORY_KEYWORDS } from './constants';
import { formatCategoryName } from './helpers';
import { Card, Recommendation } from '../types/app';

interface Site {
  name: string;
  url: string;
}

interface Offer {
  id: string;
  cardId: string;
  category?: string;
  merchant?: string;
  bonusRate?: number;
  expiryDate?: Date;
}

interface BestCardResult {
  bestCard: Card | null;
  rewardRate: number;
  category?: string;
}

/**
 * Find the best card for the current site
 * @param cards - Array of card objects
 * @param currentSite - Current site information
 * @param cardLimitedOffers - Map of card offers
 * @returns Object with best card and reward rate
 */
export const findBestCard = (
  cards: Card[], 
  currentSite: Site, 
  cardLimitedOffers: Record<string, Offer[]> = {}
): BestCardResult => {
  if (!cards.length || !currentSite) {
    return { bestCard: null, rewardRate: 0 };
  }
  
  // Extract domain from URL
  const domain = currentSite.name.toLowerCase();
  const url = currentSite.url.toLowerCase();
  
  // Determine the site's category
  let detectedCategory = 'general';
  let siteCategory = '';
  
  // Check for specific merchants first (most specific matches)
  if (domain.includes('amazon')) {
    detectedCategory = 'amazon';
    siteCategory = 'Amazon';
  } else if (domain.includes('wholefood')) {
    detectedCategory = 'wholeFoods';
    siteCategory = 'Whole Foods';
  } else {
    // Check for broader categories
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (domain.includes(keyword) || url.includes(keyword)) {
          detectedCategory = category;
          siteCategory = formatCategoryName(category);
          break;
        }
      }
      if (detectedCategory !== 'general') break;
    }
  }
  
  // Now find the card with the highest reward for this category
  let highestReward = 0;
  let bestCard: Card | null = null;
  
  cards.forEach(card => {
    // Get the reward rate for the detected category
    let rewardRate = getCardRewardRate(card, detectedCategory);
    
    // Apply point value multipliers for travel-focused categories
    if (detectedCategory === 'travel' || detectedCategory === 'hotels' || detectedCategory === 'airlines') {
      // Apply travel-specific multipliers if available
      rewardRate = applyTravelMultipliers(card, domain, rewardRate);
    }
    
    // Check for limited-time offers that might apply
    if (cardLimitedOffers[card.id]) {
      rewardRate = applyLimitedTimeOffers(cardLimitedOffers[card.id], detectedCategory, domain, rewardRate);
    }
    
    if (rewardRate > highestReward) {
      highestReward = rewardRate;
      bestCard = card;
    }
  });
  
  if (bestCard) {
    return { bestCard, rewardRate: highestReward, category: detectedCategory };
  } else {
    // If no specific card is best, recommend the best general card
    const bestGeneralCard = getBestGeneralCard(cards);
    
    return { 
      bestCard: bestGeneralCard, 
      rewardRate: getCardRewardRate(bestGeneralCard, 'general'),
      category: 'general'
    };
  }
};

/**
 * Get the best general purpose card from a list of cards
 * @param cards Array of cards
 * @returns The best general purpose card
 */
const getBestGeneralCard = (cards: Card[]): Card => {
  return cards.reduce((best, card) => {
    const currentReward = getCardRewardRate(best, 'general');
    const newReward = getCardRewardRate(card, 'general');
    return newReward > currentReward ? card : best;
  }, cards[0]);
};

/**
 * Get reward rate for a card in a specific category
 * @param card Card to check
 * @param category Category to check
 * @returns Reward rate for the category
 */
const getCardRewardRate = (card: Card, category: string): number => {
  // This is a simplified implementation - in a real app, you would 
  // have a more complex data structure for card rewards
  
  // For now, use a placeholder method
  if (category === 'general') {
    return card.rewardRate || 1;
  }
  
  // Check if the card has higher rewards for this category
  if (card.categories && card.categories.includes(category)) {
    return card.rewardRate * 1.5; // Assume 50% higher reward in bonus categories
  }
  
  return card.rewardRate || 1;
};

/**
 * Apply travel-specific multipliers to reward rate
 * @param card Card to check
 * @param domain Domain to check against 
 * @param baseRate Base reward rate
 * @returns Adjusted reward rate
 */
const applyTravelMultipliers = (card: Card, domain: string, baseRate: number): number => {
  let adjustedRate = baseRate;
  
  // This is a placeholder - in a real app, you would have more card-specific logic
  // Here we're just simulating some travel-specific bonuses
  
  // If the card has travel categories, boost the rate
  if (card.categories && card.categories.includes('travel')) {
    adjustedRate *= 1.5; // 50% boost for travel cards on travel sites
  }
  
  return adjustedRate;
};

/**
 * Apply limited-time offers to reward rate
 * @param offers Array of offers
 * @param category Current category
 * @param domain Current domain
 * @param baseRate Base reward rate
 * @returns Adjusted reward rate
 */
const applyLimitedTimeOffers = (
  offers: Offer[], 
  category: string, 
  domain: string, 
  baseRate: number
): number => {
  let adjustedRate = baseRate;
  
  const relevantOffers = offers.filter(offer => {
    // Check if the offer applies to this category or merchant
    return (offer.category === category || 
           (offer.merchant && domain.includes(offer.merchant.toLowerCase())));
  });
  
  if (relevantOffers.length > 0) {
    // Use the highest applicable bonus
    const maxBonus = Math.max(...relevantOffers.map(o => o.bonusRate || 0));
    adjustedRate = maxBonus > adjustedRate ? maxBonus : adjustedRate;
  }
  
  return adjustedRate;
};

/**
 * Toggle card comparison selection
 * @param cardId - Card ID to toggle
 * @param compareCards - Currently selected cards
 * @param cards - All available cards
 * @returns Updated comparison card list
 */
export const toggleCardComparison = (
  cardId: string, 
  compareCards: Card[], 
  cards: Card[]
): Card[] => {
  const card = cards.find(c => c.id === cardId);
  if (!card) return compareCards;

  // If card is already in comparison, remove it
  if (compareCards.some(c => c.id === cardId)) {
    return compareCards.filter(c => c.id !== cardId);
  }
  
  // Otherwise add it, but limit to 3 cards max
  if (compareCards.length < 3) {
    return [...compareCards, card];
  }
  
  return compareCards;
};
