import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import StarRating from '../StarRating/StarRating';
import ProductReview from '../ProductReview/ProductReview';
import ReviewForm from '../ReviewForm/ReviewForm';
import styles from './ProductReviews.module.css';

const ProductReviews = ({ productId, initialReviews = [] }) => {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => Math.round(review.rating) === rating).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { rating, count, percentage };
  });
  
  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'verified') return review.verified_purchase;
    if (filter === 'with-images') return review.images && review.images.length > 0;
    
    const ratingFilter = parseInt(filter);
    return !isNaN(ratingFilter) && Math.round(review.rating) === ratingFilter;
  });
  
  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else if (sort === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (sort === 'highest-rating') {
      return b.rating - a.rating;
    } else if (sort === 'lowest-rating') {
      return a.rating - b.rating;
    } else if (sort === 'most-helpful') {
      return b.helpful_count - a.helpful_count;
    }
    return 0;
  });
  
  const handleHelpfulVote = (reviewId) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful_count: review.helpful_count + 1 } 
        : review
    ));
  };
  
  const handleReviewSubmit = (reviewData) => {
    // In a real app, this would be handled by an API
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      date: new Date().toISOString(),
      user: {
        id: session?.user?.id || 'anonymous',
        name: session?.user?.name || 'Anonymous User',
      },
      helpful_count: 0,
      verified_purchase: true,
    };
    
    setReviews([newReview, ...reviews]);
    setShowReviewForm(false);
  };
  
  return (
    <div className={styles.productReviews}>
      <h2 className={styles.sectionTitle}>Customer Reviews</h2>
      
      <div className={styles.reviewsOverview}>
        <div className={styles.averageRating}>
          <div className={styles.ratingValue}>{averageRating.toFixed(1)}</div>
          <StarRating rating={averageRating} size="large" />
          <div className={styles.totalReviews}>{reviews.length} reviews</div>
        </div>
        
        <div className={styles.ratingDistribution}>
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <div key={rating} className={styles.ratingBar}>
              <button 
                className={`${styles.ratingButton} ${filter === rating.toString() ? styles.active : ''}`}
                onClick={() => setFilter(filter === rating.toString() ? 'all' : rating.toString())}
              >
                {rating} star{rating !== 1 ? 's' : ''}
              </button>
              <div className={styles.barContainer}>
                <div 
                  className={styles.barFill} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <div className={styles.ratingCount}>{count}</div>
            </div>
          ))}
        </div>
        
        <div className={styles.writeReviewContainer}>
          <button 
            className={styles.writeReviewButton}
            onClick={() => setShowReviewForm(true)}
            disabled={showReviewForm}
          >
            Write a Review
          </button>
        </div>
      </div>
      
      {showReviewForm && (
        <ReviewForm 
          productId={productId}
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
      
      <div className={styles.reviewsControls}>
        <div className={styles.reviewsFilters}>
          <span>Filter:</span>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Reviews</option>
            <option value="verified">Verified Purchases</option>
            <option value="with-images">With Images</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
        
        <div className={styles.reviewsSort}>
          <span>Sort by:</span>
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest-rating">Highest Rating</option>
            <option value="lowest-rating">Lowest Rating</option>
            <option value="most-helpful">Most Helpful</option>
          </select>
        </div>
      </div>
      
      <div className={styles.reviewsList}>
        {sortedReviews.length > 0 ? (
          sortedReviews.map(review => (
            <ProductReview 
              key={review.id} 
              review={review} 
              onHelpfulVote={handleHelpfulVote}
            />
          ))
        ) : (
          <div className={styles.noReviews}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <h3>No reviews yet</h3>
            <p>Be the first to review this product</p>
            {!showReviewForm && (
              <button 
                className={styles.writeReviewButton}
                onClick={() => setShowReviewForm(true)}
              >
                Write a Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
