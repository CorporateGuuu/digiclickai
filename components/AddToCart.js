import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function AddToCart({ product, quantity: initialQuantity = 1 }) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };
  
  const addToCart = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Failed to add to cart');
      }
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
    <div className="add-to-cart">
      <div className="quantity-selector">
        <button 
          onClick={decreaseQuantity} 
          disabled={quantity <= 1}
          className="quantity-button"
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          className="quantity-input"
        />
        <button 
          onClick={increaseQuantity}
          className="quantity-button"
        >
          +
        </button>
      </div>
      
      <div className="add-to-cart-actions">
        <button 
          onClick={addToCart}
          disabled={loading}
          className="btn btn-primary add-to-cart-button"
        >
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
        
        <button 
          onClick={goToCart}
          className="btn btn-secondary go-to-cart-button"
        >
          View Cart
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <p>Product added to cart!</p>
        </div>
      )}
    </div>
  );
}
