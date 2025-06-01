import React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from './AddToCart.module.css';

const AddToCart = ({ product, quantity = 1 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const addToCart = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Call the API to add the product to the cart
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add product to cart');
      }

      // Show success message
      setSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToCart = () => {
    router.push('/cart');
  };

  return (
    <div className={styles.addToCartContainer}>
      <button
        className={`${styles.addToCartButton} ${loading ? styles.loading : ''}`}
        onClick={addToCart}
        disabled={loading || product.stock_status === 'Out of Stock'}
      >
        {loading ? (
          <>
            <span className={styles.spinner}></span>
            Adding...
          </>
        ) : product.stock_status === 'Out of Stock' ? (
          'Out of Stock'
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            Add to Cart
          </>
        )}
      </button>

      <button
        className={styles.buyNowButton}
        onClick={goToCart}
        disabled={loading || product.stock_status === 'Out of Stock'}
      >
        Buy Now
      </button>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>Added to cart!</div>}
    </div>
  );
};

export default AddToCart;
