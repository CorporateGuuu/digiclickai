/**
 * DigiClick AI Page Transition Manager
 * GSAP-powered smooth page transitions with Next.js router integration
 * Maintains WCAG 2.1 AA compliance and 60fps performance
 */

import { gsap } from 'gsap';
import { getAccessibilityManager } from './accessibility-manager';
import { getTouchInteractionManager } from './touch-interaction-manager';

class PageTransitionManager {
  constructor() {
    this.isTransitioning = false;
    this.currentTransition = null;
    this.transitionDuration = 0.5;
    this.reducedMotion = false;
    this.transitionVariant = 'enhanced';
    this.preloadedRoutes = new Set();
    
    this.transitionVariants = {
      control: {
        duration: 0.3,
        ease: 'power2.out',
        effects: ['fade']
      },
      enhanced: {
        duration: 0.5,
        ease: 'power3.out',
        effects: ['fade', 'slide', 'stagger']
      },
      minimal: {
        duration: 0.2,
        ease: 'power1.out',
        effects: ['fade']
      },
      gaming: {
        duration: 0.8,
        ease: 'back.out(1.7)',
        effects: ['fade', 'slide', 'stagger', 'scale']
      }
    };
    
    this.init();
  }

  init() {
    this.detectMotionPreferences();
    this.setupEventListeners();
    this.setupGSAPDefaults();
    this.initializeTransitionElements();
  }

