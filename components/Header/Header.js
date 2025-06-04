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
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" style={{
            color: '#00d4ff',
            textDecoration: 'none',
            fontFamily: "'Orbitron', monospace",
            fontSize: '1.5rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: '#00d4ff' }}>DigiClick</span>
            <span style={{ color: '#7b2cbf' }}>AI</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/portfolio" className={styles.navLink}>Portfolio</Link>
          <Link href="/pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <span style={{ fontSize: '1.5rem', color: '#00d4ff' }}>☰</span>
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
          <li><Link href="/about">About</Link></li>
          <li><Link href="/portfolio">Portfolio</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li className={styles.mobileNavDivider}>Services</li>
          <li><Link href="/ai-automation">AI Automation</Link></li>
          <li><Link href="/web-design">Web Design</Link></li>
          <li><Link href="/analytics">Analytics Dashboard</Link></li>
          <li><Link href="/cursor-demo">Cursor Demo</Link></li>
          <li className={styles.mobileNavDivider}>Account</li>
          <li><Link href="/auth/signin">Sign In</Link></li>
          <li><Link href="/auth/register">Register</Link></li>
          <li><Link href="/dashboard">Dashboard</Link></li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
