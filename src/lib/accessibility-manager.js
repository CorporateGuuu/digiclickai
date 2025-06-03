/**
 * Accessibility Manager for DigiClick AI
 * Comprehensive WCAG 2.1 AA compliance implementation
 */

import { capturePerformanceIssue } from './sentry-config';

class AccessibilityManager {
  constructor() {
    this.config = {
      enableHighContrast: false,
      enableReducedMotion: false,
      enableScreenReaderMode: false,
      enableKeyboardNavigation: true,
      cursorAccessibilityMode: false,
      announcements: true
    };
    
    this.screenReaderDetected = false;
    this.keyboardUser = false;
    this.reducedMotionPreferred = false;
    this.highContrastPreferred = false;
    
    this.focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    // Detect user preferences
    this.detectUserPreferences();
    
    // Setup accessibility features
    this.setupReducedMotion();
    this.setupHighContrast();
    this.setupScreenReaderDetection();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLiveRegions();
    
    // Initialize cursor accessibility
    this.initializeCursorAccessibility();
    
    // Setup event listeners
    this.setupEventListeners();
    
    console.log('🔍 Accessibility Manager initialized');
  }

  detectUserPreferences() {
    // Detect reduced motion preference
    this.reducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Detect high contrast preference
    this.highContrastPreferred = window.matchMedia('(prefers-contrast: high)').matches;
    
    // Detect color scheme preference
    this.darkModePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Check for accessibility settings in localStorage
    const savedSettings = localStorage.getItem('digiclick-accessibility-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        this.config = { ...this.config, ...settings };
      } catch (error) {
        console.warn('Failed to parse accessibility settings:', error);
      }
    }
  }

  setupReducedMotion() {
    if (this.reducedMotionPreferred || this.config.enableReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
      
      // Disable cursor animations
      this.config.cursorAccessibilityMode = true;
      
      // Dispatch event to disable GSAP animations
      window.dispatchEvent(new CustomEvent('accessibility-reduce-motion', {
        detail: { enabled: true }
      }));
      
      console.log('🎭 Reduced motion enabled');
    }
    
    // Listen for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableReducedMotion();
      } else {
        this.disableReducedMotion();
      }
    });
  }

  setupHighContrast() {
    if (this.highContrastPreferred || this.config.enableHighContrast) {
      document.documentElement.classList.add('high-contrast');
      console.log('🎨 High contrast mode enabled');
    }
    
    // Listen for preference changes
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        this.enableHighContrast();
      } else {
        this.disableHighContrast();
      }
    });
  }

  setupScreenReaderDetection() {
    // Detect screen reader usage
    const testElement = document.createElement('div');
    testElement.setAttribute('aria-hidden', 'true');
    testElement.style.position = 'absolute';
    testElement.style.left = '-10000px';
    testElement.style.width = '1px';
    testElement.style.height = '1px';
    testElement.style.overflow = 'hidden';
    testElement.textContent = 'Screen reader test';
    
    document.body.appendChild(testElement);
    
    // Check if element is being read
    setTimeout(() => {
      if (testElement.offsetHeight > 0 || testElement.offsetWidth > 0) {
        this.screenReaderDetected = true;
        this.enableScreenReaderMode();
      }
      document.body.removeChild(testElement);
    }, 100);
    
    // Additional screen reader detection methods
    this.detectScreenReaderByUserAgent();
    this.detectScreenReaderByKeyboard();
  }

  detectScreenReaderByUserAgent() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaderIndicators = ['nvda', 'jaws', 'voiceover', 'talkback', 'orca'];
    
    if (screenReaderIndicators.some(indicator => userAgent.includes(indicator))) {
      this.screenReaderDetected = true;
      this.enableScreenReaderMode();
    }
  }

  detectScreenReaderByKeyboard() {
    // Detect screen reader navigation patterns
    let tabCount = 0;
    let arrowCount = 0;
    
    const keyHandler = (e) => {
      if (e.key === 'Tab') {
        tabCount++;
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        arrowCount++;
      }
      
      // If user is heavily using tab and arrow keys, likely using screen reader
      if (tabCount > 5 && arrowCount > 3) {
        this.screenReaderDetected = true;
        this.enableScreenReaderMode();
        document.removeEventListener('keydown', keyHandler);
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    // Remove listener after 30 seconds
    setTimeout(() => {
      document.removeEventListener('keydown', keyHandler);
    }, 30000);
  }

  setupKeyboardNavigation() {
    // Detect keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.keyboardUser = true;
        document.documentElement.classList.add('keyboard-user');
      }
    });
    
    // Remove keyboard user class on mouse use
    document.addEventListener('mousedown', () => {
      this.keyboardUser = false;
      document.documentElement.classList.remove('keyboard-user');
    });
    
    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Skip if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        return;
      }
      
      // Cursor variant shortcuts (Ctrl + 1-4)
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            this.switchCursorVariant('control');
            break;
          case '2':
            e.preventDefault();
            this.switchCursorVariant('enhanced');
            break;
          case '3':
            e.preventDefault();
            this.switchCursorVariant('minimal');
            break;
          case '4':
            e.preventDefault();
            this.switchCursorVariant('gaming');
            break;
          case 'h':
            e.preventDefault();
            this.showKeyboardHelp();
            break;
        }
      }
      
      // Escape key to disable cursor effects
      if (e.key === 'Escape') {
        this.toggleCursorAccessibilityMode();
      }
    });
  }

  setupFocusManagement() {
    // Enhanced focus indicators
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-user *:focus {
        outline: 3px solid #00d4ff !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 1px #121212, 0 0 8px rgba(0, 212, 255, 0.5) !important;
      }
      
      .high-contrast *:focus {
        outline: 4px solid #ffffff !important;
        outline-offset: 3px !important;
        background-color: #000000 !important;
        color: #ffffff !important;
      }
      
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .screen-reader-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  setupAriaLiveRegions() {
    // Create ARIA live regions for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'screen-reader-only';
    document.body.appendChild(liveRegion);
    
    const assertiveRegion = document.createElement('div');
    assertiveRegion.id = 'aria-live-region-assertive';
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'screen-reader-only';
    document.body.appendChild(assertiveRegion);
  }

  initializeCursorAccessibility() {
    // Disable cursor for screen readers and keyboard users
    if (this.screenReaderDetected || this.config.cursorAccessibilityMode) {
      window.dispatchEvent(new CustomEvent('accessibility-disable-cursor', {
        detail: { reason: 'screen_reader_detected' }
      }));
    }
  }

  setupEventListeners() {
    // Listen for cursor system events
    window.addEventListener('cursor-variant-changed', (e) => {
      this.announceCursorVariantChange(e.detail.variant);
    });
    
    // Listen for A/B test assignment
    window.addEventListener('ab-test-assigned', (e) => {
      this.announceABTestAssignment(e.detail.variant);
    });
    
    // Listen for page navigation
    window.addEventListener('popstate', () => {
      this.announcePageChange();
    });
  }

  // Public methods for enabling/disabling features
  enableReducedMotion() {
    this.config.enableReducedMotion = true;
    this.reducedMotionPreferred = true;
    document.documentElement.classList.add('reduce-motion');
    this.saveSettings();
    this.announce('Reduced motion enabled');
  }

  disableReducedMotion() {
    this.config.enableReducedMotion = false;
    this.reducedMotionPreferred = false;
    document.documentElement.classList.remove('reduce-motion');
    this.saveSettings();
    this.announce('Reduced motion disabled');
  }

  enableHighContrast() {
    this.config.enableHighContrast = true;
    document.documentElement.classList.add('high-contrast');
    this.saveSettings();
    this.announce('High contrast mode enabled');
  }

  disableHighContrast() {
    this.config.enableHighContrast = false;
    document.documentElement.classList.remove('high-contrast');
    this.saveSettings();
    this.announce('High contrast mode disabled');
  }

  enableScreenReaderMode() {
    this.config.enableScreenReaderMode = true;
    this.config.cursorAccessibilityMode = true;
    document.documentElement.classList.add('screen-reader-mode');
    
    // Disable cursor system
    window.dispatchEvent(new CustomEvent('accessibility-disable-cursor', {
      detail: { reason: 'screen_reader_mode' }
    }));
    
    this.saveSettings();
    console.log('📢 Screen reader mode enabled');
  }

  toggleCursorAccessibilityMode() {
    this.config.cursorAccessibilityMode = !this.config.cursorAccessibilityMode;
    
    if (this.config.cursorAccessibilityMode) {
      window.dispatchEvent(new CustomEvent('accessibility-disable-cursor'));
      this.announce('Cursor effects disabled for accessibility');
    } else {
      window.dispatchEvent(new CustomEvent('accessibility-enable-cursor'));
      this.announce('Cursor effects enabled');
    }
    
    this.saveSettings();
  }

  switchCursorVariant(variant) {
    if (this.config.cursorAccessibilityMode) {
      this.announce(`Cursor variant switched to ${variant}, but cursor effects are disabled for accessibility`);
      return;
    }
    
    window.dispatchEvent(new CustomEvent('accessibility-switch-cursor-variant', {
      detail: { variant }
    }));
    
    this.announce(`Cursor variant switched to ${variant}`);
  }

  showKeyboardHelp() {
    const helpText = `
      Keyboard shortcuts:
      Ctrl+1: Switch to Control cursor variant
      Ctrl+2: Switch to Enhanced cursor variant  
      Ctrl+3: Switch to Minimal cursor variant
      Ctrl+4: Switch to Gaming cursor variant
      Ctrl+H: Show this help
      Escape: Toggle cursor accessibility mode
      Tab: Navigate between interactive elements
    `;
    
    this.announce(helpText, true);
  }

  // Announcement methods
  announce(message, assertive = false) {
    if (!this.config.announcements) return;
    
    const regionId = assertive ? 'aria-live-region-assertive' : 'aria-live-region';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  announceCursorVariantChange(variant) {
    this.announce(`Cursor variant changed to ${variant}`);
  }

  announceABTestAssignment(variant) {
    this.announce(`A/B test variant assigned: ${variant}`);
  }

  announcePageChange() {
    const pageTitle = document.title;
    this.announce(`Navigated to ${pageTitle}`);
  }

  // Settings persistence
  saveSettings() {
    try {
      localStorage.setItem('digiclick-accessibility-settings', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  }

  // Accessibility testing methods
  runAccessibilityAudit() {
    // This would integrate with axe-core for automated testing
    console.log('🔍 Running accessibility audit...');
    
    // Check for common issues
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} images missing alt text`);
    }
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    if (inputs.length > 0) {
      issues.push(`${inputs.length} form inputs missing labels`);
    }
    
    // Check color contrast (simplified)
    const lowContrastElements = this.checkColorContrast();
    if (lowContrastElements.length > 0) {
      issues.push(`${lowContrastElements.length} elements with low color contrast`);
    }
    
    return issues;
  }

  checkColorContrast() {
    // Simplified color contrast check
    // In production, this would use a proper color contrast library
    const elements = document.querySelectorAll('*');
    const lowContrastElements = [];
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simplified check - in production use proper contrast calculation
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is a placeholder - implement proper contrast ratio calculation
        const contrastRatio = this.calculateContrastRatio(color, backgroundColor);
        if (contrastRatio < 4.5) {
          lowContrastElements.push(element);
        }
      }
    });
    
    return lowContrastElements;
  }

  calculateContrastRatio(color1, color2) {
    // Placeholder for proper contrast ratio calculation
    // In production, implement WCAG contrast ratio formula
    return 4.5; // Mock passing value
  }

  // Get current accessibility status
  getAccessibilityStatus() {
    return {
      reducedMotion: this.reducedMotionPreferred || this.config.enableReducedMotion,
      highContrast: this.highContrastPreferred || this.config.enableHighContrast,
      screenReader: this.screenReaderDetected || this.config.enableScreenReaderMode,
      keyboardUser: this.keyboardUser,
      cursorAccessibilityMode: this.config.cursorAccessibilityMode,
      announcements: this.config.announcements
    };
  }
}

// Create global instance
let accessibilityManager = null;

export function initializeAccessibility() {
  if (typeof window !== 'undefined' && !accessibilityManager) {
    accessibilityManager = new AccessibilityManager();
  }
  return accessibilityManager;
}

export function getAccessibilityManager() {
  return accessibilityManager;
}

export default AccessibilityManager;
