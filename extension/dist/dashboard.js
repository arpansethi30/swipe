/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/*!**************************!*\
  !*** ./src/dashboard.ts ***!
  \**************************/

// Dashboard Script for Swipe Credit Card Recommender
// Sample data for dashboard
const mockTransactions = [
    {
        merchant: 'Amazon',
        date: 'Apr 14, 2025',
        amount: 75.25,
        card: 'Amazon Prime Rewards',
        cashback: 3.76
    },
    {
        merchant: 'Whole Foods',
        date: 'Apr 12, 2025',
        amount: 42.18,
        card: 'Amex Gold Card',
        cashback: 1.69
    },
    {
        merchant: 'Exxon',
        date: 'Apr 8, 2025',
        amount: 38.50,
        card: 'Bank of America Cash Rewards',
        cashback: 1.16
    },
    {
        merchant: 'Uber Eats',
        date: 'Apr 5, 2025',
        amount: 32.99,
        card: 'Chase Sapphire Preferred',
        cashback: 0.99
    }
];
const mockCards = [
    {
        name: 'Wells Fargo Active Cash',
        type: 'wells-fargo',
        rewards: '2% on all purchases',
        isPrimary: true,
        cashback: 15.32
    },
    {
        name: 'Chase Sapphire Preferred',
        type: 'chase',
        rewards: '3% on dining, 2x on travel',
        isPrimary: false,
        cashback: 12.45
    },
    {
        name: 'Amex Gold Card',
        type: 'amex',
        rewards: '4x on dining, 4x on groceries',
        isPrimary: false,
        expiresDate: '05/2025',
        cashback: 9.24
    },
    {
        name: 'Citi Double Cash',
        type: 'citi',
        rewards: '1% when you buy, 1% when you pay',
        isPrimary: false,
        cashback: 5.17
    }
];
// Calculate total savings
function calculateTotalSavings() {
    return mockTransactions.reduce((total, transaction) => total + transaction.cashback, 0);
}
// Calculate total optimized checkouts
function getOptimizedCheckouts() {
    return mockTransactions.length;
}
// Calculate average reward rate
function getAverageRewardRate() {
    const totalAmount = mockTransactions.reduce((total, transaction) => total + transaction.amount, 0);
    const totalCashback = mockTransactions.reduce((total, transaction) => total + transaction.cashback, 0);
    return (totalCashback / totalAmount) * 100;
}
// Initialize dashboard tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            // In a real implementation, this would switch between dashboard views
            console.log(`Switched to ${tab.textContent} tab`);
        });
    });
}
// Initialize test button
function initTestButton() {
    const testButton = document.querySelector('.btn-primary');
    if (testButton) {
        testButton.addEventListener('click', () => {
            window.open('test-checkout.html', '_blank');
        });
    }
}
// Initialize toggles in settings
function initToggles() {
    const toggles = document.querySelectorAll('.toggle input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', (event) => {
            var _a, _b;
            const target = event.target;
            const settingName = (_b = (_a = target.closest('.setting-item')) === null || _a === void 0 ? void 0 : _a.querySelector('.setting-title')) === null || _b === void 0 ? void 0 : _b.textContent;
            console.log(`Setting "${settingName}" changed to: ${target.checked}`);
            // In a real implementation, this would save settings to chrome.storage
            // chrome.storage.sync.set({ [settingName]: target.checked });
        });
    });
}
// Initialize dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Swipe Dashboard loaded');
    // Update stats
    document.querySelector('.stats .stat-value:nth-child(1)').textContent = `$${calculateTotalSavings().toFixed(2)}`;
    document.querySelector('.stats .stat-value:nth-child(3)').textContent = `${getOptimizedCheckouts()}`;
    document.querySelector('.stats .stat-value:nth-child(5)').textContent = `${getAverageRewardRate().toFixed(1)}%`;
    // Initialize UI components
    initTabs();
    initTestButton();
    initToggles();
    // Load settings from storage in a real implementation
    // chrome.storage.sync.get(['autoDetect', 'autoFill', 'showCashback', 'sendNotifications'], function(result) {
    //   // Update toggle states
    // });
});

/******/ })()
;
//# sourceMappingURL=dashboard.js.map