import Image from 'next/image';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout/Layout';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import styles from '../../styles/ProductsPage.module.css';

export default function Products() {
  const router = useRouter();
  const { query } = router;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Categories for filtering - updated to match header structure
  const [categories, setCategories] = useState([
    {
      id: 1, name: 'iPhone Parts', slug: 'iphone-parts', subcategories: [
        { id: 101, name: 'iPhone 15 Series', slug: 'iphone-parts/iphone-15' },
        { id: 102, name: 'iPhone 14 Series', slug: 'iphone-parts/iphone-14' },
        { id: 103, name: 'iPhone 13 Series', slug: 'iphone-parts/iphone-13' },
        { id: 104, name: 'iPhone 12 Series', slug: 'iphone-parts/iphone-12' },
        { id: 105, name: 'Screens & LCDs', slug: 'iphone-parts/screens' },
        { id: 106, name: 'Batteries', slug: 'iphone-parts/batteries' },
        { id: 107, name: 'Charging Ports', slug: 'iphone-parts/charging-ports' },
      ]
    },
    {
      id: 2, name: 'Samsung Parts', slug: 'samsung-parts', subcategories: [
        { id: 201, name: 'Galaxy S Series', slug: 'samsung-parts/galaxy-s' },
        { id: 202, name: 'Galaxy Note Series', slug: 'samsung-parts/galaxy-note' },
        { id: 203, name: 'Galaxy A Series', slug: 'samsung-parts/galaxy-a' },
        { id: 204, name: 'Screens & LCDs', slug: 'samsung-parts/screens' },
        { id: 205, name: 'Batteries', slug: 'samsung-parts/batteries' },
      ]
    },
    {
      id: 3, name: 'iPad Parts', slug: 'ipad-parts', subcategories: [
        { id: 301, name: 'iPad Pro', slug: 'ipad-parts/ipad-pro' },
        { id: 302, name: 'iPad Air', slug: 'ipad-parts/ipad-air' },
        { id: 303, name: 'iPad Mini', slug: 'ipad-parts/ipad-mini' },
        { id: 304, name: 'Screens & LCDs', slug: 'ipad-parts/screens' },
      ]
    },
    {
      id: 4, name: 'MacBook Parts', slug: 'macbook-parts', subcategories: [
        { id: 401, name: 'MacBook Pro', slug: 'macbook-parts/macbook-pro' },
        { id: 402, name: 'MacBook Air', slug: 'macbook-parts/macbook-air' },
        { id: 403, name: 'Screens', slug: 'macbook-parts/screens' },
        { id: 404, name: 'Keyboards', slug: 'macbook-parts/keyboards' },
        { id: 405, name: 'Batteries', slug: 'macbook-parts/batteries' },
      ]
    },
    {
      id: 5, name: 'Repair Tools', slug: 'repair-tools', subcategories: [
        { id: 501, name: 'Tool Kits', slug: 'repair-tools/tool-kits' },
        { id: 502, name: 'Screwdrivers', slug: 'repair-tools/screwdrivers' },
        { id: 503, name: 'Heat Guns', slug: 'repair-tools/heat-guns' },
        { id: 504, name: 'Soldering Equipment', slug: 'repair-tools/soldering' },
        { id: 505, name: 'Adhesives & Tapes', slug: 'repair-tools/adhesives' },
      ]
    }
  ]);

  const [brands, setBrands] = useState([
    { id: 1, name: 'Apple', slug: 'apple' },
    { id: 2, name: 'Samsung', slug: 'samsung' },
    { id: 3, name: 'LG', slug: 'lg' },
    { id: 4, name: 'Huawei', slug: 'huawei' },
    { id: 5, name: 'Xiaomi', slug: 'xiaomi' }
  ]);

  // Product images from the New Content folder
  const productImages = useMemo(() => [
    // iPhone Parts
    'iphone-parts.png',
    'iphone-screen.jpg',
    'iphone-battery.jpg',
    'iphone-camera.jpg',
    'iphone-charging-port.jpg',
    'iphone-back-glass.jpg',

    // Samsung Parts
    'samsung-parts.png',
    'samsung-screen.jpg',
    'samsung-battery.jpg',
    'samsung-camera.jpg',
    'samsung-charging-port.jpg',

    // iPad Parts
    'ipad-parts.png',
    'ipad-screen.jpg',
    'ipad-battery.jpg',
    'ipad-camera.jpg',

    // MacBook Parts
    'macbook-parts.png',
    'macbook-screen.jpg',
    'macbook-keyboard.jpg',
    'macbook-battery.jpg',
    'macbook-trackpad.jpg',

    // Repair Tools
    'repair-tools.png',
    'screwdriver-set.jpg',
    'heat-gun.jpg',
    'opening-tools.jpg',
    'soldering-kit.jpg',
    'microscope.jpg',

    // Branding and Certification
    'apple-logo.png',
    'warranty.png',
    'certified.png'
  ], []);

  // Function to get a product image based on category and product name
  const getProductImage = (product) => {
    const productName = product.name?.toLowerCase() || '';
    const categoryName = product.category_name?.toLowerCase() || '';

    // iPhone specific parts
    if (categoryName.includes('iphone')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return 'iphone-screen.jpg';
      } else if (productName.includes('battery')) {
        return 'iphone-battery.jpg';
      } else if (productName.includes('camera')) {
        return 'iphone-camera.jpg';
      } else if (productName.includes('charging') || productName.includes('port') || productName.includes('connector')) {
        return 'iphone-charging-port.jpg';
      } else if (productName.includes('back') || productName.includes('glass') || productName.includes('housing')) {
        return 'iphone-back-glass.jpg';
      } else {
        return 'iphone-parts.png';
      }
    }
    // Samsung specific parts
    else if (categoryName.includes('samsung')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return 'samsung-screen.jpg';
      } else if (productName.includes('battery')) {
        return 'samsung-battery.jpg';
      } else if (productName.includes('camera')) {
        return 'samsung-camera.jpg';
      } else if (productName.includes('charging') || productName.includes('port') || productName.includes('connector')) {
        return 'samsung-charging-port.jpg';
      } else {
        return 'samsung-parts.png';
      }
    }
    // iPad specific parts
    else if (categoryName.includes('ipad')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return 'ipad-screen.jpg';
      } else if (productName.includes('battery')) {
        return 'ipad-battery.jpg';
      } else if (productName.includes('camera')) {
        return 'ipad-camera.jpg';
      } else {
        return 'ipad-parts.png';
      }
    }
    // MacBook specific parts
    else if (categoryName.includes('macbook')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return 'macbook-screen.jpg';
      } else if (productName.includes('keyboard')) {
        return 'macbook-keyboard.jpg';
      } else if (productName.includes('battery')) {
        return 'macbook-battery.jpg';
      } else if (productName.includes('trackpad')) {
        return 'macbook-trackpad.jpg';
      } else {
        return 'macbook-parts.png';
      }
    }
    // Repair tools
    else if (categoryName.includes('tool')) {
      if (productName.includes('screwdriver') || productName.includes('driver')) {
        return 'screwdriver-set.jpg';
      } else if (productName.includes('heat') || productName.includes('gun')) {
        return 'heat-gun.jpg';
      } else if (productName.includes('opening') || productName.includes('pry')) {
        return 'opening-tools.jpg';
      } else if (productName.includes('solder')) {
        return 'soldering-kit.jpg';
      } else if (productName.includes('microscope') || productName.includes('magnifier')) {
        return 'microscope.jpg';
      } else {
        return 'repair-tools.png';
      }
    }
    // Fallback to random image
    else {
      const randomIndex = Math.floor(Math.random() * productImages.length);
      return productImages[randomIndex];
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    // // // console.log('Filters changed:', filters);
    // In a real implementation, this would update the query parameters
    // and trigger a new fetch of filtered products
  };

  useEffect(() => {
    // Update page from query params if present
    if (query.page) {
      setPage(parseInt(query.page));
    }
  }, [query.page]);

  useEffect(() => {
    // Function to fetch products from API with filters
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query string with all filters
        let queryString = `page=${page}&limit=${limit}`;

        if (query.category) {
          queryString += `&category=${query.category}`;
        }

        if (query.brand) {
          queryString += `&brand=${query.brand}`;
        }

        if (query.minPrice && query.maxPrice) {
          queryString += `&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`;
        }

        if (query.inStock === 'true') {
          queryString += '&inStock=true';
        }

        if (query.sortBy) {
          queryString += `&sortBy=${query.sortBy}`;
        }

        const response = await fetch(`/api/products?${queryString}`);

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
          setTotalProducts(data.total || data.products.length);
          setTotalPages(data.totalPages || Math.ceil(data.total / limit) || 1);
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, query]);

  // Handle pagination
  const handleNextPage = () => {
    const nextPage = page + 1;
    router.push({
      pathname: router.pathname,
      query: { ...query, page: nextPage }
    }, undefined, { shallow: true });
  };

  const handlePrevPage = () => {
    const prevPage = Math.max(page - 1, 1);
    router.push({
      pathname: router.pathname,
      query: { ...query, page: prevPage }
    }, undefined, { shallow: true });
  };

  return (
    <Layout
      title="Products | MDTS - Midas Technical Solutions"
      description="Browse our extensive collection of repair parts and tools for all major device brands."
    >
      <div className={`container ${styles.productsContainer}`}>
        <div className={styles.productsHeader}>
          <h1>Products</h1>
          <p>Browse our extensive collection of repair parts and tools</p>
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
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="error-message">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Try Again</button>
              </div>
            ) : products.length === 0 ? (
              <div className={styles.emptyProducts}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <h3>No products found</h3>
                <p>Try adjusting your filters or browse all products</p>
                <button
                  className={styles.resetButton}
                  onClick={() => router.push('/products')}
                >
                  Reset Filters
                </button>
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
                          src={product.image_url || `/images/gapp/${getProductImage(product)}`}
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
                          <Link href={`/products/${product.slug}`}>
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
                          <Link href={`/products/${product.slug}`} className={styles.viewDetailsButton}>
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

                <div className={styles.pagination}>
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className={`${styles.paginationButton} ${page === 1 ? styles.disabled : ''}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                    Previous
                  </button>

                  <div className={styles.paginationPages}>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          router.push({
                            pathname: router.pathname,
                            query: { ...query, page: i + 1 }
                          }, undefined, { shallow: true });
                        }}
                        className={`${styles.pageNumber} ${page === i + 1 ? styles.activePage : ''}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className={`${styles.paginationButton} ${page >= totalPages ? styles.disabled : ''}`}
                  >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
