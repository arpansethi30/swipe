// Common types used throughout the application

export interface Card {
  id: number;
  name: string;
  type: string;
  image: string;
  rewards: Record<string, number>;
  pointsInfo?: {
    currency: string;
    transferPartners: string[];
    transferValue: number;
    redemptionOptions: string[];
    annualFee: number;
    travelCredits?: number;
    signupBonus?: string;
    specialFeature?: string;
  };
  color: string;
  spendingCategories: Record<string, number>;
}

export interface Offer {
  id: number;
  cardId: number;
  title: string;
  description: string;
  bonusRate?: number;
  category?: string;
  merchant?: string;
  validUntil: string;
  isNew: boolean;
  activationType: string;
  additionalInfo?: string;
}

export interface MerchantInfo {
  merchant_name?: string;
  merchant_category?: string;
  merchant_subcategory?: string;
  average_transaction?: number;
}

export interface Site {
  name: string;
  url: string;
  category: string;
}

// Chrome extension message types
export interface ChromeMessage {
  action: string;
  data?: any;
}

export interface ChromeResponse {
  success: boolean;
  data?: any;
  error?: string;
}
