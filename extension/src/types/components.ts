import { Card, MerchantInfo, Site } from './index';

export interface CardRecommendationsProps {
  recommendations: Card[];
  merchantInfo: MerchantInfo | null;
  currentSite: Site | null;
  detectedAmount: number | null;
  loading?: boolean;
  error?: string | null;
}

export interface MerchantInfoProps {
  merchantInfo: MerchantInfo | null;
  detectedAmount: number | null;
  currentUrl: string;
  currentSite: Site | null;
  loading: boolean;
  apiStatus: string;
  error: string | null;
  onGetRecommendations: () => void;
  onTriggerContentScript: () => void;
  onDetectPurchaseAmount: () => void;
  onCheckApiStatus: () => void;
}

export interface CardListProps {
  cards: Card[];
  loading: boolean;
  error: string | null;
  onCardSelect?: (card: Card) => void;
}

export interface SettingsPanelProps {
  apiStatus: string;
  cacheStatus: string;
  onCheckApiStatus: () => void;
}

export interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface HeaderProps {
  title: string;
  subtitle?: string;
} 