import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../ProductCard/ProductCard';
import styles from './ProductRecommendations.module.css';

const ProductRecommendations = ({ 
  currentProductId, 
  currentCategory,
  viewedProducts = [],
  limit = 4,
  title = "You Might Also Like"
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        if (currentProductId) {
          params.append('excludeId', currentProductId);
        }
        
        if (currentCategory) {
          params.append('category', currentCategory);
        }
        
        if (viewedProducts && viewedProducts.length > 0) {
          params.append('viewedProducts', viewedProducts.join(','));
        }
        
        params.append('limit', limit);
        
        // Fetch recommendations from API
        const response = await fetch(`/api/recommendations?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }
        
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to empty array
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [currentProductId, currentCategory, viewedProducts, limit]);
  
  if (loading) {
    return (
      <div className={styles.recommendationsLoading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return null; // Don't show anything if no recommendations
  }
  
  return (
    <div className={styles.recommendationsContainer}>
      <h2 className={styles.recommendationsTitle}>{title}</h2>
      
      <div className={styles.recommendationsList}>
        {recommendations.map(product => (
          <div key={product.id} className={styles.recommendationItem}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      <div className={styles.viewAllContainer}>
        <Link href="/products" className={styles.viewAllLink}>
          View All Products
        </Link>
      </div>
    </div>
  );
};

export default ProductRecommendations;