  detectMotionPreferences() {
    // Check system preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check accessibility manager settings
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      const status = accessibilityManager.getAccessibilityStatus();
      this.reducedMotion = this.reducedMotion || status.reducedMotion;
      
      // Get transition preferences from visual effects settings
      if (status.visualEffects) {
        this.transitionDuration = this.reducedMotion ? 0.1 : 
          (status.visualEffects.performanceMode === 'minimal' ? 0.2 : 0.5);
      }
    }
  }

  setupEventListeners() {
    // Listen for accessibility changes
    window.addEventListener('accessibility-reduce-motion', (e) => {
      this.reducedMotion = e.detail.enabled;
      this.updateTransitionSettings();
    });

    // Listen for visual effects changes
    window.addEventListener('visual-effects-changed', (e) => {
      this.updateTransitionSettings(e.detail.settings);
    });

    // Listen for A/B test variant changes
    window.addEventListener('ab-test-variant-changed', (e) => {
      this.transitionVariant = e.detail.variant;
      this.updateTransitionSettings();
    });

    // Listen for route changes
    if (typeof window !== 'undefined' && window.next && window.next.router) {
      const router = window.next.router;
      router.events.on('routeChangeStart', this.handleRouteChangeStart.bind(this));
      router.events.on('routeChangeComplete', this.handleRouteChangeComplete.bind(this));
      router.events.on('routeChangeError', this.handleRouteChangeError.bind(this));
    }
  }

  setupGSAPDefaults() {
    // Set GSAP defaults for performance
    gsap.defaults({
      duration: this.transitionDuration,
      ease: 'power2.out',
      force3D: true,
      lazy: false
    });

    // Register GSAP plugins if needed
    if (typeof window !== 'undefined') {
      gsap.config({
        nullTargetWarn: false,
        trialWarn: false
      });
    }
  }

  initializeTransitionElements() {
    // Create transition overlay
    if (typeof document !== 'undefined') {
      this.createTransitionOverlay();
      this.createLoadingIndicator();
    }
  }

  createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #121212 0%, rgba(0, 212, 255, 0.1) 50%, #121212 100%);
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      backdrop-filter: blur(0px);
      transition: backdrop-filter 0.3s ease;
    `;
    
    document.body.appendChild(overlay);
    this.transitionOverlay = overlay;
  }

  createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'page-transition-indicator';
    indicator.className = 'page-transition-indicator';
    indicator.innerHTML = `
      <div class="transition-spinner">
        <svg viewBox="0 0 100 100" class="transition-spinner-svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#00d4ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="60 40" />
        </svg>
      </div>
      <div class="transition-text" aria-live="polite">Loading...</div>
    `;
    
    indicator.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      text-align: center;
      color: #ffffff;
      font-family: 'Orbitron', monospace;
    `;
    
    document.body.appendChild(indicator);
    this.loadingIndicator = indicator;
  }

  updateTransitionSettings(visualEffectsSettings = null) {
    if (visualEffectsSettings) {
      // Update based on performance mode
      switch (visualEffectsSettings.performanceMode) {
        case 'minimal':
          this.transitionDuration = 0.2;
          this.transitionVariant = 'minimal';
          break;
        case 'reduced':
          this.transitionDuration = 0.3;
          break;
        default:
          this.transitionDuration = this.reducedMotion ? 0.1 : 0.5;
      }
    }

    // Update GSAP defaults
    gsap.defaults({ duration: this.transitionDuration });
  }

  async handleRouteChangeStart(url) {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Announce route change to screen readers
    this.announceRouteChange(`Navigating to ${this.getPageTitle(url)}`);
    
    // Start exit transition
    await this.startExitTransition();
    
    // Show loading indicator
    this.showLoadingIndicator();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('page-transition-start', {
      detail: { url, timestamp: Date.now() }
    }));
  }

  async handleRouteChangeComplete(url) {
    if (!this.isTransitioning) return;
    
    // Hide loading indicator
    this.hideLoadingIndicator();
    
    // Start enter transition
    await this.startEnterTransition();
    
    this.isTransitioning = false;
    
    // Announce completion to screen readers
    this.announceRouteChange(`Loaded ${this.getPageTitle(url)}`);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('page-transition-complete', {
      detail: { url, timestamp: Date.now() }
    }));
  }

  async handleRouteChangeError(err, url) {
    this.isTransitioning = false;
    
    // Hide loading indicator
    this.hideLoadingIndicator();
    
    // Reset page state
    await this.resetPageState();
    
    // Announce error to screen readers
    this.announceRouteChange(`Failed to load page. Please try again.`);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('page-transition-error', {
      detail: { error: err, url, timestamp: Date.now() }
    }));
  }

  async startExitTransition() {
    const variant = this.transitionVariants[this.transitionVariant] || this.transitionVariants.enhanced;
    const duration = this.reducedMotion ? 0.1 : variant.duration;
    
    // Show overlay
    gsap.set(this.transitionOverlay, { visibility: 'visible' });
    gsap.to(this.transitionOverlay, {
      opacity: 1,
      backdropFilter: 'blur(8px)',
      duration: duration * 0.5,
      ease: variant.ease
    });
    
    // Animate page content out
    const mainContent = document.querySelector('main, #__next > div, .page-content');
    if (mainContent && !this.reducedMotion) {
      if (variant.effects.includes('fade')) {
        gsap.to(mainContent, {
          opacity: 0,
          duration: duration * 0.7,
          ease: variant.ease
        });
      }
      
      if (variant.effects.includes('slide')) {
        gsap.to(mainContent, {
          y: -30,
          duration: duration * 0.7,
          ease: variant.ease
        });
      }
      
      if (variant.effects.includes('scale')) {
        gsap.to(mainContent, {
          scale: 0.95,
          duration: duration * 0.7,
          ease: variant.ease
        });
      }
    }
    
    // Wait for exit animation to complete
    await new Promise(resolve => setTimeout(resolve, duration * 700));
  }

  async startEnterTransition() {
    const variant = this.transitionVariants[this.transitionVariant] || this.transitionVariants.enhanced;
    const duration = this.reducedMotion ? 0.1 : variant.duration;
    
    // Get new page content
    const mainContent = document.querySelector('main, #__next > div, .page-content');
    
    if (mainContent && !this.reducedMotion) {
      // Set initial state
      gsap.set(mainContent, {
        opacity: 0,
        y: variant.effects.includes('slide') ? 30 : 0,
        scale: variant.effects.includes('scale') ? 1.05 : 1
      });
      
      // Animate content in
      gsap.to(mainContent, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: duration,
        ease: variant.ease
      });
      
      // Stagger child elements if enabled
      if (variant.effects.includes('stagger')) {
        const children = mainContent.querySelectorAll('.animate-in, .card, .section, h1, h2, h3');
        if (children.length > 0) {
          gsap.fromTo(children, 
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: duration * 0.8,
              stagger: 0.1,
              ease: variant.ease,
              delay: duration * 0.2
            }
          );
        }
      }
    } else if (mainContent) {
      // Immediate show for reduced motion
      gsap.set(mainContent, { opacity: 1, y: 0, scale: 1 });
    }
    
    // Hide overlay
    gsap.to(this.transitionOverlay, {
      opacity: 0,
      backdropFilter: 'blur(0px)',
      duration: duration * 0.5,
      ease: variant.ease,
      delay: duration * 0.3,
      onComplete: () => {
        gsap.set(this.transitionOverlay, { visibility: 'hidden' });
      }
    });
    
    // Wait for enter animation to complete
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  showLoadingIndicator() {
    if (this.reducedMotion) {
      gsap.set(this.loadingIndicator, { visibility: 'visible', opacity: 1 });
    } else {
      gsap.set(this.loadingIndicator, { visibility: 'visible' });
      gsap.to(this.loadingIndicator, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)'
      });
    }
    
    // Start spinner animation
    const spinner = this.loadingIndicator.querySelector('.transition-spinner-svg');
    if (spinner && !this.reducedMotion) {
      gsap.to(spinner, {
        rotation: 360,
        duration: 1,
        ease: 'none',
        repeat: -1
      });
    }
  }

  hideLoadingIndicator() {
    if (this.reducedMotion) {
      gsap.set(this.loadingIndicator, { visibility: 'hidden', opacity: 0 });
    } else {
      gsap.to(this.loadingIndicator, {
        opacity: 0,
        scale: 0.8,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(this.loadingIndicator, { visibility: 'hidden' });
        }
      });
    }
    
    // Stop spinner animation
    const spinner = this.loadingIndicator.querySelector('.transition-spinner-svg');
    if (spinner) {
      gsap.killTweensOf(spinner);
    }
  }

  async resetPageState() {
    // Reset all animations and show content
    const mainContent = document.querySelector('main, #__next > div, .page-content');
    if (mainContent) {
      gsap.set(mainContent, { opacity: 1, y: 0, scale: 1 });
    }
    
    // Hide overlay
    gsap.set(this.transitionOverlay, { visibility: 'hidden', opacity: 0 });
  }

  announceRouteChange(message) {
    // Update loading indicator text for screen readers
    const textElement = this.loadingIndicator?.querySelector('.transition-text');
    if (textElement) {
      textElement.textContent = message;
    }
    
    // Create temporary announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  getPageTitle(url) {
    // Extract page name from URL for announcements
    const path = url.split('/').filter(Boolean).pop() || 'home';
    return path.charAt(0).toUpperCase() + path.slice(1);
  }

  // Public API methods
  setTransitionVariant(variant) {
    if (this.transitionVariants[variant]) {
      this.transitionVariant = variant;
      this.updateTransitionSettings();
    }
  }

  setTransitionDuration(duration) {
    this.transitionDuration = Math.max(0.1, Math.min(1.0, duration));
    this.updateTransitionSettings();
  }

  preloadRoute(url) {
    if (!this.preloadedRoutes.has(url)) {
      // Preload route using Next.js router
      if (typeof window !== 'undefined' && window.next && window.next.router) {
        window.next.router.prefetch(url);
        this.preloadedRoutes.add(url);
      }
    }
  }

  isTransitionInProgress() {
    return this.isTransitioning;
  }

  getTransitionSettings() {
    return {
      variant: this.transitionVariant,
      duration: this.transitionDuration,
      reducedMotion: this.reducedMotion,
      availableVariants: Object.keys(this.transitionVariants)
    };
  }
}

// Create global instance
let pageTransitionManager = null;

export function getPageTransitionManager() {
  if (!pageTransitionManager) {
    pageTransitionManager = new PageTransitionManager();
  }
  return pageTransitionManager;
}

export function initializePageTransitions() {
  return getPageTransitionManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializePageTransitions();
  });
}

export default PageTransitionManager;
