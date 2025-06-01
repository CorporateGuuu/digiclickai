import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './FeaturedProducts.module.css';

const FeaturedProducts = ({ products }) => {
  return (
    <section className={styles.featuredProducts}>
      <h2 className={styles.title}>Featured Products</h2>
      <p className={styles.subtitle}>
        Discover our most popular repair parts and tools, trusted by professionals worldwide.
      </p>

      <div className={styles.products}>
        {products.map(product => (
          <div key={product.id} className={styles.product}>
            <div className={styles.imageContainer}>
              <img
                src={product.imageUrl || '/images/placeholder.png'}
                alt={product.name}
                className={styles.image}
              />
              {product.badge && (
                <div className={styles.badge}>{product.badge}</div>
              )}
            </div>

            <div className={styles.content}>
              <div className={styles.category}>{product.category}</div>
              <h3 className={styles.name}>{product.name}</h3>
              <div className={styles.price}>
                <span className={styles.salePrice}>${product.price.toFixed(2)}</span>
              </div>
              <Link href={`/products/${product.id}`} className={styles.viewAll}>
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Link href="/products" className={styles.viewAll}>
        View All Products
      </Link>
    </section>
  );
};

export default FeaturedProducts;
