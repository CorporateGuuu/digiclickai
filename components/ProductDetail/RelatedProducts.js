import Image from 'next/image';
import React from 'react';
import Link from 'next/link';
import styles from './RelatedProducts.module.css';

const RelatedProducts = ({ categoryId, currentProductId }) => {
  // In a real implementation, related products would be fetched from an API
  // For demo purposes, we'll use mock data
  const mockRelatedProducts = [
    {
      id: 101,
      name: 'iPhone 13 Battery Replacement',
      slug: 'iphone-13-battery-replacement',
      price: 49.99,
      category: 'iPhone Parts',
      imageUrl: '/images/iphone-battery.svg'
    },
    {
      id: 102,
      name: 'iPhone 13 Pro Camera Module',
      slug: 'iphone-13-pro-camera-module',
      price: 89.99,
      category: 'iPhone Parts',
      imageUrl: '/images/iphone-camera.svg'
    },
    {
      id: 103,
      name: 'iPhone 13 Pro Max Screen Protector',
      slug: 'iphone-13-pro-max-screen-protector',
      price: 14.99,
      category: 'Accessories',
      imageUrl: '/images/screen-protector.svg'
    },
    {
      id: 104,
      name: 'iPhone Repair Tool Kit',
      slug: 'iphone-repair-tool-kit',
      price: 29.99,
      category: 'Tools',
      imageUrl: '/images/repair-tools.svg'
    }
  ];

  return (
    <div className={styles.relatedProducts}>
      <h2 className={styles.title}>Related Products</h2>
      
      <div className={styles.products}>
        {mockRelatedProducts.map(product => (
          <Link href={`/products/${product.slug}`} key={product.id} className={styles.product}>
            <div className={styles.imageContainer}>
              <img src={product.imageUrl} alt={product.name} className={styles.image} />
            </div>
            <div className={styles.content}>
              <div className={styles.category}>{product.category}</div>
              <h3 className={styles.name}>{product.name}</h3>
              <div className={styles.price}>${product.price.toFixed(2)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
