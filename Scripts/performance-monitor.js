#!/usr/bin/env node

/**
 * DigiClick AI Performance Monitoring Script
 * Monitors cursor system performance and Core Web Vitals
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app';
    this.thresholds = {
      performance: {
        lighthouse: 85,
        fcp: 2500,
        lcp: 4000,
        cls: 0.1,
        tti: 5000,
        tbt: 300,
        si: 3000
      },
      cursor: {
        frameRate: 60,
        responseTime: 16,
        memoryLeakThreshold: 50 // MB
      },
      bundles: {
        javascript: 500 * 1024, // 500KB
        css: 100 * 1024 // 100KB
      }
    };
    
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'unknown',
      performance: {},
      cursor: {},
      bundles: {},
      violations: [],
      warnings: [],
      recommendations: []
    };
  }

  async runPerformanceAudit() {
    console.log('🚀 Starting DigiClick AI Performance Audit...');
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });

      // Test critical pages
      const pages = [
        { path: '/', name: 'Home' },
        { path: '/cursor-context-demo', name: 'Cursor Demo' },
        { path: '/portfolio', name: 'Portfolio' },
        { path: '/about', name: 'About' },
        { path: '/contact', name: 'Contact' }
      ];

      for (const pageInfo of pages) {
        await this.auditPage(browser, pageInfo);
      }

      await browser.close();
      
      this.analyzeResults();
      this.generateReport();
      
    } catch (error) {
      console.error('💥 Performance audit failed:', error);
      this.results.overall = 'failure';
      this.results.error = error.message;
    }

    return this.results;
  }

  async auditPage(browser, pageInfo) {
    console.log(`🔍 Auditing ${pageInfo.name} page...`);
    
    const page = await browser.newPage();
    
    try {
      // Enable performance monitoring
      await page.setCacheEnabled(false);
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Start performance monitoring
      const performanceMetrics = await this.measurePagePerformance(page, pageInfo);
      
      // Test cursor system if it's the cursor demo page
      if (pageInfo.path === '/cursor-context-demo') {
        const cursorMetrics = await this.measureCursorPerformance(page);
        this.results.cursor = cursorMetrics;
      }
      
      // Measure bundle sizes
      const bundleMetrics = await this.measureBundleSizes(page);
      
      this.results.performance[pageInfo.name] = performanceMetrics;
      this.results.bundles[pageInfo.name] = bundleMetrics;
      
    } catch (error) {
      console.error(`❌ Failed to audit ${pageInfo.name}:`, error.message);
      this.results.performance[pageInfo.name] = { error: error.message };
    } finally {
      await page.close();
    }
  }

  async measurePagePerformance(page, pageInfo) {
    const url = `${this.baseUrl}${pageInfo.path}`;
    
    // Start timing
    const startTime = Date.now();
    
    // Navigate and wait for load
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for performance observer
        if ('PerformanceObserver' in window) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const paintEntries = performance.getEntriesByType('paint');
            const navigationEntries = performance.getEntriesByType('navigation');
            
            resolve({
              fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
              lcp: entries.find(entry => entry.entryType === 'largest-contentful-paint')?.startTime || 0,
              cls: entries.reduce((sum, entry) => {
                if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                  return sum + entry.value;
                }
                return sum;
              }, 0),
              tti: navigationEntries[0]?.domInteractive || 0,
              loadTime: navigationEntries[0]?.loadEventEnd - navigationEntries[0]?.loadEventStart || 0
            });
          });
          
          observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
          
          // Fallback timeout
          setTimeout(() => {
            resolve({
              fcp: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime || 0,
              lcp: 0,
              cls: 0,
              tti: performance.getEntriesByType('navigation')[0]?.domInteractive || 0,
              loadTime: Date.now() - performance.timeOrigin
            });
          }, 5000);
        } else {
          resolve({
            fcp: 0,
            lcp: 0,
            cls: 0,
            tti: 0,
            loadTime: Date.now() - performance.timeOrigin
          });
        }
      });
    });

    const totalTime = Date.now() - startTime;
    
    return {
      ...metrics,
      totalTime,
      url,
      timestamp: new Date().toISOString()
    };
  }

  async measureCursorPerformance(page) {
    console.log('🖱️ Measuring cursor system performance...');
    
    try {
      const cursorMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          let startTime = performance.now();
          let memoryStart = performance.memory ? performance.memory.usedJSHeapSize : 0;
          
          // Test cursor interactions
          const testCursorInteractions = () => {
            const elements = document.querySelectorAll('.cta-button, .nav-link, input, .card');
            let responseTime = 0;
            let interactionCount = 0;
            
            elements.forEach(element => {
              const start = performance.now();
              
              // Simulate mouse events
              element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
              element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
              
              const end = performance.now();
              responseTime += (end - start);
              interactionCount++;
            });
            
            return {
              averageResponseTime: responseTime / interactionCount,
              interactionCount
            };
          };
          
          // Measure frame rate
          const measureFrameRate = () => {
            const measureFrames = () => {
              frameCount++;
              requestAnimationFrame(measureFrames);
            };
            
            requestAnimationFrame(measureFrames);
            
            setTimeout(() => {
              const endTime = performance.now();
              const duration = (endTime - startTime) / 1000;
              const fps = frameCount / duration;
              const memoryEnd = performance.memory ? performance.memory.usedJSHeapSize : 0;
              const memoryUsage = (memoryEnd - memoryStart) / 1024 / 1024; // MB
              
              const interactionMetrics = testCursorInteractions();
              
              resolve({
                frameRate: Math.round(fps),
                averageResponseTime: interactionMetrics.averageResponseTime,
                memoryUsage,
                interactionCount: interactionMetrics.interactionCount,
                gsapDetected: typeof gsap !== 'undefined',
                cursorSystemDetected: document.querySelector('.cursor') !== null
              });
            }, 3000); // Measure for 3 seconds
          };
          
          // Wait for cursor system to load
          setTimeout(measureFrameRate, 1000);
        });
      });
      
      return cursorMetrics;
      
    } catch (error) {
      console.error('❌ Cursor performance measurement failed:', error.message);
      return { error: error.message };
    }
  }

  async measureBundleSizes(page) {
    try {
      const resources = await page.evaluate(() => {
        const entries = performance.getEntriesByType('resource');
        const bundles = {
          javascript: 0,
          css: 0,
          images: 0,
          fonts: 0,
          total: 0
        };
        
        entries.forEach(entry => {
          const size = entry.transferSize || entry.encodedBodySize || 0;
          bundles.total += size;
          
          if (entry.name.includes('.js')) {
            bundles.javascript += size;
          } else if (entry.name.includes('.css')) {
            bundles.css += size;
          } else if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            bundles.images += size;
          } else if (entry.name.match(/\.(woff|woff2|ttf|otf)$/i)) {
            bundles.fonts += size;
          }
        });
        
        return bundles;
      });
      
      return resources;
      
    } catch (error) {
      console.error('❌ Bundle size measurement failed:', error.message);
      return { error: error.message };
    }
  }

  analyzeResults() {
    console.log('\n📊 Analyzing performance results...');
    
    let violations = 0;
    let warnings = 0;
    
    // Check performance thresholds
    Object.entries(this.results.performance).forEach(([pageName, metrics]) => {
      if (metrics.error) return;
      
      if (metrics.fcp > this.thresholds.performance.fcp) {
        this.addViolation('FCP', `${pageName}: ${metrics.fcp}ms > ${this.thresholds.performance.fcp}ms`);
        violations++;
      }
      
      if (metrics.lcp > this.thresholds.performance.lcp) {
        this.addViolation('LCP', `${pageName}: ${metrics.lcp}ms > ${this.thresholds.performance.lcp}ms`);
        violations++;
      }
      
      if (metrics.cls > this.thresholds.performance.cls) {
        this.addViolation('CLS', `${pageName}: ${metrics.cls} > ${this.thresholds.performance.cls}`);
        violations++;
      }
      
      if (metrics.tti > this.thresholds.performance.tti) {
        this.addWarning('TTI', `${pageName}: ${metrics.tti}ms > ${this.thresholds.performance.tti}ms`);
        warnings++;
      }
    });
    
    // Check cursor system performance
    if (this.results.cursor && !this.results.cursor.error) {
      if (this.results.cursor.frameRate < this.thresholds.cursor.frameRate) {
        this.addViolation('CURSOR_FPS', `Frame rate: ${this.results.cursor.frameRate}fps < ${this.thresholds.cursor.frameRate}fps`);
        violations++;
      }
      
      if (this.results.cursor.averageResponseTime > this.thresholds.cursor.responseTime) {
        this.addViolation('CURSOR_RESPONSE', `Response time: ${this.results.cursor.averageResponseTime}ms > ${this.thresholds.cursor.responseTime}ms`);
        violations++;
      }
      
      if (this.results.cursor.memoryUsage > this.thresholds.cursor.memoryLeakThreshold) {
        this.addWarning('CURSOR_MEMORY', `Memory usage: ${this.results.cursor.memoryUsage}MB > ${this.thresholds.cursor.memoryLeakThreshold}MB`);
        warnings++;
      }
    }
    
    // Check bundle sizes
    Object.entries(this.results.bundles).forEach(([pageName, bundles]) => {
      if (bundles.error) return;
      
      if (bundles.javascript > this.thresholds.bundles.javascript) {
        this.addViolation('BUNDLE_JS', `${pageName}: JavaScript ${(bundles.javascript/1024).toFixed(1)}KB > ${(this.thresholds.bundles.javascript/1024)}KB`);
        violations++;
      }
      
      if (bundles.css > this.thresholds.bundles.css) {
        this.addViolation('BUNDLE_CSS', `${pageName}: CSS ${(bundles.css/1024).toFixed(1)}KB > ${(this.thresholds.bundles.css/1024)}KB`);
        violations++;
      }
    });
    
    // Determine overall status
    if (violations > 0) {
      this.results.overall = 'failure';
    } else if (warnings > 0) {
      this.results.overall = 'warning';
    } else {
      this.results.overall = 'success';
    }
    
    console.log(`📈 Analysis complete: ${violations} violations, ${warnings} warnings`);
  }

  addViolation(type, message) {
    this.results.violations.push({ type, message, timestamp: new Date().toISOString() });
    console.log(`❌ VIOLATION [${type}]: ${message}`);
  }

  addWarning(type, message) {
    this.results.warnings.push({ type, message, timestamp: new Date().toISOString() });
    console.log(`⚠️ WARNING [${type}]: ${message}`);
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../reports/performance-audit-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Write detailed report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Performance Audit Summary:');
    console.log(`Overall Status: ${this.results.overall.toUpperCase()}`);
    console.log(`Violations: ${this.results.violations.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Report saved to: ${reportPath}`);
    
    return reportPath;
  }
}

// Run performance audit if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.runPerformanceAudit()
    .then((results) => {
      process.exit(results.overall === 'failure' ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Performance audit failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceMonitor;
