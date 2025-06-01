import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ProductCard from '../ProductCard/ProductCard';
import { getPersonalizedRecommendations } from '../../utils/recommendationEngine';
import styles from './Recommendations.module.css';

const PersonalizedRecommendations = ({ 
  title = "Recommended For You",
  subtitle = "Based on your browsing history",
  limit = 4
}) => {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // Get user ID if logged in
        const userId = session?.user?.id;
        
        // Get personalized recommendations
        const recommendedProducts = await getPersonalizedRecommendations(userId, limit);
        
        setRecommendations(recommendedProducts);
      } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [session, limit]);
  
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
    <section className={styles.recommendationsSection}>
      <div className="container">
        <div className={styles.recommendationsHeader}>
          <h2 className={styles.recommendationsTitle}>{title}</h2>
          {subtitle && <p className={styles.recommendationsSubtitle}>{subtitle}</p>}
        </div>
        
        <div className={styles.recommendationsGrid}>
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
    </section>
  );
};

export default PersonalizedRecommendations;
