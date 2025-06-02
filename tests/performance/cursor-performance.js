/**
 * DigiClick AI Enhanced Cursor System - Performance Tests
 * Tests frame rate, memory usage, and performance optimization
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');
const path = require('path');

class CursorPerformanceTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      frameRate: [],
      memoryUsage: [],
      cpuUsage: [],
      animationTiming: [],
      coreWebVitals: {},
    };
  }

  async setup() {
    console.log('🚀 Setting up performance testing environment...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--enable-features=VaapiVideoDecoder',
        '--use-gl=egl',
      ],
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for consistent testing
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable performance monitoring
    await this.page.setCacheEnabled(false);
    await this.page.coverage.startJSCoverage();
    
    console.log('✅ Performance testing environment ready');
  }

  async testFrameRate() {
    console.log('📊 Testing cursor animation frame rate...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', {
      waitUntil: 'networkidle0',
    });

    // Inject frame rate monitoring script
    const frameRateData = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const frames = [];
        let lastTime = performance.now();
        let frameCount = 0;
        const duration = 5000; // 5 seconds
        const startTime = performance.now();

        function measureFrame() {
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;
          const fps = 1000 / deltaTime;
          
          frames.push({
            timestamp: currentTime - startTime,
            fps: fps,
            deltaTime: deltaTime,
          });
          
          lastTime = currentTime;
          frameCount++;

          if (currentTime - startTime < duration) {
            requestAnimationFrame(measureFrame);
          } else {
            const avgFps = frames.reduce((sum, frame) => sum + frame.fps, 0) / frames.length;
            const minFps = Math.min(...frames.map(f => f.fps));
            const maxFps = Math.max(...frames.map(f => f.fps));
            
            resolve({
              averageFps: avgFps,
              minimumFps: minFps,
              maximumFps: maxFps,
              frameCount: frameCount,
              droppedFrames: frames.filter(f => f.fps < 55).length,
              frames: frames,
            });
          }
        }

        // Start measuring after cursor is loaded
        setTimeout(() => {
          requestAnimationFrame(measureFrame);
        }, 1000);
      });
    });

    this.results.frameRate = frameRateData;
    
    console.log(`📈 Frame Rate Results:`);
    console.log(`   Average FPS: ${frameRateData.averageFps.toFixed(2)}`);
    console.log(`   Minimum FPS: ${frameRateData.minimumFps.toFixed(2)}`);
    console.log(`   Maximum FPS: ${frameRateData.maximumFps.toFixed(2)}`);
    console.log(`   Dropped Frames: ${frameRateData.droppedFrames}`);
    
    return frameRateData;
  }

  async testMemoryUsage() {
    console.log('🧠 Testing memory usage and cleanup...');
    
    const memoryData = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const measurements = [];
        const duration = 10000; // 10 seconds
        const interval = 500; // Every 500ms
        const startTime = performance.now();

        function measureMemory() {
          if (performance.memory) {
            measurements.push({
              timestamp: performance.now() - startTime,
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            });
          }

          if (performance.now() - startTime < duration) {
            setTimeout(measureMemory, interval);
          } else {
            resolve({
              measurements: measurements,
              peakMemory: Math.max(...measurements.map(m => m.usedJSHeapSize)),
              averageMemory: measurements.reduce((sum, m) => sum + m.usedJSHeapSize, 0) / measurements.length,
              memoryGrowth: measurements[measurements.length - 1].usedJSHeapSize - measurements[0].usedJSHeapSize,
            });
          }
        }

        measureMemory();
      });
    });

    this.results.memoryUsage = memoryData;
    
    console.log(`🧠 Memory Usage Results:`);
    console.log(`   Peak Memory: ${(memoryData.peakMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Memory: ${(memoryData.averageMemory / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Memory Growth: ${(memoryData.memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
    
    return memoryData;
  }

  async testAnimationTiming() {
    console.log('⏱️ Testing animation timing and smoothness...');
    
    const animationData = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const timings = [];
        let animationStartTime = null;
        
        // Monitor GSAP animations
        if (window.gsap) {
          const originalTo = window.gsap.to;
          window.gsap.to = function(...args) {
            const startTime = performance.now();
            const animation = originalTo.apply(this, args);
            
            if (animation && animation.then) {
              animation.then(() => {
                timings.push({
                  duration: performance.now() - startTime,
                  type: 'gsap-to',
                  timestamp: startTime,
                });
              });
            }
            
            return animation;
          };
        }

        // Simulate cursor interactions
        const testElement = document.querySelector('.cta-button') || document.body;
        
        // Test hover animations
        testElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        setTimeout(() => {
          testElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
        }, 1000);

        // Test click animations
        setTimeout(() => {
          testElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }, 2000);

        // Resolve after collecting data
        setTimeout(() => {
          resolve({
            animationTimings: timings,
            averageAnimationTime: timings.length > 0 ? 
              timings.reduce((sum, t) => sum + t.duration, 0) / timings.length : 0,
            slowAnimations: timings.filter(t => t.duration > 100).length,
          });
        }, 5000);
      });
    });

    this.results.animationTiming = animationData;
    
    console.log(`⏱️ Animation Timing Results:`);
    console.log(`   Average Animation Time: ${animationData.averageAnimationTime.toFixed(2)}ms`);
    console.log(`   Slow Animations (>100ms): ${animationData.slowAnimations}`);
    
    return animationData;
  }

  async testCoreWebVitals() {
    console.log('🎯 Testing Core Web Vitals...');
    
    const { lhr } = await lighthouse('http://localhost:3000/cursor-demo', {
      port: (new URL(this.browser.wsEndpoint())).port,
      output: 'json',
      logLevel: 'info',
    });

    const vitals = {
      performanceScore: lhr.categories.performance.score * 100,
      firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
      largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
      cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
      totalBlockingTime: lhr.audits['total-blocking-time'].numericValue,
      speedIndex: lhr.audits['speed-index'].numericValue,
    };

    this.results.coreWebVitals = vitals;
    
    console.log(`🎯 Core Web Vitals Results:`);
    console.log(`   Performance Score: ${vitals.performanceScore.toFixed(1)}/100`);
    console.log(`   First Contentful Paint: ${vitals.firstContentfulPaint.toFixed(0)}ms`);
    console.log(`   Largest Contentful Paint: ${vitals.largestContentfulPaint.toFixed(0)}ms`);
    console.log(`   Cumulative Layout Shift: ${vitals.cumulativeLayoutShift.toFixed(3)}`);
    console.log(`   Total Blocking Time: ${vitals.totalBlockingTime.toFixed(0)}ms`);
    
    return vitals;
  }

  async generateReport() {
    console.log('📝 Generating performance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      testEnvironment: {
        userAgent: await this.page.evaluate(() => navigator.userAgent),
        viewport: await this.page.viewport(),
        url: this.page.url(),
      },
      results: this.results,
      recommendations: this.generateRecommendations(),
    };

    const reportPath = path.join(__dirname, '../reports/cursor-performance-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📝 Performance report saved to: ${reportPath}`);
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Frame rate recommendations
    if (this.results.frameRate.averageFps < 55) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Average frame rate is below 55fps. Consider optimizing animations.',
        suggestion: 'Reduce particle count or simplify animation complexity.',
      });
    }

    // Memory recommendations
    if (this.results.memoryUsage.memoryGrowth > 10 * 1024 * 1024) { // 10MB
      recommendations.push({
        type: 'memory',
        severity: 'medium',
        message: 'Memory usage increased by more than 10MB during testing.',
        suggestion: 'Check for memory leaks in particle cleanup or event listeners.',
      });
    }

    // Core Web Vitals recommendations
    if (this.results.coreWebVitals.performanceScore < 90) {
      recommendations.push({
        type: 'vitals',
        severity: 'medium',
        message: 'Performance score is below 90.',
        suggestion: 'Optimize cursor loading and reduce initial bundle size.',
      });
    }

    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Performance testing cleanup complete');
  }

  async runAllTests() {
    try {
      await this.setup();
      
      await this.testFrameRate();
      await this.testMemoryUsage();
      await this.testAnimationTiming();
      await this.testCoreWebVitals();
      
      const report = await this.generateReport();
      
      return report;
    } catch (error) {
      console.error('❌ Performance testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CursorPerformanceTester();
  
  tester.runAllTests()
    .then((report) => {
      console.log('✅ Performance testing completed successfully');
      
      // Exit with error code if performance is poor
      const hasHighSeverityIssues = report.recommendations.some(r => r.severity === 'high');
      process.exit(hasHighSeverityIssues ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Performance testing failed:', error);
      process.exit(1);
    });
}

module.exports = CursorPerformanceTester;
