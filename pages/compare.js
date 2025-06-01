import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Compare.module.css';

export default function CompareProducts() {
  const router = useRouter();
  const { ids } = router.query;
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Only fetch when ids are available
    if (!ids) return;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Parse the product IDs from the query parameter
        const productIds = ids.split(',');
        
        if (productIds.length === 0) {
          setError('No products selected for comparison');
          setLoading(false);
          return;
        }
        
        // In a real app, this would fetch products from an API
        // For now, we'll use mock data
        
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock product data
        const mockProducts = [
          {
            id: 1,
            name: 'iPhone 13 Pro OLED Screen',
            slug: 'iphone-13-pro-oled-screen',
            category_name: 'iPhone Parts',
            price: 129.99,
            discount_percentage: 10,
            image_url: '/images/iphone-screen.svg',
            stock_status: 'In Stock',
            description: 'High-quality OLED screen replacement for iPhone 13 Pro. Perfect for professional repair shops and DIY enthusiasts.',
            specifications: {
              brand: 'Apple',
              compatibility: 'iPhone 13 Pro',
              warranty: '90 days',
              condition: 'New',
              material: 'OLED'
            }
          },
          {
            id: 2,
            name: 'iPhone 12 Pro OLED Screen',
            slug: 'iphone-12-pro-oled-screen',
            category_name: 'iPhone Parts',
            price: 119.99,
            discount_percentage: 5,
            image_url: '/images/iphone-screen.svg',
            stock_status: 'In Stock',
            description: 'High-quality OLED screen replacement for iPhone 12 Pro. Perfect for professional repair shops and DIY enthusiasts.',
            specifications: {
              brand: 'Apple',
              compatibility: 'iPhone 12 Pro',
              warranty: '90 days',
              condition: 'New',
              material: 'OLED'
            }
          },
          {
            id: 3,
            name: 'Samsung Galaxy S22 Battery',
            slug: 'samsung-galaxy-s22-battery',
            category_name: 'Samsung Parts',
            price: 39.99,
            discount_percentage: 15,
            image_url: '/images/samsung-battery.svg',
            stock_status: 'In Stock',
            description: 'Replacement battery for Samsung Galaxy S22. High capacity and long-lasting performance.',
            specifications: {
              brand: 'Samsung',
              compatibility: 'Galaxy S22',
              warranty: '90 days',
              condition: 'New',
              capacity: '3700mAh'
            }
          },
          {
            id: 4,
            name: 'Professional Repair Tool Kit',
            slug: 'professional-repair-tool-kit',
            category_name: 'Repair Tools',
            price: 89.99,
            discount_percentage: 0,
            image_url: '/images/repair-tools.svg',
            stock_status: 'In Stock',
            description: 'Complete toolkit for professional mobile device repairs. Includes precision screwdrivers, pry tools, tweezers, and more.',
            specifications: {
              brand: 'MDTS',
              pieces: '24',
              warranty: '1 year',
              condition: 'New',
              material: 'Stainless Steel'
            }
          },
          {
            id: 5,
            name: 'iPad Pro 12.9" LCD Assembly',
            slug: 'ipad-pro-12-9-lcd-assembly',
            category_name: 'iPad Parts',
            price: 199.99,
            discount_percentage: 5,
            image_url: '/images/ipad-screen.svg',
            stock_status: 'In Stock',
            description: 'Complete LCD assembly for iPad Pro 12.9". Includes digitizer and frame.',
            specifications: {
              brand: 'Apple',
              compatibility: 'iPad Pro 12.9"',
              warranty: '90 days',
              condition: 'New',
              material: 'LCD'
            }
          }
        ];
        
        // Filter products based on the IDs in the query
        const filteredProducts = mockProducts.filter(product => 
          productIds.includes(product.id.toString())
        );
        
        if (filteredProducts.length === 0) {
          setError('No matching products found for comparison');
        } else {
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error('Error fetching products for comparison:', err);
        setError('Failed to load products for comparison');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [ids]);
  
  const removeProduct = (productId) => {
    const updatedProducts = products.filter(product => product.id !== productId);
    setProducts(updatedProducts);
    
    // Update the URL to reflect the removed product
    const updatedIds = updatedProducts.map(product => product.id).join(',');
    router.push(`/compare?ids=${updatedIds}`, undefined, { shallow: true });
  };
  
  // Get all unique specification keys from all products
  const getSpecificationKeys = () => {
    const keys = new Set();
    
    products.forEach(product => {
      if (product.specifications) {
        Object.keys(product.specifications).forEach(key => keys.add(key));
      }
    });
    
    return Array.from(keys);
  };
  
  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products for comparison...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container">
        <div className="error-message">
          <h1>Error</h1>
          <p>{error}</p>
          <Link href="/products" className="btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="container">
        <div className={styles.emptyCompare}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <h2>No Products to Compare</h2>
          <p>You haven't selected any products to compare yet.</p>
          <Link href="/products" className={styles.browseButton}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Compare Products | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="Compare different products side by side at MDTS - Midas Technical Solutions" />
      </Head>
      
      <div className="container">
        <div className={styles.compareHeader}>
          <h1>Compare Products</h1>
          <p>Compare features and specifications side by side</p>
        </div>
        
        <div className={styles.compareTable}>
          {/* Product Images and Names */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Product</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareProduct}>
                <button 
                  className={styles.removeProduct}
                  onClick={() => removeProduct(product.id)}
                  title="Remove from comparison"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <div className={styles.productImage}>
                  <img 
                    src={product.image_url || '/images/placeholder.svg'} 
                    alt={product.name}
                  />
                </div>
                
                <h3 className={styles.productName}>
                  <Link href={`/products/${product.slug}`}>
                    {product.name}
                  </Link>
                </h3>
              </div>
            ))}
          </div>
          
          {/* Price */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Price</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareValue}>
                {product.discount_percentage > 0 ? (
                  <>
                    <span className={styles.originalPrice}>
                      ${(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                    </span>
                    <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className={styles.currentPrice}>${product.price.toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>
          
          {/* Category */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Category</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareValue}>
                {product.category_name}
              </div>
            ))}
          </div>
          
          {/* Stock Status */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Availability</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareValue}>
                <span className={`${styles.stockStatus} ${product.stock_status === 'In Stock' ? styles.inStock : styles.outOfStock}`}>
                  {product.stock_status}
                </span>
              </div>
            ))}
          </div>
          
          {/* Description */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Description</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareValue}>
                <p>{product.description}</p>
              </div>
            ))}
          </div>
          
          {/* Specifications */}
          {getSpecificationKeys().map(key => (
            <div key={key} className={styles.compareRow}>
              <div className={styles.compareFeature}>
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
              
              {products.map(product => (
                <div key={product.id} className={styles.compareValue}>
                  {product.specifications && product.specifications[key] ? (
                    product.specifications[key]
                  ) : (
                    <span className={styles.notAvailable}>N/A</span>
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {/* Add to Cart Buttons */}
          <div className={styles.compareRow}>
            <div className={styles.compareFeature}>
              <span>Actions</span>
            </div>
            
            {products.map(product => (
              <div key={product.id} className={styles.compareValue}>
                <button className={styles.addToCartButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Add to Cart
                </button>
                
                <Link href={`/products/${product.slug}`} className={styles.viewDetailsButton}>
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className={styles.compareActions}>
          <Link href="/products" className={styles.backToProductsButton}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Products
          </Link>
        </div>
      </div>
    </>
  );
}
