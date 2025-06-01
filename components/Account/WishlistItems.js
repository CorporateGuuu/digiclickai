import React from 'react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import SocialShare from '../SocialShare/SocialShare';
import styles from '../../styles/Account.module.css';

const WishlistItems = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch wishlist items from an API
    const fetchWishlistItems = async () => {
      try {
        setLoading(true);

        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock wishlist data
        const mockWishlistItems = [
          {
            id: 1,
            product_id: 1,
            name: 'iPhone 13 Pro OLED Screen',
            slug: 'iphone-13-pro-oled-screen',
            category: 'iPhone Parts',
            price: 129.99,
            discount_percentage: 10,
            image_url: '/images/iphone-screen.svg',
            added_at: '2023-06-10T09:15:00Z'
          },
          {
            id: 2,
            product_id: 2,
            name: 'Professional Repair Tool Kit',
            slug: 'professional-repair-tool-kit',
            category: 'Tools',
            price: 89.99,
            discount_percentage: 0,
            image_url: '/images/repair-tools.svg',
            added_at: '2023-06-05T14:30:00Z'
          },
          {
            id: 3,
            product_id: 3,
            name: 'Samsung Galaxy S22 Battery',
            slug: 'samsung-galaxy-s22-battery',
            category: 'Samsung Parts',
            price: 39.99,
            discount_percentage: 15,
            image_url: '/images/samsung-battery.svg',
            added_at: '2023-05-28T11:45:00Z'
          },
          {
            id: 4,
            product_id: 5,
            name: 'iPad Pro 12.9" LCD Assembly',
            slug: 'ipad-pro-12-9-lcd-assembly',
            category: 'iPad Parts',
            price: 199.99,
            discount_percentage: 5,
            image_url: '/images/ipad-screen.svg',
            added_at: '2023-05-20T16:20:00Z'
          }
        ];

        setWishlistItems(mockWishlistItems);
      } catch (err) {
        console.error('Error fetching wishlist items:', err);
        setError('Failed to load wishlist items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  const handleRemoveFromWishlist = (itemId) => {
    // In a real app, this would call an API to remove the item from the wishlist
    setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
  };

  const handleAddToCart = (item) => {
    // In a real app, this would call an API to add the item to the cart
    alert(`Added ${item.name} to cart`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.emptyWishlist}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <h3>Your wishlist is empty</h3>
        <p>Save items you're interested in for later.</p>
        <Link href="/products" className={styles.browseProductsButton}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.wishlistHeader}>
        <div>
          <h2>My Wishlist</h2>
          <p>Items you've saved for later</p>
        </div>

        <div className={styles.shareWishlist}>
          <h4>Share Your Wishlist</h4>
          <SocialShare
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title="Check out my wishlist at MDTS - Midas Technical Solutions"
            description="Here are some products I'm interested in from MDTS - Midas Technical Solutions."
            platforms={['facebook', 'twitter', 'email', 'copy']}
          />
        </div>
      </div>

      <div className={styles.wishlistGrid}>
        {wishlistItems.map(item => (
          <div key={item.id} className={styles.wishlistCard}>
            <div className={styles.wishlistImageContainer}>
              <img
                src={item.image_url || '/images/placeholder.svg'}
                alt={item.name}
                className={styles.wishlistImage}
              />

              <button
                className={styles.removeWishlistItem}
                onClick={() => handleRemoveFromWishlist(item.id)}
                title="Remove from wishlist"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className={styles.wishlistContent}>
              <div className={styles.wishlistCategory}>{item.category}</div>

              <h3 className={styles.wishlistName}>
                <Link href={`/products/${item.slug}`}>
                  {item.name}
                </Link>
              </h3>

              <div className={styles.wishlistPrice}>
                {item.discount_percentage > 0 ? (
                  <>
                    <span className={styles.wishlistOriginalPrice}>
                      ${(item.price / (1 - item.discount_percentage / 100)).toFixed(2)}
                    </span>
                    <span className={styles.wishlistCurrentPrice}>${item.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className={styles.wishlistCurrentPrice}>${item.price.toFixed(2)}</span>
                )}
              </div>

              <div className={styles.wishlistActions}>
                <button
                  className={styles.addToCartFromWishlist}
                  onClick={() => handleAddToCart(item)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Add to Cart
                </button>

                <Link
                  href={`/products/${item.slug}`}
                  className={styles.viewProductFromWishlist}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistItems;
