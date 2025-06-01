import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ProductFilters from '../../components/ProductFilters/ProductFilters';
import styles from '../../styles/CategoryPage.module.css';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const category = slug; // For backward compatibility

  const [products, setProducts] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mock brands for filtering
  const [brands, setBrands] = useState([
    { id: 1, name: 'Apple', slug: 'apple' },
    { id: 2, name: 'Samsung', slug: 'samsung' },
    { id: 3, name: 'LG', slug: 'lg' },
    { id: 4, name: 'Huawei', slug: 'huawei' },
    { id: 5, name: 'Xiaomi', slug: 'xiaomi' }
  ]);

  // Category information mapping
  const categoryMapping = {
    'iphone-parts': {
      name: 'iPhone Parts',
      description: 'High-quality replacement parts for all iPhone models',
      image: '/images/gapp/iphone-parts.png',
      models: ['iPhone 15', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11', 'iPhone X', 'iPhone 8', 'iPhone 7', 'iPhone 6']
    },
    'samsung-parts': {
      name: 'Samsung Parts',
      description: 'Genuine replacement parts for Samsung Galaxy devices',
      image: '/images/gapp/samsung-parts.png',
      models: ['Galaxy S23', 'Galaxy S22', 'Galaxy S21', 'Galaxy S20', 'Galaxy Note 20', 'Galaxy Note 10', 'Galaxy A Series']
    },
    'ipad-parts': {
      name: 'iPad Parts',
      description: 'Premium replacement parts for all iPad models',
      image: '/images/gapp/ipad-parts.png',
      models: ['iPad Pro', 'iPad Air', 'iPad Mini', 'iPad (Standard)']
    },
    'macbook-parts': {
      name: 'MacBook Parts',
      description: 'High-quality replacement parts for MacBook laptops',
      image: '/images/gapp/macbook-parts.png',
      models: ['MacBook Pro', 'MacBook Air', 'MacBook (Standard)']
    },
    'repair-tools': {
      name: 'Repair Tools',
      description: 'Professional-grade tools for device repair and maintenance',
      image: '/images/gapp/repair-tools.png',
      types: ['Screwdriver Sets', 'Opening Tools', 'Heat Guns', 'Soldering Equipment', 'Microscopes', 'Testing Equipment']
    }
  };

  // Function to get product image based on product name and category
  const getProductImage = (product) => {
    const productName = product.name?.toLowerCase() || '';
    const categoryName = product.category_name?.toLowerCase() || '';

    // iPhone specific parts
    if (categoryName.includes('iphone')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return '/images/gapp/iphone-screen.jpg';
      } else if (productName.includes('battery')) {
        return '/images/gapp/iphone-battery.jpg';
      } else if (productName.includes('camera')) {
        return '/images/gapp/iphone-camera.jpg';
      } else if (productName.includes('charging') || productName.includes('port') || productName.includes('connector')) {
        return '/images/gapp/iphone-charging-port.jpg';
      } else if (productName.includes('back') || productName.includes('glass') || productName.includes('housing')) {
        return '/images/gapp/iphone-back-glass.jpg';
      } else {
        return '/images/gapp/iphone-parts.png';
      }
    }
    // Samsung specific parts
    else if (categoryName.includes('samsung')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return '/images/gapp/samsung-screen.jpg';
      } else if (productName.includes('battery')) {
        return '/images/gapp/samsung-battery.jpg';
      } else if (productName.includes('camera')) {
        return '/images/gapp/samsung-camera.jpg';
      } else if (productName.includes('charging') || productName.includes('port') || productName.includes('connector')) {
        return '/images/gapp/samsung-charging-port.jpg';
      } else {
        return '/images/gapp/samsung-parts.png';
      }
    }
    // iPad specific parts
    else if (categoryName.includes('ipad')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return '/images/gapp/ipad-screen.jpg';
      } else if (productName.includes('battery')) {
        return '/images/gapp/ipad-battery.jpg';
      } else if (productName.includes('camera')) {
        return '/images/gapp/ipad-camera.jpg';
      } else {
        return '/images/gapp/ipad-parts.png';
      }
    }
    // MacBook specific parts
    else if (categoryName.includes('macbook')) {
      if (productName.includes('screen') || productName.includes('display') || productName.includes('lcd')) {
        return '/images/gapp/macbook-screen.jpg';
      } else if (productName.includes('keyboard')) {
        return '/images/gapp/macbook-keyboard.jpg';
      } else if (productName.includes('battery')) {
        return '/images/gapp/macbook-battery.jpg';
      } else if (productName.includes('trackpad')) {
        return '/images/gapp/macbook-trackpad.jpg';
      } else {
        return '/images/gapp/macbook-parts.png';
      }
    }
    // Repair tools
    else if (categoryName.includes('tool')) {
      if (productName.includes('screwdriver') || productName.includes('driver')) {
        return '/images/gapp/screwdriver-set.jpg';
      } else if (productName.includes('heat') || productName.includes('gun')) {
        return '/images/gapp/heat-gun.jpg';
      } else if (productName.includes('opening') || productName.includes('pry')) {
        return '/images/gapp/opening-tools.jpg';
      } else if (productName.includes('solder')) {
        return '/images/gapp/soldering-kit.jpg';
      } else if (productName.includes('microscope') || productName.includes('magnifier')) {
        return '/images/gapp/microscope.jpg';
      } else {
        return '/images/gapp/repair-tools.png';
      }
    }
    // Fallback
    else {
      return '/images/gapp/certified.png';
    }
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    // In a real implementation, this would update the query parameters
    // and trigger a new fetch of filtered products
  };

  useEffect(() => {
    if (!category) return;

    // Set category info
    setCategoryInfo(categoryMapping[category] || null);

    // Function to fetch products from API with filters
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Build query string with category filter
        let queryString = `page=${page}&limit=${limit}&category=${category}`;

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
  }, [category, page, limit]);

  // Handle pagination
  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
  };

  const handlePrevPage = () => {
    const prevPage = Math.max(page - 1, 1);
    setPage(prevPage);
  };

  if (!category || !categoryInfo) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading category...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{categoryInfo.name} | MDTS - Midas Technical Solutions</title>
        <meta name="description" content={categoryInfo.description} />
      </Head>

      <div className="container">
        <div className={styles.categoryHeader}>
          <div className={styles.categoryInfo}>
            <h1>{categoryInfo.name}</h1>
            <p>{categoryInfo.description}</p>

            <div className={styles.breadcrumbs}>
              <Link href="/">Home</Link> &gt;
              <Link href="/categories">Categories</Link> &gt;
              <span>{categoryInfo.name}</span>
            </div>
          </div>

          <div className={styles.categoryImage}>
            <img src={categoryInfo.image} alt={categoryInfo.name} />
          </div>
        </div>

        {/* Models/Types Section */}
        <div className={styles.modelsSection}>
          <h2>{categoryInfo.models ? 'Available Models' : 'Available Types'}</h2>
          <div className={styles.modelsList}>
            {categoryInfo.models ? (
              categoryInfo.models.map((model, index) => (
                <Link
                  href={`/products?category=${category}&model=${model.toLowerCase().replace(/\s+/g, '-')}`}
                  key={index}
                  className={styles.modelItem}
                >
                  {model}
                </Link>
              ))
            ) : (
              categoryInfo.types.map((type, index) => (
                <Link
                  href={`/products?category=${category}&type=${type.toLowerCase().replace(/\s+/g, '-')}`}
                  key={index}
                  className={styles.modelItem}
                >
                  {type}
                </Link>
              ))
            )}
          </div>
        </div>

        <div className={styles.productsLayout}>
          {/* Product Filters */}
          <ProductFilters
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
                  onClick={() => router.push(`/categories/${category}`)}
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
                          src={product.image_url || getProductImage(product)}
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
                        onClick={() => setPage(i + 1)}
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
    </>
  );
}
