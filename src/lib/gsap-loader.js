/**
 * Optimized GSAP Loader for DigiClick AI
 * Conditional loading based on A/B variant and device type
 */

import { capturePerformanceIssue } from './sentry-config';

// GSAP loading cache
let gsapLoadingPromise = null;
let gsapLoadedModules = new Set();

// Device detection cache
let deviceType = null;
let isTouch = null;

// Performance tracking
const performanceMetrics = {
  loadStartTime: null,
  loadEndTime: null,
  variant: null,
  deviceType: null
};

/**
 * Detect device type and touch capability
 */
export function detectDevice() {
  if (typeof window === 'undefined') {
    return { type: 'server', isTouch: false };
  }
  
  if (deviceType !== null && isTouch !== null) {
    return { type: deviceType, isTouch };
  }
  
  // Touch detection
  isTouch = 'ontouchstart' in window || 
           navigator.maxTouchPoints > 0 || 
           navigator.msMaxTouchPoints > 0;
  
  // Device type detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
  
  if (isMobile && !isTablet) {
    deviceType = 'mobile';
  } else if (isTablet) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  return { type: deviceType, isTouch };
}

/**
 * Get cursor variant from A/B testing cookie
 */
export function getCursorVariant() {
  if (typeof document === 'undefined') {
    return 'control';
  }
  
  try {
    const cookies = document.cookie.split(';');
    const abCookie = cookies.find(cookie => 
      cookie.trim().startsWith('ab_cursor-theme-optimization')
    );
    
    if (abCookie) {
      return abCookie.split('=')[1]?.trim() || 'control';
    }
    
    return 'control';
  } catch (error) {
    console.warn('Failed to get cursor variant:', error);
    return 'control';
  }
}

/**
 * Determine if GSAP is needed for the current variant and device
 */
export function isGSAPNeeded(variant = null, device = null) {
  const currentVariant = variant || getCursorVariant();
  const currentDevice = device || detectDevice();
  
  // Don't load GSAP on touch devices (cursor disabled)
  if (currentDevice.isTouch) {
    return false;
  }
  
  // GSAP requirements by variant
  const gsapVariants = ['enhanced', 'gaming'];
  return gsapVariants.includes(currentVariant);
}

/**
 * Get required GSAP modules for variant
 */
export function getRequiredGSAPModules(variant) {
  const moduleMap = {
    control: [], // No GSAP needed
    minimal: [], // CSS-only animations
    enhanced: ['core', 'css'], // Basic GSAP for smooth animations
    gaming: ['core', 'css', 'motionPath', 'morphSVG'] // Full GSAP for advanced effects
  };
  
  return moduleMap[variant] || [];
}

/**
 * Load GSAP core library
 */
async function loadGSAPCore() {
  if (gsapLoadedModules.has('core')) {
    return window.gsap;
  }
  
  try {
    const { gsap } = await import('gsap');
    gsapLoadedModules.add('core');
    
    // Register with window for global access
    if (typeof window !== 'undefined') {
      window.gsap = gsap;
    }
    
    return gsap;
  } catch (error) {
    console.error('Failed to load GSAP core:', error);
    capturePerformanceIssue(
      'gsap_core_load_failed',
      0,
      1,
      {
        tags: { component: 'gsap_loader' },
        extra: { error: error.message }
      }
    );
    throw error;
  }
}

/**
 * Load GSAP CSS plugin
 */
async function loadGSAPCSS() {
  if (gsapLoadedModules.has('css')) {
    return;
  }
  
  try {
    await import('gsap/CSSPlugin');
    gsapLoadedModules.add('css');
  } catch (error) {
    console.error('Failed to load GSAP CSS plugin:', error);
    throw error;
  }
}

/**
 * Load GSAP MotionPath plugin (for gaming variant)
 */
async function loadGSAPMotionPath() {
  if (gsapLoadedModules.has('motionPath')) {
    return;
  }
  
  try {
    await import('gsap/MotionPathPlugin');
    gsapLoadedModules.add('motionPath');
  } catch (error) {
    console.error('Failed to load GSAP MotionPath plugin:', error);
    throw error;
  }
}

/**
 * Load GSAP MorphSVG plugin (for gaming variant)
 */
async function loadGSAPMorphSVG() {
  if (gsapLoadedModules.has('morphSVG')) {
    return;
  }
  
  try {
    // Note: MorphSVG requires GSAP membership
    await import('gsap/MorphSVGPlugin');
    gsapLoadedModules.add('morphSVG');
  } catch (error) {
    console.warn('MorphSVG plugin not available (requires GSAP membership):', error);
    // Don't throw error for optional plugin
  }
}

/**
 * Load required GSAP modules for variant
 */
