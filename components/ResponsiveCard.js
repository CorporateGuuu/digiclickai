import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

function ResponsiveCard({ 
  product,
  imageHeight = 'auto',
  showCategory = true,
  showDescription = false,
  maxDescriptionLength = 100
}) {
  // Calculate discounted price if applicable
  const discountedPrice = product.discount_percentage > 0
    ? product.price * (1 - product.discount_percentage / 100)
    : null;
  
  // Truncate description if needed
  const truncatedDescription = product.description && showDescription
    ? product.description.length > maxDescriptionLength
      ? `${product.description.substring(0, maxDescriptionLength)}...`
      : product.description
    : null;
  
  return (
    <div className="responsive-card">
      <Link href={`/products/${product.slug}`} className="card-link">
        <div className="card-image" style={{ height: imageHeight }}>
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.name}
            loading="lazy"
          />
          
          {product.discount_percentage > 0 && (
            <div className="card-badge">
              {product.discount_percentage}% OFF
            </div>
          )}
        </div>
        
        <div className="card-content">
          {showCategory && product.category && (
            <div className="card-category">{product.category.name}</div>
          )}
          
          <h3 className="card-title">{product.name}</h3>
          
          {truncatedDescription && (
            <p className="card-description">{truncatedDescription}</p>
          )}
          
          <div className="card-price">
            {discountedPrice ? (
              <>
                <span className="original-price">${product.price.toFixed(2)}</span>
                <span className="discounted-price">${discountedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <div className="card-actions">
            <button className="btn btn-primary">View Details</button>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default React.memo(ResponsiveCard);
