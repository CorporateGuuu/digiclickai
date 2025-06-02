/**
 * DigiClick AI Enhanced Cursor System - End-to-End Tests
 * Tests cursor functionality across different pages and user interactions
 */

const puppeteer = require('puppeteer');

class CursorE2ETester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Setting up E2E testing environment...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 50, // Slow down for visual verification
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Browser Error:', msg.text());
      }
    });

    console.log('✅ E2E testing environment ready');
  }

  async testCursorPresence(url) {
    console.log(`🔍 Testing cursor presence on: ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    
    // Wait for cursor to initialize
    await this.page.waitForTimeout(2000);
    
    const cursorExists = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor') ||
                   document.querySelector('[role="presentation"]');
      return !!cursor;
    });

    const result = {
      test: 'cursor-presence',
      url: url,
      passed: cursorExists,
      message: cursorExists ? 'Cursor found on page' : 'Cursor not found on page',
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testCursorMovement(url) {
    console.log(`🖱️ Testing cursor movement on: ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    // Test cursor follows mouse movement
    const movementTest = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let cursorMoved = false;
        const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                      document.querySelector('.enhanced-cursor');
        
        if (!cursor) {
          resolve({ success: false, reason: 'Cursor element not found' });
          return;
        }

        const initialTransform = getComputedStyle(cursor).transform;
        
        // Simulate mouse movement
        const event = new MouseEvent('mousemove', {
          clientX: 500,
          clientY: 300,
          bubbles: true
        });
        
        document.dispatchEvent(event);
        
        // Check if cursor moved after a short delay
        setTimeout(() => {
          const newTransform = getComputedStyle(cursor).transform;
          cursorMoved = newTransform !== initialTransform;
          
          resolve({
            success: cursorMoved,
            reason: cursorMoved ? 'Cursor followed mouse movement' : 'Cursor did not move',
            initialTransform,
            newTransform
          });
        }, 500);
      });
    });

    const result = {
      test: 'cursor-movement',
      url: url,
      passed: movementTest.success,
      message: movementTest.reason,
      details: movementTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testInteractiveElements(url) {
    console.log(`🎯 Testing interactive elements on: ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const interactiveTests = await this.page.evaluate(() => {
      const results = [];
      const selectors = ['.cta-button', '.nav-link', '.glow-text', '.pulse-box', '.glow-trigger'];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        if (elements.length > 0) {
          const element = elements[0];
          
          // Test hover effect
          const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
          element.dispatchEvent(hoverEvent);
          
          results.push({
            selector: selector,
            found: true,
            count: elements.length,
            hoverTested: true
          });
        } else {
          results.push({
            selector: selector,
            found: false,
            count: 0,
            hoverTested: false
          });
        }
      });
      
      return results;
    });

    const allElementsFound = interactiveTests.every(test => test.found);
    
    const result = {
      test: 'interactive-elements',
      url: url,
      passed: allElementsFound,
      message: `Found ${interactiveTests.filter(t => t.found).length}/${interactiveTests.length} interactive element types`,
      details: interactiveTests,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testClickEffects(url) {
    console.log(`👆 Testing click effects on: ${url}`);
    
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const clickTest = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let rippleCreated = false;
        
        // Monitor for ripple creation
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.classList && (
                node.classList.contains('cursor-ripple') ||
                node.classList.contains('cursor-click-ripple')
              )) {
                rippleCreated = true;
              }
            });
          });
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Simulate click
        const clickEvent = new MouseEvent('click', {
          clientX: 400,
          clientY: 300,
          bubbles: true
        });
        
        document.dispatchEvent(clickEvent);
        
        // Check for ripple after delay
        setTimeout(() => {
          observer.disconnect();
          resolve({
            success: rippleCreated,
            reason: rippleCreated ? 'Click ripple effect created' : 'No click ripple effect detected'
          });
        }, 1000);
      });
    });

    const result = {
      test: 'click-effects',
      url: url,
      passed: clickTest.success,
      message: clickTest.reason,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testTouchDeviceDetection() {
    console.log('📱 Testing touch device detection...');
    
    // Test with touch device simulation
    await this.page.emulate({
      name: 'iPhone 12',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
      viewport: { width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    });

    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const touchTest = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor');
      
      return {
        cursorHidden: !cursor || getComputedStyle(cursor).display === 'none',
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        userAgent: navigator.userAgent
      };
    });

    const result = {
      test: 'touch-device-detection',
      url: 'touch-simulation',
      passed: touchTest.cursorHidden && touchTest.isTouchDevice,
      message: touchTest.cursorHidden ? 
        'Cursor correctly hidden on touch device' : 
        'Cursor not hidden on touch device',
      details: touchTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    // Reset to desktop
    await this.page.emulate({
      name: 'Desktop',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080, deviceScaleFactor: 1, isMobile: false, hasTouch: false }
    });
    
    return result;
  }

  async testPageTransitions() {
    console.log('🔄 Testing cursor across page transitions...');
    
    const pages = [
      'http://localhost:3000',
      'http://localhost:3000/portfolio',
      'http://localhost:3000/cursor-demo',
      'http://localhost:3000/contact'
    ];

    const transitionResults = [];

    for (const pageUrl of pages) {
      await this.page.goto(pageUrl, { waitUntil: 'networkidle0' });
      await this.page.waitForTimeout(1000);

      const cursorWorking = await this.page.evaluate(() => {
        const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                     document.querySelector('.enhanced-cursor');
        return !!cursor;
      });

      transitionResults.push({
        url: pageUrl,
        cursorWorking: cursorWorking
      });
    }

    const allPagesWorking = transitionResults.every(r => r.cursorWorking);

    const result = {
      test: 'page-transitions',
      url: 'multiple-pages',
      passed: allPagesWorking,
      message: `Cursor working on ${transitionResults.filter(r => r.cursorWorking).length}/${transitionResults.length} pages`,
      details: transitionResults,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async generateReport() {
    console.log('📝 Generating E2E test report...');
    
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests) * 100;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: totalTests,
        passedTests: passedTests,
        failedTests: totalTests - passedTests,
        successRate: successRate,
      },
      results: this.testResults,
      recommendations: this.generateRecommendations(),
    };

    console.log(`📊 E2E Test Summary:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${totalTests - passedTests}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.testResults.filter(r => !r.passed);

    failedTests.forEach(test => {
      switch (test.test) {
        case 'cursor-presence':
          recommendations.push({
            type: 'critical',
            message: `Cursor not found on ${test.url}`,
            suggestion: 'Check if EnhancedCustomCursor component is properly imported and rendered'
          });
          break;
        case 'cursor-movement':
          recommendations.push({
            type: 'high',
            message: 'Cursor not following mouse movement',
            suggestion: 'Verify GSAP animations and mouse event listeners are working'
          });
          break;
        case 'interactive-elements':
          recommendations.push({
            type: 'medium',
            message: 'Some interactive elements not found',
            suggestion: 'Ensure all required CSS classes are present on interactive elements'
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
    console.log('🧹 E2E testing cleanup complete');
  }

  async runAllTests() {
    try {
      await this.setup();
      
      // Test main pages
      const testUrls = [
        'http://localhost:3000',
        'http://localhost:3000/portfolio',
        'http://localhost:3000/cursor-demo',
        'http://localhost:3000/contact'
      ];

      for (const url of testUrls) {
        await this.testCursorPresence(url);
        await this.testCursorMovement(url);
        await this.testInteractiveElements(url);
        await this.testClickEffects(url);
      }

      await this.testTouchDeviceDetection();
      await this.testPageTransitions();
      
      const report = await this.generateReport();
      
      return report;
    } catch (error) {
      console.error('❌ E2E testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CursorE2ETester();
  
  tester.runAllTests()
    .then((report) => {
      console.log('✅ E2E testing completed');
      
      // Exit with error code if tests failed
      const hasFailures = report.summary.failedTests > 0;
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ E2E testing failed:', error);
      process.exit(1);
    });
}

module.exports = CursorE2ETester;
