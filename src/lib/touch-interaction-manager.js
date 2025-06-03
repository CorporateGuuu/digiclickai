/**
 * DigiClick AI Touch Interaction Manager
 * Handles touch-specific interactions, gestures, and device detection
 * Maintains WCAG 2.1 AA compliance and 60fps performance
 */

class TouchInteractionManager {
  constructor() {
    this.isTouch = false;
    this.isTablet = false;
    this.isMobile = false;
    this.supportsHaptics = false;
    this.gestureThreshold = 50; // pixels
    this.tapTimeout = 300; // ms
    this.doubleTapTimeout = 300; // ms
    
    this.touchStartTime = 0;
    this.lastTap = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.touchEndPos = { x: 0, y: 0 };
    
    this.init();
  }

  init() {
    this.detectDeviceCapabilities();
    this.setupTouchEventListeners();
    this.setupGestureHandlers();
    this.optimizeForDevice();
    this.setupHapticFeedback();
  }

  detectDeviceCapabilities() {
    // Enhanced touch detection
    this.isTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(hover: none)').matches
    );

    // Device type detection
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);

    // Mobile detection (more comprehensive)
    this.isMobile = (
      this.isTouch &&
      (maxDimension <= 896 || minDimension <= 414) &&
      (userAgent.includes('mobile') || 
       userAgent.includes('android') ||
       userAgent.includes('iphone') ||
       userAgent.includes('ipod'))
    );

    // Tablet detection
    this.isTablet = (
      this.isTouch &&
      !this.isMobile &&
      (maxDimension >= 768 && maxDimension <= 1366) &&
      (userAgent.includes('tablet') ||
       userAgent.includes('ipad') ||
       (userAgent.includes('android') && !userAgent.includes('mobile')))
    );

    // Haptic feedback support
    this.supportsHaptics = (
      'vibrate' in navigator ||
      ('hapticFeedback' in navigator) ||
      ('webkitVibrate' in navigator)
    );

    // Apply device classes to body
    document.body.classList.toggle('touch-device', this.isTouch);
    document.body.classList.toggle('non-touch-device', !this.isTouch);
    document.body.classList.toggle('mobile-device', this.isMobile);
    document.body.classList.toggle('tablet-device', this.isTablet);
    document.body.classList.toggle('desktop-device', !this.isTouch);

    console.log('Touch Interaction Manager - Device Detection:', {
      isTouch: this.isTouch,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      supportsHaptics: this.supportsHaptics,
      screenSize: `${screenWidth}x${screenHeight}`
    });
  }

  setupTouchEventListeners() {
    if (!this.isTouch) return;

    // Passive event listeners for better performance
    const passiveOptions = { passive: true };
    const activeOptions = { passive: false };

    // Touch start handler
    document.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    }, passiveOptions);

    // Touch move handler (prevent unwanted scrolling)
    document.addEventListener('touchmove', (e) => {
      this.handleTouchMove(e);
    }, activeOptions);

    // Touch end handler
    document.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
    }, passiveOptions);

    // Touch cancel handler
    document.addEventListener('touchcancel', (e) => {
      this.handleTouchCancel(e);
    }, passiveOptions);
  }

  handleTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartTime = Date.now();
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };

    // Add touch feedback class
    const target = e.target.closest('.touch-target, button, a, .clickable');
    if (target) {
      target.classList.add('touch-active');
      this.triggerHapticFeedback('light');
    }

    // Dispatch custom touch start event
    this.dispatchTouchEvent('touch-interaction-start', {
      position: this.touchStartPos,
      target: e.target,
      timestamp: this.touchStartTime
    });
  }

  handleTouchMove(e) {
    const touch = e.touches[0];
    const currentPos = { x: touch.clientX, y: touch.clientY };
    const distance = this.calculateDistance(this.touchStartPos, currentPos);

    // Remove touch feedback if moved too far
    if (distance > 10) {
      const activeElements = document.querySelectorAll('.touch-active');
      activeElements.forEach(el => el.classList.remove('touch-active'));
    }

    // Prevent scroll on certain elements
    const target = e.target.closest('.prevent-scroll, .modal, .panel');
    if (target) {
      e.preventDefault();
    }
  }

  handleTouchEnd(e) {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - this.touchStartTime;
    
    if (e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      this.touchEndPos = { x: touch.clientX, y: touch.clientY };
    }

    const distance = this.calculateDistance(this.touchStartPos, this.touchEndPos);
    const target = e.target.closest('.touch-target, button, a, .clickable');

    // Remove touch feedback
    const activeElements = document.querySelectorAll('.touch-active');
    activeElements.forEach(el => el.classList.remove('touch-active'));

    // Determine interaction type
    if (distance < 10 && touchDuration < this.tapTimeout) {
      this.handleTap(e, target);
    } else if (distance > this.gestureThreshold) {
      this.handleSwipe(e, this.touchStartPos, this.touchEndPos);
    }

    // Dispatch custom touch end event
    this.dispatchTouchEvent('touch-interaction-end', {
      startPos: this.touchStartPos,
      endPos: this.touchEndPos,
      duration: touchDuration,
      distance: distance,
      target: e.target
    });
  }

  handleTouchCancel(e) {
    // Remove touch feedback
    const activeElements = document.querySelectorAll('.touch-active');
    activeElements.forEach(el => el.classList.remove('touch-active'));

    this.dispatchTouchEvent('touch-interaction-cancel', {
      target: e.target,
      timestamp: Date.now()
    });
  }

  handleTap(e, target) {
    const now = Date.now();
    const timeSinceLastTap = now - this.lastTap;

    if (timeSinceLastTap < this.doubleTapTimeout) {
      // Double tap
      this.handleDoubleTap(e, target);
    } else {
      // Single tap
      this.handleSingleTap(e, target);
    }

    this.lastTap = now;
  }

  handleSingleTap(e, target) {
    if (target) {
      this.triggerHapticFeedback('medium');
      
      // Add tap animation
      this.addTapAnimation(target);
      
      // Dispatch custom tap event
      this.dispatchTouchEvent('single-tap', {
        target: target,
        position: this.touchEndPos
      });
    }
  }

  handleDoubleTap(e, target) {
    if (target) {
      this.triggerHapticFeedback('heavy');
      
      // Prevent default double-tap zoom
      e.preventDefault();
      
      // Dispatch custom double-tap event
      this.dispatchTouchEvent('double-tap', {
        target: target,
        position: this.touchEndPos
      });
    }
  }

  handleSwipe(e, startPos, endPos) {
    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;
    const direction = this.getSwipeDirection(deltaX, deltaY);

    this.triggerHapticFeedback('light');

    // Dispatch custom swipe event
    this.dispatchTouchEvent('swipe', {
      direction: direction,
      distance: this.calculateDistance(startPos, endPos),
      deltaX: deltaX,
      deltaY: deltaY,
      startPos: startPos,
      endPos: endPos
    });
  }

  setupGestureHandlers() {
    // Swipe navigation for modals and panels
    document.addEventListener('swipe', (e) => {
      const modal = e.target.closest('.modal, .panel, .accessibility-menu');
      if (modal && e.detail.direction === 'down') {
        // Close modal on swipe down
        const closeButton = modal.querySelector('.close-button, [aria-label*="close"]');
        if (closeButton) {
          closeButton.click();
        }
      }
    });

    // Pinch-to-zoom prevention on specific elements
    document.addEventListener('gesturestart', (e) => {
      const preventZoom = e.target.closest('.prevent-zoom, .modal, .panel');
      if (preventZoom) {
        e.preventDefault();
      }
    });
  }

  optimizeForDevice() {
    // Mobile-specific optimizations
    if (this.isMobile) {
      // Reduce animation complexity
      document.documentElement.style.setProperty('--animation-complexity', 'reduced');
      document.documentElement.style.setProperty('--mobile-animation-duration', '0.2s');
      
      // Optimize scroll performance
      document.body.style.webkitOverflowScrolling = 'touch';
      
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }

    // Tablet-specific optimizations
    if (this.isTablet) {
      document.documentElement.style.setProperty('--animation-complexity', 'normal');
      document.documentElement.style.setProperty('--tablet-animation-duration', '0.25s');
    }
  }

  setupHapticFeedback() {
    if (!this.supportsHaptics) return;

    // Create haptic feedback patterns
    this.hapticPatterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [50, 50, 50],
      warning: [20, 20, 20]
    };
  }

  triggerHapticFeedback(type = 'light') {
    if (!this.supportsHaptics) return;

    const pattern = this.hapticPatterns[type] || this.hapticPatterns.light;
    
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      } else if (navigator.webkitVibrate) {
        navigator.webkitVibrate(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }

  addTapAnimation(element) {
    element.classList.add('tap-animation');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      element.classList.remove('tap-animation');
    }, 200);
  }

  calculateDistance(pos1, pos2) {
    const deltaX = pos2.x - pos1.x;
    const deltaY = pos2.y - pos1.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  getSwipeDirection(deltaX, deltaY) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX > absDeltaY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  dispatchTouchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });
    
    document.dispatchEvent(event);
  }

  // Public API methods
  getDeviceInfo() {
    return {
      isTouch: this.isTouch,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      supportsHaptics: this.supportsHaptics,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  enableHapticFeedback() {
    this.supportsHaptics = true;
  }

  disableHapticFeedback() {
    this.supportsHaptics = false;
  }

  updateGestureThreshold(threshold) {
    this.gestureThreshold = Math.max(10, Math.min(100, threshold));
  }
}

// Create global instance
let touchInteractionManager = null;

export function getTouchInteractionManager() {
  if (!touchInteractionManager) {
    touchInteractionManager = new TouchInteractionManager();
  }
  return touchInteractionManager;
}

export function initializeTouchInteractions() {
  return getTouchInteractionManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeTouchInteractions();
  });
}

export default TouchInteractionManager;
