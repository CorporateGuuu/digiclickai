import React from 'react';
import styles from './StockIndicator.module.css';

const StockIndicator = ({ stock, threshold = 5, showExactCount = false }) => {
  // Determine stock status
  let status = 'out-of-stock';
  
  if (stock > 0) {
    status = stock <= threshold ? 'low-stock' : 'in-stock';
  }
  
  // Get status text
  const getStatusText = () => {
    if (status === 'out-of-stock') {
      return 'Out of Stock';
    } else if (status === 'low-stock') {
      return showExactCount ? `Only ${stock} left` : 'Low Stock';
    } else {
      return showExactCount ? `${stock} in Stock` : 'In Stock';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    if (status === 'out-of-stock') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      );
    } else if (status === 'low-stock') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      );
    }
  };
  
  return (
    <div className={`${styles.stockIndicator} ${styles[status]}`}>
      <span className={styles.icon}>{getStatusIcon()}</span>
      <span className={styles.text}>{getStatusText()}</span>
    </div>
  );
};

export default StockIndicator;
