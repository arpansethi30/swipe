// Card network logos
export const CARD_NETWORK_LOGOS = {
  "Visa": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/200px-Visa_Inc._logo.svg.png",
  "Mastercard": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png",
  "American Express": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png",
  "Discover": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Discover_Card_logo.svg/200px-Discover_Card_logo.svg.png"
};

// Credit score badges
export const CREDIT_SCORE_COLORS = {
  "Excellent": "#00897b", // Teal
  "Good": "#43a047", // Green
  "Fair": "#fb8c00", // Orange
  "Poor": "#e53935", // Red
  "No Credit": "#5e35b1" // Purple
};

// Category keywords for detection
export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  travel: ['hotel', 'booking', 'airline', 'flight', 'expedia', 'kayak', 'airbnb', 'hostel', 'trip', 'vacation', 'rental'],
  dining: ['restaurant', 'food', 'menu', 'doordash', 'ubereats', 'grubhub', 'postmates', 'seamless', 'delivery'],
  groceries: ['grocery', 'wholefood', 'safeway', 'kroger', 'albertsons', 'supermarket', 'market'],
  gas: ['gas', 'fuel', 'gasoline', 'shell', 'exxon', 'chevron', 'mobil'],
  entertainment: ['movie', 'theatre', 'cinema', 'ticket', 'concert', 'event'],
  streaming: ['netflix', 'hulu', 'disney+', 'spotify', 'prime video', 'youtube', 'streaming'],
  retail: ['walmart', 'target', 'costco', 'bestbuy', 'macys', 'kohls', 'nordstrom', 'shopping'],
  airlines: ['united', 'delta', 'american airlines', 'southwest', 'jetblue', 'british airways', 'air france', 'emirates', 'turkish'],
  hotels: ['hilton', 'marriott', 'hyatt', 'wyndham', 'ihg', 'accor', 'radisson', 'choice', 'best western']
};
