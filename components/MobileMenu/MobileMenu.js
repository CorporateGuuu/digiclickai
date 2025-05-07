import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import styles from './MobileMenu.module.css';

const MobileMenu = ({ isOpen, onClose }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  
  // Close menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      onClose();
    };
    
    router.events.on('routeChangeStart', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, onClose]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && e.target.classList.contains(styles.mobileMenuOverlay)) {
        onClose();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const toggleSubmenu = (submenu) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };
  
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className={styles.mobileMenuOverlay}>
      <div className={styles.mobileMenu}>
        <div className={styles.mobileMenuHeader}>
          <div className={styles.mobileMenuLogo}>
            <Link href="/">MDTS</Link>
          </div>
          
          <button className={styles.closeButton} onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.mobileMenuContent}>
          <nav className={styles.mobileNav}>
            <div className={styles.mobileNavItem}>
              <Link href="/" className={router.pathname === '/' ? styles.active : ''}>
                Home
              </Link>
            </div>
            
            <div className={styles.mobileNavItem}>
              <div 
                className={`${styles.mobileNavLink} ${activeSubmenu === 'products' ? styles.active : ''}`}
                onClick={() => toggleSubmenu('products')}
              >
                Products
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${activeSubmenu === 'products' ? styles.open : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              
              {activeSubmenu === 'products' && (
                <div className={styles.submenu}>
                  <Link href="/products" className={router.pathname === '/products' ? styles.active : ''}>
                    All Products
                  </Link>
                  <Link href="/categories/iphone-parts" className={router.asPath === '/categories/iphone-parts' ? styles.active : ''}>
                    iPhone Parts
                  </Link>
                  <Link href="/categories/samsung-parts" className={router.asPath === '/categories/samsung-parts' ? styles.active : ''}>
                    Samsung Parts
                  </Link>
                  <Link href="/categories/ipad-parts" className={router.asPath === '/categories/ipad-parts' ? styles.active : ''}>
                    iPad Parts
                  </Link>
                  <Link href="/categories/macbook-parts" className={router.asPath === '/categories/macbook-parts' ? styles.active : ''}>
                    MacBook Parts
                  </Link>
                  <Link href="/categories/repair-tools" className={router.asPath === '/categories/repair-tools' ? styles.active : ''}>
                    Repair Tools
                  </Link>
                </div>
              )}
            </div>
            
            <div className={styles.mobileNavItem}>
              <Link href="/lcd-buyback" className={router.pathname === '/lcd-buyback' ? styles.active : ''}>
                LCD Buyback
              </Link>
            </div>
            
            <div className={styles.mobileNavItem}>
              <div 
                className={`${styles.mobileNavLink} ${activeSubmenu === 'info' ? styles.active : ''}`}
                onClick={() => toggleSubmenu('info')}
              >
                Information
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${activeSubmenu === 'info' ? styles.open : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              
              {activeSubmenu === 'info' && (
                <div className={styles.submenu}>
                  <Link href="/about" className={router.pathname === '/about' ? styles.active : ''}>
                    About Us
                  </Link>
                  <Link href="/contact" className={router.pathname === '/contact' ? styles.active : ''}>
                    Contact
                  </Link>
                  <Link href="/faq" className={router.pathname === '/faq' ? styles.active : ''}>
                    FAQ
                  </Link>
                </div>
              )}
            </div>
            
            <div className={styles.mobileNavItem}>
              <div 
                className={`${styles.mobileNavLink} ${activeSubmenu === 'service' ? styles.active : ''}`}
                onClick={() => toggleSubmenu('service')}
              >
                Customer Service
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${styles.chevron} ${activeSubmenu === 'service' ? styles.open : ''}`}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
              
              {activeSubmenu === 'service' && (
                <div className={styles.submenu}>
                  <Link href="/shipping" className={router.pathname === '/shipping' ? styles.active : ''}>
                    Shipping
                  </Link>
                  <Link href="/returns" className={router.pathname === '/returns' ? styles.active : ''}>
                    Returns
                  </Link>
                  <Link href="/warranty" className={router.pathname === '/warranty' ? styles.active : ''}>
                    Warranty
                  </Link>
                </div>
              )}
            </div>
          </nav>
          
          <div className={styles.mobileMenuActions}>
            {session ? (
              <>
                <Link href="/account" className={styles.accountButton}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  My Account
                </Link>
                
                <button className={styles.signOutButton} onClick={handleSignOut}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/auth/signin" className={styles.signInButton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Sign In
              </Link>
            )}
            
            <Link href="/cart" className={styles.cartButton}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              View Cart
            </Link>
          </div>
          
          <div className={styles.mobileMenuContact}>
            <div className={styles.contactItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+1 (240) 351-0511</span>
            </div>
            
            <div className={styles.contactItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>support@mdtstech.store</span>
            </div>
            
            <div className={styles.contactItem}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>Mon-Fri 9AM-10PM EST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
