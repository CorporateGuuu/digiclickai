// Recommendation Engine Utility
import { getSearchHistory, getSearchClicks } from './searchAnalytics';

// Get personalized recommendations based on user behavior
export const getPersonalizedRecommendations = async (userId, limit = 8) => {
  try {
    // If we have a logged-in user, try to get recommendations from the server
    if (userId) {
      try {
        const response = await fetch(`/api/recommendations/personalized?userId=${userId}&limit=${limit}`);

        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error('Error fetching personalized recommendations from API:', error);
        // Fall back to client-side recommendations
      }
    }

    // If server-side recommendations fail or user is not logged in,
    // generate recommendations client-side based on local data
    return generateClientSideRecommendations(limit);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return [];
  }
};

// Generate recommendations based on client-side data
const generateClientSideRecommendations = (limit = 8) => {
  try {
    // Get user behavior data
    const searchHistory = getSearchHistory();
    const searchClicks = getSearchClicks();
    const viewedProducts = getViewedProducts();
    const cartItems = getCartItems();
    const wishlistItems = getWishlistItems();

    // Calculate product scores based on user behavior
    const productScores = calculateProductScores(searchHistory, searchClicks, viewedProducts, cartItems, wishlistItems);

    // Sort products by score and return top recommendations
    const recommendations = productScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error('Error generating client-side recommendations:', error);
    return [];
  }
};

// Calculate product scores based on user behavior
const calculateProductScores = (searchHistory, searchClicks, viewedProducts, cartItems, wishlistItems) => {
  // Create a map to store product scores
  const productScores = new Map();

  // Weight factors for different behaviors
  const weights = {
    search: 1,
    click: 2,
    view: 3,
    cart: 5,
    wishlist: 4,
    recency: 0.1 // Recency factor (per hour)
  };

  // Current time for recency calculations
  const now = Date.now();

  // Process search clicks (highest relevance)
  searchClicks.forEach(click => {
    const productId = click.productId;
    const hoursSinceClick = (now - click.timestamp) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 24 - hoursSinceClick) * weights.recency;
    const score = weights.click + recencyBonus;

    if (productScores.has(productId)) {
      productScores.set(productId, productScores.get(productId) + score);
    } else {
      productScores.set(productId, score);
    }
  });

  // Process viewed products
  viewedProducts.forEach(view => {
    const productId = view.id;
    const hoursSinceView = (now - view.timestamp) / (1000 * 60 * 60);
    const recencyBonus = Math.max(0, 24 - hoursSinceView) * weights.recency;
    const score = weights.view + recencyBonus;

    if (productScores.has(productId)) {
      productScores.set(productId, productScores.get(productId) + score);
    } else {
      productScores.set(productId, score);
    }
  });

  // Process cart items (highest purchase intent)
  cartItems.forEach(item => {
    const productId = item.id;
    const score = weights.cart;

    if (productScores.has(productId)) {
      productScores.set(productId, productScores.get(productId) + score);
    } else {
      productScores.set(productId, score);
    }
  });

  // Process wishlist items
  wishlistItems.forEach(item => {
    const productId = item.id;
    const score = weights.wishlist;

    if (productScores.has(productId)) {
      productScores.set(productId, productScores.get(productId) + score);
    } else {
      productScores.set(productId, score);
    }
  });

  // Convert map to array of objects
  return Array.from(productScores.entries()).map(([id, score]) => ({ id, score }));
};

// Get recently viewed products from localStorage
const getViewedProducts = () => {
  try {
    const viewedProductsJson = localStorage.getItem('viewedProducts');
    return viewedProductsJson ? JSON.parse(viewedProductsJson) : [];
  } catch (error) {
    console.error('Error getting viewed products:', error);
    return [];
  }
};