export async function loadGSAPForVariant(variant = null, options = {}) {
  const currentVariant = variant || getCursorVariant();
  const device = detectDevice();
  
  // Performance tracking
  performanceMetrics.loadStartTime = performance.now();
  performanceMetrics.variant = currentVariant;
  performanceMetrics.deviceType = device.type;
  
  // Check if GSAP is needed
  if (!isGSAPNeeded(currentVariant, device)) {
    console.log(`🚀 GSAP not needed for variant: ${currentVariant}, device: ${device.type}, touch: ${device.isTouch}`);
    return null;
  }
  
  // Return existing promise if already loading
  if (gsapLoadingPromise) {
    return gsapLoadingPromise;
  }
  
  console.log(`📦 Loading GSAP for variant: ${currentVariant}`);
  
  gsapLoadingPromise = (async () => {
    try {
      const requiredModules = getRequiredGSAPModules(currentVariant);
      let gsap = null;
      
      // Load modules in sequence for better performance
      for (const module of requiredModules) {
        switch (module) {
          case 'core':
            gsap = await loadGSAPCore();
            break;
          case 'css':
            await loadGSAPCSS();
            break;
          case 'motionPath':
            await loadGSAPMotionPath();
            break;
          case 'morphSVG':
            await loadGSAPMorphSVG();
            break;
        }
      }
      
      // Performance tracking
      performanceMetrics.loadEndTime = performance.now();
      const loadTime = performanceMetrics.loadEndTime - performanceMetrics.loadStartTime;
      
      console.log(`✅ GSAP loaded for ${currentVariant} in ${Math.round(loadTime)}ms`);
      
      // Track performance if loading is slow
      if (loadTime > 500) {
        capturePerformanceIssue(
          'gsap_slow_loading',
          loadTime,
          500,
          {
            tags: { 
              variant: currentVariant,
              device_type: device.type
            },
            extra: {
              modules_loaded: Array.from(gsapLoadedModules),
              device_info: device
            }
          }
        );
      }
      
      // Dispatch custom event for cursor system
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gsap-loaded', {
          detail: {
            variant: currentVariant,
            modules: Array.from(gsapLoadedModules),
            loadTime: loadTime
          }
        }));
      }
      
      return gsap;
      
    } catch (error) {
      console.error('❌ GSAP loading failed:', error);
      
      capturePerformanceIssue(
        'gsap_loading_failed',
        0,
        1,
        {
          tags: { 
            variant: currentVariant,
            device_type: device.type
          },
          extra: {
            error: error.message,
            attempted_modules: getRequiredGSAPModules(currentVariant)
          }
        }
      );
      
      // Dispatch error event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('gsap-load-error', {
          detail: {
            variant: currentVariant,
            error: error.message
          }
        }));
      }
      
      throw error;
    }
  })();
  
  return gsapLoadingPromise;
}

/**
 * Preload GSAP for variants that will likely need it
 */
export function preloadGSAPIfNeeded() {
  if (typeof window === 'undefined') {
    return;
  }
  
  const variant = getCursorVariant();
  const device = detectDevice();
  
  // Preload for enhanced and gaming variants on non-touch devices
  if (isGSAPNeeded(variant, device)) {
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadGSAPForVariant(variant);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        loadGSAPForVariant(variant);
      }, 100);
    }
  }
}

/**
 * Get GSAP instance (load if needed)
 */
export async function getGSAP(variant = null) {
  const currentVariant = variant || getCursorVariant();
  
  // Return existing GSAP if already loaded
  if (typeof window !== 'undefined' && window.gsap && gsapLoadedModules.has('core')) {
    return window.gsap;
  }
  
  // Load GSAP if needed
  return await loadGSAPForVariant(currentVariant);
}

/**
 * Check if GSAP is loaded and ready
 */
export function isGSAPLoaded() {
  return typeof window !== 'undefined' && 
         window.gsap && 
         gsapLoadedModules.has('core');
}

/**
 * Get loading performance metrics
 */
export function getGSAPPerformanceMetrics() {
  return {
    ...performanceMetrics,
    loadTime: performanceMetrics.loadEndTime && performanceMetrics.loadStartTime
      ? performanceMetrics.loadEndTime - performanceMetrics.loadStartTime
      : null,
    modulesLoaded: Array.from(gsapLoadedModules),
    isLoaded: isGSAPLoaded()
  };
}

/**
 * Reset GSAP loader state (for testing)
 */
export function resetGSAPLoader() {
  gsapLoadingPromise = null;
  gsapLoadedModules.clear();
  deviceType = null;
  isTouch = null;
  
  Object.keys(performanceMetrics).forEach(key => {
    performanceMetrics[key] = null;
  });
}

/**
 * Create fallback cursor behavior for when GSAP fails to load
 */
export function createFallbackCursor() {
  if (typeof document === 'undefined') {
    return null;
  }
  
  console.log('🔄 Creating fallback cursor behavior');
  
  // Simple CSS-based cursor fallback
  const style = document.createElement('style');
  style.textContent = `
    .cursor-fallback {
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid #00d4ff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transition: transform 0.1s ease-out;
      mix-blend-mode: difference;
    }
    
    .cursor-fallback.hover {
      transform: scale(1.5);
      border-color: #7b2cbf;
    }
  `;
  
  document.head.appendChild(style);
  
  const cursor = document.createElement('div');
  cursor.className = 'cursor-fallback';
  document.body.appendChild(cursor);
  
  // Basic mouse tracking
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX - 10 + 'px';
    cursor.style.top = e.clientY - 10 + 'px';
  });
  
  // Hover effects
  document.addEventListener('mouseenter', (e) => {
    if (e.target.matches('.cta-button, .nav-link, button, a')) {
      cursor.classList.add('hover');
    }
  }, true);
  
  document.addEventListener('mouseleave', (e) => {
    if (e.target.matches('.cta-button, .nav-link, button, a')) {
      cursor.classList.remove('hover');
    }
  }, true);
  
  return cursor;
}
