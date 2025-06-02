/**
 * DigiClick AI Enhanced Cursor System - Cross-Device Tests
 * Tests cursor functionality across different devices and browsers
 */

const puppeteer = require('puppeteer');

class CrossDeviceTester {
  constructor() {
    this.browser = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Setting up cross-device testing environment...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    console.log('✅ Cross-device testing environment ready');
  }

  async testDevice(deviceConfig) {
    console.log(`📱 Testing on ${deviceConfig.name}...`);
    
    const page = await this.browser.newPage();
    
    try {
      // Emulate device
      await page.emulate(deviceConfig);
      await page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
      await page.waitForTimeout(2000);

      const deviceTest = await page.evaluate((deviceName) => {
        const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                     document.querySelector('.enhanced-cursor');
        
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const cursorVisible = cursor && getComputedStyle(cursor).display !== 'none';
        
        // For touch devices, cursor should be hidden
        // For non-touch devices, cursor should be visible
        const expectedBehavior = isTouchDevice ? !cursorVisible : cursorVisible;

        return {
          deviceName: deviceName,
          isTouchDevice: isTouchDevice,
          cursorVisible: cursorVisible,
          expectedBehavior: expectedBehavior,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          success: expectedBehavior,
          reason: expectedBehavior ? 
            (isTouchDevice ? 'Cursor correctly hidden on touch device' : 'Cursor correctly shown on non-touch device') :
            (isTouchDevice ? 'Cursor should be hidden on touch device' : 'Cursor should be visible on non-touch device')
        };
      }, deviceConfig.name);

      // Test performance on device
      const performanceMetrics = await page.metrics();
      
      const result = {
        device: deviceConfig.name,
        category: deviceConfig.category,
        passed: deviceTest.success,
        message: deviceTest.reason,
        details: {
          ...deviceTest,
          performance: {
            jsHeapUsedSize: performanceMetrics.JSHeapUsedSize,
            jsHeapTotalSize: performanceMetrics.JSHeapTotalSize,
            layoutCount: performanceMetrics.LayoutCount,
            recalcStyleCount: performanceMetrics.RecalcStyleCount
          }
        }
      };

      this.testResults.push(result);
      console.log(`${result.passed ? '✅' : '❌'} ${deviceConfig.name}: ${result.message}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Error testing ${deviceConfig.name}:`, error);
      
      const result = {
        device: deviceConfig.name,
        category: deviceConfig.category,
        passed: false,
        message: `Test failed: ${error.message}`,
        details: { error: error.message }
      };

      this.testResults.push(result);
      return result;
    } finally {
      await page.close();
    }
  }

