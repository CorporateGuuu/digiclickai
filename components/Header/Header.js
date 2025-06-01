import React from 'react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      {/* Placeholder for new header design */}
      <div className={styles.headerPlaceholder}>
        <div className={styles.logo}>
          <Link href="/">MDTS</Link>
        </div>

        {/* Mobile menu button - keeping this for mobile functionality */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <i className="fas fa-bars">☰</i>
        </button>
      </div>

      {/* Mobile Menu - keeping this for mobile functionality */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <button
          className={styles.closeButton}
          onClick={toggleMobileMenu}
          aria-label="Close menu"
        >
          <i className="fas fa-times">✕</i>
        </button>

        <ul className={styles.mobileNavLinks}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/products">Products</Link></li>
          <li><Link href="/categories">Categories</Link></li>
          <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
          <li><Link href="/trade-off">Trade-Off</Link></li>
          <li><Link href="/finance">Financing</Link></li>
          <li><Link href="/gapp">Apple Parts Program</Link></li>
          <li className={styles.mobileNavDivider}>Shop By Category</li>
          <li><Link href="/categories/iphone-parts">iPhone Parts</Link></li>
          <li><Link href="/categories/samsung-parts">Samsung Parts</Link></li>
          <li><Link href="/categories/ipad-parts">iPad Parts</Link></li>
          <li><Link href="/categories/macbook-parts">MacBook Parts</Link></li>
          <li><Link href="/categories/repair-tools">Repair Tools</Link></li>
          <li className={styles.mobileNavDivider}>Account</li>
          <li><Link href="/cart">Cart</Link></li>
          <li><Link href="/auth/signin">Sign In</Link></li>
          <li><Link href="/auth/register">Register</Link></li>
          <li><Link href="/user/orders">My Orders</Link></li>
          <li><Link href="/user/profile">My Profile</Link></li>
          <li><Link href="/wishlist">Wishlist</Link></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
