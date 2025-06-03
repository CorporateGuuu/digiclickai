/**
 * DigiClick AI Frontend Performance Manager
 * Comprehensive frontend optimization with caching, preloading, and monitoring
 * Integrates with existing systems while maintaining 60fps performance
 */

import { getRedisCacheManager } from './redis-cache-manager';
import { getAPICacheManager } from './api-cache-manager';
import { getPageTransitionManager } from './page-transition-manager';
import { getLoadingStateManager } from './loading-state-manager';

class FrontendPerformanceManager {
  constructor() {
    this.cacheManager = null;
    this.apiCacheManager = null;
    this.pageTransitionManager = null;
    this.loadingStateManager = null;
    
    this.performanceMetrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      resourceLoadTimes: {},
      cacheHitRate: 0,
      jsHeapSize: 0,
      frameRate: 60
    };
    
    this.optimizationStrategies = {
      lazyLoading: true,
      imageOptimization: true,
      resourcePreloading: true,
      codesplitting: true,
      serviceWorkerCaching: true,
      compressionEnabled: true,
      criticalResourcePriority: true,
      performanceMonitoring: true
    };
    
    this.preloadingRules = {
      navigation: {
        '/': ['/about', '/services'],
        '/about': ['/services', '/contact'],
        '/services': ['/pricing', '/contact'],
        '/pricing': ['/contact', '/demo'],
        '/contact': ['/demo']
      },
      resources: {
        critical: ['fonts', 'critical-css', 'hero-images'],
        important: ['main-css', 'main-js', 'navigation-images'],
        optional: ['analytics', 'social-widgets', 'non-critical-images']
      }
    };
    
    this.resourcePriorities = {
      'font': 'high',
      'css': 'high',
      'js': 'medium',
      'image': 'low',
      'video': 'low',
      'audio': 'low'
    };
    
