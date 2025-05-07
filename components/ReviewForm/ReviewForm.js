import React from 'react';
import Image from 'next/image';
import { useState } from 'react';
import StarRating from '../StarRating/StarRating';
import styles from './ReviewForm.module.css';

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors({ ...errors, rating: null });
    }
  };
  
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors({ ...errors, title: null });
    }
  };
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (errors.content) {
      setErrors({ ...errors, content: null });
    }
  };
  
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      return isImage && isValidSize;
    });
    
    if (validFiles.length + images.length > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }
    
    // Create image previews
    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages([...images, ...newImages]);
    if (errors.images) {
      setErrors({ ...errors, images: null });
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    setImages(newImages);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Please enter your review';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Review must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload images and submit the review to an API
      // For this example, we'll just simulate a successful submission
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reviewData = {
        productId,
        rating,
        title,
        content,
        images: images.map(img => img.preview) // In a real app, these would be URLs from your server
      };
      
      if (onSubmit) {
        onSubmit(reviewData);
      }
      
      // Clean up image previews
      images.forEach(img => URL.revokeObjectURL(img.preview));
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ ...errors, submit: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={styles.reviewForm}>
      <h3 className={styles.formTitle}>Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Your Rating *</label>
          <div className={styles.ratingInput}>
            <StarRating 
              rating={rating} 
              interactive={true} 
              onChange={handleRatingChange}
              size="large"
            />
            {errors.rating && <div className={styles.errorMessage}>{errors.rating}</div>}
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="review-title" className={styles.formLabel}>Review Title</label>
          <input
            type="text"
            id="review-title"
            className={styles.textInput}
            value={title}
            onChange={handleTitleChange}
            placeholder="Summarize your experience (optional)"
            maxLength={100}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="review-content" className={styles.formLabel}>Your Review *</label>
          <textarea
            id="review-content"
            className={`${styles.textInput} ${styles.textarea} ${errors.content ? styles.hasError : ''}`}
            value={content}
            onChange={handleContentChange}
            placeholder="What did you like or dislike? How was the quality? Is it as described?"
            rows={5}
            maxLength={1000}
          ></textarea>
          {errors.content && <div className={styles.errorMessage}>{errors.content}</div>}
          <div className={styles.charCount}>{content.length}/1000</div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Add Photos (optional)</label>
          <div className={styles.imageUpload}>
            <div className={styles.imagePreviewContainer}>
              {images.map((image, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={image.preview} alt={`Preview ${index + 1}`} />
                  <button 
                    type="button" 
                    className={styles.removeImageButton}
                    onClick={() => removeImage(index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className={styles.uploadButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <span>Add Photo</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </label>
              )}
            </div>
            {errors.images && <div className={styles.errorMessage}>{errors.images}</div>}
            <div className={styles.imageUploadHint}>
              Max 5 images, 5MB each. Supported formats: JPG, PNG, GIF
            </div>
          </div>
        </div>
        
        {errors.submit && (
          <div className={styles.submitError}>
            {errors.submit}
          </div>
        )}
        
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                  <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                  <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                </svg>
                Submitting...
              </>
            ) : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