// Get cart items from localStorage
const getCartItems = () => {
  try {
    const cartItemsJson = localStorage.getItem('cartItems');
    return cartItemsJson ? JSON.parse(cartItemsJson) : [];
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

// Get wishlist items from localStorage
const getWishlistItems = () => {
  try {
    const wishlistItemsJson = localStorage.getItem('wishlistItems');
    return wishlistItemsJson ? JSON.parse(wishlistItemsJson) : [];
  } catch (error) {
    console.error('Error getting wishlist items:', error);
    return [];
  }
};

// Track product view
export const trackProductView = (productId) => {
  try {
    if (!productId) return;

    // Get existing viewed products
    const viewedProducts = getViewedProducts();

    // Check if product is already in the list
    const existingIndex = viewedProducts.findIndex(item => item.id === productId);

    if (existingIndex !== -1) {
      // Update timestamp if product already viewed
      viewedProducts[existingIndex].timestamp = Date.now();
      viewedProducts[existingIndex].viewCount = (viewedProducts[existingIndex].viewCount || 1) + 1;
    } else {
      // Add new product view
      viewedProducts.unshift({
        id: productId,
        timestamp: Date.now(),
        viewCount: 1
      });
    }

    // Keep only the most recent 50 viewed products
    const limitedViewedProducts = viewedProducts.slice(0, 50);

    // Save back to localStorage
    localStorage.setItem('viewedProducts', JSON.stringify(limitedViewedProducts));

    // Send to server if user is logged in
    const userId = getUserId();
    if (userId) {
      sendProductViewToServer(userId, productId);
    }
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
};

// Get user ID from session
const getUserId = () => {
  try {
    // This would be replaced with actual session management
    return localStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Send product view to server
const sendProductViewToServer = async (userId, productId) => {
  try {
    await fetch('/api/analytics/product-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        productId,
        timestamp: Date.now()
      }),
    });
  } catch (error) {
    console.error('Error sending product view to server:', error);
  }
};

// Get similar products based on product attributes
export const getSimilarProducts = async (productId, categoryId, limit = 4) => {
  try {
    // Try to get similar products from the server
    try {
      const response = await fetch(`/api/recommendations/similar?productId=${productId}&categoryId=${categoryId}&limit=${limit}`);

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error fetching similar products from API:', error);
      // Fall back to mock data
    }

    // Mock similar products (for demo purposes)
    return getMockSimilarProducts(categoryId, limit);
  } catch (error) {
    console.error('Error getting similar products:', error);
    return [];
  }
};

// Get mock similar products (for demo purposes)
const getMockSimilarProducts = (categoryId, limit) => {
  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: 'iPhone 13 Pro OLED Screen',
      slug: 'iphone-13-pro-oled-screen',
      price: 129.99,
      category_id: 1,
      category_name: 'iPhone Parts',
      image_url: '/images/products/iphone-screen.jpg',
      rating: 4.5,
      review_count: 28,
      stock: 15,
      discount_percentage: 0
    },
    {
      id: 2,
      name: 'Samsung Galaxy S22 Battery',
      slug: 'samsung-galaxy-s22-battery',
      price: 39.99,
      category_id: 2,
      category_name: 'Samsung Parts',
      image_url: '/images/products/samsung-battery.jpg',
      rating: 4.2,
      review_count: 17,
      stock: 23,
      discount_percentage: 15
    },
    {
      id: 3,
      name: 'Professional Repair Tool Kit',
      slug: 'professional-repair-tool-kit',
      price: 89.99,
      category_id: 5,
      category_name: 'Repair Tools',
      image_url: '/images/products/repair-tools.jpg',
      rating: 4.8,
      review_count: 42,
      stock: 8,
      discount_percentage: 0
    },
    {
      id: 4,
      name: 'iPad Pro 12.9" LCD Assembly',
      slug: 'ipad-pro-12-9-lcd-assembly',
      price: 199.99,
      category_id: 3,
      category_name: 'iPad Parts',
      image_url: '/images/products/ipad-screen.jpg',
      rating: 4.6,
      review_count: 13,
      stock: 5,
      discount_percentage: 10
    },
    {
      id: 5,
      name: 'iPhone 12 Battery Replacement Kit',
      slug: 'iphone-12-battery-replacement-kit',
      price: 49.99,
      category_id: 1,
      category_name: 'iPhone Parts',
      image_url: '/images/products/iphone-battery.jpg',
      rating: 4.7,
      review_count: 32,
      stock: 25,
      discount_percentage: 10
    },
    {
      id: 6,
      name: 'Samsung Galaxy S21 Screen Assembly',
      slug: 'samsung-galaxy-s21-screen-assembly',
      price: 119.99,
      category_id: 2,
      category_name: 'Samsung Parts',
      image_url: '/images/products/samsung-screen.jpg',
      rating: 4.5,
      review_count: 18,
      stock: 12,
      discount_percentage: 0
    },
    {
      id: 7,
      name: 'iPad Mini 6 Digitizer',
      slug: 'ipad-mini-6-digitizer',
      price: 89.99,
      category_id: 3,
      category_name: 'iPad Parts',
      image_url: '/images/products/ipad-digitizer.jpg',
      rating: 4.3,
      review_count: 14,
      stock: 8,
      discount_percentage: 5
    },
    {
      id: 8,
      name: 'Precision Screwdriver Set',
      slug: 'precision-screwdriver-set',
      price: 29.99,
      category_id: 5,
      category_name: 'Repair Tools',
      image_url: '/images/products/screwdriver-set.jpg',
      rating: 4.9,
      review_count: 47,
      stock: 35,
      discount_percentage: 0
    }
  ];

  // Filter by category if provided
  const filteredProducts = categoryId
    ? mockProducts.filter(product => product.category_id === parseInt(categoryId))
    : mockProducts;

  // Return random products up to the limit
  return filteredProducts
    .sort(() => 0.5 - Math.random())
    .slice(0, limit);
};

