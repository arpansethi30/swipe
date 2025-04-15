# Swipe Credit Card Recommender Chrome Extension

A Chrome extension that helps users maximize credit card rewards by recommending the best card to use at checkout.

## Features

- **Automatic Checkout Detection**: Identifies when users are on e-commerce checkout pages
- **Smart Recommendations**: Suggests the best credit card based on merchant and purchase amount
- **Beautiful UI**: Clean, modern interface with intuitive card selection
- **Auto-Fill Functionality**: Fills credit card details with one click
- **Alternative Card Options**: Shows multiple card options with cashback estimates

## Installation

1. **Clone or download this repository**

2. **Build the extension**:
   ```
   cd extension
   npm install
   npm run build
   ```

3. **Load the extension in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder in the extension directory

## Testing

1. **Start the backend server**:
   ```
   cd backend
   source venv/bin/activate
   python app.py
   ```
   This will start the Flask server on `http://localhost:5001`.

2. **Test the popup**:
   - Click on the Swipe extension icon in Chrome toolbar to see recommendations
   - Recommendations will show even when not on a checkout page (simulated mode)

3. **Test auto-detection**:
   - Go to any e-commerce website
   - Add an item to cart and proceed to checkout
   - The extension should automatically detect the checkout page and display a popup with credit card recommendations

4. **Test in test environment**:
   - Open `chrome-extension://<YOUR_EXTENSION_ID>/test-checkout.html` in Chrome
   - This is a test checkout page that simulates a real checkout experience

## Development

- **File Structure**:
  - `src/`: TypeScript source files
  - `public/`: Static files copied to the `dist` folder
  - `dist/`: Built extension files (created after running `npm run build`)

- **Key Files**:
  - `content.ts`: Content script injected into web pages to detect checkout and show recommendations
  - `popup.ts`: Handles the extension popup UI
  - `background.ts`: Background service worker for API communication
  - `utils.ts`: Shared utility functions
  - `popup.html`: Main extension popup HTML

- **Watching for changes**:
  ```
  npm run watch
  ```
  This will automatically rebuild the extension when files change.

## Credits

Developed by Swipe Team 