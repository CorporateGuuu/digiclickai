import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { 
  getPersonalizedRecommendations, 
  getSimilarProducts, 
  getFrequentlyBoughtTogether,
  trackProductView
} from '../../utils/recommendationEngine';

// Custom hook for personalized recommendations
export const usePersonalizedRecommendations = (limit = 8) => {
  const { data: session } = useSession();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID if logged in
        const userId = session?.user?.id;
        
        // Get personalized recommendations
        const recommendedProducts = await getPersonalizedRecommendations(userId, limit);
        
        setRecommendations(recommendedProducts);
      } catch (err) {
        console.error('Error fetching personalized recommendations:', err);
        setError(err.message);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [session, limit]);
  
  return { recommendations, loading, error };
};

// Custom hook for similar products
export const useSimilarProducts = (productId, categoryId, limit = 4) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!productId && !categoryId) {
          setSimilarProducts([]);
          return;
        }
        
        // Get similar products
        const products = await getSimilarProducts(productId, categoryId, limit);
        
        setSimilarProducts(products);
      } catch (err) {
        console.error('Error fetching similar products:', err);
        setError(err.message);
        setSimilarProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSimilarProducts();
  }, [productId, categoryId, limit]);
  
  return { similarProducts, loading, error };
};

// Custom hook for frequently bought together products
export const useFrequentlyBoughtTogether = (productId, limit = 3) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!productId) {
          setRelatedProducts([]);
          return;
        }
        
        // Get frequently bought together products
        const products = await getFrequentlyBoughtTogether(productId, limit);
        
        setRelatedProducts(products);
      } catch (err) {
        console.error('Error fetching frequently bought together products:', err);
        setError(err.message);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [productId, limit]);
  
  return { relatedProducts, loading, error };
};

// Custom hook for tracking product views
export const useProductViewTracking = () => {
  const trackView = useCallback((productId) => {
    if (!productId) return;
    
    // Track product view
    trackProductView(productId);
  }, []);
  
  return { trackView };
};

// RecommendationContext provider component
export const RecommendationProvider = ({ children }) => {
  // Initialize recommendation state and functions
  
  return (
    <div>
      {children}
    </div>
  );
};
