# Swipe Demo

This is a demonstration of how the Swipe Chrome extension would work, without requiring users to install the extension.

## About

This demo simulates a checkout page with the Swipe credit card recommendation UI that automatically appears. When you click "pay with selected card", it auto-fills the credit card fields with the details of the recommended card.

## Features

- Simulated checkout page that looks like a typical e-commerce site
- Credit card recommendation popup that appears automatically
- Auto-fill functionality when clicking "pay with selected card"
- Success notification after auto-filling
- Mobile-responsive design

## How to Run Locally

1. Clone this repository
2. Navigate to the `swipe-demo` directory:
```
cd swipe-demo
```
3. Install dependencies:
```
npm install
```
4. Start the server:
```
npm start
```
5. Open your browser to the displayed URL (usually http://localhost:5000)

## Deployment to Vercel

This demo is ready to be deployed to Vercel:

1. Install Vercel CLI:
```
npm install -g vercel
```

2. Deploy:
```
vercel
```

## How It Works

In the real extension:
1. The Chrome extension detects when you're on a checkout page
2. It analyzes the merchant and shows the best credit card to use
3. When you click to use that card, it auto-fills the payment form

This demo simulates that experience without requiring the Chrome extension to be installed.

## Learn More

To learn more about the full Swipe extension, visit the main repository. 