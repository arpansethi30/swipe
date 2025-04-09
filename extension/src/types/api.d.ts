import { Recommendation, MerchantInfo } from './app';

// API request types
export interface GetRecommendationsRequest {
  merchantInfo: MerchantInfo;
  amount: number;
}

export interface GetRecommendationsResponse {
  success: boolean;
  data?: Recommendation[];
  error?: string;
}

export interface DetectPurchaseAmountRequest {
  url: string;
  html?: string;
}

export interface DetectPurchaseAmountResponse {
  success: boolean;
  data?: {
    amount: number;
  };
  error?: string;
}

export interface CheckApiStatusResponse {
  success: boolean;
  data?: {
    status: boolean;
    version: string;
  };
  error?: string;
}

export interface GetCardsResponse {
  success: boolean;
  data?: {
    cards: Array<{
      id: string;
      name: string;
      issuer: string;
      imageUrl: string;
      rewardRate: number;
      categories: string[];
      annualFee: number;
    }>;
  };
  error?: string;
}

export interface UpdateUserPreferencesRequest {
  preferredCards?: string[];
  excludedCards?: string[];
  minRewardRate?: number;
  maxAnnualFee?: number;
}

export interface UpdateUserPreferencesResponse {
  success: boolean;
  error?: string;
} 