// Get frequently bought together products
export const getFrequentlyBoughtTogether = async (productId, limit = 3) => {
  try {
    // Try to get frequently bought together products from the server
    try {
      const response = await fetch(`/api/recommendations/frequently-bought-together?productId=${productId}&limit=${limit}`);

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error fetching frequently bought together products from API:', error);
      // Fall back to mock data
    }

    // Mock frequently bought together products (for demo purposes)
    return getMockFrequentlyBoughtTogether(productId, limit);
  } catch (error) {
    console.error('Error getting frequently bought together products:', error);
    return [];
  }
};

// Get mock frequently bought together products (for demo purposes)
const getMockFrequentlyBoughtTogether = (productId, limit) => {
  // Mock product combinations
  const productCombinations = {
    // iPhone screen + battery + repair kit
    1: [5, 3, 8],
    // Samsung battery + screen + repair kit
    2: [6, 3, 8],
    // Repair tools + iPhone screen + Samsung screen
    3: [1, 6, 8],
    // iPad screen + digitizer + repair kit
    4: [7, 3, 8],
    // iPhone battery + screen + repair kit
    5: [1, 3, 8],
    // Samsung screen + battery + repair kit
    6: [2, 3, 8],
    // iPad digitizer + screen + repair kit
    7: [4, 3, 8],
    // Screwdriver set + iPhone screen + Samsung screen
    8: [1, 6, 3]
  };

  // Get combinations for the product
  const combinations = productCombinations[productId] || [];

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: 'iPhone 13 Pro OLED Screen',
      slug: 'iphone-13-pro-oled-screen',
      price: 129.99,
      category_name: 'iPhone Parts',
      image_url: '/images/products/iphone-13-screen.jpg',
      rating: 4.5,
      review_count: 28,
      stock: 15,
      discount_percentage: 0
    },
    {
      id: 2,
      name: 'Samsung Galaxy S22 Battery',
      slug: 'samsung-galaxy-s22-battery',
      price: 39.99,
      category_name: 'Samsung Parts',
      image_url: '/images/products/samsung-s21-screen.jpg',
      rating: 4.2,
      review_count: 17,
      stock: 23,
      discount_percentage: 15
    },
    {
      id: 3,
      name: 'Professional Repair Tool Kit',
      slug: 'professional-repair-tool-kit',
      price: 89.99,
      category_name: 'Repair Tools',
      image_url: '/images/products/repair-tools.jpg',
      rating: 4.8,
      review_count: 42,
      stock: 8,
      discount_percentage: 0
    },
    {
      id: 4,
      name: 'iPad Pro 12.9" LCD Assembly',
      slug: 'ipad-pro-12-9-lcd-assembly',
      price: 199.99,
      category_name: 'iPad Parts',
      image_url: '/images/products/ipad-screen.jpg',
      rating: 4.6,
      review_count: 13,
      stock: 5,
      discount_percentage: 10
    },
    {
      id: 5,
      name: 'iPhone 12 Battery Replacement Kit',
      slug: 'iphone-12-battery-replacement-kit',
      price: 49.99,
      category_name: 'iPhone Parts',
      image_url: '/images/products/iphone-battery.jpg',
      rating: 4.7,
      review_count: 32,
      stock: 25,
      discount_percentage: 10
    },
    {
      id: 6,
      name: 'Samsung Galaxy S21 Screen Assembly',
      slug: 'samsung-galaxy-s21-screen-assembly',
      price: 119.99,
      category_name: 'Samsung Parts',
      image_url: '/images/products/samsung-screen.jpg',
      rating: 4.5,
      review_count: 18,
      stock: 12,
      discount_percentage: 0
    },
    {
      id: 7,
      name: 'iPad Mini 6 Digitizer',
      slug: 'ipad-mini-6-digitizer',
      price: 89.99,
      category_name: 'iPad Parts',
      image_url: '/images/products/ipad-digitizer.jpg',
      rating: 4.3,
      review_count: 14,
      stock: 8,
      discount_percentage: 5
    },
    {
      id: 8,
      name: 'Precision Screwdriver Set',
      slug: 'precision-screwdriver-set',
      price: 29.99,
      category_name: 'Repair Tools',
      image_url: '/images/products/screwdriver-set.jpg',
      rating: 4.9,
      review_count: 47,
      stock: 35,
      discount_percentage: 0
    }
  ];

  // Get products for the combinations
  return combinations
    .map(id => mockProducts.find(product => product.id === id))
    .filter(Boolean)
    .slice(0, limit);
};
