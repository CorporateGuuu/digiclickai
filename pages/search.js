import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProductFilters from '../components/ProductFilters/ProductFilters';
import EnhancedSearch from '../components/EnhancedSearch/EnhancedSearch';
import { trackSearch, trackSearchResultClick } from '../utils/searchAnalytics';
import styles from '../styles/ProductsPage.module.css';

export default function Search() {
  const router = useRouter();
  const { q: searchQuery } = router.query;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Mock categories and brands for filtering
  const [categories, setCategories] = useState([
    { id: 1, name: 'iPhone Parts', slug: 'iphone-parts' },
    { id: 2, name: 'Samsung Parts', slug: 'samsung-parts' },
    { id: 3, name: 'iPad Parts', slug: 'ipad-parts' },
    { id: 4, name: 'MacBook Parts', slug: 'macbook-parts' },
    { id: 5, name: 'Repair Tools', slug: 'repair-tools' }
  ]);

  const [brands, setBrands] = useState([
    { id: 1, name: 'Apple', slug: 'apple' },
    { id: 2, name: 'Samsung', slug: 'samsung' },
    { id: 3, name: 'LG', slug: 'lg' },
    { id: 4, name: 'Huawei', slug: 'huawei' },
    { id: 5, name: 'Xiaomi', slug: 'xiaomi' }
  ]);

  // Product images from the Website Content folder
  const productImages = useMemo(() => [
    '0DA4ABBF-40A3-456A-8275-7A18F7831F17.JPG',
    '1333A34A-20B6-481E-A61A-2144DE8EB250.JPG',
    '2AA4A703-8C13-4A01-BA85-3B3AD0FC729D.JPG',
    '31DC2BA3-E822-41C9-8AD4-E901A05C73E2.JPG',
    '5FE8C433-F216-4C2F-AFAA-B17576A69E70.JPG',
    '64EA3D01-5BD4-44CB-A7D9-5779ACF06239.JPG',
    '6B074445-59FB-47A1-AA9E-A6F54F36C28B.JPG',
    '77A26396-50B6-405B-B76C-C751924A6621.JPG',
    '78D0434A-D569-40A9-BCD9-FD0C1F113C72.JPG',
    '84B5F3DD-755C-4E8A-96DD-EA6F63B9642F.JPG',
    '8A1B4B2E-EDE6-4D12-A79C-AB7ACE5A1460.JPG',
    '901CCF8F-6A4E-46F3-B319-11F81EE5C240.JPG',
    'B8C872E3-8F03-4207-88A3-D714D5C5C801.JPG',
    'BA8EC1D7-89F1-45BD-94E3-0FD68374AA7C.JPG',
    'C6488984-139C-46D2-BBDA-79717072235B.JPG',
    'D7AC4198-419E-4992-9E65-6D3AADBDBEE8.JPG',
    'E31077DE-4766-4F72-AA7F-0CF19CF06A22.JPG',
    'FCD10084-3B70-4FAB-BDD0-FE04958553D6.JPG'
  ], []);

  // Function to get a random product image
  const getRandomProductImage = () => {
    const randomIndex = Math.floor(Math.random() * productImages.length);
    return productImages[randomIndex];
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    // // // console.log('Filters changed:', filters);
    // In a real implementation, this would update the query parameters
    // and trigger a new fetch of filtered products
  };

  useEffect(() => {
    if (!searchQuery) {
      setLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        // Track search analytics
        const filters = {};
        if (router.query.category) filters.category = router.query.category;
        if (router.query.minPrice) filters.minPrice = router.query.minPrice;
        if (router.query.maxPrice) filters.maxPrice = router.query.maxPrice;
        if (router.query.inStock) filters.inStock = router.query.inStock === 'true';

        // In a real implementation, this would be an API call to search products
        // For demo purposes, we'll simulate a delay and return mock data
        setTimeout(() => {
          // Mock search results
          const mockResults = [
            {
              id: 1,
              name: 'iPhone 13 Pro OLED Screen',
              slug: 'iphone-13-pro-oled-screen',
              category_name: 'iPhone Parts',
              price: 129.99,
              discount_percentage: 10,
              image_url: '/images/iphone-screen.svg'
            },
            {
              id: 2,
              name: 'iPhone 13 Battery Replacement',
              slug: 'iphone-13-battery-replacement',
              category_name: 'iPhone Parts',
              price: 49.99,
              discount_percentage: 0,
              image_url: '/images/iphone-battery.svg'
            },
            {
              id: 3,
              name: 'Samsung Galaxy S22 Battery',
              slug: 'samsung-galaxy-s22-battery',
              category_name: 'Samsung Parts',
              price: 39.99,
              discount_percentage: 15,
              image_url: '/images/samsung-battery.svg'
            },
            {
              id: 4,
              name: 'Professional Repair Tool Kit',
              slug: 'professional-repair-tool-kit',
              category_name: 'Repair Tools',
              price: 89.99,
              discount_percentage: 0,
              image_url: '/images/repair-tools.svg'
            },
            {
              id: 5,
              name: 'iPad Pro 12.9" LCD Assembly',
              slug: 'ipad-pro-12-9-lcd-assembly',
              category_name: 'iPad Parts',
              price: 199.99,
              discount_percentage: 5,
              image_url: '/images/ipad-screen.svg'
            },
            {
              id: 6,
              name: 'MacBook Pro Keyboard Replacement',
              slug: 'macbook-pro-keyboard-replacement',
              category_name: 'MacBook Parts',
              price: 149.99,
              discount_percentage: 0,
              image_url: '/images/macbook-keyboard.svg'
            }
          ];

          // Filter results based on search query
          const filteredResults = mockResults.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category_name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          setProducts(filteredResults);
          setTotalProducts(filteredResults.length);
          setLoading(false);

          // Track search results count
          trackSearch(searchQuery, {}, filteredResults.length);
        }, 500);
      } catch (err) {
        console.error('Error searching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  return (
    <>
      <Head>
        <title>{searchQuery ? `Search results for "${searchQuery}"` : 'Search'} | MDTS - Midas Technical Solutions</title>
        <meta name="description" content={`Search results for ${searchQuery || 'products'} at MDTS - Midas Technical Solutions`} />
      </Head>

      <div className="container">
        <div className={styles.productsHeader}>
          <h1>{searchQuery ? `Search results for "${searchQuery}"` : 'Search'}</h1>
          {searchQuery && <p>Found {totalProducts} products matching your search</p>}

          {/* Enhanced Search Component */}
          <div className={styles.enhancedSearchContainer}>
            <EnhancedSearch initialQuery={searchQuery || ''} showFilters={true} />
          </div>
        </div>

        <div className={styles.productsLayout}>
          {/* Product Filters */}
          <ProductFilters
            categories={categories}
            brands={brands}
            onFilterChange={handleFilterChange}
          />

          {/* Product Grid */}
          <div className={styles.productsContent}>
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Searching products...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyProducts}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "{searchQuery}"</p>
                <p>Try different keywords or browse our categories</p>
                <Link href="/products" className={styles.resetButton}>
                  Browse All Products
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.resultsInfo}>
                  <p>Showing {products.length} of {totalProducts} products</p>
                </div>

                <div className={styles.productsGrid}>
                  {products.map((product) => (
                    <div key={product.id} className={styles.productCard}>
                      <div className={styles.productImageContainer}>
                        <img
                          src={product.image_url || `/images/products/${getRandomProductImage()}`}
                          alt={product.name}
                          className={styles.productImage}
                        />
                        {product.discount_percentage > 0 && (
                          <span className={styles.discountBadge}>
                            {product.discount_percentage}% OFF
                          </span>
                        )}
                        <div className={styles.productActions}>
                          <button className={styles.wishlistButton} title="Add to Wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                          <button className={styles.quickViewButton} title="Quick View">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className={styles.productContent}>
                        <div className={styles.productCategory}>{product.category_name}</div>
                        <h3 className={styles.productName}>
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={() => trackSearchResultClick(searchQuery, product.id, products.indexOf(product) + 1)}
                          >
                            {product.name}
                          </Link>
                        </h3>

                        <div className={styles.productPrice}>
                          {product.discount_percentage > 0 ? (
                            <>
                              <span className={styles.originalPrice}>${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}</span>
                              <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                          )}
                        </div>

                        <div className={styles.productButtons}>
                          <Link
                            href={`/products/${product.slug}`}
                            className={styles.viewDetailsButton}
                            onClick={() => trackSearchResultClick(searchQuery, product.id, products.indexOf(product) + 1)}
                          >
                            View Details
                          </Link>
                          <button className={styles.addToCartButton}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="21" r="1"></circle>
                              <circle cx="20" cy="21" r="1"></circle>
                              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
