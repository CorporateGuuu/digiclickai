/**
 * DigiClick AI Enhanced Cursor System - Accessibility Tests
 * Tests cursor accessibility features and compliance
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');

class CursorAccessibilityTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Setting up accessibility testing environment...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    console.log('✅ Accessibility testing environment ready');
  }

  async testReducedMotionPreference() {
    console.log('🎭 Testing reduced motion preference compliance...');
    
    // Test with reduced motion preference
    await this.page.emulateMediaFeatures([
      { name: 'prefers-reduced-motion', value: 'reduce' }
    ]);

    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const reducedMotionTest = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor');
      
      if (!cursor) {
        return { success: false, reason: 'Cursor not found' };
      }

      // Check if reduced motion is respected
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const cursorStyle = getComputedStyle(cursor);
      
      // Check for reduced animation properties
      const hasReducedAnimations = 
        cursorStyle.animationDuration === '0s' ||
        cursorStyle.transitionDuration === '0s' ||
        cursor.classList.contains('reduced-motion') ||
        cursor.hasAttribute('data-reduced-motion');

      return {
        success: prefersReducedMotion ? hasReducedAnimations : true,
        prefersReducedMotion: prefersReducedMotion,
        hasReducedAnimations: hasReducedAnimations,
        reason: prefersReducedMotion ? 
          (hasReducedAnimations ? 'Reduced motion respected' : 'Reduced motion not respected') :
          'No reduced motion preference'
      };
    });

    const result = {
      test: 'reduced-motion-preference',
      passed: reducedMotionTest.success,
      message: reducedMotionTest.reason,
      details: reducedMotionTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testAriaAttributes() {
    console.log('🏷️ Testing ARIA attributes...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const ariaTest = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor');
      
      if (!cursor) {
        return { success: false, reason: 'Cursor not found' };
      }

      const hasAriaHidden = cursor.hasAttribute('aria-hidden');
      const ariaHiddenValue = cursor.getAttribute('aria-hidden');
      const hasRole = cursor.hasAttribute('role');
      const roleValue = cursor.getAttribute('role');

      return {
        success: hasAriaHidden && ariaHiddenValue === 'true',
        hasAriaHidden: hasAriaHidden,
        ariaHiddenValue: ariaHiddenValue,
        hasRole: hasRole,
        roleValue: roleValue,
        reason: hasAriaHidden && ariaHiddenValue === 'true' ? 
          'Proper ARIA attributes found' : 
          'Missing or incorrect ARIA attributes'
      };
    });

    const result = {
      test: 'aria-attributes',
      passed: ariaTest.success,
      message: ariaTest.reason,
      details: ariaTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testKeyboardNavigation() {
    console.log('⌨️ Testing keyboard navigation compatibility...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const keyboardTest = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let keyboardInterference = false;
        let focusableElements = [];

        // Find focusable elements
        const focusableSelectors = [
          'button', 'a[href]', 'input', 'select', 'textarea',
          '[tabindex]:not([tabindex="-1"])'
        ];
        
        focusableSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          focusableElements.push(...Array.from(elements));
        });

        if (focusableElements.length === 0) {
          resolve({
            success: true,
            reason: 'No focusable elements to test',
            focusableCount: 0
          });
          return;
        }

        // Test keyboard navigation
        let currentIndex = 0;
        const testElement = focusableElements[currentIndex];
        
        if (testElement) {
          testElement.focus();
          
          // Check if cursor interferes with focus
          setTimeout(() => {
            const activeElement = document.activeElement;
            const focusWorking = activeElement === testElement;
            
            resolve({
              success: focusWorking,
              reason: focusWorking ? 
                'Keyboard navigation not interfered by cursor' : 
                'Cursor interferes with keyboard navigation',
              focusableCount: focusableElements.length,
              activeElement: activeElement ? activeElement.tagName : 'none'
            });
          }, 500);
        } else {
          resolve({
            success: true,
            reason: 'No testable focusable elements',
            focusableCount: focusableElements.length
          });
        }
      });
    });

    const result = {
      test: 'keyboard-navigation',
      passed: keyboardTest.success,
      message: keyboardTest.reason,
      details: keyboardTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testScreenReaderCompatibility() {
    console.log('🔊 Testing screen reader compatibility...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const screenReaderTest = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor');
      
      if (!cursor) {
        return { success: false, reason: 'Cursor not found' };
      }

      // Check if cursor is properly hidden from screen readers
      const isHiddenFromScreenReader = 
        cursor.hasAttribute('aria-hidden') && cursor.getAttribute('aria-hidden') === 'true';
      
      // Check if cursor doesn't have any text content that could be read
      const hasTextContent = cursor.textContent && cursor.textContent.trim().length > 0;
      
      // Check if cursor doesn't have alt text or labels
      const hasAltText = cursor.hasAttribute('alt') || cursor.hasAttribute('aria-label');

      return {
        success: isHiddenFromScreenReader && !hasTextContent && !hasAltText,
        isHiddenFromScreenReader: isHiddenFromScreenReader,
        hasTextContent: hasTextContent,
        hasAltText: hasAltText,
        textContent: cursor.textContent,
        reason: isHiddenFromScreenReader && !hasTextContent && !hasAltText ?
          'Cursor properly hidden from screen readers' :
          'Cursor may interfere with screen readers'
      };
    });

    const result = {
      test: 'screen-reader-compatibility',
      passed: screenReaderTest.success,
      message: screenReaderTest.reason,
      details: screenReaderTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testColorContrast() {
    console.log('🎨 Testing cursor visibility and color contrast...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    const contrastTest = await this.page.evaluate(() => {
      const cursor = document.querySelector('[data-testid="enhanced-cursor"]') ||
                   document.querySelector('.enhanced-cursor');
      
      if (!cursor) {
        return { success: false, reason: 'Cursor not found' };
      }

      const cursorStyle = getComputedStyle(cursor);
      const backgroundColor = cursorStyle.backgroundColor;
      const borderColor = cursorStyle.borderColor;
      const boxShadow = cursorStyle.boxShadow;

      // Check if cursor has sufficient visual distinction
      const hasBackground = backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasBorder = borderColor && borderColor !== 'rgba(0, 0, 0, 0)';
      const hasShadow = boxShadow && boxShadow !== 'none';
      
      const hasVisualDistinction = hasBackground || hasBorder || hasShadow;

      return {
        success: hasVisualDistinction,
        hasBackground: hasBackground,
        hasBorder: hasBorder,
        hasShadow: hasShadow,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        boxShadow: boxShadow,
        reason: hasVisualDistinction ?
          'Cursor has sufficient visual distinction' :
          'Cursor lacks visual distinction'
      };
    });

    const result = {
      test: 'color-contrast',
      passed: contrastTest.success,
      message: contrastTest.reason,
      details: contrastTest,
    };

    this.testResults.push(result);
    console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
    
    return result;
  }

  async testAxeCompliance() {
    console.log('🪓 Running axe-core accessibility audit...');
    
    await this.page.goto('http://localhost:3000/cursor-demo', { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);

    try {
      const axe = new AxePuppeteer(this.page);
      const axeResults = await axe.analyze();

      const violations = axeResults.violations;
      const cursorRelatedViolations = violations.filter(violation => 
        violation.nodes.some(node => 
          node.html.includes('cursor') || 
          node.target.some(target => target.includes('cursor'))
        )
      );

      const result = {
        test: 'axe-compliance',
        passed: cursorRelatedViolations.length === 0,
        message: cursorRelatedViolations.length === 0 ?
          'No cursor-related accessibility violations found' :
          `Found ${cursorRelatedViolations.length} cursor-related accessibility violations`,
        details: {
          totalViolations: violations.length,
          cursorViolations: cursorRelatedViolations.length,
          violations: cursorRelatedViolations.map(v => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help
          }))
        }
      };

      this.testResults.push(result);
      console.log(`${result.passed ? '✅' : '❌'} ${result.message}`);
      
      return result;
    } catch (error) {
      console.error('❌ Axe audit failed:', error);
      
      const result = {
        test: 'axe-compliance',
        passed: false,
        message: 'Axe audit failed to run',
        details: { error: error.message }
      };

      this.testResults.push(result);
      return result;
    }
  }

  async generateReport() {
    console.log('📝 Generating accessibility test report...');
    
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

    console.log(`📊 Accessibility Test Summary:`);
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
        case 'reduced-motion-preference':
          recommendations.push({
            type: 'high',
            message: 'Cursor does not respect reduced motion preferences',
            suggestion: 'Add CSS media query for prefers-reduced-motion and disable animations accordingly'
          });
          break;
        case 'aria-attributes':
          recommendations.push({
            type: 'medium',
            message: 'Cursor missing proper ARIA attributes',
            suggestion: 'Add aria-hidden="true" to cursor element to hide from screen readers'
          });
          break;
        case 'keyboard-navigation':
          recommendations.push({
            type: 'high',
            message: 'Cursor interferes with keyboard navigation',
            suggestion: 'Ensure cursor does not capture focus or interfere with tab navigation'
          });
          break;
        case 'screen-reader-compatibility':
          recommendations.push({
            type: 'medium',
            message: 'Cursor may interfere with screen readers',
            suggestion: 'Ensure cursor is properly hidden from assistive technologies'
          });
          break;
        case 'color-contrast':
          recommendations.push({
            type: 'low',
            message: 'Cursor lacks sufficient visual distinction',
            suggestion: 'Add border, shadow, or background color to improve cursor visibility'
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
    console.log('🧹 Accessibility testing cleanup complete');
  }

  async runAllTests() {
    try {
      await this.setup();
      
      await this.testReducedMotionPreference();
      await this.testAriaAttributes();
      await this.testKeyboardNavigation();
      await this.testScreenReaderCompatibility();
      await this.testColorContrast();
      await this.testAxeCompliance();
      
      const report = await this.generateReport();
      
      return report;
    } catch (error) {
      console.error('❌ Accessibility testing failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CursorAccessibilityTester();
  
  tester.runAllTests()
    .then((report) => {
      console.log('✅ Accessibility testing completed');
      
      // Exit with error code if tests failed
      const hasFailures = report.summary.failedTests > 0;
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Accessibility testing failed:', error);
      process.exit(1);
    });
}

module.exports = CursorAccessibilityTester;
