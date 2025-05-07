import Image from 'next/image';
import React, { useState } from 'react';
import Link from 'next/link';
import AddToCart from './AddToCart';

export default function ResponsiveProductDetail({ product }) {
  const [activeImage, setActiveImage] = useState(0);
  
  // Handle multiple images if available
  const images = product.image_url 
    ? [product.image_url] 
    : ['/placeholder.svg'];
  
  if (product.additional_images && Array.isArray(product.additional_images)) {
    images.push(...product.additional_images);
  }
  
  return (
    <div className="product-detail-container">
      <div className="breadcrumbs">
        <Link href="/products">Products</Link>
        {product.category && (
          <>
            <span className="breadcrumb-separator">/</span>
            <Link href={`/categories/${product.category.slug}`}>
              {product.category.name}
            </Link>
          </>
        )}
        <span className="breadcrumb-separator">/</span>
        <span className="current-page">{product.name}</span>
      </div>
      
      <div className="product-details">
        <div className="product-gallery">
          <div className="main-image">
            <img 
              src={images[activeImage]} 
              alt={product.name} 
              className="product-main-image"
            />
          </div>
          
          {images.length > 1 && (
            <div className="image-thumbnails">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={image} alt={`${product.name} - Image ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            {product.brand && (
              <div className="product-brand">
                <span className="meta-label">Brand:</span> {product.brand}
              </div>
            )}
            
            {product.model && (
              <div className="product-model">
                <span className="meta-label">Model:</span> {product.model}
              </div>
            )}
            
            <div className="product-sku">
              <span className="meta-label">SKU:</span> {product.sku || 'N/A'}
            </div>
          </div>
          
          <div className="product-price-container">
            {product.discount_percentage > 0 ? (
              <>
                <div className="original-price">${product.price.toFixed(2)}</div>
                <div className="discounted-price">
                  ${(product.price * (1 - product.discount_percentage / 100)).toFixed(2)}
                  <span className="discount-badge">{product.discount_percentage}% OFF</span>
                </div>
              </>
            ) : (
              <div className="product-price">${product.price.toFixed(2)}</div>
            )}
          </div>
          
          <div className="product-availability">
            <span className={`availability-badge ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
              {product.in_stock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          <div className="product-description">
            <h2>Description</h2>
            <p>{product.description}</p>
          </div>
          
          {product.specifications && (
            <div className="product-specifications">
              <h2>Specifications</h2>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <div className="spec-label">{key}</div>
                    <div className="spec-value">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.in_stock && (
            <div className="product-actions">
              <AddToCart product={product} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
