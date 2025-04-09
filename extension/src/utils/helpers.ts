// Helper functions for the application

// Format category names for display
export const formatCategoryName = (category: string): string => {
  if (category === 'general') return 'all purchases';
  if (category === 'wholeFoods') return 'Whole Foods';
  if (category === 'rotatingCategories') return 'current bonus category';
  
  return category.charAt(0).toUpperCase() + category.slice(1);
};

// Calculate rewards for a specific spend amount
export const calculateRewards = (rate: number, amount: number): string => {
  return ((rate / 100) * amount).toFixed(2);
};

// Get image path based on environment
export const getImagePath = (imageName: string): string => {
  // Check if it's an SVG file
  const isSvg = imageName.endsWith('.svg');
  const filename = isSvg ? imageName : imageName.replace('.png', '');
  
  // For production build
  if (import.meta.env?.PROD) {
    return `/assets/images/${filename}${isSvg ? '' : '.png'}`;
  }
  // For development
  return `/src/assets/images/${filename}${isSvg ? '' : '.png'}`;
};
