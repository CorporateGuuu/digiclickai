import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './Header.module.css';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${className}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={`${styles.logo} glow-text`}>
          <span className={styles.logoText}>DigiClick</span>
          <span className={styles.logoAccent}>AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} nav-link ${
                    router.pathname === item.href ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA Button */}
        <div className={styles.ctaContainer}>
          <Link href="/contact" className={`${styles.ctaButton} cta-button`}>
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`${styles.mobileMenuButton} ${isMenuOpen ? styles.open : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={isMenuOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`${styles.mobileNav} ${isMenuOpen ? styles.open : ''}`}>
        <nav className={styles.mobileNavContent}>
          <ul className={styles.mobileNavList}>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.mobileNavLink} nav-link ${
                    router.pathname === item.href ? styles.active : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className={`${styles.mobileCta} cta-button`}
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
