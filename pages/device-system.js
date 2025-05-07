import React, { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

// Create a simple Layout component if the import fails
const LayoutFallback = ({ children }) => (
  <div>
    <main>{children}</main>
  </div>
);

// Try to import the real Layout component, fall back to the simple one if it fails
let Layout;
try {
  Layout = require('../components/Layout/Layout').default;
} catch (e) {
  Layout = LayoutFallback;
}

// Create a simple styles object if the import fails
const stylesFallback = {
  deviceSystemHeader: '',
  deviceSystemFilters: '',
  filterGroup: '',
  deviceSystemResults: '',
  resultsHeader: '',
  downloadSection: '',
  downloadButton: '',
  deviceGrid: '',
  deviceCard: '',
  deviceImageContainer: '',
  deviceImage: '',
  conditionBadge: '',
  outOfStockBadge: '',
  deviceContent: '',
  deviceCategory: '',
  deviceName: '',
  deviceSpecs: '',
  specItem: '',
  specLabel: '',
  specValue: '',
  deviceFooter: '',
  devicePrice: '',
  deviceStock: '',
  inStock: '',
  outOfStock: '',
  deviceActions: '',
  detailsButton: '',
  orderButton: '',
  noResults: '',
  resetButton: '',
  deviceSystemInfo: '',
  gradingLegend: '',
  gradingItem: '',
  gradeBadge: '',
  conditionA: '',
  conditionB: '',
  conditionC: '',
  conditionD: '',
  learnMoreLink: '',
  loadingContainer: '',
  spinner: '',
  errorContainer: '',
  retryButton: ''
};

// Try to import the real styles, fall back to the simple ones if it fails
let styles;
try {
  styles = require('../styles/DeviceSystem.module.css');
} catch (e) {
  styles = stylesFallback;
}

export default function DeviceSystemPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { instock } = router.query;

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    brand: 'all',
    condition: 'all',
    inStock: instock === '1',
    search: '',
  });

  // Mock device data (in a real app, this would come from an API)
  const mockDevices = [
    {
      id: 1,
      name: 'iPhone 13 Pro',
      brand: 'Apple',
      category: 'Smartphone',
      condition: 'A',
      price: 699.99,
      stock: 15,
      image: '/images/devices/iphone-13-pro.jpg',
      specs: {
        storage: '128GB',
        color: 'Graphite',
        screen: '6.1" OLED',
        camera: 'Triple 12MP',
        battery: '3095mAh',
      }
    },
    {
      id: 2,
      name: 'Samsung Galaxy S22',
      brand: 'Samsung',
      category: 'Smartphone',
      condition: 'A',
      price: 649.99,
      stock: 8,
      image: '/images/devices/samsung-s22.jpg',
      specs: {
        storage: '256GB',
        color: 'Phantom Black',
        screen: '6.1" Dynamic AMOLED',
        camera: 'Triple 50MP',
        battery: '3700mAh',
      }
    },
    {
      id: 3,
      name: 'iPad Pro 12.9"',
      brand: 'Apple',
      category: 'Tablet',
      condition: 'B',
      price: 899.99,
      stock: 5,
      image: '/images/devices/ipad-pro.jpg',
      specs: {
        storage: '256GB',
        color: 'Space Gray',
        screen: '12.9" Liquid Retina XDR',
        camera: '12MP Wide',
        battery: '10,758mAh',
      }
    },
    {
      id: 4,
      name: 'MacBook Pro 14"',
      brand: 'Apple',
      category: 'Laptop',
      condition: 'A',
      price: 1499.99,
      stock: 3,
      image: '/images/devices/macbook-pro.jpg',
      specs: {
        storage: '512GB SSD',
        color: 'Silver',
        screen: '14" Liquid Retina XDR',
        processor: 'M1 Pro',
        memory: '16GB',
      }
    },
    {
      id: 5,
      name: 'Google Pixel 6',
      brand: 'Google',
      category: 'Smartphone',
      condition: 'B',
      price: 499.99,
      stock: 0,
      image: '/images/devices/pixel-6.jpg',
      specs: {
        storage: '128GB',
        color: 'Stormy Black',
        screen: '6.4" OLED',
        camera: '50MP Wide',
        battery: '4614mAh',
      }
    },
    {
      id: 6,
      name: 'Samsung Galaxy Tab S8',
      brand: 'Samsung',
      category: 'Tablet',
      condition: 'A',
      price: 649.99,
      stock: 7,
      image: '/images/devices/galaxy-tab-s8.jpg',
      specs: {
        storage: '128GB',
        color: 'Graphite',
        screen: '11" TFT LCD',
        camera: '13MP',
        battery: '8000mAh',
      }
    },
    {
      id: 7,
      name: 'iPhone 12',
      brand: 'Apple',
      category: 'Smartphone',
      condition: 'C',
      price: 499.99,
      stock: 12,
      image: '/images/devices/iphone-12.jpg',
      specs: {
        storage: '64GB',
        color: 'Blue',
        screen: '6.1" Super Retina XDR',
        camera: 'Dual 12MP',
        battery: '2815mAh',
      }
    },
    {
      id: 8,
      name: 'Dell XPS 13',
      brand: 'Dell',
      category: 'Laptop',
      condition: 'B',
      price: 999.99,
      stock: 0,
      image: '/images/devices/dell-xps-13.jpg',
      specs: {
        storage: '512GB SSD',
        color: 'Platinum Silver',
        screen: '13.4" FHD+',
        processor: 'Intel Core i7',
        memory: '16GB',
      }
    },
  ];

  // Fetch devices (simulated)
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would be an API call
        setDevices(mockDevices);
      } catch (err) {
        console.error('Error fetching devices:', err);
        setError('Failed to load devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter devices based on current filters
  const filteredDevices = devices.filter(device => {
    // Filter by in stock
    if (filters.inStock && device.stock <= 0) {
      return false;
    }

    // Filter by category
    if (filters.category !== 'all' && device.category !== filters.category) {
      return false;
    }

    // Filter by brand
    if (filters.brand !== 'all' && device.brand !== filters.brand) {
      return false;
    }

    // Filter by condition
    if (filters.condition !== 'all' && device.condition !== filters.condition) {
      return false;
    }

    // Filter by search term
    if (filters.search && !device.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Get unique categories, brands, and conditions for filter options
  const categories = ['all', ...new Set(devices.map(device => device.category))];
  const brands = ['all', ...new Set(devices.map(device => device.brand))];
  const conditions = ['all', 'A', 'B', 'C', 'D'];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/device-system');
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="container">
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading device inventory...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container">
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Device Inventory System | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Browse our inventory of devices and parts at MDTS - Midas Technical Solutions." />
      </Head>

      <main className="main-content">
        <div className="container">
          <div className={styles.deviceSystemHeader}>
            <h1>Device Inventory System</h1>
            <p>
              Browse our complete inventory of devices and parts. Use the filters below to find exactly what you need.
            </p>
          </div>

          <div className={styles.deviceSystemFilters}>
            <div className={styles.filterGroup}>
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                id="search"
                placeholder="Search devices..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="brand">Brand:</label>
              <select
                id="brand"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand === 'all' ? 'All Brands' : brand}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="condition">Condition:</label>
              <select
                id="condition"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition === 'all' ? 'All Conditions' : `Grade ${condition}`}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                />
                In Stock Only
              </label>
            </div>
          </div>

          <div className={styles.deviceSystemResults}>
            <div className={styles.resultsHeader}>
              <h2>Results ({filteredDevices.length} devices)</h2>

              <div className={styles.downloadSection}>
                <button className={styles.downloadButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download Inventory CSV
                </button>

                <button className={styles.downloadButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Download PDF Catalog
                </button>
              </div>
            </div>

            {filteredDevices.length === 0 ? (
              <div className={styles.noResults}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <h3>No devices found</h3>
                <p>Try adjusting your filters or search criteria.</p>
                <button
                  onClick={() => setFilters({
                    category: 'all',
                    brand: 'all',
                    condition: 'all',
                    inStock: false,
                    search: '',
                  })}
                  className={styles.resetButton}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.deviceGrid}>
                {filteredDevices.map(device => (
                  <div key={device.id} className={styles.deviceCard}>
                    <div className={styles.deviceImageContainer}>
                      <img
                        src={device.image || '/images/placeholder.svg'}
                        alt={device.name}
                        className={styles.deviceImage}
                      />
                      <div className={`${styles.conditionBadge} ${styles[`condition${device.condition}`]}`}>
                        Grade {device.condition}
                      </div>
                      {device.stock <= 0 && (
                        <div className={styles.outOfStockBadge}>
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className={styles.deviceContent}>
                      <div className={styles.deviceCategory}>{device.category} • {device.brand}</div>
                      <h3 className={styles.deviceName}>{device.name}</h3>

                      <div className={styles.deviceSpecs}>
                        {Object.entries(device.specs).map(([key, value]) => (
                          <div key={key} className={styles.specItem}>
                            <span className={styles.specLabel}>{key}:</span>
                            <span className={styles.specValue}>{value}</span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.deviceFooter}>
                        <div className={styles.devicePrice}>${device.price.toFixed(2)}</div>
                        <div className={styles.deviceStock}>
                          {device.stock > 0 ? (
                            <span className={styles.inStock}>In Stock: {device.stock}</span>
                          ) : (
                            <span className={styles.outOfStock}>Out of Stock</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.deviceActions}>
                        <button
                          className={styles.detailsButton}
                          onClick={() => router.push(`/devices/${device.id}`)}
                        >
                          View Details
                        </button>
                        <button
                          className={styles.orderButton}
                          disabled={device.stock <= 0}
                        >
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.deviceSystemInfo}>
            <h2>Device Grading System</h2>
            <p>
              All devices in our inventory are graded according to our standardized grading system.
              This ensures transparency and helps you make informed decisions.
            </p>
            <div className={styles.gradingLegend}>
              <div className={styles.gradingItem}>
                <div className={`${styles.gradeBadge} ${styles.conditionA}`}>Grade A</div>
                <span>Excellent condition, like new</span>
              </div>
              <div className={styles.gradingItem}>
                <div className={`${styles.gradeBadge} ${styles.conditionB}`}>Grade B</div>
                <span>Good condition, minor wear</span>
              </div>
              <div className={styles.gradingItem}>
                <div className={`${styles.gradeBadge} ${styles.conditionC}`}>Grade C</div>
                <span>Fair condition, noticeable wear</span>
              </div>
              <div className={styles.gradingItem}>
                <div className={`${styles.gradeBadge} ${styles.conditionD}`}>Grade D</div>
                <span>Poor condition, significant wear</span>
              </div>
            </div>
            <Link href="/device-grading" className={styles.learnMoreLink} passHref>
              <span>Learn more about our grading system</span>
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

// Server-side authentication check
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/device-system',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}
