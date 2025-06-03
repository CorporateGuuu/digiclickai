/**
 * DigiClick AI Progressive Enhancement Manager
 * Provides fallbacks and polyfills for older browsers
 * Maintains functionality across all supported browser versions
 */

class ProgressiveEnhancementManager {
  constructor() {
    this.browserSupport = {
      cssCustomProperties: false,
      cssGrid: false,
      flexbox: false,
      svgAnimations: false,
      intersectionObserver: false,
      customElements: false,
      es6Modules: false,
      asyncAwait: false,
      fetch: false,
      promises: false
    };
    
    this.browserInfo = {
      name: '',
      version: '',
      engine: '',
      isModern: false,
      needsPolyfills: false
    };
    
    this.init();
  }

  init() {
    this.detectBrowser();
    this.detectFeatureSupport();
    this.applyProgressiveEnhancements();
    this.loadPolyfillsIfNeeded();
    this.setupFallbacks();
  }

  detectBrowser() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    // Chrome
    if (userAgent.includes('Chrome') && vendor.includes('Google')) {
      this.browserInfo.name = 'Chrome';
      this.browserInfo.engine = 'Blink';
      const match = userAgent.match(/Chrome\/(\d+)/);
      this.browserInfo.version = match ? parseInt(match[1]) : 0;
      this.browserInfo.isModern = this.browserInfo.version >= 90;
    }
    // Firefox
    else if (userAgent.includes('Firefox')) {
      this.browserInfo.name = 'Firefox';
      this.browserInfo.engine = 'Gecko';
      const match = userAgent.match(/Firefox\/(\d+)/);
      this.browserInfo.version = match ? parseInt(match[1]) : 0;
      this.browserInfo.isModern = this.browserInfo.version >= 88;
    }
    // Safari
    else if (userAgent.includes('Safari') && vendor.includes('Apple')) {
      this.browserInfo.name = 'Safari';
      this.browserInfo.engine = 'WebKit';
      const match = userAgent.match(/Version\/(\d+)/);
      this.browserInfo.version = match ? parseInt(match[1]) : 0;
      this.browserInfo.isModern = this.browserInfo.version >= 14;
    }
    // Edge
    else if (userAgent.includes('Edg')) {
      this.browserInfo.name = 'Edge';
      this.browserInfo.engine = 'Blink';
      const match = userAgent.match(/Edg\/(\d+)/);
      this.browserInfo.version = match ? parseInt(match[1]) : 0;
      this.browserInfo.isModern = this.browserInfo.version >= 90;
    }
    // Internet Explorer
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
      this.browserInfo.name = 'Internet Explorer';
      this.browserInfo.engine = 'Trident';
      const match = userAgent.match(/(?:MSIE |rv:)(\d+)/);
      this.browserInfo.version = match ? parseInt(match[1]) : 0;
      this.browserInfo.isModern = false;
      this.browserInfo.needsPolyfills = true;
    }
    
    // Apply browser classes
    document.documentElement.classList.add(
      `browser-${this.browserInfo.name.toLowerCase()}`,
      `engine-${this.browserInfo.engine.toLowerCase()}`,
      this.browserInfo.isModern ? 'modern-browser' : 'legacy-browser'
    );

    console.log('Progressive Enhancement - Browser Detection:', this.browserInfo);
  }

  detectFeatureSupport() {
    // CSS Custom Properties
    this.browserSupport.cssCustomProperties = window.CSS && CSS.supports('color', 'var(--test)');
    
    // CSS Grid
    this.browserSupport.cssGrid = CSS.supports('display', 'grid');
    
    // Flexbox
    this.browserSupport.flexbox = CSS.supports('display', 'flex');
    
    // SVG Animations
    this.browserSupport.svgAnimations = typeof SVGElement !== 'undefined' && 
      'animate' in SVGElement.prototype;
    
    // Intersection Observer
    this.browserSupport.intersectionObserver = 'IntersectionObserver' in window;
    
    // Custom Elements
    this.browserSupport.customElements = 'customElements' in window;
    
    // ES6 Modules
    this.browserSupport.es6Modules = 'noModule' in HTMLScriptElement.prototype;
    
    // Async/Await
    try {
      eval('async function test() {}');
      this.browserSupport.asyncAwait = true;
    } catch (e) {
      this.browserSupport.asyncAwait = false;
    }
    
    // Fetch API
    this.browserSupport.fetch = 'fetch' in window;
    
    // Promises
    this.browserSupport.promises = 'Promise' in window;

    console.log('Progressive Enhancement - Feature Support:', this.browserSupport);
  }

  applyProgressiveEnhancements() {
    // Apply feature support classes
    Object.keys(this.browserSupport).forEach(feature => {
      const className = this.browserSupport[feature] ? 
        `supports-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}` : 
        `no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      document.documentElement.classList.add(className);
    });

    // Apply browser-specific optimizations
    this.applyBrowserOptimizations();
  }

  applyBrowserOptimizations() {
    switch (this.browserInfo.name) {
      case 'Safari':
        this.applySafariOptimizations();
        break;
      case 'Firefox':
        this.applyFirefoxOptimizations();
        break;
      case 'Internet Explorer':
        this.applyIEOptimizations();
        break;
      default:
        this.applyChromiumOptimizations();
    }
  }

  applySafariOptimizations() {
    // Safari-specific CSS fixes
    const style = document.createElement('style');
    style.textContent = `
      /* Safari backface-visibility fix */
      .gpu-accelerated {
        -webkit-backface-visibility: hidden;
        -webkit-transform: translateZ(0);
      }
      
      /* Safari flexbox fixes */
      .flex-container {
        -webkit-flex-wrap: wrap;
      }
      
      /* Safari scroll fixes */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
  }

  applyFirefoxOptimizations() {
    // Firefox-specific optimizations
    const style = document.createElement('style');
    style.textContent = `
      /* Firefox scrollbar styling */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #00d4ff #121212;
      }
      
      /* Firefox animation performance */
      .animated-element {
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }

  applyIEOptimizations() {
    // Internet Explorer fallbacks
    const style = document.createElement('style');
    style.textContent = `
      /* IE flexbox fallbacks */
      .no-supports-css-grid .grid {
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
      }
      
      .no-supports-css-grid .grid > * {
        -ms-flex: 1 1 300px;
        flex: 1 1 300px;
      }
      
      /* IE custom properties fallback */
      .no-supports-css-custom-properties {
        --glow-color: #00d4ff;
        --secondary-color: #7b2cbf;
        --background-color: #121212;
      }
    `;
    document.head.appendChild(style);
  }

  applyChromiumOptimizations() {
    // Chrome/Edge optimizations
    const style = document.createElement('style');
    style.textContent = `
      /* Chromium performance optimizations */
      .gpu-accelerated {
        transform: translateZ(0);
        will-change: transform, opacity;
      }
      
      /* Chromium scroll optimizations */
      .smooth-scroll {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
  }

  loadPolyfillsIfNeeded() {
    const polyfillsNeeded = [];

    // CSS Custom Properties polyfill for IE
    if (!this.browserSupport.cssCustomProperties) {
      polyfillsNeeded.push(this.loadCSSCustomPropertiesPolyfill());
    }

    // Intersection Observer polyfill
    if (!this.browserSupport.intersectionObserver) {
      polyfillsNeeded.push(this.loadIntersectionObserverPolyfill());
    }

    // Fetch polyfill
    if (!this.browserSupport.fetch) {
      polyfillsNeeded.push(this.loadFetchPolyfill());
    }

    // Promise polyfill
    if (!this.browserSupport.promises) {
      polyfillsNeeded.push(this.loadPromisePolyfill());
    }

    return Promise.all(polyfillsNeeded);
  }

  loadCSSCustomPropertiesPolyfill() {
    return new Promise((resolve) => {
      // Simple CSS custom properties fallback
      const fallbackStyles = {
        '--glow-primary': '#00d4ff',
        '--glow-secondary': '#7b2cbf',
        '--glow-accent': '#a855f7',
        '--background-primary': '#121212',
        '--text-primary': '#ffffff',
        '--border-radius': '8px',
        '--spacing-small': '8px',
        '--spacing-medium': '16px',
        '--spacing-large': '24px'
      };

      // Apply fallback values
      Object.keys(fallbackStyles).forEach(property => {
        document.documentElement.style.setProperty(property, fallbackStyles[property]);
      });

      resolve();
    });
  }

  loadIntersectionObserverPolyfill() {
    return new Promise((resolve) => {
      if (window.IntersectionObserver) {
        resolve();
        return;
      }

      // Simple intersection observer polyfill
      window.IntersectionObserver = class {
        constructor(callback) {
          this.callback = callback;
          this.elements = new Set();
        }

        observe(element) {
          this.elements.add(element);
          // Immediately trigger callback for fallback
          this.callback([{
            target: element,
            isIntersecting: true,
            intersectionRatio: 1
          }]);
        }

        unobserve(element) {
          this.elements.delete(element);
        }

        disconnect() {
          this.elements.clear();
        }
      };

      resolve();
    });
  }

  loadFetchPolyfill() {
    return new Promise((resolve) => {
      if (window.fetch) {
        resolve();
        return;
      }

      // Simple fetch polyfill using XMLHttpRequest
      window.fetch = function(url, options = {}) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open(options.method || 'GET', url);
          
          if (options.headers) {
            Object.keys(options.headers).forEach(key => {
              xhr.setRequestHeader(key, options.headers[key]);
            });
          }

          xhr.onload = () => {
            resolve({
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              json: () => Promise.resolve(JSON.parse(xhr.responseText)),
              text: () => Promise.resolve(xhr.responseText)
            });
          };

          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(options.body);
        });
      };

      resolve();
    });
  }

  loadPromisePolyfill() {
    return new Promise((resolve) => {
      if (window.Promise) {
        resolve();
        return;
      }

      // Basic Promise polyfill
      window.Promise = class {
        constructor(executor) {
          this.state = 'pending';
          this.value = undefined;
          this.handlers = [];

          const resolve = (value) => {
            if (this.state === 'pending') {
              this.state = 'fulfilled';
              this.value = value;
              this.handlers.forEach(handler => handler.onFulfilled(value));
            }
          };

          const reject = (reason) => {
            if (this.state === 'pending') {
              this.state = 'rejected';
              this.value = reason;
              this.handlers.forEach(handler => handler.onRejected(reason));
            }
          };

          try {
            executor(resolve, reject);
          } catch (error) {
            reject(error);
          }
        }

        then(onFulfilled, onRejected) {
          return new Promise((resolve, reject) => {
            const handler = {
              onFulfilled: (value) => {
                try {
                  const result = onFulfilled ? onFulfilled(value) : value;
                  resolve(result);
                } catch (error) {
                  reject(error);
                }
              },
              onRejected: (reason) => {
                try {
                  const result = onRejected ? onRejected(reason) : reason;
                  reject(result);
                } catch (error) {
                  reject(error);
                }
              }
            };

            if (this.state === 'fulfilled') {
              handler.onFulfilled(this.value);
            } else if (this.state === 'rejected') {
              handler.onRejected(this.value);
            } else {
              this.handlers.push(handler);
            }
          });
        }

        catch(onRejected) {
          return this.then(null, onRejected);
        }

        static resolve(value) {
          return new Promise(resolve => resolve(value));
        }

        static reject(reason) {
          return new Promise((_, reject) => reject(reason));
        }
      };

      resolve();
    });
  }

  setupFallbacks() {
    // CSS Grid fallback
    if (!this.browserSupport.cssGrid) {
      this.setupFlexboxGridFallback();
    }

    // SVG animation fallback
    if (!this.browserSupport.svgAnimations) {
      this.setupStaticSVGFallback();
    }

    // Visual effects fallback for older browsers
    if (!this.browserInfo.isModern) {
      this.setupReducedVisualEffects();
    }
  }

  setupFlexboxGridFallback() {
    const style = document.createElement('style');
    style.textContent = `
      .no-supports-css-grid .grid {
        display: flex;
        flex-wrap: wrap;
        margin: -8px;
      }
      
      .no-supports-css-grid .grid > * {
        flex: 1 1 300px;
        margin: 8px;
        min-width: 0;
      }
      
      .no-supports-css-grid .pricing-grid > * {
        flex: 1 1 250px;
      }
      
      .no-supports-css-grid .team-grid > * {
        flex: 1 1 200px;
      }
    `;
    document.head.appendChild(style);
  }

  setupStaticSVGFallback() {
    // Replace animated SVGs with static versions
    const animatedSVGs = document.querySelectorAll('svg[class*="spinner"], svg[class*="animated"]');
    animatedSVGs.forEach(svg => {
      svg.style.animation = 'none';
      svg.querySelectorAll('animate, animateTransform').forEach(anim => {
        anim.remove();
      });
    });
  }

  setupReducedVisualEffects() {
    document.documentElement.classList.add('reduced-effects');
    
    const style = document.createElement('style');
    style.textContent = `
      .reduced-effects * {
        animation-duration: 0.1s !important;
        transition-duration: 0.1s !important;
      }
      
      .reduced-effects .glow-element,
      .reduced-effects .holographic-text,
      .reduced-effects .gradient-background {
        background: #121212 !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }
      
      .reduced-effects .loading-spinner {
        border: 2px solid #00d4ff;
        border-radius: 50%;
        width: 20px;
        height: 20px;
      }
    `;
    document.head.appendChild(style);
  }

  // Public API
  getBrowserInfo() {
    return { ...this.browserInfo };
  }

  getFeatureSupport() {
    return { ...this.browserSupport };
  }

  isFeatureSupported(feature) {
    return this.browserSupport[feature] || false;
  }

  isModernBrowser() {
    return this.browserInfo.isModern;
  }
}

// Create global instance
let progressiveEnhancementManager = null;

export function getProgressiveEnhancementManager() {
  if (!progressiveEnhancementManager) {
    progressiveEnhancementManager = new ProgressiveEnhancementManager();
  }
  return progressiveEnhancementManager;
}

export function initializeProgressiveEnhancement() {
  return getProgressiveEnhancementManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeProgressiveEnhancement();
  });
}

export default ProgressiveEnhancementManager;
