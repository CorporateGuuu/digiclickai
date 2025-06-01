import React from 'react';
import { useState } from 'react';
import styles from './SkipNavigation.module.css';

const SkipNavigation = () => {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`${styles.skipNavContainer} ${focused ? styles.focused : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <a
        href="#main-content"
        className={styles.skipNavLink}
        onClick={(e) => {
          // Prevent default behavior
          e.preventDefault();

          // Find the main content element
          const mainContent = document.getElementById('main-content');

          // If found, focus and scroll to it
          if (mainContent) {
            mainContent.setAttribute('tabindex', '-1');
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        Skip to main content
      </a>

      <a
        href="#footer"
        className={styles.skipNavLink}
      >
        Skip to footer
      </a>

      <a
        href="#search"
        className={styles.skipNavLink}
        onClick={(e) => {
          // Prevent default behavior
          e.preventDefault();

          // Find the search input
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');

          // If found, focus it
          if (searchInput) {
            searchInput.focus();
          }
        }}
      >
        Skip to search
      </a>
    </div>
  );
};

export default SkipNavigation;
