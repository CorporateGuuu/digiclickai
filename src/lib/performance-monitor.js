// Performance monitoring utility
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
      cacheHits: 0,
      cacheMisses: 0
    };

    // Initialize performance observers
    this.initObservers();
  }

  initObservers() {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.metrics.fcp = entries[entries.length - 1].startTime;
      this.reportMetric('FCP', this.metrics.fcp);
    }).observe({ type: 'paint', buffered: true });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.metrics.lcp = entries[entries.length - 1].startTime;
      this.reportMetric('LCP', this.metrics.lcp);
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      this.metrics.fid = entries[0].processingStart - entries[0].startTime;
      this.reportMetric('FID', this.metrics.fid);
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.cls = clsValue;
      this.reportMetric('CLS', this.metrics.cls);
    }).observe({ type: 'layout-shift', buffered: true });

    // Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      this.reportMetric('TTFB', this.metrics.ttfb);
    }
  }

  // Track cache effectiveness
  trackCacheStatus(isCacheHit) {
    if (isCacheHit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }

    const cacheHitRate = this.metrics.cacheHits / 
      (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    this.reportMetric('Cache Hit Rate', cacheHitRate);
  }

  // Report metrics to monitoring service
  reportMetric(name, value) {
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      // Send to monitoring service (e.g., Google Analytics, New Relic, etc.)
      if (window.gtag) {
        window.gtag('event', 'performance_metric', {
          metric_name: name,
          value: value
        });
      }

      // Log to console in development
      console.log(`Performance Metric - ${name}: ${value}`);
    }
  }

  // Get all current metrics
  getMetrics() {
    return {
      ...this.metrics,
      cacheHitRate: this.metrics.cacheHits / 
        (this.metrics.cacheHits + this.metrics.cacheMisses) * 100
    };
  }

  // Check if metrics meet performance budget
  checkPerformanceBudget() {
    const budget = {
      fcp: 1500,  // 1.5s
      lcp: 2500,  // 2.5s
      fid: 100,   // 100ms
      cls: 0.1,   // 0.1
      ttfb: 600,  // 600ms
      cacheHitRate: 90 // 90%
    };

    const violations = [];

    if (this.metrics.fcp > budget.fcp) {
      violations.push(`FCP exceeds budget: ${this.metrics.fcp}ms vs ${budget.fcp}ms`);
    }
    if (this.metrics.lcp > budget.lcp) {
      violations.push(`LCP exceeds budget: ${this.metrics.lcp}ms vs ${budget.lcp}ms`);
    }
    if (this.metrics.fid > budget.fid) {
      violations.push(`FID exceeds budget: ${this.metrics.fid}ms vs ${budget.fid}ms`);
    }
    if (this.metrics.cls > budget.cls) {
      violations.push(`CLS exceeds budget: ${this.metrics.cls} vs ${budget.cls}`);
    }
    if (this.metrics.ttfb > budget.ttfb) {
      violations.push(`TTFB exceeds budget: ${this.metrics.ttfb}ms vs ${budget.ttfb}ms`);
    }

    const cacheHitRate = this.metrics.cacheHits / 
      (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    if (cacheHitRate < budget.cacheHitRate) {
      violations.push(`Cache hit rate below target: ${cacheHitRate}% vs ${budget.cacheHitRate}%`);
    }

    return {
      passes: violations.length === 0,
      violations
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper functions
export const trackCacheStatus = (isCacheHit) => performanceMonitor.trackCacheStatus(isCacheHit);
export const getMetrics = () => performanceMonitor.getMetrics();
export const checkPerformanceBudget = () => performanceMonitor.checkPerformanceBudget();
