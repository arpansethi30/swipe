import React from 'react';

function SiteDetection({ site }) {
  if (!site) {
    return (
      <div className="site-detection">
        <p className="no-site">No checkout page detected.</p>
      </div>
    );
  }

  return (
    <div className="site-detection">
      <h3>Current Site</h3>
      <div className="site-info">
        <div className="site-icon">
          {/* Display site favicon */}
          <img 
            src={`https://www.google.com/s2/favicons?domain=${site.name}&sz=64`} 
            alt={site.name} 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/32?text=🌐';
            }}
          />
        </div>
        <div className="site-details">
          <span className="site-name">{site.name}</span>
          <span className="site-url">{formatUrl(site.url)}</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to format URL for display
function formatUrl(url) {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    // If path is too long, truncate it
    if (path.length > 20) {
      path = path.substring(0, 17) + '...';
    }
    
    return path;
  } catch (e) {
    return url;
  }
}

export default SiteDetection; 