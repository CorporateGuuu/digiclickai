import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './MainNavigation.module.css';

const MainNavigation = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change navigation bar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Check if the current route is active
  const isActive = (path) => {
    if (path === '/' && router.pathname === '/') {
      return true;
    }
    if (path !== '/' && router.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <nav className={`${styles.mainNav} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <Link href="/" className={styles.navLogo}>
          <span className={styles.logoText}>MDTS</span>
        </Link>

        {/* Main Navigation Links */}
        <div className={styles.navLinks}>
          <Link href="/categories" className={`${styles.navLink} ${isActive('/categories') ? styles.active : ''}`}>
            Categories
          </Link>
          <Link href="/products" className={`${styles.navLink} ${isActive('/products') ? styles.active : ''}`}>
            Products
          </Link>
          <Link href="/lcd-buyback" className={`${styles.navLink} ${isActive('/lcd-buyback') ? styles.active : ''}`}>
            LCD Buyback
          </Link>
          <Link href="/gapp" className={`${styles.navLink} ${isActive('/gapp') ? styles.active : ''}`}>
            Apple Parts Program
          </Link>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search for products..."
            className={styles.searchInput}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                router.push(`/search?q=${encodeURIComponent(e.target.value)}`);
              }
            }}
          />
          <button
            className={styles.searchButton}
            onClick={() => {
              const searchInput = document.querySelector(`.${styles.searchInput}`);
              if (searchInput && searchInput.value) {
                router.push(`/search?q=${encodeURIComponent(searchInput.value)}`);
              }
            }}
            aria-label="Search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className={styles.navActions}>
          {session ? (
            <Link href="/account" className={`${styles.navAction} ${isActive('/account') ? styles.active : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span className={styles.navActionText}>Account</span>
            </Link>
          ) : (
            <Link href="/auth/signin" className={`${styles.navAction} ${isActive('/auth/signin') ? styles.active : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              <span className={styles.navActionText}>Sign In</span>
            </Link>
          )}

          <Link href="/cart" className={`${styles.navAction} ${isActive('/cart') ? styles.active : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className={styles.navActionText}>Cart</span>
          </Link>

          {session && session.user.isAdmin && (
            <>
              <Link href="/admin" className={`${styles.navAction} ${isActive('/admin') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <span className={styles.navActionText}>Admin</span>
              </Link>
              <Link href="/supabase-test" className={`${styles.navAction} ${isActive('/supabase-test') ? styles.active : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                </svg>
                <span className={styles.navActionText}>Supabase</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;
