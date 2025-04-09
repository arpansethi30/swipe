import { useState, useEffect } from 'react';
import { Card, MerchantInfo, Site } from '../types';
import { findBestCard } from '../utils/cardService';
import * as chromeService from '../utils/chromeServices';

export const useCardRecommendations = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [recommendations, setRecommendations] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<MerchantInfo | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [detectedAmount, setDetectedAmount] = useState<number | null>(null);

  const fetchCards = async () => {
    try {
      const storedCards = await chromeService.fetchCardData();
      setCards(storedCards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('Failed to fetch cards');
    }
  };

  const getRecommendations = async (url: string) => {
    if (!url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await chromeService.getRecommendations(url);
      setRecommendations(result.recommendations || []);
      setMerchantInfo(result.merchantInfo || null);
    } catch (err: any) {
      console.error('Error getting recommendations:', err);
      setError(err.message || "Failed to get recommendations");
    } finally {
      setLoading(false);
    }
  };

  const detectPurchaseAmount = async (tabId: number) => {
    try {
      const amount = await chromeService.detectPurchaseAmount(tabId);
      setDetectedAmount(amount);
    } catch (error) {
      console.error('Error detecting purchase amount:', error);
      setError('Failed to detect purchase amount');
    }
  };

  const findBestCardForSite = () => {
    if (!cards.length || !currentSite) return null;
    return findBestCard(cards, currentSite);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return {
    cards,
    recommendations,
    loading,
    error,
    merchantInfo,
    currentSite,
    detectedAmount,
    getRecommendations,
    detectPurchaseAmount,
    findBestCardForSite,
    setCurrentSite
  };
}; 