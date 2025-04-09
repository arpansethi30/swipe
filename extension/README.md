# Swipe - Credit Card Rewards Maximizer

A Chrome extension that helps you choose the best credit card to maximize rewards during checkout.

## Features

- Automatically detects checkout pages
- Shows cash back offers from your credit cards
- Displays a popup in the bottom right corner with the best card to use
- Allows quick selection of cards for payment

## Building the Extension

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

Clone the repository and install dependencies:

```bash
cd extension
npm install
```

### Build for Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

The built extension will be in the `dist` directory.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" 
4. Select the `dist` directory

## Usage

1. Navigate to any checkout page with a payment step
2. The extension will automatically detect the checkout and show a popup in the bottom right corner
3. The popup will display the best card to use and estimated cash back
4. Click "pay with selected card" to use the card

## Development Notes

- The extension uses TypeScript and React for the popup UI
- Content script and background script are built with esbuild
- Main extension UI is built with Vite

## Troubleshooting

If you encounter any build issues:

1. Try cleaning the node modules and reinstalling:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Make sure you have the required dependencies:
   ```bash
   npm install typescript @types/chrome esbuild --save-dev
   ```

3. Check for TypeScript errors:
   ```bash
   npm run check
   ```

## Architecture

### Extension Components

- **Popup UI** (`App.jsx`): React-based interface for viewing recommendations and managing settings
- **Content Script** (`content.js`): Runs on web pages to detect merchants and purchase amounts
- **Background Script** (`background.js`): Manages API communication, caching, and extension lifecycle

### Backend Integration

The extension communicates with a FastAPI backend that:

1. Identifies merchants from URLs
2. Stores detailed credit card information
3. Calculates the best card for each purchase
4. Maintains a database of retailer categories and reward percentages

## Development

### Directory Structure

```
extension/
  ├── src/               # Source code
  │   ├── App.jsx        # Main UI component
  │   ├── App.css        # Styles
  │   ├── main.jsx       # Entry point
  │   ├── background.js  # Background script
  │   └── content.js     # Content script
  ├── public/            # Static assets
  │   └── icons/         # Extension icons
  ├── index.html         # HTML template
  ├── manifest.json      # Extension manifest
  ├── package.json       # Dependencies
  └── vite.config.js     # Build configuration
```

## Data Flow

1. User visits a shopping website
2. Content script detects the merchant and purchase amount
3. Background script sends data to the backend API
4. API returns recommended cards based on reward rates
5. Extension displays personalized recommendations to the user

## Enhancements

The extension includes several key enhancements:

- **Advanced Merchant Detection**: Uses domain patterns and path analysis to identify retailers
- **Comprehensive Card Data**: Includes detailed information about annual fees, point values, and card benefits
- **Limited-Time Offers**: Highlights special promotions and time-limited reward opportunities
- **Cache Management**: Reduces API calls by caching recommendations with configurable expiry
- **Connectivity Handling**: Gracefully handles API connectivity issues with clear error messages

## Screenshots

[Screenshots will be added here]
