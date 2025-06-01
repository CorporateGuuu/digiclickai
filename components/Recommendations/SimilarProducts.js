import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../ProductCard/ProductCard';
import { getSimilarProducts } from '../../utils/recommendationEngine';
import styles from './Recommendations.module.css';

const SimilarProducts = ({ 
  productId,
  categoryId,
  title = "Similar Products",
  subtitle = "You might also be interested in these products",
  limit = 4
}) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        
        // Get similar products
        const products = await getSimilarProducts(productId, categoryId, limit);
        
        setSimilarProducts(products);
      } catch (error) {
        console.error('Error fetching similar products:', error);
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (productId || categoryId) {
      fetchSimilarProducts();
    }
  }, [productId, categoryId, limit]);
  
  if (loading) {
    return (
      <div className={styles.recommendationsLoading}>
        <div className={styles.loadingSpinner}></div>
      </div>
    );
  }
  
  if (similarProducts.length === 0) {
    return null; // Don't show anything if no similar products
  }
  
  return (
    <section className={styles.recommendationsSection}>
      <div className="container">
        <div className={styles.recommendationsHeader}>
          <h2 className={styles.recommendationsTitle}>{title}</h2>
          {subtitle && <p className={styles.recommendationsSubtitle}>{subtitle}</p>}
        </div>
        
        <div className={styles.recommendationsGrid}>
          {similarProducts.map(product => (
            <div key={product.id} className={styles.recommendationItem}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        <div className={styles.viewAllContainer}>
          <Link 
            href={categoryId ? `/categories/${categoryId}` : "/products"} 
            className={styles.viewAllLink}
          >
            View More
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts;
