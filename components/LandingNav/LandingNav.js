import React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './LandingNav.module.css';

const LandingNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className={styles.landingNav}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">MDTS</Link>
        </div>

        <div className={styles.searchBar}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className={styles.navLinks}>
          <Link href="/products">Products</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/lcd-buyback">LCD Buyback</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/auth/signin" className={styles.signInLink}>Sign In</Link>
        </div>

        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <button
          className={styles.closeButton}
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className={styles.mobileSearchBar}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className={styles.mobileMenuLinks}>
          <Link href="/products">Products</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/lcd-buyback">LCD Buyback</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/auth/signin">Sign In</Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;
