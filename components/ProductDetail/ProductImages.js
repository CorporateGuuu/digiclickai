import Image from 'next/image';
import React, { useState } from 'react';
import styles from './ProductImages.module.css';

const ProductImages = ({ product }) => {
  // In a real implementation, product would have multiple images
  // For demo purposes, we'll create some mock additional images
  const images = [
    product.image_url || "/placeholder.svg",
    "/images/product-detail-1.jpg",
    "/images/product-detail-2.jpg",
    "/images/product-detail-3.jpg",
  ];

  const [mainImage, setMainImage] = useState(images[0]);

  return (
    <div className={styles.productImages}>
      <div className={styles.mainImage}>
        <img src={mainImage} alt={product.name} />
        
        {/* Zoom overlay */}
        <div className={styles.zoomOverlay}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
      </div>
      
      <div className={styles.thumbnails}>
        {images.map((image, index) => (
          <div 
            key={index} 
            className={`${styles.thumbnail} ${mainImage === image ? styles.active : ''}`}
            onClick={() => setMainImage(image)}
          >
            <img src={image} alt={`${product.name} - View ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
