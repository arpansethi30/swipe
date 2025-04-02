# Swipe - Credit Card Rewards Maximizer

Swipe is a Chrome extension that helps users select the best credit card for maximizing reward points during checkout.

## Project Structure

- **backend/** - Empty folder for future FastAPI backend implementation
- **extension/** - Chrome extension using React with Vite

## Features

- Automatically detects checkout pages
- Recommends the best credit card for the current website based on rewards data
- Clean, user-friendly interface based on the Figma design
- Preloaded with 5 credit cards and their reward structures

## Development

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Setup

1. Clone the repository
2. Navigate to the extension directory:
```
cd extension
```
3. Install dependencies:
```
npm install
```
4. Start the development server:
```
npm run dev
```

### Building the Extension

To build the extension for Chrome:

```
npm run build
```

This will create a `dist` directory with the built extension.

### Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select the `dist` directory

## Future Enhancements

- Backend integration with FastAPI
- User ability to add custom cards
- More sophisticated merchant category detection
- Transaction history and analytics

## License

MIT 