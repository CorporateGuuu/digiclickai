import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './MiniCart.module.css';

const MiniCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const cartRef = useRef(null);

  // Mock cart data for demo purposes
  const mockCartItems = [
    {
      id: 1,
      name: 'iPhone 13 Pro OLED Screen',
      price: 129.99,
      quantity: 1,
      image: '/images/iphone-screen.svg'
    },
    {
      id: 2,
      name: 'Professional Repair Tool Kit',
      price: 89.99,
      quantity: 1,
      image: '/images/repair-tools.svg'
    }
  ];

  useEffect(() => {
    // In a real implementation, this would fetch cart data from an API or localStorage
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setCartItems(mockCartItems);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // Close the mini cart when clicking outside
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className={styles.miniCart} ref={cartRef}>
      <button className={styles.cartButton} onClick={toggleCart}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span className={styles.cartCount}>{cartItems.length}</span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Your Cart ({cartItems.length})</h3>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <p>Your cart is empty</p>
              <Link href="/products" className={styles.shopButton}>
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.items}>
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <div className={styles.itemImage}>
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className={styles.itemDetails}>
                      <h4>{item.name}</h4>
                      <div className={styles.itemMeta}>
                        <span className={styles.itemPrice}>${item.price.toFixed(2)}</span>
                        <span className={styles.itemQuantity}>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <button className={styles.removeButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.footer}>
                <div className={styles.subtotal}>
                  <span>Subtotal:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <Link href="/cart" className={styles.viewCartButton}>
                  View Cart
                </Link>
                <Link href="/checkout" className={styles.checkoutButton}>
                  Checkout
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MiniCart;
