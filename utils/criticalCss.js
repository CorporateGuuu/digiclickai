/**
 * Utility functions for critical CSS optimization
 */

// Common critical CSS for all pages
export const commonCriticalCss = `
  /* Base styles for the entire site */
  :root {
    --primary-color: #0066cc;
    --secondary-color: #ff3e3e;
    --text-color: #333333;
    --background-color: #ffffff;
    --light-gray: #f5f5f5;
    --border-color: #e0e0e0;
    --success-color: #4caf50;
    --warning-color: #ff9800;
    --error-color: #f44336;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    color: var(--text-color);
    background-color: var(--background-color);
    line-height: 1.5;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Header styles */
  header {
    background-color: var(--background-color);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  /* Main content container */
  main {
    min-height: calc(100vh - 200px);
    padding: 1rem;
  }
  
  /* Basic button styles */
  button, .button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }
  
  button:hover, .button:hover {
    background-color: #0055b3;
  }
  
  /* Basic form styles */
  input, select, textarea {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 0.5rem;
    width: 100%;
    font-size: 1rem;
  }
  
  /* Basic card styles */
  .card {
    background-color: var(--background-color);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
`;

// Home page critical CSS
export const homePageCriticalCss = `
  /* Hero section styles */
  .hero {
    background-color: var(--light-gray);
    padding: 2rem 1rem;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .hero h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .hero p {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
  
  /* Featured products section */
  .featured-products {
    margin-bottom: 3rem;
  }
  
  .featured-products h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  /* Product card styles */
  .product-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .product-image-container {
    position: relative;
    padding-top: 100%;
    overflow: hidden;
    border-radius: 8px 8px 0 0;
  }
  
  .product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
`;

// Product page critical CSS
export const productPageCriticalCss = `
  /* Product filters */
  .filters {
    background-color: var(--light-gray);
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }
  
  .filter-group {
    margin-bottom: 1rem;
  }
  
  .filter-group h3 {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  
  /* Product grid */
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  /* Product card */
  .product-card {
    background-color: var(--background-color);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

// Product detail page critical CSS
export const productDetailCriticalCss = `
  /* Product detail layout */
  .product-detail {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  @media (min-width: 768px) {
    .product-detail {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  /* Product images */
  .product-images {
    position: relative;
  }
  
  .main-image {
    width: 100%;
    height: 400px;
    background-color: var(--light-gray);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1rem;
  }
  
  .main-image img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  /* Product info */
  .product-info h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .product-price {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  .product-description {
    margin-bottom: 1.5rem;
  }
  
  /* Add to cart button */
  .add-to-cart {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .quantity {
    width: 100px;
  }
`;

// Get critical CSS based on page type
export const getCriticalCssByPage = (pageType) => {
  switch (pageType) {
    case 'home':
      return commonCriticalCss + homePageCriticalCss;
    case 'products':
      return commonCriticalCss + productPageCriticalCss;
    case 'product-detail':
      return commonCriticalCss + productDetailCriticalCss;
    default:
      return commonCriticalCss;
  }
};

// Define CSS files to preload by page type
export const getPreloadStylesByPage = (pageType) => {
  const commonStyles = [
    '/_next/static/css/global.css',
  ];
  
  switch (pageType) {
    case 'home':
      return [...commonStyles, '/_next/static/css/home.css'];
    case 'products':
      return [...commonStyles, '/_next/static/css/products.css'];
    case 'product-detail':
      return [...commonStyles, '/_next/static/css/product-detail.css'];
    default:
      return commonStyles;
  }
};

// Define CSS files to defer by page type
export const getDeferredStylesByPage = (pageType) => {
  const commonDeferredStyles = [
    '/_next/static/css/components.css',
  ];
  
  switch (pageType) {
    case 'home':
      return [...commonDeferredStyles, '/_next/static/css/animations.css'];
    case 'products':
      return [...commonDeferredStyles, '/_next/static/css/filters.css'];
    case 'product-detail':
      return [...commonDeferredStyles, '/_next/static/css/reviews.css'];
    default:
      return commonDeferredStyles;
  }
};
