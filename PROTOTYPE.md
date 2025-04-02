# Swipe Enhanced Prototype - Credit Card Rewards Maximizer

## Overview

This enhanced prototype of Swipe provides a comprehensive credit card recommendation system that helps users select the optimal card during checkout based on detailed reward structures and merchant categories.

## Enhanced Features

### Improved Data Model

- **Detailed Card Information**:
  - Sign-up bonuses and welcome offers
  - Foreign transaction fees
  - Annual fees with reward value calculations

- **Advanced Reward Structure**:
  - Subcategories for more precise matching
  - Rotating quarterly categories
  - Spending caps and tiered rewards

- **Enhanced Merchant Detection**:
  - Subcategory classification
  - Support for alternative domains
  - Intelligent category guessing for unknown merchants

- **Limited-Time Offers**:
  - Special promotions with expiration dates
  - Enhanced reward calculations during offer periods

### Improved User Experience

- **Rich Recommendation UI**:
  - Card images and visual indicators
  - Reward amount estimates for detected purchase amounts
  - Explanations for why each card was recommended
  - Animated popup with clear visual hierarchy

- **Advanced Features**:
  - Purchase amount detection
  - Manual triggering via context menu
  - Recommendation caching for performance
  - Support for SPA (Single Page Application) navigation

## Components

### Backend (FastAPI)

- **Models**: Enhanced SQLite database with detailed tables for cards, rewards, limited-time offers, retailers, and alternate domains
- **API Endpoints**:
  - `/cards`: CRUD operations for credit cards
  - `/recommendations/detect-merchant`: Enhanced merchant detection with subcategories
  - `/recommendations/recommend-card`: Sophisticated card recommendation algorithm

### Extension

- **Content Script**: Detects checkout pages, purchase amounts, and displays an enhanced popup with recommendations
- **Background Script**: Handles API communication, caching, and context menu integration
- **Popup**: Card management UI (basic implementation)

## Sample Data

- **Credit Cards**: 8 popular cards with detailed reward structures
- **Retailers**: 15 major retailers with categories, subcategories, and logo URLs
- **Limited-Time Offers**: Sample promotional offers with expiration dates

## Running the Enhanced Prototype

### Backend

1. Navigate to the backend directory:
```
cd backend
```

2. Execute the run script:
```
./run.sh
```

This starts the FastAPI server at http://localhost:8000

### Extension

1. Navigate to the extension directory:
```
cd extension
```

2. Install dependencies:
```
npm install
```

3. Build the extension:
```
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## Testing

1. Visit a checkout page (Amazon, Walmart, Target, Best Buy, Uber Eats, etc.)
2. The extension should detect the checkout page and automatically show recommendations
3. If it doesn't activate automatically, right-click the page and select "Show card recommendations"
4. Observe the purchase amount detection and reward calculations
5. See the detailed explanations for each card recommendation

## Next Steps

1. **User Authentication**:
   - Implement user accounts and data sync
   - Personalized recommendations based on spending history

2. **Machine Learning**:
   - Train models for better merchant categorization
   - Personalized reward optimization algorithms

3. **Data Collection**:
   - Implement web scrapers for card offers
   - Create a scheduled task to update reward information

4. **Advanced Features**:
   - Multiple purchase optimization (which cards for which stores)
   - Annual spending analysis and card suggestions
   - Credit score impact analysis 