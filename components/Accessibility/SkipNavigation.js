import React from 'react';
import { useState } from 'react';
import styles from './SkipNavigation.module.css';

const SkipNavigation = () => {
  const [focused, setFocused] = useState(false);

  const skipLinks = [
    {
      href: '#main-content',
      text: 'Skip to main content',
      key: 'main'
    },
    {
      href: '#navigation',
      text: 'Skip to navigation',
      key: 'nav'
    },
    {
      href: '#cursor-demo',
      text: 'Skip to cursor demonstration',
      key: 'cursor'
    },
    {
      href: '#contact-form',
      text: 'Skip to contact form',
      key: 'contact'
    },
    {
      href: '#footer',
      text: 'Skip to footer',
      key: 'footer'
    }
  ];

  const handleSkipClick = (e, targetId) => {
    e.preventDefault();

    const target = document.querySelector(targetId);
    if (target) {
      // Set tabindex to make it focusable
      target.setAttribute('tabindex', '-1');

      // Focus the target element
      target.focus();

      // Scroll to target with smooth behavior (unless reduced motion is preferred)
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });

      // Announce the skip action to screen readers
      const liveRegion = document.getElementById('aria-live-region');
      if (liveRegion) {
        const targetLabel = target.getAttribute('aria-label') ||
                           target.getAttribute('title') ||
                           target.textContent?.trim().substring(0, 50) ||
                           'content';
        liveRegion.textContent = `Skipped to ${targetLabel}`;
      }
    }
  };

  return (
    <nav
      className={`${styles.skipNavContainer} ${focused ? styles.focused : ''}`}
      aria-label="Skip navigation links"
      role="navigation"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <ul className={styles.skipList}>
        {skipLinks.map((link) => (
          <li key={link.key} className={styles.skipItem}>
            <a
              href={link.href}
              className={styles.skipNavLink}
              onClick={(e) => handleSkipClick(e, link.href)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSkipClick(e, link.href);
                }
              }}
            >
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SkipNavigation;
