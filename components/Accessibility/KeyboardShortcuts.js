import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './KeyboardShortcuts.module.css';

const KeyboardShortcuts = () => {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  
  // Define keyboard shortcuts
  const shortcuts = [
    { key: '?', description: 'Show/hide keyboard shortcuts' },
    { key: 'h', description: 'Go to home page' },
    { key: 'p', description: 'Go to products page' },
    { key: 'c', description: 'Go to cart' },
    { key: 'a', description: 'Go to account' },
    { key: 's', description: 'Focus search' },
    { key: 'Esc', description: 'Close dialogs or menus' }
  ];
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger shortcuts if no input element is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' || 
                             activeElement.isContentEditable;
      
      if (isInputFocused) return;
      
      // Handle keyboard shortcuts
      switch (e.key) {
        case '?':
          // Toggle help dialog
          setShowHelp(prev => !prev);
          break;
        case 'h':
          // Go to home page
          router.push('/');
          break;
        case 'p':
          // Go to products page
          router.push('/products');
          break;
        case 'c':
          // Go to cart
          router.push('/cart');
          break;
        case 'a':
          // Go to account
          router.push('/account');
          break;
        case 's':
          // Focus search
          const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.focus();
            e.preventDefault(); // Prevent 's' from being typed in the input
          }
          break;
        case 'Escape':
          // Close help dialog if open
          if (showHelp) {
            setShowHelp(false);
          }
          break;
        default:
          // No matching shortcut
          break;
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router, showHelp]);
  
  // Render help dialog
  if (!showHelp) return null;
  
  return (
    <div className={styles.shortcutsOverlay} onClick={() => setShowHelp(false)}>
      <div 
        className={styles.shortcutsDialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className={styles.shortcutsHeader}>
          <h2 id="keyboard-shortcuts-title">Keyboard Shortcuts</h2>
          <button 
            className={styles.closeButton}
            onClick={() => setShowHelp(false)}
            aria-label="Close keyboard shortcuts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.shortcutsList}>
          {shortcuts.map((shortcut, index) => (
            <div key={index} className={styles.shortcutItem}>
              <kbd className={styles.shortcutKey}>{shortcut.key}</kbd>
              <span className={styles.shortcutDescription}>{shortcut.description}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.shortcutsFooter}>
          <p>Press <kbd>?</kbd> to toggle this dialog</p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
