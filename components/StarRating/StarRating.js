import React from 'react';
import styles from './StarRating.module.css';

const StarRating = ({ rating, maxRating = 5, size = 'medium', interactive = false, onChange }) => {
  const stars = [];
  
  // Calculate the filled width percentage
  const getStarFillPercentage = (starPosition) => {
    const difference = rating - starPosition + 1;
    
    if (difference >= 1) {
      return 100; // Fully filled
    } else if (difference > 0) {
      return difference * 100; // Partially filled
    } else {
      return 0; // Empty
    }
  };
  
  // Handle star click for interactive mode
  const handleStarClick = (starPosition) => {
    if (interactive && onChange) {
      onChange(starPosition);
    }
  };
  
  // Generate stars
  for (let i = 1; i <= maxRating; i++) {
    const fillPercentage = getStarFillPercentage(i);
    
    stars.push(
      <div 
        key={i} 
        className={`${styles.star} ${interactive ? styles.interactive : ''} ${styles[size]}`}
        onClick={() => handleStarClick(i)}
      >
        {/* Empty star (background) */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={styles.emptyStar}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        
        {/* Filled star (overlay) */}
        <div 
          className={styles.fillContainer} 
          style={{ width: `${fillPercentage}%` }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className={styles.filledStar}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.starRating}>
      {stars}
      {rating > 0 && (
        <span className={styles.ratingText}>{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
