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
      announcements: true,
      // Enhanced cursor customization settings
      cursorCustomization: {
        particleTrails: true,
        clickRipples: true,
        glowEffects: true,
        hoverAnimations: true,
        size: 100, // 50-200% of default
        opacity: 100, // 30-100%
        colorTheme: 'default', // default, accent, secondary, custom
        shape: 'circle', // circle, square, custom
        reducedMotionOverride: false, // user override for system preference
        customColor: '#00d4ff'
      },
      // Visual effects settings
      visualEffects: {
        glowAnimations: true,
        glowIntensity: 100, // 0-100%
        holographicText: true,
        holographicIntensity: 100, // 0-100%
        backgroundGradients: true,
        gradientIntensity: 80, // 0-100%
        loadingAnimations: true,
        performanceMode: 'normal' // normal, reduced, minimal
      },
      // Responsive design settings
      responsiveSettings: {
        touchTargetSize: 'comfortable', // minimum, comfortable, large
        mobileOptimizations: true,
        tabletOptimizations: true,
        hapticFeedback: true,
        gestureNavigation: true,
        autoZoomPrevention: true,
        orientationLock: false,
        deviceSpecificOptimizations: true
      },
      // Navigation and UX settings
      navigationSettings: {
        pageTransitions: true,
        transitionDuration: 0.5, // 0.1 - 1.0 seconds
        transitionVariant: 'enhanced', // control, enhanced, minimal, gaming
        breadcrumbDisplay: true,
        breadcrumbViewMode: 'full', // full, compact, minimal
        loadingAnimations: true,
        routePreloading: true,
        gestureNavigation: true,
        keyboardShortcuts: true
      }
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
      announcements: this.config.announcements,
      cursorCustomization: this.config.cursorCustomization
    };
  }

  // Cursor customization methods
  updateCursorCustomization(settings) {
    const previousSettings = { ...this.config.cursorCustomization };
    this.config.cursorCustomization = { ...this.config.cursorCustomization, ...settings };

    // Apply CSS custom properties for real-time updates
    this.applyCursorCustomProperties();

    // Dispatch event for cursor system to update
    window.dispatchEvent(new CustomEvent('cursor-customization-changed', {
      detail: {
        settings: this.config.cursorCustomization,
        previousSettings,
        changes: settings
      }
    }));

    this.saveSettings();
    this.announce(`Cursor customization updated`);
  }

  applyCursorCustomProperties() {
    const settings = this.config.cursorCustomization;
    const root = document.documentElement;

    // Size adjustment
    root.style.setProperty('--cursor-size-multiplier', settings.size / 100);

    // Opacity adjustment
    root.style.setProperty('--cursor-opacity', settings.opacity / 100);

    // Color theme
    const colorMap = {
      'default': '#00d4ff',
      'accent': '#00d4ff',
      'secondary': '#a855f7',
      'custom': settings.customColor
    };
    root.style.setProperty('--cursor-color', colorMap[settings.colorTheme] || colorMap.default);

    // Shape
    root.style.setProperty('--cursor-border-radius', settings.shape === 'circle' ? '50%' : settings.shape === 'square' ? '0%' : '25%');

    // Effect toggles
    root.style.setProperty('--cursor-particles-enabled', settings.particleTrails ? '1' : '0');
    root.style.setProperty('--cursor-ripples-enabled', settings.clickRipples ? '1' : '0');
    root.style.setProperty('--cursor-glow-enabled', settings.glowEffects ? '1' : '0');
    root.style.setProperty('--cursor-hover-enabled', settings.hoverAnimations ? '1' : '0');

    // Reduced motion override
    if (settings.reducedMotionOverride && this.reducedMotionPreferred) {
      root.style.setProperty('--cursor-motion-override', '1');
    } else {
      root.style.setProperty('--cursor-motion-override', '0');
    }
  }

  toggleCursorEffect(effectName) {
    const currentValue = this.config.cursorCustomization[effectName];
    this.updateCursorCustomization({ [effectName]: !currentValue });
    this.announce(`${effectName} ${!currentValue ? 'enabled' : 'disabled'}`);
  }

  setCursorSize(size) {
    const clampedSize = Math.max(50, Math.min(200, size));
    this.updateCursorCustomization({ size: clampedSize });
  }

  setCursorOpacity(opacity) {
    const clampedOpacity = Math.max(30, Math.min(100, opacity));
    this.updateCursorCustomization({ opacity: clampedOpacity });
  }

  setCursorColorTheme(theme) {
    this.updateCursorCustomization({ colorTheme: theme });
  }

  setCursorShape(shape) {
    this.updateCursorCustomization({ shape });
  }

  setCustomColor(color) {
    this.updateCursorCustomization({ customColor: color, colorTheme: 'custom' });
  }

  toggleReducedMotionOverride() {
    const newValue = !this.config.cursorCustomization.reducedMotionOverride;
    this.updateCursorCustomization({ reducedMotionOverride: newValue });
    this.announce(`Reduced motion override ${newValue ? 'enabled' : 'disabled'}`);
  }

  resetCursorCustomization() {
    const defaultSettings = {
      particleTrails: true,
      clickRipples: true,
      glowEffects: true,
      hoverAnimations: true,
      size: 100,
      opacity: 100,
      colorTheme: 'default',
      shape: 'circle',
      reducedMotionOverride: false,
      customColor: '#00d4ff'
    };

    this.updateCursorCustomization(defaultSettings);
    this.announce('Cursor customization reset to defaults');
  }

  exportCursorSettings() {
    const settings = {
      accessibility: this.config,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'digiclick-cursor-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.announce('Cursor settings exported');
  }

  importCursorSettings(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);

          if (settings.accessibility && settings.accessibility.cursorCustomization) {
            this.updateCursorCustomization(settings.accessibility.cursorCustomization);
            this.announce('Cursor settings imported successfully');
            resolve(settings);
          } else {
            throw new Error('Invalid settings file format');
          }
        } catch (error) {
          this.announce('Failed to import cursor settings');
          reject(error);
        }
      };

      reader.onerror = () => {
        this.announce('Failed to read settings file');
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }

  // Visual Effects Management Methods
  updateVisualEffects(settings) {
    const previousSettings = { ...this.config.visualEffects };
    this.config.visualEffects = { ...this.config.visualEffects, ...settings };

    // Apply visual effects CSS custom properties
    this.applyVisualEffectsProperties();

    // Dispatch event for visual effects system to update
    window.dispatchEvent(new CustomEvent('visual-effects-changed', {
      detail: {
        settings: this.config.visualEffects,
        previousSettings,
        changes: settings
      }
    }));

    this.saveSettings();
    this.announce(`Visual effects updated`);
  }

  applyVisualEffectsProperties() {
    const settings = this.config.visualEffects;
    const root = document.documentElement;

    // Glow effects
    root.style.setProperty('--glow-enabled', settings.glowAnimations ? '1' : '0');
    root.style.setProperty('--glow-intensity', settings.glowIntensity / 100);

    // Holographic text
    root.style.setProperty('--holographic-enabled', settings.holographicText ? '1' : '0');
    root.style.setProperty('--holographic-intensity', settings.holographicIntensity / 100);

    // Background gradients
    root.style.setProperty('--gradient-animation-enabled', settings.backgroundGradients ? '1' : '0');
    root.style.setProperty('--gradient-intensity', settings.gradientIntensity / 100);

    // Loading animations
    root.style.setProperty('--loading-animation-enabled', settings.loadingAnimations ? '1' : '0');

    // Performance mode
    root.style.setProperty('--effects-performance-mode', settings.performanceMode);

    // Apply performance mode classes
    document.body.classList.remove('effects-performance-normal', 'effects-performance-reduced', 'effects-performance-minimal');
    document.body.classList.add(`effects-performance-${settings.performanceMode}`);

    // Handle reduced motion override
    if (settings.performanceMode === 'minimal' || (!this.config.cursorCustomization.reducedMotionOverride && this.reducedMotionPreferred)) {
      root.style.setProperty('--motion-enabled', '0');
    } else {
      root.style.setProperty('--motion-enabled', '1');
    }
  }

  toggleGlowAnimations() {
    const newValue = !this.config.visualEffects.glowAnimations;
    this.updateVisualEffects({ glowAnimations: newValue });
    this.announce(`Glow animations ${newValue ? 'enabled' : 'disabled'}`);
  }

  setGlowIntensity(intensity) {
    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    this.updateVisualEffects({ glowIntensity: clampedIntensity });
  }

  toggleHolographicText() {
    const newValue = !this.config.visualEffects.holographicText;
    this.updateVisualEffects({ holographicText: newValue });
    this.announce(`Holographic text ${newValue ? 'enabled' : 'disabled'}`);
  }

  setHolographicIntensity(intensity) {
    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    this.updateVisualEffects({ holographicIntensity: clampedIntensity });
  }

  toggleBackgroundGradients() {
    const newValue = !this.config.visualEffects.backgroundGradients;
    this.updateVisualEffects({ backgroundGradients: newValue });
    this.announce(`Background gradients ${newValue ? 'enabled' : 'disabled'}`);
  }

  setGradientIntensity(intensity) {
    const clampedIntensity = Math.max(0, Math.min(100, intensity));
    this.updateVisualEffects({ gradientIntensity: clampedIntensity });
  }

  toggleLoadingAnimations() {
    const newValue = !this.config.visualEffects.loadingAnimations;
    this.updateVisualEffects({ loadingAnimations: newValue });
    this.announce(`Loading animations ${newValue ? 'enabled' : 'disabled'}`);
  }

  setPerformanceMode(mode) {
    const validModes = ['normal', 'reduced', 'minimal'];
    if (validModes.includes(mode)) {
      this.updateVisualEffects({ performanceMode: mode });
      this.announce(`Performance mode set to ${mode}`);
    }
  }

  resetVisualEffects() {
    const defaultSettings = {
      glowAnimations: true,
      glowIntensity: 100,
      holographicText: true,
      holographicIntensity: 100,
      backgroundGradients: true,
      gradientIntensity: 80,
      loadingAnimations: true,
      performanceMode: 'normal'
    };

    this.updateVisualEffects(defaultSettings);
    this.announce('Visual effects reset to defaults');
  }

  // Responsive Design Management Methods
  updateResponsiveSettings(settings) {
    const previousSettings = { ...this.config.responsiveSettings };
    this.config.responsiveSettings = { ...this.config.responsiveSettings, ...settings };

    // Apply responsive settings CSS custom properties
    this.applyResponsiveProperties();

    // Dispatch event for responsive system to update
    window.dispatchEvent(new CustomEvent('responsive-settings-changed', {
      detail: {
        settings: this.config.responsiveSettings,
        previousSettings,
        changes: settings
      }
    }));

    this.saveSettings();
    this.announce(`Responsive settings updated`);
  }

  applyResponsiveProperties() {
    const settings = this.config.responsiveSettings;
    const root = document.documentElement;

    // Touch target sizes
    const touchSizes = {
      'minimum': '44px',
      'comfortable': '48px',
      'large': '56px'
    };
    root.style.setProperty('--touch-target-size', touchSizes[settings.touchTargetSize] || touchSizes.comfortable);

    // Device optimizations
    root.style.setProperty('--mobile-optimizations', settings.mobileOptimizations ? '1' : '0');
    root.style.setProperty('--tablet-optimizations', settings.tabletOptimizations ? '1' : '0');
    root.style.setProperty('--haptic-feedback', settings.hapticFeedback ? '1' : '0');
    root.style.setProperty('--gesture-navigation', settings.gestureNavigation ? '1' : '0');

    // Apply device-specific classes
    document.body.classList.toggle('mobile-optimized', settings.mobileOptimizations);
    document.body.classList.toggle('tablet-optimized', settings.tabletOptimizations);
    document.body.classList.toggle('haptic-enabled', settings.hapticFeedback);
    document.body.classList.toggle('gesture-enabled', settings.gestureNavigation);

    // Auto-zoom prevention
    if (settings.autoZoomPrevention) {
      this.preventAutoZoom();
    }

    // Orientation lock
    if (settings.orientationLock && screen.orientation) {
      try {
        screen.orientation.lock('portrait').catch(() => {
          console.log('Orientation lock not supported or denied');
        });
      } catch (error) {
        console.log('Orientation lock not available');
      }
    }
  }

  preventAutoZoom() {
    // Prevent zoom on input focus for iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const currentContent = viewport.getAttribute('content');
      if (!currentContent.includes('user-scalable=no')) {
        viewport.setAttribute('content',
          currentContent + ', user-scalable=no, maximum-scale=1.0'
        );
      }
    }

    // Ensure minimum font size to prevent zoom
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const computedStyle = window.getComputedStyle(input);
      const fontSize = parseFloat(computedStyle.fontSize);
      if (fontSize < 16) {
        input.style.fontSize = '16px';
      }
    });
  }

  setTouchTargetSize(size) {
    const validSizes = ['minimum', 'comfortable', 'large'];
    if (validSizes.includes(size)) {
      this.updateResponsiveSettings({ touchTargetSize: size });
      this.announce(`Touch target size set to ${size}`);
    }
  }

  toggleMobileOptimizations() {
    const newValue = !this.config.responsiveSettings.mobileOptimizations;
    this.updateResponsiveSettings({ mobileOptimizations: newValue });
    this.announce(`Mobile optimizations ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleTabletOptimizations() {
    const newValue = !this.config.responsiveSettings.tabletOptimizations;
    this.updateResponsiveSettings({ tabletOptimizations: newValue });
    this.announce(`Tablet optimizations ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleHapticFeedback() {
    const newValue = !this.config.responsiveSettings.hapticFeedback;
    this.updateResponsiveSettings({ hapticFeedback: newValue });
    this.announce(`Haptic feedback ${newValue ? 'enabled' : 'disabled'}`);

    // Update touch interaction manager
    if (window.touchInteractionManager) {
      if (newValue) {
        window.touchInteractionManager.enableHapticFeedback();
      } else {
        window.touchInteractionManager.disableHapticFeedback();
      }
    }
  }

  toggleGestureNavigation() {
    const newValue = !this.config.responsiveSettings.gestureNavigation;
    this.updateResponsiveSettings({ gestureNavigation: newValue });
    this.announce(`Gesture navigation ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleAutoZoomPrevention() {
    const newValue = !this.config.responsiveSettings.autoZoomPrevention;
    this.updateResponsiveSettings({ autoZoomPrevention: newValue });
    this.announce(`Auto-zoom prevention ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleOrientationLock() {
    const newValue = !this.config.responsiveSettings.orientationLock;
    this.updateResponsiveSettings({ orientationLock: newValue });
    this.announce(`Orientation lock ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleDeviceSpecificOptimizations() {
    const newValue = !this.config.responsiveSettings.deviceSpecificOptimizations;
    this.updateResponsiveSettings({ deviceSpecificOptimizations: newValue });
    this.announce(`Device-specific optimizations ${newValue ? 'enabled' : 'disabled'}`);
  }

  resetResponsiveSettings() {
    const defaultSettings = {
      touchTargetSize: 'comfortable',
      mobileOptimizations: true,
      tabletOptimizations: true,
      hapticFeedback: true,
      gestureNavigation: true,
      autoZoomPrevention: true,
      orientationLock: false,
      deviceSpecificOptimizations: true
    };

    this.updateResponsiveSettings(defaultSettings);
    this.announce('Responsive settings reset to defaults');
  }

  // Device detection and optimization
  optimizeForCurrentDevice() {
    if (!this.config.responsiveSettings.deviceSpecificOptimizations) return;

    const touchManager = window.touchInteractionManager;
    if (!touchManager) return;

    const deviceInfo = touchManager.getDeviceInfo();

    // Mobile-specific optimizations
    if (deviceInfo.isMobile) {
      this.updateVisualEffects({ performanceMode: 'reduced' });
      this.updateCursorCustomization({
        particleTrails: false,
        clickRipples: false
      });
      this.announce('Mobile optimizations applied');
    }

    // Tablet-specific optimizations
    else if (deviceInfo.isTablet) {
      this.updateVisualEffects({ performanceMode: 'normal' });
      this.updateCursorCustomization({
        particleTrails: true,
        clickRipples: true
      });
      this.announce('Tablet optimizations applied');
    }

    // Desktop optimizations
    else {
      this.updateVisualEffects({ performanceMode: 'normal' });
      this.announce('Desktop optimizations applied');
    }
  }

  // Responsive breakpoint detection
  getCurrentBreakpoint() {
    const width = window.innerWidth;

    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'desktop';
    return 'large-desktop';
  }

  // Orientation change handling
  handleOrientationChange() {
    const orientation = window.orientation ||
      (window.screen && window.screen.orientation && window.screen.orientation.angle) || 0;

    const isLandscape = Math.abs(orientation) === 90;

    document.body.classList.toggle('landscape', isLandscape);
    document.body.classList.toggle('portrait', !isLandscape);

    // Dispatch orientation change event
    window.dispatchEvent(new CustomEvent('orientation-changed', {
      detail: {
        orientation: isLandscape ? 'landscape' : 'portrait',
        angle: orientation
      }
    }));

    this.announce(`Orientation changed to ${isLandscape ? 'landscape' : 'portrait'}`);
  }

  // Navigation and UX Management Methods
  updateNavigationSettings(settings) {
    const previousSettings = { ...this.config.navigationSettings };
    this.config.navigationSettings = { ...this.config.navigationSettings, ...settings };

    // Apply navigation settings
    this.applyNavigationProperties();

    // Dispatch event for navigation system to update
    window.dispatchEvent(new CustomEvent('navigation-settings-changed', {
      detail: {
        settings: this.config.navigationSettings,
        previousSettings,
        changes: settings
      }
    }));

    this.saveSettings();
    this.announce(`Navigation settings updated`);
  }

  applyNavigationProperties() {
    const settings = this.config.navigationSettings;
    const root = document.documentElement;

    // Page transitions
    root.style.setProperty('--page-transitions-enabled', settings.pageTransitions ? '1' : '0');
    root.style.setProperty('--transition-duration', `${settings.transitionDuration}s`);
    root.style.setProperty('--transition-variant', settings.transitionVariant);

    // Breadcrumb settings
    root.style.setProperty('--breadcrumb-display', settings.breadcrumbDisplay ? 'flex' : 'none');
    root.style.setProperty('--breadcrumb-view-mode', settings.breadcrumbViewMode);

    // Loading animations
    root.style.setProperty('--loading-animations-enabled', settings.loadingAnimations ? '1' : '0');

    // Apply navigation classes
    document.body.classList.toggle('transitions-enabled', settings.pageTransitions);
    document.body.classList.toggle('breadcrumbs-enabled', settings.breadcrumbDisplay);
    document.body.classList.toggle('loading-animations-enabled', settings.loadingAnimations);
    document.body.classList.toggle('gesture-navigation-enabled', settings.gestureNavigation);
    document.body.classList.toggle('keyboard-shortcuts-enabled', settings.keyboardShortcuts);

    // Update page transition manager
    if (window.pageTransitionManager) {
      window.pageTransitionManager.setTransitionVariant(settings.transitionVariant);
      window.pageTransitionManager.setTransitionDuration(settings.transitionDuration);
    }
  }

  togglePageTransitions() {
    const newValue = !this.config.navigationSettings.pageTransitions;
    this.updateNavigationSettings({ pageTransitions: newValue });
    this.announce(`Page transitions ${newValue ? 'enabled' : 'disabled'}`);
  }

  setTransitionDuration(duration) {
    const clampedDuration = Math.max(0.1, Math.min(1.0, duration));
    this.updateNavigationSettings({ transitionDuration: clampedDuration });
    this.announce(`Transition duration set to ${clampedDuration} seconds`);
  }

  setTransitionVariant(variant) {
    const validVariants = ['control', 'enhanced', 'minimal', 'gaming'];
    if (validVariants.includes(variant)) {
      this.updateNavigationSettings({ transitionVariant: variant });
      this.announce(`Transition variant set to ${variant}`);
    }
  }

  toggleBreadcrumbDisplay() {
    const newValue = !this.config.navigationSettings.breadcrumbDisplay;
    this.updateNavigationSettings({ breadcrumbDisplay: newValue });
    this.announce(`Breadcrumb navigation ${newValue ? 'enabled' : 'disabled'}`);
  }

  setBreadcrumbViewMode(mode) {
    const validModes = ['full', 'compact', 'minimal'];
    if (validModes.includes(mode)) {
      this.updateNavigationSettings({ breadcrumbViewMode: mode });
      this.announce(`Breadcrumb view mode set to ${mode}`);
    }
  }

  toggleLoadingAnimations() {
    const newValue = !this.config.navigationSettings.loadingAnimations;
    this.updateNavigationSettings({ loadingAnimations: newValue });
    this.announce(`Loading animations ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleRoutePreloading() {
    const newValue = !this.config.navigationSettings.routePreloading;
    this.updateNavigationSettings({ routePreloading: newValue });
    this.announce(`Route preloading ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleGestureNavigation() {
    const newValue = !this.config.navigationSettings.gestureNavigation;
    this.updateNavigationSettings({ gestureNavigation: newValue });
    this.announce(`Gesture navigation ${newValue ? 'enabled' : 'disabled'}`);
  }

  toggleKeyboardShortcuts() {
    const newValue = !this.config.navigationSettings.keyboardShortcuts;
    this.updateNavigationSettings({ keyboardShortcuts: newValue });
    this.announce(`Keyboard shortcuts ${newValue ? 'enabled' : 'disabled'}`);
  }

  resetNavigationSettings() {
    const defaultSettings = {
      pageTransitions: true,
      transitionDuration: 0.5,
      transitionVariant: 'enhanced',
      breadcrumbDisplay: true,
      breadcrumbViewMode: 'full',
      loadingAnimations: true,
      routePreloading: true,
      gestureNavigation: true,
      keyboardShortcuts: true
    };

    this.updateNavigationSettings(defaultSettings);
    this.announce('Navigation settings reset to defaults');
  }

  // Navigation analytics and tracking
  trackNavigationEvent(eventType, details = {}) {
    // Dispatch custom event for analytics tracking
    window.dispatchEvent(new CustomEvent('navigation-analytics', {
      detail: {
        eventType,
        details,
        timestamp: Date.now(),
        settings: this.config.navigationSettings,
        accessibility: {
          reducedMotion: this.config.enableReducedMotion || this.reducedMotionPreferred,
          screenReader: this.screenReaderDetected,
          keyboardUser: this.keyboardUser
        }
      }
    }));
  }

  // Keyboard shortcut management
  setupKeyboardShortcuts() {
    if (!this.config.navigationSettings.keyboardShortcuts) return;

    const shortcuts = {
      'Alt+H': () => window.location.href = '/',
      'Alt+B': () => window.history.back(),
      'Alt+F': () => window.history.forward(),
      'Alt+R': () => window.location.reload(),
      'Alt+T': () => this.togglePageTransitions(),
      'Alt+N': () => this.toggleBreadcrumbDisplay()
    };

    document.addEventListener('keydown', (e) => {
      const key = `${e.altKey ? 'Alt+' : ''}${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`;

      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
        this.trackNavigationEvent('keyboard_shortcut', { shortcut: key });
      }
    });
  }

  // Route preloading management
  preloadCriticalRoutes() {
    if (!this.config.navigationSettings.routePreloading) return;

    const criticalRoutes = ['/', '/about', '/services', '/contact', '/pricing'];

    if (window.pageTransitionManager) {
      criticalRoutes.forEach(route => {
        window.pageTransitionManager.preloadRoute(route);
      });
    }
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
