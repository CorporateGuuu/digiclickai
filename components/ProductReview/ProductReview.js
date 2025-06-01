import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import StarRating from '../StarRating/StarRating';
import styles from './ProductReview.module.css';

const ProductReview = ({ review, onHelpfulVote }) => {
  const [voted, setVoted] = useState(false);
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleHelpfulVote = () => {
    if (!voted) {
      setVoted(true);
      if (onHelpfulVote) {
        onHelpfulVote(review.id);
      }
    }
  };
  
  return (
    <div className={styles.review}>
      <div className={styles.reviewHeader}>
        <div className={styles.reviewerInfo}>
          <div className={styles.reviewerAvatar}>
            {review.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className={styles.reviewerName}>{review.user.name}</div>
            <div className={styles.reviewDate}>{formatDate(review.date)}</div>
          </div>
        </div>
        
        <div className={styles.reviewRating}>
          <StarRating rating={review.rating} size="small" />
        </div>
      </div>
      
      {review.title && (
        <h4 className={styles.reviewTitle}>{review.title}</h4>
      )}
      
      <div className={styles.reviewContent}>
        <p>{review.content}</p>
      </div>
      
      {review.images && review.images.length > 0 && (
        <div className={styles.reviewImages}>
          {review.images.map((image, index) => (
            <div key={index} className={styles.reviewImage}>
              <img src={image} alt={`Review image ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.reviewFooter}>
        <div className={styles.helpfulVote}>
          <span>Was this review helpful?</span>
          <button 
            className={`${styles.helpfulButton} ${voted ? styles.voted : ''}`}
            onClick={handleHelpfulVote}
            disabled={voted}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
            {voted ? 'Helpful' : 'Yes'}
            {review.helpful_count > 0 && <span className={styles.helpfulCount}>({review.helpful_count + (voted ? 1 : 0)})</span>}
          </button>
        </div>
        
        {review.verified_purchase && (
          <div className={styles.verifiedPurchase}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Verified Purchase
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReview;
