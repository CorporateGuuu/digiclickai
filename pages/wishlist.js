import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout/Layout';
import styles from '../styles/Wishlist.module.css';

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        setError(null);

        // If user is not authenticated, use mock data
        if (status === 'unauthenticated') {
          // Get wishlist from localStorage
          const storedWishlist = localStorage.getItem('wishlistItems');
          const items = storedWishlist ? JSON.parse(storedWishlist) : [];
          setWishlistItems(items);
          setLoading(false);
          return;
        }

        // For authenticated users, we would fetch from API
        // For now, using mock data
        const mockWishlistItems = [
          {
            id: 1,
            product_id: 1,
            name: 'iPhone 13 Pro LCD Screen',
            slug: 'iphone-13-pro-lcd-screen',
            category: 'iPhone Parts',
            price: 89.99,
            discount_percentage: 10,
            image_url: '/images/products/iphone-screen.jpg',
            added_at: '2023-05-15T10:30:00Z'
          },
          {
            id: 2,
            product_id: 2,
            name: 'Samsung Galaxy S22 Battery',
            slug: 'samsung-galaxy-s22-battery',
            category: 'Samsung Parts',
            price: 39.99,
            discount_percentage: 0,
            image_url: '/images/products/samsung-battery.jpg',
            added_at: '2023-05-16T14:45:00Z'
          },
          {
            id: 3,
            product_id: 3,
            name: 'Professional Repair Tool Kit',
            slug: 'professional-repair-tool-kit',
            category: 'Repair Tools',
            price: 129.99,
            discount_percentage: 15,
            image_url: '/images/products/repair-tools.jpg',
            added_at: '2023-05-18T09:15:00Z'
          },
          {
            id: 4,
            product_id: 5,
            name: 'iPad Pro 12.9" LCD Assembly',
            slug: 'ipad-pro-12-9-lcd-assembly',
            category: 'iPad Parts',
            price: 199.99,
            discount_percentage: 5,
            image_url: '/images/products/ipad-screen.jpg',
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

    fetchWishlist();
  }, [status]);

  const handleRemoveFromWishlist = (itemId) => {
    // In a real app, this would call an API to remove the item from the wishlist
    setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
    
    // If using localStorage for unauthenticated users
    if (status === 'unauthenticated') {
      const updatedWishlist = wishlistItems.filter(item => item.id !== itemId);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
    }
  };

  const handleAddToCart = async (item) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: item.product_id,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      const data = await response.json();
      
      if (data.success) {
        alert(`${item.name} added to cart!`);
      } else {
        throw new Error(data.message || 'Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistItems([]);
      
      // If using localStorage for unauthenticated users
      if (status === 'unauthenticated') {
        localStorage.setItem('wishlistItems', JSON.stringify([]));
      }
      
      // In a real app, this would call an API to clear the wishlist for authenticated users
    }
  };

  return (
    <Layout>
      <Head>
        <title>My Wishlist | MDTS - Midas Technical Solutions</title>
        <meta name="description" content="View and manage your saved items at MDTS - Midas Technical Solutions." />
      </Head>

      <main className="main-content">
        <div className="container">
          <div className={styles.wishlistContainer}>
            <div className={styles.wishlistHeader}>
              <div>
                <h1 className={styles.wishlistTitle}>My Wishlist</h1>
                <p className={styles.wishlistSubtitle}>Items you've saved for later</p>
              </div>

              {wishlistItems.length > 0 && (
                <button 
                  onClick={handleClearWishlist}
                  className={styles.clearWishlistButton}
                >
                  Clear Wishlist
                </button>
              )}
            </div>

            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your wishlist...</p>
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className={styles.retryButton}>
                  Try Again
                </button>
              </div>
            ) : wishlistItems.length === 0 ? (
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
            ) : (
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

                      <div className={styles.wishlistButtons}>
                        <Link href={`/products/${item.slug}`} className={styles.viewDetailsButton}>
                          View Details
                        </Link>
                        <button
                          className={styles.addToCartButton}
                          onClick={() => handleAddToCart(item)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </Layout>
  );
}
