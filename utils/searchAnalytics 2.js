// Search analytics utility functions

// Store a search query in localStorage
export const trackSearch = (query, filters = {}, resultsCount = 0) => {
  try {
    if (!query || query.trim() === '') return;
    
    // Get existing search history
    const searchHistory = getSearchHistory();
    
    // Create a new search entry
    const searchEntry = {
      query: query.trim().toLowerCase(),
      timestamp: Date.now(),
      filters: filters || {},
      resultsCount: resultsCount,
      sessionId: getSessionId()
    };
    
    // Add to history (at the beginning)
    searchHistory.unshift(searchEntry);
    
    // Keep only the most recent 100 searches
    const limitedHistory = searchHistory.slice(0, 100);
    
    // Save back to localStorage
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
    
    // If we have a server-side analytics endpoint, send the data there too
    sendSearchAnalytics(searchEntry);
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

// Track when a user clicks on a search result
export const trackSearchResultClick = (query, productId, position) => {
  try {
    if (!query || !productId) return;
    
    // Get existing clicks
    const searchClicks = getSearchClicks();
    
    // Create a new click entry
    const clickEntry = {
      query: query.trim().toLowerCase(),
      productId,
      position,
      timestamp: Date.now(),
      sessionId: getSessionId()
    };
    
    // Add to clicks (at the beginning)
    searchClicks.unshift(clickEntry);
    
    // Keep only the most recent 100 clicks
    const limitedClicks = searchClicks.slice(0, 100);
    
    // Save back to localStorage
    localStorage.setItem('searchClicks', JSON.stringify(limitedClicks));
    
    // If we have a server-side analytics endpoint, send the data there too
    sendSearchClickAnalytics(clickEntry);
  } catch (error) {
    console.error('Error tracking search result click:', error);
  }
};

// Get search history from localStorage
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

// Get search clicks from localStorage
export const getSearchClicks = () => {
  try {
    const clicks = localStorage.getItem('searchClicks');
    return clicks ? JSON.parse(clicks) : [];
  } catch (error) {
    console.error('Error getting search clicks:', error);
    return [];
  }
};

// Get popular searches
export const getPopularSearches = (limit = 5) => {
  try {
    const history = getSearchHistory();
    
    // Group searches by query
    const searchCounts = history.reduce((acc, entry) => {
      const query = entry.query;
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array and sort by count
    const popularSearches = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return popularSearches;
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};

// Get zero-result searches
export const getZeroResultSearches = () => {
  try {
    const history = getSearchHistory();
    
    // Filter searches with zero results
    const zeroResultSearches = history.filter(entry => entry.resultsCount === 0);
    
    // Group by query
    const searchCounts = zeroResultSearches.reduce((acc, entry) => {
      const query = entry.query;
      acc[query] = (acc[query] || 0) + 1;
      return acc;
    }, {});
    
    // Convert to array and sort by count
    const sortedZeroResults = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count);
    
    return sortedZeroResults;
  } catch (error) {
    console.error('Error getting zero-result searches:', error);
    return [];
  }
};

// Get search conversion rate (clicks / searches)
export const getSearchConversionRate = () => {
  try {
    const history = getSearchHistory();
    const clicks = getSearchClicks();
    
    if (history.length === 0) return 0;
    
    const conversionRate = clicks.length / history.length;
    return conversionRate;
  } catch (error) {
    console.error('Error calculating search conversion rate:', error);
    return 0;
  }
};

// Get or create a session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('searchSessionId');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('searchSessionId', sessionId);
  }
  
  return sessionId;
};

// Send search analytics to server (if available)
const sendSearchAnalytics = async (searchData) => {
  try {
    // In a production environment, you would send this data to your analytics endpoint
    // For now, we'll just log it
    // // // console.log('Search analytics:', searchData);
    
    // Example of how to send to a server endpoint:
    /*
    const response = await fetch('/api/analytics/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send search analytics');
    }
    */
  } catch (error) {
    console.error('Error sending search analytics:', error);
  }
};

// Send search click analytics to server (if available)
const sendSearchClickAnalytics = async (clickData) => {
  try {
    // In a production environment, you would send this data to your analytics endpoint
    // For now, we'll just log it
    // // // console.log('Search click analytics:', clickData);
    
    // Example of how to send to a server endpoint:
    /*
    const response = await fetch('/api/analytics/search-click', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clickData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send search click analytics');
    }
    */
  } catch (error) {
    console.error('Error sending search click analytics:', error);
  }
};
