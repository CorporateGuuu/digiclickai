/**
 * Core Web Vitals Performance Monitoring for DigiClick AI
 * Real User Monitoring (RUM) with A/B testing integration
 */

import { getCLS, getFCP, getFID, getLCP, getTTFB, getINP } from 'web-vitals';
import { capturePerformanceIssue, setABTestContext, setCursorContext } from './sentry-config';

// Performance thresholds (Google's "Good" standards)
const PERFORMANCE_THRESHOLDS = {
  FCP: { good: 1800, needs_improvement: 3000 },
  LCP: { good: 2500, needs_improvement: 4000 },
  FID: { good: 100, needs_improvement: 300 },
  CLS: { good: 0.1, needs_improvement: 0.25 },
  TTFB: { good: 800, needs_improvement: 1800 },
  INP: { good: 200, needs_improvement: 500 }
};

// Performance budgets for A/B testing variants
const VARIANT_BUDGETS = {
  control: {
    FCP: 2500,
    LCP: 4000,
    CLS: 0.1,
    memory_budget: 50 // MB
  },
  enhanced: {
    FCP: 2800,
    LCP: 4200,
    CLS: 0.12,
    memory_budget: 60 // MB (higher due to particles)
  },
  minimal: {
    FCP: 2200,
    LCP: 3500,
    CLS: 0.08,
    memory_budget: 30 // MB (lower for efficiency)
  },
  gaming: {
    FCP: 3000,
    LCP: 4500,
    CLS: 0.15,
    memory_budget: 80 // MB (highest for RGB effects)
  }
};

class CoreWebVitalsMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.cursorVariant = this.getCursorVariant();
    this.abTestId = 'cursor-theme-optimization-v1';
    
    // Performance monitoring configuration
    this.config = {
      sampling_rate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      batch_size: 10,
      flush_interval: 30000, // 30 seconds
      api_endpoint: process.env.NEXT_PUBLIC_API_URL + '/api/analytics/performance',
      enable_real_user_monitoring: true,
      enable_synthetic_monitoring: false
    };
    
    this.metricsBatch = [];
    this.lastFlush = Date.now();
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return;
    }

    console.log('🔍 Initializing Core Web Vitals monitoring...');
    
    // Set up A/B testing context
    setABTestContext(this.abTestId, this.cursorVariant, this.sessionId);
    
    // Initialize Core Web Vitals monitoring
    this.initializeCoreWebVitals();
    
    // Initialize cursor system performance monitoring
    this.initializeCursorPerformanceMonitoring();
    
    // Initialize memory monitoring
    this.initializeMemoryMonitoring();
    
    // Initialize network monitoring
    this.initializeNetworkMonitoring();
    
    // Set up periodic reporting
    this.setupPeriodicReporting();
    
    // Set up page visibility handling
    this.setupPageVisibilityHandling();
    
    this.isInitialized = true;
    console.log('✅ Core Web Vitals monitoring initialized');
  }

  initializeCoreWebVitals() {
    // First Contentful Paint
    getFCP(metric => this.handleMetric('FCP', metric));
    
    // Largest Contentful Paint
    getLCP(metric => this.handleMetric('LCP', metric));
    
    // First Input Delay
    getFID(metric => this.handleMetric('FID', metric));
    
    // Cumulative Layout Shift
    getCLS(metric => this.handleMetric('CLS', metric));
    
    // Time to First Byte
    getTTFB(metric => this.handleMetric('TTFB', metric));
    
    // Interaction to Next Paint (Chrome 96+)
    if ('getINP' in window) {
      getINP(metric => this.handleMetric('INP', metric));
    }
  }

  initializeCursorPerformanceMonitoring() {
    // Monitor cursor system frame rate
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        this.recordCustomMetric('cursor_fps', fps, {
          variant: this.cursorVariant,
          target_fps: 60
        });
        
        // Alert if FPS is below threshold
        if (fps < 55) {
          capturePerformanceIssue(
            'cursor_fps_low',
            fps,
            60,
            {
              tags: { variant: this.cursorVariant },
              extra: { measurement_duration: currentTime - lastTime }
            }
          );
        }
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
    
    // Monitor cursor response time
    this.setupCursorResponseTimeMonitoring();
  }

  setupCursorResponseTimeMonitoring() {
    let lastInteractionTime = 0;
    
    const interactionElements = document.querySelectorAll(
      '.cta-button, .nav-link, .card, button, input, a'
    );
    
    interactionElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        lastInteractionTime = performance.now();
      });
      
      element.addEventListener('mouseleave', () => {
        if (lastInteractionTime > 0) {
          const responseTime = performance.now() - lastInteractionTime;
          
          this.recordCustomMetric('cursor_response_time', responseTime, {
            variant: this.cursorVariant,
            element_type: element.tagName.toLowerCase(),
            element_class: element.className
          });
          
          // Alert if response time is too high
          if (responseTime > 20) {
            capturePerformanceIssue(
              'cursor_response_slow',
              responseTime,
              20,
              {
                tags: { 
                  variant: this.cursorVariant,
                  element_type: element.tagName.toLowerCase()
                }
              }
            );
          }
        }
      });
    });
  }

  initializeMemoryMonitoring() {
    if (!('memory' in performance)) {
      console.warn('⚠️ Memory monitoring not supported in this browser');
      return;
    }
    
    const monitorMemory = () => {
      const memoryInfo = performance.memory;
      const usedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024);
      
      this.recordCustomMetric('memory_usage', usedMB, {
        variant: this.cursorVariant,
        limit_mb: limitMB,
        usage_percentage: Math.round((usedMB / limitMB) * 100)
      });
      
      // Check variant-specific memory budget
      const budget = VARIANT_BUDGETS[this.cursorVariant]?.memory_budget || 50;
      if (usedMB > budget) {
        capturePerformanceIssue(
          'memory_budget_exceeded',
          usedMB,
          budget,
          {
            tags: { variant: this.cursorVariant },
            extra: { 
              limit_mb: limitMB,
              budget_mb: budget
            }
          }
        );
      }
    };
    
    // Monitor memory every 10 seconds
    setInterval(monitorMemory, 10000);
    
    // Initial measurement
    monitorMemory();
  }

  initializeNetworkMonitoring() {
    // Monitor navigation timing
    if ('getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        
        this.recordCustomMetric('dns_lookup_time', nav.domainLookupEnd - nav.domainLookupStart);
        this.recordCustomMetric('tcp_connect_time', nav.connectEnd - nav.connectStart);
        this.recordCustomMetric('server_response_time', nav.responseEnd - nav.requestStart);
        this.recordCustomMetric('dom_processing_time', nav.domComplete - nav.domLoading);
      }
    }
    
    // Monitor resource loading
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('cursor') || entry.name.includes('gsap')) {
            this.recordCustomMetric('cursor_resource_load_time', entry.duration, {
              resource_name: entry.name,
              resource_type: entry.initiatorType,
              variant: this.cursorVariant
            });
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    }
  }

  handleMetric(name, metric) {
    console.log(`📊 ${name}:`, metric.value);
    
    // Store metric
    this.metrics.set(name, metric);
    
    // Determine performance rating
    const threshold = PERFORMANCE_THRESHOLDS[name];
    let rating = 'good';
    
    if (threshold) {
      if (metric.value > threshold.needs_improvement) {
        rating = 'poor';
      } else if (metric.value > threshold.good) {
        rating = 'needs-improvement';
      }
    }
    
    // Check variant-specific budgets
    const variantBudget = VARIANT_BUDGETS[this.cursorVariant];
    if (variantBudget && variantBudget[name] && metric.value > variantBudget[name]) {
      rating = 'budget-exceeded';
      
      capturePerformanceIssue(
        `${name.toLowerCase()}_budget_exceeded`,
        metric.value,
        variantBudget[name],
        {
          tags: { 
            variant: this.cursorVariant,
            metric_name: name
          },
          extra: {
            google_threshold: threshold,
            variant_budget: variantBudget[name]
          }
        }
      );
    }
    
    // Record metric with context
    this.recordMetric(name, metric.value, {
      rating,
      variant: this.cursorVariant,
      ab_test_id: this.abTestId,
      session_id: this.sessionId,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: Date.now()
    });
    
    // Send to analytics if critical
    if (rating === 'poor' || rating === 'budget-exceeded') {
      this.sendMetricToAnalytics(name, metric.value, rating);
    }
  }

  recordCustomMetric(name, value, context = {}) {
    this.recordMetric(name, value, {
      ...context,
      variant: this.cursorVariant,
      ab_test_id: this.abTestId,
      session_id: this.sessionId,
      timestamp: Date.now()
    });
  }

  recordMetric(name, value, context) {
    const metricData = {
      name,
      value,
      context,
      timestamp: Date.now()
    };
    
    this.metricsBatch.push(metricData);
    
    // Flush if batch is full
    if (this.metricsBatch.length >= this.config.batch_size) {
      this.flushMetrics();
    }
  }

  setupPeriodicReporting() {
    // Flush metrics periodically
    setInterval(() => {
      if (this.metricsBatch.length > 0) {
        this.flushMetrics();
      }
    }, this.config.flush_interval);
    
    // Generate performance report every 5 minutes
    setInterval(() => {
      this.generatePerformanceReport();
    }, 300000);
  }

  setupPageVisibilityHandling() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Flush metrics before page becomes hidden
        this.flushMetrics();
      }
    });
    
    // Flush metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetrics();
    });
  }

  async flushMetrics() {
    if (this.metricsBatch.length === 0) return;
    
    const batch = [...this.metricsBatch];
    this.metricsBatch = [];
    this.lastFlush = Date.now();
    
    try {
      await this.sendMetricsToAPI(batch);
      console.log(`📊 Flushed ${batch.length} performance metrics`);
    } catch (error) {
      console.error('❌ Failed to flush performance metrics:', error);
      
      // Re-add metrics to batch for retry (with limit)
      if (this.metricsBatch.length < 100) {
        this.metricsBatch.unshift(...batch);
      }
    }
  }

  async sendMetricsToAPI(metrics) {
    if (!this.config.api_endpoint) return;
    
    const payload = {
      session_id: this.sessionId,
      variant: this.cursorVariant,
      ab_test_id: this.abTestId,
      metrics,
      timestamp: Date.now(),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };
    
    const response = await fetch(this.config.api_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
  }

  async sendMetricToAnalytics(name, value, rating) {
    // Send to Google Analytics 4 if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'core_web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_rating: rating,
        cursor_variant: this.cursorVariant,
        ab_test_id: this.abTestId,
        custom_parameter_1: this.abTestId,
        custom_parameter_2: this.cursorVariant,
        custom_parameter_3: rating
      });
    }
  }

  generatePerformanceReport() {
    const report = {
      session_id: this.sessionId,
      variant: this.cursorVariant,
      ab_test_id: this.abTestId,
      timestamp: Date.now(),
      core_web_vitals: {},
      custom_metrics: {},
      performance_summary: {}
    };
    
    // Add Core Web Vitals
    ['FCP', 'LCP', 'FID', 'CLS', 'TTFB', 'INP'].forEach(metric => {
      if (this.metrics.has(metric)) {
        const metricData = this.metrics.get(metric);
        report.core_web_vitals[metric] = {
          value: metricData.value,
          rating: this.getRating(metric, metricData.value)
        };
      }
    });
    
    // Calculate performance score
    report.performance_summary.score = this.calculatePerformanceScore();
    report.performance_summary.variant_compliance = this.checkVariantCompliance();
    
    console.log('📊 Performance Report:', report);
    
    // Send report to analytics
    this.sendMetricsToAPI([{
      name: 'performance_report',
      value: report.performance_summary.score,
      context: report
    }]);
  }

  getRating(metric, value) {
    const threshold = PERFORMANCE_THRESHOLDS[metric];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  calculatePerformanceScore() {
    const weights = { FCP: 0.15, LCP: 0.25, FID: 0.25, CLS: 0.25, TTFB: 0.1 };
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(weights).forEach(([metric, weight]) => {
      if (this.metrics.has(metric)) {
        const value = this.metrics.get(metric).value;
        const rating = this.getRating(metric, value);
        
        let score = 0;
        if (rating === 'good') score = 100;
        else if (rating === 'needs-improvement') score = 50;
        else score = 0;
        
        totalScore += score * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  checkVariantCompliance() {
    const budget = VARIANT_BUDGETS[this.cursorVariant];
    if (!budget) return { compliant: false, reason: 'no_budget_defined' };
    
    const violations = [];
    
    Object.entries(budget).forEach(([metric, threshold]) => {
      if (metric === 'memory_budget') return; // Handled separately
      
      if (this.metrics.has(metric.toUpperCase())) {
        const value = this.metrics.get(metric.toUpperCase()).value;
        if (value > threshold) {
          violations.push({ metric, value, threshold });
        }
      }
    });
    
    return {
      compliant: violations.length === 0,
      violations,
      variant: this.cursorVariant
    };
  }

  getCursorVariant() {
    if (typeof document === 'undefined') return 'unknown';
    
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
      return 'control';
    }
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Public API
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getCurrentPerformanceScore() {
    return this.calculatePerformanceScore();
  }

  getVariantCompliance() {
    return this.checkVariantCompliance();
  }
}

// Global instance
let coreWebVitalsMonitor = null;

export function initializeCoreWebVitalsMonitoring() {
  if (typeof window === 'undefined') return null;
  
  if (!coreWebVitalsMonitor) {
    coreWebVitalsMonitor = new CoreWebVitalsMonitor();
  }
  
  coreWebVitalsMonitor.initialize();
  return coreWebVitalsMonitor;
}

export function getCoreWebVitalsMonitor() {
  return coreWebVitalsMonitor;
}

export { CoreWebVitalsMonitor };
