import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../ProductCard/ProductCard';
import styles from './RecentlyViewed.module.css';

const RecentlyViewed = ({
  currentProductId,
  limit = 4,
  title = "Recently Viewed",
  subtitle = "Products you've viewed recently"
}) => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentlyViewed = async () => {
      try {
        setLoading(true);

        // Get recently viewed products from localStorage
        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        // Filter out current product if provided
        const filteredIds = currentProductId
          ? recentlyViewedIds.filter(id => id !== currentProductId)
          : recentlyViewedIds;

        // If no recently viewed products, return early
        if (filteredIds.length === 0) {
          // For demo purposes, use mock data if no recently viewed products
          const mockRecentlyViewed = [
            {
              id: 1,
              name: 'iPhone 13 Pro OLED Screen',
              slug: 'iphone-13-pro-oled-screen',
              price: 129.99,
              category_name: 'iPhone Parts',
              image_url: '/images/products/iphone-screen.jpg',
              rating: 4.5,
              review_count: 28,
              stock: 15
            },
            {
              id: 2,
              name: 'Samsung Galaxy S22 Battery',
              slug: 'samsung-galaxy-s22-battery',
              price: 39.99,
              category_name: 'Samsung Parts',
              image_url: '/images/products/samsung-battery.jpg',
              rating: 4.2,
              review_count: 17,
              stock: 23
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
              stock: 8
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
              stock: 5
            }
          ];

          setRecentProducts(mockRecentlyViewed);
          setLoading(false);
          return;
        }

        // Limit the number of products to fetch
        const limitedIds = filteredIds.slice(0, limit);

        // Fetch product details for the IDs
        const response = await fetch(`/api/products/batch?ids=${limitedIds.join(',')}`);

        if (!response.ok) {
          throw new Error('Failed to fetch recently viewed products');
        }

        const data = await response.json();
        setRecentProducts(data);
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    // Add current product to recently viewed
    const updateRecentlyViewed = () => {
      if (!currentProductId) return;

      try {
        // Get existing recently viewed products
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

        // Remove current product if it exists (to move it to the front)
        const filtered = recentlyViewed.filter(id => id !== currentProductId);

        // Add current product to the beginning
        filtered.unshift(currentProductId);

        // Keep only the most recent 20 products
        const limited = filtered.slice(0, 20);

        // Save back to localStorage
        localStorage.setItem('recentlyViewed', JSON.stringify(limited));
      } catch (error) {
        console.error('Error updating recently viewed products:', error);
      }
    };

    // Update recently viewed if current product is provided
    if (currentProductId) {
      updateRecentlyViewed();
    }

    // Load recently viewed products
    loadRecentlyViewed();
  }, [currentProductId, limit]);

  if (loading) {
    return (
      <div className={styles.recentlyViewedLoading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }

  if (recentProducts.length === 0) {
    return null; // Don't show anything if no recently viewed products
  }

  return (
    <section className={styles.recentlyViewed}>
      <div className="container">
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.products}>
          {recentProducts.map(product => (
            <div key={product.id} className={styles.productWrapper}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