    this.init();
  }

  async init() {
    this.cacheManager = getRedisCacheManager();
    this.apiCacheManager = getAPICacheManager();
    this.pageTransitionManager = getPageTransitionManager();
    this.loadingStateManager = getLoadingStateManager();
    
    this.setupPerformanceMonitoring();
    this.setupResourceOptimization();
    this.setupServiceWorker();
    this.setupEventListeners();
    this.startPerformanceTracking();
  }

  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.performanceMetrics.firstInputDelay);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            this.performanceMetrics.cumulativeLayoutShift += entry.value;
            this.reportMetric('CLS', this.performanceMetrics.cumulativeLayoutShift);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });

      // Resource loading times
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.performanceMetrics.resourceLoadTimes[entry.name] = entry.duration;
        });
      }).observe({ entryTypes: ['resource'] });
    }

    // Monitor frame rate
    this.monitorFrameRate();
  }

  monitorFrameRate() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const measureFrameRate = (currentTime) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        this.performanceMetrics.frameRate = frameCount;
        this.reportMetric('FPS', frameCount);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrameRate);
    };
    
    requestAnimationFrame(measureFrameRate);
  }

  setupResourceOptimization() {
    // Optimize images with lazy loading
    this.setupLazyLoading();
    
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Setup resource hints
    this.setupResourceHints();
  }

  setupLazyLoading() {
    if (!this.optimizationStrategies.lazyLoading) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
            
            // Report lazy load
            this.reportMetric('lazy-load', img.src);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
    
    // Setup mutation observer for dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const lazyImages = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
            lazyImages.forEach(img => imageObserver.observe(img));
          }
        });
      });
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  preloadCriticalResources() {
    if (!this.optimizationStrategies.resourcePreloading) return;
    
    const criticalResources = this.preloadingRules.resources.critical;
    
    criticalResources.forEach(resourceType => {
      this.preloadResourcesByType(resourceType);
    });
  }

  preloadResourcesByType(resourceType) {
    const selectors = {
      'fonts': 'link[rel="preload"][as="font"]',
      'critical-css': 'link[rel="stylesheet"][data-critical="true"]',
      'hero-images': 'img[data-hero="true"]',
      'main-css': 'link[rel="stylesheet"]:not([data-critical])',
      'main-js': 'script[src]:not([data-defer])'
    };
    
    const selector = selectors[resourceType];
    if (!selector) return;
    
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      this.preloadResource(element);
    });
  }

  preloadResource(element) {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (element.tagName === 'LINK') {
      link.href = element.href;
      link.as = 'style';
    } else if (element.tagName === 'SCRIPT') {
      link.href = element.src;
      link.as = 'script';
    } else if (element.tagName === 'IMG') {
      link.href = element.src || element.dataset.src;
      link.as = 'image';
    }
    
    if (link.href) {
      document.head.appendChild(link);
      this.reportMetric('preload', link.href);
    }
  }

  setupResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'www.google-analytics.com',
      'cdn.jsdelivr.net'
    ];
    
    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
    
    // Preconnect to critical external resources
    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];
    
    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  async setupServiceWorker() {
    if (!this.optimizationStrategies.serviceWorkerCaching) return;
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHE_HIT') {
          this.reportMetric('sw-cache-hit', event.data.url);
        }
      });
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  setupEventListeners() {
    // Listen for page navigation to preload next likely pages
    window.addEventListener('page-transition-start', (e) => {
      this.preloadNextLikelyPages(e.detail.url);
    });
    
    // Listen for form interactions to preload related resources
    document.addEventListener('focus', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        this.preloadFormRelatedResources();
      }
    }, true);
    
    // Listen for scroll to preload below-fold content
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.preloadBelowFoldContent();
      }, 100);
    });
  }

  startPerformanceTracking() {
    // Track performance metrics every 30 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);
    
    // Track memory usage
    if ('memory' in performance) {
      setInterval(() => {
        this.performanceMetrics.jsHeapSize = performance.memory.usedJSHeapSize;
        this.reportMetric('memory', performance.memory.usedJSHeapSize);
      }, 60000);
    }
  }

  preloadNextLikelyPages(currentUrl) {
    const currentPath = new URL(currentUrl, window.location.origin).pathname;
    const nextPages = this.preloadingRules.navigation[currentPath] || [];
    
    nextPages.forEach(page => {
      this.preloadPage(page);
    });
  }

  async preloadPage(path) {
    try {
      // Preload the page using the page transition manager
      if (this.pageTransitionManager) {
        this.pageTransitionManager.preloadRoute(path);
      }
      
      // Preload API data for the page
      if (this.apiCacheManager) {
        await this.apiCacheManager.preloadEndpoint(`/api${path}`);
      }
      
      this.reportMetric('page-preload', path);
    } catch (error) {
      console.warn(`Failed to preload page ${path}:`, error);
    }
  }

  preloadFormRelatedResources() {
    // Preload validation rules and auto-complete data
    const resources = [
      '/api/validation/rules',
      '/api/autocomplete/domains',
      '/api/autocomplete/companies'
    ];
    
    resources.forEach(resource => {
      if (this.apiCacheManager) {
        this.apiCacheManager.preloadEndpoint(resource);
      }
    });
  }

  preloadBelowFoldContent() {
    // Check if user is near bottom of page
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const threshold = documentHeight * 0.8; // 80% scrolled
    
    if (scrollPosition > threshold) {
      // Preload next page content or load more data
      this.preloadNextPageContent();
    }
  }

  preloadNextPageContent() {
    // Implementation for preloading next page content
    // This could involve loading more blog posts, products, etc.
    this.reportMetric('below-fold-preload', window.location.pathname);
  }

  collectPerformanceMetrics() {
    // Collect current performance metrics
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.performanceMetrics.timeToInteractive = navigation.domInteractive - navigation.fetchStart;
    }
    
    // Get paint metrics
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-contentful-paint') {
        this.performanceMetrics.firstContentfulPaint = entry.startTime;
      }
    });
    
    // Calculate cache hit rate
    const cacheMetrics = this.cacheManager ? this.cacheManager.getMetrics() : {};
    this.performanceMetrics.cacheHitRate = cacheMetrics.totalRequests > 0 ? 
      (cacheMetrics.hits / cacheMetrics.totalRequests * 100) : 0;
    
    // Dispatch performance update event
    window.dispatchEvent(new CustomEvent('performance-metrics-updated', {
      detail: this.performanceMetrics
    }));
  }

  reportMetric(name, value) {
    // Report metric to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        custom_parameter: window.location.pathname
      });
    }
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('performance-metric-reported', {
      detail: { name, value, timestamp: Date.now() }
    }));
  }

  // Optimization control methods
  enableOptimization(strategy) {
    if (this.optimizationStrategies.hasOwnProperty(strategy)) {
      this.optimizationStrategies[strategy] = true;
      console.log(`Enabled optimization: ${strategy}`);
    }
  }

  disableOptimization(strategy) {
    if (this.optimizationStrategies.hasOwnProperty(strategy)) {
      this.optimizationStrategies[strategy] = false;
      console.log(`Disabled optimization: ${strategy}`);
    }
  }

  updatePreloadingRules(rules) {
    this.preloadingRules = { ...this.preloadingRules, ...rules };
  }

  setResourcePriority(resourceType, priority) {
    if (['high', 'medium', 'low'].includes(priority)) {
      this.resourcePriorities[resourceType] = priority;
    }
  }

  // Public API methods
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  getOptimizationStrategies() {
    return { ...this.optimizationStrategies };
  }

  async optimizeResource(url, type) {
    // Optimize a specific resource
    const priority = this.resourcePriorities[type] || 'medium';
    
    if (priority === 'high') {
      await this.preloadResource({ href: url, as: type });
    }
    
    return { optimized: true, priority };
  }

  async clearPerformanceCache() {
    if (this.cacheManager) {
      await this.cacheManager.invalidatePattern('perf:*');
    }
  }

  generatePerformanceReport() {
    const report = {
      metrics: this.getPerformanceMetrics(),
      strategies: this.getOptimizationStrategies(),
      recommendations: this.generateOptimizationRecommendations(),
      timestamp: new Date().toISOString()
    };
    
    console.log('Performance Report:', report);
    return report;
  }

  generateOptimizationRecommendations() {
    const recommendations = [];
    const metrics = this.performanceMetrics;
    
    if (metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize LCP by preloading hero images and critical CSS');
    }
    
    if (metrics.firstInputDelay > 100) {
      recommendations.push('Reduce FID by optimizing JavaScript execution');
    }
    
    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Improve CLS by setting image dimensions and avoiding layout shifts');
    }
    
    if (metrics.frameRate < 55) {
      recommendations.push('Optimize animations and reduce JavaScript execution time');
    }
    
    if (metrics.cacheHitRate < 70) {
      recommendations.push('Improve caching strategies to increase cache hit rate');
    }
    
    return recommendations;
  }
}

// Create global instance
let frontendPerformanceManager = null;

export function getFrontendPerformanceManager() {
  if (!frontendPerformanceManager) {
    frontendPerformanceManager = new FrontendPerformanceManager();
  }
  return frontendPerformanceManager;
}

export function initializeFrontendPerformance() {
  return getFrontendPerformanceManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeFrontendPerformance();
  });
}

export default FrontendPerformanceManager;
