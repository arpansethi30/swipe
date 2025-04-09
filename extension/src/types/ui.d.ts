import { Card, Recommendation } from './app';

export interface CardProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
}

export interface RecommendationProps {
  recommendation: Recommendation;
  onSelect?: () => void;
}

export interface CardListProps {
  cards: Card[];
  onCardClick?: (card: Card) => void;
  selectedCardId?: string;
}

export interface RecommendationListProps {
  recommendations: Recommendation[];
  onRecommendationSelect?: (recommendation: Recommendation) => void;
}

export interface MerchantInfoProps {
  merchantName: string;
  category: string;
  amount: number;
}

export interface UserPreferencesProps {
  onSave: (preferences: {
    preferredCards?: string[];
    excludedCards?: string[];
    minRewardRate?: number;
    maxAnnualFee?: number;
  }) => void;
  initialPreferences?: {
    preferredCards?: string[];
    excludedCards?: string[];
    minRewardRate?: number;
    maxAnnualFee?: number;
  };
}

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
} 