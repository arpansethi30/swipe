# Swipe Credit Card Recommender

A Chrome extension that helps users choose the best credit card at checkout to maximize rewards.

## Features

- Automatically detects when user is on a checkout page
- Recommends the best credit card based on merchant category
- Shows potential cashback or reward points for each card
- Clean, modern UI with smooth animations
- Supports top 10 US credit cards (hardcoded for prototype)

## Project Structure

- `/backend`: Python Flask API for card recommendation logic
- `/extension`: Chrome extension written in TypeScript

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Activate the virtual environment:
   ```
   source venv/bin/activate   # On macOS/Linux
   ```

3. Run the Flask server:
   ```
   python app.py
   ```

### Extension Setup

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
   - Click "Load unpacked" and select the `dist` folder in the extension directory

## Usage

1. Navigate to any online shopping site
2. Proceed to checkout
3. The extension will automatically detect the checkout page and display a popup with card recommendations
4. For demo purposes, you can also click on the extension icon to see simulated recommendations

## Development

- Backend: Uses Flask to serve card recommendations
- Extension: Uses TypeScript and Manifest V3
- To modify the card data or merchant categories, edit `backend/app.py`
- To customize the extension UI, edit files in `extension/src` 