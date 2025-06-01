import React, { useState } from 'react';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ productId }) => {
  // In a real implementation, reviews would be fetched from an API
  // For demo purposes, we'll use mock data
  const mockReviews = [
    {
      id: 1,
      author: "John D.",
      rating: 5,
      date: "2023-05-15",
      title: "Excellent quality",
      content: "The screen was a perfect fit for my iPhone 13 Pro. Installation was straightforward and the quality is indistinguishable from the original.",
      verified: true
    },
    {
      id: 2,
      author: "Sarah M.",
      rating: 4,
      date: "2023-04-22",
      title: "Good value",
      content: "Good quality for the price. The colors are slightly different from the original but not noticeable unless you're really looking for it.",
      verified: true
    },
    {
      id: 3,
      author: "Michael T.",
      rating: 5,
      date: "2023-03-10",
      title: "Fast shipping",
      content: "Received the product earlier than expected. Installation was easy with the included tools. Very satisfied with my purchase.",
      verified: false
    }
  ];

  const [reviews] = useState(mockReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <div className={styles.productReviews}>
      <h2 className={styles.title}>Customer Reviews</h2>
      
      <div className={styles.summary}>
        <div className={styles.averageRating}>
          <div className={styles.ratingValue}>{averageRating.toFixed(1)}</div>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(averageRating) ? styles.starFilled : styles.starEmpty}>★</span>
            ))}
          </div>
          <div className={styles.reviewCount}>Based on {reviews.length} reviews</div>
        </div>
        
        <button 
          className={styles.writeReviewButton}
          onClick={() => setShowReviewForm(!showReviewForm)}
        >
          Write a Review
        </button>
      </div>
      
      {showReviewForm && (
        <div className={styles.reviewForm}>
          <h3>Write Your Review</h3>
          <form>
            <div className={styles.formGroup}>
              <label>Rating</label>
              <div className={styles.ratingSelector}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={styles.ratingStar}>★</span>
                ))}
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Title</label>
              <input type="text" placeholder="Summarize your review" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Review</label>
              <textarea placeholder="Write your review here..." rows={4}></textarea>
            </div>
            
            <div className={styles.formGroup}>
              <label>Name</label>
              <input type="text" placeholder="Your name" />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" placeholder="Your email (will not be published)" />
            </div>
            
            <button type="submit" className={styles.submitButton}>Submit Review</button>
          </form>
        </div>
      )}
      
      <div className={styles.reviewsList}>
        {reviews.map(review => (
          <div key={review.id} className={styles.review}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewAuthor}>{review.author}</div>
              <div className={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</div>
            </div>
            
            <div className={styles.reviewRating}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>★</span>
              ))}
              {review.verified && <span className={styles.verifiedBadge}>Verified Purchase</span>}
            </div>
            
            <h4 className={styles.reviewTitle}>{review.title}</h4>
            <p className={styles.reviewContent}>{review.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
