# Building and Loading the Swipe Extension

This document provides step-by-step instructions for building and loading the Swipe Chrome extension.

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Chrome browser

## Building the Extension

1. Install dependencies:

```bash
cd extension
npm install
```

2. Build the extension:

```bash
npm run build
```

This will create a `dist` directory with the built extension.

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked" and select the `dist` directory from the build step
4. The extension should now appear in your extensions list

## Testing the Extension

1. Visit a checkout page on a supported retailer (Amazon, Walmart, Target, Uber Eats, etc.)
2. The extension should automatically detect the checkout and show recommendations
3. Alternatively, you can:
   - Click the extension icon in the toolbar to open the popup
   - Use the "Show Card Recommendations" button
   - Right-click on the page and select "Show card recommendations" from the context menu

## Connecting to the Backend

The extension connects to the backend API at `http://localhost:8000`. Make sure the backend server is running:

```bash
cd backend
./run.sh
```

## Troubleshooting

If you encounter any issues:

1. Check that the backend server is running
2. Verify the extension is enabled in Chrome
3. Try clearing the extension cache from the Settings tab
4. Inspect the extension popup using Chrome DevTools (right-click on popup > Inspect)
5. Check the browser console for any errors

## Development Workflow

For active development, you can use:

```bash
npm run dev
```

This will watch for changes and rebuild automatically.

To see your changes, go to `chrome://extensions` and click the refresh icon on the extension. 