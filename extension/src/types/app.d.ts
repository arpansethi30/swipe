export interface Card {
  id: string;
  name: string;
  issuer: string;
  imageUrl: string;
  rewardRate: number;
  categories?: string[];
  annualFee: number;
  pointsInfo?: {
    transferValue?: number;
    transferPartners?: string[];
  };
}

export interface Recommendation {
  card: Card;
  estimatedReward: number;
  rewardRate: number;
}

export interface MerchantInfo {
  name: string;
  category: string;
  amount: number;
}

export interface ChromeMessage {
  action: string;
  data?: any;
}

export interface ChromeResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserPreferences {
  preferredCards?: string[];
  excludedCards?: string[];
  minRewardRate?: number;
  maxAnnualFee?: number;
} 