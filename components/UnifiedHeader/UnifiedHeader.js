import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './UnifiedHeader.module.css';
import ShippingCutoff from '../ShippingCutoff/ShippingCutoff';
import SearchBar from '../SearchBar/SearchBar';

const UnifiedHeader = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [scrollState, setScrollState] = useState({
    scrolled: false,
    lastScrollY: 0,
    hidden: false
  });

  // Define mega menu items with updated structure
  const megaMenuItems = [
    {
      id: 1,
      title: 'iPhone Parts',
      url: '/products?category=iphone-parts',
      submenu: [
        {
          id: 101,
          title: 'By Model',
          items: [
            { id: 1011, title: 'iPhone 15 Series', url: '/products?category=iphone-parts&subcategory=iphone-parts/iphone-15' },
            { id: 1012, title: 'iPhone 14 Series', url: '/products?category=iphone-parts&subcategory=iphone-parts/iphone-14' },
            { id: 1013, title: 'iPhone 13 Series', url: '/products?category=iphone-parts&subcategory=iphone-parts/iphone-13' },
            { id: 1014, title: 'iPhone 12 Series', url: '/products?category=iphone-parts&subcategory=iphone-parts/iphone-12' },
            { id: 1015, title: 'iPhone 11 Series', url: '/products?category=iphone-parts&model=iphone-11' },
            { id: 1016, title: 'iPhone X Series', url: '/products?category=iphone-parts&model=iphone-x' },
            { id: 1017, title: 'iPhone 8 Series', url: '/products?category=iphone-parts&model=iphone-8' },
            { id: 1018, title: 'iPhone 7 Series', url: '/products?category=iphone-parts&model=iphone-7' },
          ]
        },
        {
          id: 102,
          title: 'By Part Type',
          items: [
            { id: 1021, title: 'Screens & LCDs', url: '/products?category=iphone-parts&subcategory=iphone-parts/screens' },
            { id: 1022, title: 'Batteries', url: '/products?category=iphone-parts&subcategory=iphone-parts/batteries' },
            { id: 1023, title: 'Charging Ports', url: '/products?category=iphone-parts&subcategory=iphone-parts/charging-ports' },
            { id: 1024, title: 'Back Glass', url: '/products?category=iphone-parts&part=back-glass' },
            { id: 1025, title: 'Cameras', url: '/products?category=iphone-parts&part=camera' },
            { id: 1026, title: 'Speakers', url: '/products?category=iphone-parts&part=speaker' },
          ]
        },
        {
          id: 103,
          title: 'Featured',
          items: [
            { id: 1031, title: 'New Arrivals', url: '/products?category=iphone-parts&sort=newest' },
            { id: 1032, title: 'Best Sellers', url: '/products?category=iphone-parts&sort=bestselling' },
            { id: 1033, title: 'Special Offers', url: '/products?category=iphone-parts&discount=true' },
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Samsung Parts',
      url: '/products?category=samsung-parts',
      submenu: [
        {
          id: 201,
          title: 'By Model',
          items: [
            { id: 2011, title: 'Galaxy S Series', url: '/products?category=samsung-parts&subcategory=samsung-parts/galaxy-s' },
            { id: 2012, title: 'Galaxy Note Series', url: '/products?category=samsung-parts&subcategory=samsung-parts/galaxy-note' },
            { id: 2013, title: 'Galaxy A Series', url: '/products?category=samsung-parts&subcategory=samsung-parts/galaxy-a' },
            { id: 2014, title: 'Galaxy Z Series', url: '/products?category=samsung-parts&model=galaxy-z' },
            { id: 2015, title: 'Galaxy Tab Series', url: '/products?category=samsung-parts&model=galaxy-tab' },
          ]
        },
        {
          id: 202,
          title: 'By Part Type',
          items: [
            { id: 2021, title: 'Screens & LCDs', url: '/products?category=samsung-parts&subcategory=samsung-parts/screens' },
            { id: 2022, title: 'Batteries', url: '/products?category=samsung-parts&subcategory=samsung-parts/batteries' },
            { id: 2023, title: 'Charging Ports', url: '/products?category=samsung-parts&part=charging-port' },
            { id: 2024, title: 'Back Glass', url: '/products?category=samsung-parts&part=back-glass' },
            { id: 2025, title: 'Cameras', url: '/products?category=samsung-parts&part=camera' },
          ]
        },
        {
          id: 203,
          title: 'Featured',
          items: [
            { id: 2031, title: 'New Arrivals', url: '/products?category=samsung-parts&sort=newest' },
            { id: 2032, title: 'Best Sellers', url: '/products?category=samsung-parts&sort=bestselling' },
            { id: 2033, title: 'Special Offers', url: '/products?category=samsung-parts&discount=true' },
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'iPad Parts',
      url: '/products?category=ipad-parts',
      submenu: [
        {
          id: 301,
          title: 'By Model',
          items: [
            { id: 3011, title: 'iPad Pro', url: '/products?category=ipad-parts&subcategory=ipad-parts/ipad-pro' },
            { id: 3012, title: 'iPad Air', url: '/products?category=ipad-parts&subcategory=ipad-parts/ipad-air' },
            { id: 3013, title: 'iPad Mini', url: '/products?category=ipad-parts&subcategory=ipad-parts/ipad-mini' },
            { id: 3014, title: 'iPad Standard', url: '/products?category=ipad-parts&model=ipad-standard' },
          ]
        },
        {
          id: 302,
          title: 'By Part Type',
          items: [
            { id: 3021, title: 'Screens & LCDs', url: '/products?category=ipad-parts&subcategory=ipad-parts/screens' },
            { id: 3022, title: 'Batteries', url: '/products?category=ipad-parts&part=battery' },
            { id: 3023, title: 'Charging Ports', url: '/products?category=ipad-parts&part=charging-port' },
            { id: 3024, title: 'Cameras', url: '/products?category=ipad-parts&part=camera' },
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'MacBook Parts',
      url: '/products?category=macbook-parts',
      submenu: [
        {
          id: 401,
          title: 'By Model',
          items: [
            { id: 4011, title: 'MacBook Pro', url: '/products?category=macbook-parts&subcategory=macbook-parts/macbook-pro' },
            { id: 4012, title: 'MacBook Air', url: '/products?category=macbook-parts&subcategory=macbook-parts/macbook-air' },
          ]
        },
        {
          id: 402,
          title: 'By Part Type',
          items: [
            { id: 4021, title: 'Screens', url: '/products?category=macbook-parts&subcategory=macbook-parts/screens' },
            { id: 4022, title: 'Keyboards', url: '/products?category=macbook-parts&subcategory=macbook-parts/keyboards' },
            { id: 4023, title: 'Batteries', url: '/products?category=macbook-parts&subcategory=macbook-parts/batteries' },
            { id: 4024, title: 'Trackpads', url: '/products?category=macbook-parts&part=trackpad' },
            { id: 4025, title: 'Logic Boards', url: '/products?category=macbook-parts&part=logic-board' },
          ]
        }
      ]
    },
    {
      id: 5,
      title: 'Repair Tools',
      url: '/products?category=repair-tools',
      submenu: [
        {
          id: 501,
          title: 'Tool Types',
          items: [
            { id: 5011, title: 'Tool Kits', url: '/products?category=repair-tools&subcategory=repair-tools/tool-kits' },
            { id: 5012, title: 'Screwdrivers', url: '/products?category=repair-tools&subcategory=repair-tools/screwdrivers' },
            { id: 5013, title: 'Heat Guns', url: '/products?category=repair-tools&subcategory=repair-tools/heat-guns' },
            { id: 5014, title: 'Soldering Equipment', url: '/products?category=repair-tools&subcategory=repair-tools/soldering' },
            { id: 5015, title: 'Adhesives & Tapes', url: '/products?category=repair-tools&subcategory=repair-tools/adhesives' },
          ]
        },
        {
          id: 502,
          title: 'By Brand',
          items: [
            { id: 5021, title: 'iFixit', url: '/products?category=repair-tools&brand=ifixit' },
            { id: 5022, title: 'MDTS Tools', url: '/products?category=repair-tools&brand=mdts' },
            { id: 5023, title: 'JAKEMY', url: '/products?category=repair-tools&brand=jakemy' },
            { id: 5024, title: 'QIANLI', url: '/products?category=repair-tools&brand=qianli' },
          ]
        },
        {
          id: 503,
          title: 'Featured',
          items: [
            { id: 5031, title: 'New Arrivals', url: '/products?category=repair-tools&sort=newest' },
            { id: 5032, title: 'Best Sellers', url: '/products?category=repair-tools&sort=bestselling' },
            { id: 5033, title: 'Special Offers', url: '/products?category=repair-tools&discount=true' },
          ]
        }
      ]
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Handle mega menu hover
  const handleMegaMenuHover = (id) => {
    setActiveMegaMenu(id);
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

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Handle scroll behavior for header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 50; // Minimum scroll before showing effects

      if (currentScrollY > scrollThreshold) {
        // User has scrolled down
        setScrollState(prevState => ({
          scrolled: true,
          hidden: currentScrollY > prevState.lastScrollY && currentScrollY > 150, // Hide when scrolling down and past 150px
          lastScrollY: currentScrollY
        }));
      } else {
        // User is at the top
        setScrollState({
          scrolled: false,
          hidden: false,
          lastScrollY: currentScrollY
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if we're already inside a header to prevent double headers
  const isInsideHeader = typeof window !== 'undefined' && document.querySelector('header header');

  return (
    <header
      className={`${styles.header} unified-header ${scrollState.scrolled ? styles.headerScrolled : ''} ${scrollState.hidden ? styles.headerHidden : ''}`}
      id="unified-header"
    >
      {/* Shipping Cutoff Timer */}
      <div className={styles.shippingCutoffContainer}>
        <ShippingCutoff />
      </div>

      {/* New header design */}
      <div className={styles.mainHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <Link href="/">MDTS</Link>
          </div>

          {/* Search Bar */}
          <div className={styles.searchBarContainer}>
            <SearchBar />
          </div>

          <nav className={styles.mainNav}>
            <ul className={styles.navList}>
              {/* Mega Menu Items */}
              {megaMenuItems.map((item) => (
                <li
                  key={item.id}
                  className={`${styles.navItem} ${styles.megaMenuItem}`}
                  onMouseEnter={() => handleMegaMenuHover(item.id)}
                  onMouseLeave={() => handleMegaMenuHover(null)}
                >
                  <Link
                    href={item.url}
                    className={router.asPath.includes(item.url) ? styles.active : ''}
                  >
                    {item.title}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevronDown}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <div className={`${styles.megaMenu} ${activeMegaMenu === item.id ? styles.active : ''}`}>
                    <div className={styles.megaMenuContainer}>
                      {item.submenu.map((section) => (
                        <div key={section.id} className={styles.megaMenuColumn}>
                          <h3 className={styles.megaMenuTitle}>{section.title}</h3>
                          <ul className={styles.megaMenuList}>
                            {section.items.map((subItem) => (
                              <li key={subItem.id} className={styles.megaMenuItem}>
                                <Link href={subItem.url}>{subItem.title}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}

              {/* Other Nav Items */}
              <li className={styles.navItem}>
                <Link href="/lcd-buyback" className={router.pathname === '/lcd-buyback' ? styles.active : ''}>
                  LCD Buyback
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/gapp" className={router.pathname === '/gapp' ? styles.active : ''}>
                  Apple Parts Program
                </Link>
              </li>
            </ul>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/cart" className={styles.cartLink}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span>Cart</span>
            </Link>

            <div className={styles.accountDropdown} ref={dropdownRef}>
              <button
                className={styles.accountButton}
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Account</span>
              </button>

              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {session ? (
                    <>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {session.user.name || session.user.email}
                        </span>
                      </div>
                      <Link href="/user/profile" className={styles.dropdownItem}>
                        My Profile
                      </Link>
                      <Link href="/user/orders" className={styles.dropdownItem}>
                        My Orders
                      </Link>
                      <Link href="/wishlist" className={styles.dropdownItem}>
                        My Wishlist
                      </Link>
                      <div className={styles.dropdownDivider}></div>
                      <button
                        className={styles.signOutButton}
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/signin" className={styles.dropdownItem}>
                        Sign In
                      </Link>
                      <Link href="/auth/register" className={styles.dropdownItem}>
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className={styles.mobileMenuToggle}
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Only visible on mobile */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.mobileMenuContent}>
          <div className={styles.mobileMenuHeader}>
            <div className={styles.mobileLogo}>
              <Link href="/">MDTS</Link>
            </div>
            <button
              className={styles.mobileCloseButton}
              onClick={toggleMobileMenu}
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.mobileSearch}>
            <SearchBar />
          </div>

          <nav className={styles.mobileNav}>
            <div className={styles.mobileNavSection}>
              <h3 className={styles.mobileNavTitle}>Main Menu</h3>
              <ul className={styles.mobileNavList}>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/lcd-buyback">LCD Buyback</Link></li>
                <li><Link href="/gapp">Apple Parts Program</Link></li>
              </ul>
            </div>

            {/* Generate mobile menu from megaMenuItems */}
            {megaMenuItems.map((item) => (
              <div key={item.id} className={styles.mobileNavSection}>
                <h3 className={styles.mobileNavTitle}>{item.title}</h3>
                <ul className={styles.mobileNavList}>
                  <li><Link href={item.url}>All {item.title}</Link></li>
                  {item.submenu.map((section) => (
                    section.items.slice(0, 3).map((subItem) => (
                      <li key={subItem.id}>
                        <Link href={subItem.url}>{subItem.title}</Link>
                      </li>
                    ))
                  ))}
                </ul>
              </div>
            ))}

            <div className={styles.mobileNavSection}>
              <h3 className={styles.mobileNavTitle}>Account</h3>
              <ul className={styles.mobileNavList}>
                {session ? (
                  <>
                    <li><Link href="/user/profile">My Profile</Link></li>
                    <li><Link href="/user/orders">My Orders</Link></li>
                    <li><Link href="/wishlist">My Wishlist</Link></li>
                    <li><Link href="/cart">My Cart</Link></li>
                    <li>
                      <button
                        className={styles.mobileSignOutButton}
                        onClick={() => signOut({ callbackUrl: '/' })}
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li><Link href="/auth/signin">Sign In</Link></li>
                    <li><Link href="/auth/register">Register</Link></li>
                    <li><Link href="/cart">Cart</Link></li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default UnifiedHeader;
