import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './CompareButton.module.css';

const CompareButton = ({ product }) => {
  const router = useRouter();
  const [isInCompare, setIsInCompare] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  
  useEffect(() => {
    // Check if the product is already in the compare list
    const compareList = getCompareList();
    setIsInCompare(compareList.some(item => item.id === product.id));
    setCompareCount(compareList.length);
  }, [product]);
  
  // Get the compare list from localStorage
  const getCompareList = () => {
    if (typeof window === 'undefined') return [];
    
    const compareList = localStorage.getItem('compareList');
    return compareList ? JSON.parse(compareList) : [];
  };
  
  // Add or remove product from compare list
  const toggleCompare = () => {
    const compareList = getCompareList();
    
    if (isInCompare) {
      // Remove from compare list
      const updatedList = compareList.filter(item => item.id !== product.id);
      localStorage.setItem('compareList', JSON.stringify(updatedList));
      setIsInCompare(false);
      setCompareCount(updatedList.length);
    } else {
      // Add to compare list (max 4 products)
      if (compareList.length >= 4) {
        alert('You can compare up to 4 products at a time. Please remove a product before adding a new one.');
        return;
      }
      
      const updatedList = [...compareList, {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image_url: product.image_url
      }];
      
      localStorage.setItem('compareList', JSON.stringify(updatedList));
      setIsInCompare(true);
      setCompareCount(updatedList.length);
    }
  };
  
  // Go to compare page
  const goToComparePage = () => {
    const compareList = getCompareList();
    
    if (compareList.length === 0) {
      alert('Please add products to compare first.');
      return;
    }
    
    const ids = compareList.map(item => item.id).join(',');
    router.push(`/compare?ids=${ids}`);
  };
  
  return (
    <div className={styles.compareContainer}>
      <button 
        className={`${styles.compareButton} ${isInCompare ? styles.active : ''}`}
        onClick={toggleCompare}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        {isInCompare ? 'Remove from Compare' : 'Add to Compare'}
      </button>
      
      {compareCount > 0 && (
        <button 
          className={styles.viewCompareButton}
          onClick={goToComparePage}
        >
          View Comparison ({compareCount})
        </button>
      )}
    </div>
  );
};

export default CompareButton;
