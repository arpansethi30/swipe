import React from 'react';

function SiteDetection({ site }) {
  if (!site) {
    return (
      <div className="site-detection">
        <div className="site-name">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="16" r="1" fill="currentColor"/>
          </svg>
          <span>No checkout page detected</span>
        </div>
        <div className="site-url">Visit an online store to see card recommendations</div>
      </div>
    );
  }
  
  // Get favicon with fallback
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${site.name}&sz=64`;
  
  // Determine if it's a checkout page
  const isCheckout = isCheckoutPage(site.url);

  return (
    <div className={`site-detection ${isCheckout ? 'checkout-detected' : ''}`}>
      <div className="site-name">
        <img 
          src={faviconUrl} 
          alt=""
          width="20"
          height="20" 
          className="site-favicon"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <span>{site.name}</span>
        {isCheckout && (
          <span className="checkout-badge">Checkout</span>
        )}
      </div>
      <div className="site-url">{formatUrl(site.url)}</div>
    </div>
  );
}

// Helper function to check if it's a checkout page
function isCheckoutPage(url) {
  const checkoutPatterns = [
    'checkout', 'payment', 'cart', 'billing', 'order', 
    'basket', 'pay', 'purchase', 'shipping'
  ];
  
  const lowerUrl = url.toLowerCase();
  return checkoutPatterns.some(pattern => lowerUrl.includes(pattern));
}

// Helper function to format URL for display
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    // If path is too long, truncate it
    if (path.length > 30) {
      path = path.substring(0, 27) + '...';
    }
    
    return urlObj.origin + path;
  } catch (e) {
    return url;
  }
}

export default SiteDetection; 