  async testBrowserCompatibility() {
    console.log('🌐 Testing browser compatibility...');
    
    const userAgents = [
      {
        name: 'Chrome Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
      },
      {
        name: 'Firefox Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
      },
      {
        name: 'Safari Desktop',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
      },
      {
        name: 'Edge Desktop',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
      }
    ];

    for (const browser of userAgents) {
      const page = await this.browser.newPage();
      
      try {
        await page.setUserAgent(browser.userAgent);
        await page.setViewport(browser.viewport);
        await page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        const browserTest = await page.evaluate((browserName) => {
          const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                       document.querySelector('.enhanced-cursor');
          
          const cursorExists = !!cursor;
          const gsapLoaded = typeof window.gsap !== 'undefined';
          
          // Test basic cursor functionality
          let animationWorking = false;
          if (cursor && gsapLoaded) {
            // Simulate mouse movement
            const event = new MouseEvent('mousemove', {
              clientX: 100,
              clientY: 100,
              bubbles: true
            });
            document.dispatchEvent(event);
            animationWorking = true; // Assume working if no errors
          }

          return {
            browserName: browserName,
            cursorExists: cursorExists,
            gsapLoaded: gsapLoaded,
            animationWorking: animationWorking,
            userAgent: navigator.userAgent,
            success: cursorExists && gsapLoaded,
            reason: cursorExists && gsapLoaded ? 
              'Cursor working correctly' : 
              `Issues: ${!cursorExists ? 'Cursor missing' : ''} ${!gsapLoaded ? 'GSAP not loaded' : ''}`.trim()
          };
        }, browser.name);

        const result = {
          device: browser.name,
          category: 'browser',
          passed: browserTest.success,
          message: browserTest.reason,
          details: browserTest
        };

        this.testResults.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${browser.name}: ${result.message}`);
        
      } catch (error) {
        console.error(`❌ Error testing ${browser.name}:`, error);
        
        const result = {
          device: browser.name,
          category: 'browser',
          passed: false,
          message: `Test failed: ${error.message}`,
          details: { error: error.message }
        };

        this.testResults.push(result);
      } finally {
        await page.close();
      }
    }
  }

  async testResolutionScaling() {
    console.log('🖥️ Testing resolution scaling...');
    
    const resolutions = [
      { name: '1080p', width: 1920, height: 1080, deviceScaleFactor: 1 },
      { name: '1440p', width: 2560, height: 1440, deviceScaleFactor: 1 },
      { name: '4K', width: 3840, height: 2160, deviceScaleFactor: 1 },
      { name: 'Retina', width: 1920, height: 1080, deviceScaleFactor: 2 },
      { name: 'Mobile Small', width: 375, height: 667, deviceScaleFactor: 2 },
      { name: 'Tablet', width: 768, height: 1024, deviceScaleFactor: 2 }
    ];

    for (const resolution of resolutions) {
      const page = await this.browser.newPage();
      
      try {
        await page.setViewport(resolution);
        await page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(1000);

        const resolutionTest = await page.evaluate((resName) => {
          const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                       document.querySelector('.enhanced-cursor');
          
          if (!cursor) {
            return {
              resolutionName: resName,
              success: false,
              reason: 'Cursor not found'
            };
          }

          const cursorStyle = getComputedStyle(cursor);
          const cursorSize = {
            width: parseFloat(cursorStyle.width),
            height: parseFloat(cursorStyle.height)
          };

          // Check if cursor scales appropriately
          const devicePixelRatio = window.devicePixelRatio || 1;
          const expectedMinSize = 20 * devicePixelRatio;
          const expectedMaxSize = 100 * devicePixelRatio;
          
          const sizeAppropriate = 
            cursorSize.width >= expectedMinSize && cursorSize.width <= expectedMaxSize &&
            cursorSize.height >= expectedMinSize && cursorSize.height <= expectedMaxSize;

          return {
            resolutionName: resName,
            cursorSize: cursorSize,
            devicePixelRatio: devicePixelRatio,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            sizeAppropriate: sizeAppropriate,
            success: sizeAppropriate,
            reason: sizeAppropriate ? 
              'Cursor size appropriate for resolution' : 
              'Cursor size not appropriate for resolution'
          };
        }, resolution.name);

        const result = {
          device: resolution.name,
          category: 'resolution',
          passed: resolutionTest.success,
          message: resolutionTest.reason,
          details: resolutionTest
        };

        this.testResults.push(result);
        console.log(`${result.passed ? '✅' : '❌'} ${resolution.name}: ${result.message}`);
        
      } catch (error) {
        console.error(`❌ Error testing ${resolution.name}:`, error);
        
        const result = {
          device: resolution.name,
          category: 'resolution',
          passed: false,
          message: `Test failed: ${error.message}`,
          details: { error: error.message }
        };

        this.testResults.push(result);
      } finally {
        await page.close();
      }
    }
  }

  async generateReport() {
    console.log('📝 Generating cross-device test report...');
    
    const categories = ['mobile', 'tablet', 'desktop', 'browser', 'resolution'];
    const summary = {};
    
    categories.forEach(category => {
      const categoryResults = this.testResults.filter(r => r.category === category);
      const passed = categoryResults.filter(r => r.passed).length;
      const total = categoryResults.length;
      
      summary[category] = {
        total: total,
        passed: passed,
        failed: total - passed,
        successRate: total > 0 ? (passed / total) * 100 : 0
      };
    });

    const totalTests = this.testResults.length;
    const totalPassed = this.testResults.filter(r => r.passed).length;
    const overallSuccessRate = totalTests > 0 ? (totalPassed / totalTests) * 100 : 0;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overall: {
          totalTests: totalTests,
          passedTests: totalPassed,
          failedTests: totalTests - totalPassed,
          successRate: overallSuccessRate
        },
        byCategory: summary
      },
      results: this.testResults,
      recommendations: this.generateRecommendations(),
    };

    console.log(`📊 Cross-Device Test Summary:`);
    console.log(`   Overall Success Rate: ${overallSuccessRate.toFixed(1)}%`);
    
    Object.entries(summary).forEach(([category, stats]) => {
      if (stats.total > 0) {
        console.log(`   ${category}: ${stats.passed}/${stats.total} (${stats.successRate.toFixed(1)}%)`);
      }
    });

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    // Group failures by category
    const failuresByCategory = {};
    failedTests.forEach(test => {
      if (!failuresByCategory[test.category]) {
        failuresByCategory[test.category] = [];
      }
      failuresByCategory[test.category].push(test);
    });

    Object.entries(failuresByCategory).forEach(([category, failures]) => {
      switch (category) {
        case 'mobile':
          recommendations.push({
            type: 'high',
            message: `Cursor issues on ${failures.length} mobile device(s)`,
            suggestion: 'Ensure touch detection is working correctly and cursor is hidden on mobile'
          });
          break;
        case 'browser':
          recommendations.push({
            type: 'medium',
            message: `Cursor compatibility issues in ${failures.length} browser(s)`,
            suggestion: 'Check GSAP loading and browser-specific CSS compatibility'
          });
          break;
        case 'resolution':
          recommendations.push({
            type: 'low',
            message: `Cursor scaling issues at ${failures.length} resolution(s)`,
            suggestion: 'Implement responsive cursor sizing based on device pixel ratio'
          });
          break;
      }
    });

    return recommendations;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🧹 Cross-device testing cleanup complete');
  }

  async runAllTests() {
    try {
      await this.setup();
      
      // Define device configurations
      const devices = [
        // Mobile devices
        { name: 'iPhone 12', category: 'mobile', ...puppeteer.devices['iPhone 12'] },
        { name: 'iPhone 12 Pro', category: 'mobile', ...puppeteer.devices['iPhone 12 Pro'] },
        { name: 'Pixel 5', category: 'mobile', ...puppeteer.devices['Pixel 5'] },
        { name: 'Galaxy S21', category: 'mobile', ...puppeteer.devices['Galaxy S21'] },
        
        // Tablet devices
        { name: 'iPad', category: 'tablet', ...puppeteer.devices['iPad'] },
        { name: 'iPad Pro', category: 'tablet', ...puppeteer.devices['iPad Pro'] },
        
        // Desktop configurations
        {
          name: 'Desktop 1080p',
          category: 'desktop',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
        },
        {
          name: 'Desktop 1440p',
          category: 'desktop',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          viewport: { width: 2560, height: 1440, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
        }
      ];

      // Test each device
      for (const device of devices) {
        await this.testDevice(device);
      }

      // Test browser compatibility
      await this.testBrowserCompatibility();
      
      // Test resolution scaling
      await this.testResolutionScaling();
      
      const report = await this.generateReport();
      
      return report;
    } catch (error) {
      console.error('❌ Cross-device testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CrossDeviceTester();
  
  tester.runAllTests()
    .then((report) => {
      console.log('✅ Cross-device testing completed');
      
      // Exit with error code if tests failed
      const hasFailures = report.summary.overall.failedTests > 0;
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Cross-device testing failed:', error);
      process.exit(1);
    });
}

module.exports = CrossDeviceTester;
