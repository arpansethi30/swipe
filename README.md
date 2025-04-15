# Swipe Credit Card Recommender

Swipe is a Chrome extension that automatically recommends the best credit card to use during online checkout, maximizing your cashback and rewards.

## Features

- **Automatic Checkout Detection**: Identifies when you're on a payment page
- **Merchant Categorization**: Identifies the merchant category for optimal card recommendations
- **Smart Card Recommendations**: Suggests the best credit cards based on reward percentages
- **Real-time Cashback Calculation**: Shows exact cashback amount for your purchase
- **One-Click Autofill**: Automatically fills in credit card details with a single click
- **Visual Notifications**: Provides feedback when filling card details

## Project Structure

The project consists of two main components:

1. **Backend API** (Flask server)
   - Provides recommendations based on merchant and purchase amount
   - Categorizes merchants for optimal card selection
   - Calculates potential cashback amounts

2. **Chrome Extension**
   - Detects checkout pages
   - Captures purchase amount
   - Displays recommendations in a sleek popup
   - Allows auto-filling of card details

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Start the Flask server:
   ```
   python app.py
   ```
   The server will start at http://127.0.0.1:5001

### Chrome Extension Setup

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
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `extension/dist` folder
   - The extension should appear with a blue credit card icon

## Testing

### Test with the Demo Checkout Page

1. Ensure the backend server is running
2. Open http://localhost:8080/test-checkout.html in your browser
3. The extension should detect it as a checkout page and show a popup with card recommendations
4. The popup should display the correct amount ($75.25) from the page
5. Click "pay with selected card" to auto-fill the form

### Test on Real E-commerce Sites

1. Navigate to any e-commerce website
2. Add an item to your cart
3. Proceed to checkout
4. When you reach the payment section, the extension should auto-detect and show recommendations
5. Click on the extension icon if the popup doesn't appear automatically

## API Endpoints

- **POST /api/recommend**
  - Request: `{"merchant": "amazon", "amount": 50.00}`
  - Response: List of recommended cards with reward percentages and cashback amounts

- **GET /ping**
  - Health check endpoint
  - Response: `{"status": "ok", "timestamp": "2025-04-14T18:30:00", "version": "1.0.0"}`

## Development

### Frontend Development

1. Navigate to the extension directory:
   ```
   cd extension
   ```

2. Run the build in watch mode:
   ```
   npm run watch
   ```

3. Make changes to files in the `src` directory
4. Reload the extension in Chrome to see changes

### Backend Development

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the Flask server in debug mode:
   ```
   python app.py
   ```

3. Make changes to `app.py` or other files
4. The server will automatically reload with your changes

## Troubleshooting

- **Extension not detecting checkout**: Try clicking the extension icon manually
- **Backend not responding**: Ensure the Flask server is running at port 5001
- **Card auto-fill not working**: Check console for errors and verify form field detection
- **404 Not Found errors**: Make sure you're accessing the correct URLs for testing

## License

This project is licensed under the MIT License - see the LICENSE file for details. 