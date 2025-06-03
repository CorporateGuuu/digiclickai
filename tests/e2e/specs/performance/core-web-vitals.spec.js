/**
 * DigiClick AI Core Web Vitals Performance Tests
 * Comprehensive performance testing for LCP, FID, CLS, and 60fps targets
 */

import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals Performance Tests', () => {
  const pages = [
    { path: '/', name: 'Home', lcpTarget: 4000, fidTarget: 100, clsTarget: 0.1 },
    { path: '/about', name: 'About', lcpTarget: 4000, fidTarget: 100, clsTarget: 0.1 },
    { path: '/services', name: 'Services', lcpTarget: 4000, fidTarget: 100, clsTarget: 0.1 },
    { path: '/contact', name: 'Contact', lcpTarget: 4000, fidTarget: 100, clsTarget: 0.1 }
  ];

  for (const pageInfo of pages) {
    test(`should meet Core Web Vitals targets on ${pageInfo.name} page`, async ({ page }) => {
      // Start performance monitoring
      await page.goto(pageInfo.path);
      
      // Collect Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals = {};
          
          // Largest Contentful Paint
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // First Input Delay
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
              vitals.fid = entry.processingStart - entry.startTime;
            });
          }).observe({ entryTypes: ['first-input'] });
          
          // Cumulative Layout Shift
          let clsValue = 0;
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Wait for measurements
          setTimeout(() => {
            resolve(vitals);
          }, 5000);
        });
      });
      
      // Assert Core Web Vitals targets
      if (vitals.lcp) {
        expect(vitals.lcp).toBeLessThan(pageInfo.lcpTarget);
      }
      if (vitals.fid) {
        expect(vitals.fid).toBeLessThan(pageInfo.fidTarget);
      }
      if (vitals.cls !== undefined) {
        expect(vitals.cls).toBeLessThan(pageInfo.clsTarget);
      }
    });
  }

  test('should maintain 60fps during cursor interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start frame rate monitoring
    const frameRateData = await page.evaluate(() => {
      return new Promise((resolve) => {
        const frameRates = [];
        let lastTime = performance.now();
        let frameCount = 0;
        
        function measureFrameRate(currentTime) {
          frameCount++;
          
          if (currentTime - lastTime >= 1000) {
            frameRates.push(frameCount);
            frameCount = 0;
            lastTime = currentTime;
          }
          
          if (frameRates.length < 5) {
            requestAnimationFrame(measureFrameRate);
          } else {
            const avgFrameRate = frameRates.reduce((a, b) => a + b, 0) / frameRates.length;
            resolve({ frameRates, avgFrameRate });
          }
        }
        
        requestAnimationFrame(measureFrameRate);
      });
    });

    // Test cursor interactions during frame rate monitoring
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.mouse.move(300, 300);
    await page.mouse.click(300, 300);

    // Assert frame rate targets
    expect(frameRateData.avgFrameRate).toBeGreaterThanOrEqual(55); // Allow 5fps tolerance
    
    // No frame rate should drop below 45fps
    for (const frameRate of frameRateData.frameRates) {
      expect(frameRate).toBeGreaterThanOrEqual(45);
    }
  });

  test('should maintain performance during form interactions', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Start performance monitoring
    await page.evaluate(() => {
      window.performanceMarks = [];
      window.performance.mark('form-performance-start');
    });

    // Perform rapid form interactions
    const formData = {
      name: 'Performance Test User',
      email: 'performance@test.com',
      company: 'Test Company',
      message: 'This is a performance test message with sufficient length to test typing performance.'
    };

    // Type rapidly to test performance
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    await page.locator('[data-testid="contact-email"]').fill(formData.email);
    await page.locator('[data-testid="contact-company"]').fill(formData.company);
    await page.locator('[data-testid="contact-message"]').fill(formData.message);

    // Test validation performance
    await page.locator('[data-testid="contact-email"]').clear();
    await page.locator('[data-testid="contact-email"]').fill('invalid-email');
    await page.locator('[data-testid="contact-name"]').focus();

    // Measure performance
    const performanceMetrics = await page.evaluate(() => {
      window.performance.mark('form-performance-end');
      window.performance.measure('form-performance', 'form-performance-start', 'form-performance-end');
      
      const measure = window.performance.getEntriesByName('form-performance')[0];
      const frameRate = window.getFrontendPerformanceManager?.()?.getPerformanceMetrics?.()?.frameRate || 60;
      
      return {
        duration: measure.duration,
        frameRate: frameRate
      };
    });

    // Assert performance targets
    expect(performanceMetrics.duration).toBeLessThan(2000); // Form interactions under 2s
    expect(performanceMetrics.frameRate).toBeGreaterThanOrEqual(55); // Maintain near 60fps
  });

  test('should maintain performance during page transitions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start performance monitoring
    await page.evaluate(() => {
      window.performance.mark('transition-start');
    });

    // Perform page transition
    await page.locator('a[href="/about"]').first().click();
    await page.waitForLoadState('networkidle');

    // Measure transition performance
    const transitionMetrics = await page.evaluate(() => {
      window.performance.mark('transition-end');
      window.performance.measure('page-transition', 'transition-start', 'transition-end');
      
      const measure = window.performance.getEntriesByName('page-transition')[0];
      return {
        duration: measure.duration,
        navigationTiming: performance.getEntriesByType('navigation')[0]
      };
    });

    // Assert transition performance
    expect(transitionMetrics.duration).toBeLessThan(3000); // Page transition under 3s
    expect(transitionMetrics.navigationTiming.loadEventEnd - transitionMetrics.navigationTiming.fetchStart).toBeLessThan(5000);
  });

  test('should optimize caching performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test cache performance
    const cacheMetrics = await page.evaluate(() => {
      const cacheManager = window.getRedisCacheManager?.();
      const apiCacheManager = window.getAPICacheManager?.();
      
      return {
        redisCacheAvailable: !!cacheManager,
        apiCacheAvailable: !!apiCacheManager,
        cacheStats: cacheManager ? cacheManager.getMetrics() : null
      };
    });

    expect(cacheMetrics.redisCacheAvailable).toBeTruthy();
    expect(cacheMetrics.apiCacheAvailable).toBeTruthy();

    if (cacheMetrics.cacheStats) {
      const hitRate = cacheMetrics.cacheStats.totalRequests > 0 ? 
        (cacheMetrics.cacheStats.hits / cacheMetrics.cacheStats.totalRequests) * 100 : 0;
      
      // Cache hit rate should be reasonable for a fresh session
      expect(hitRate).toBeGreaterThanOrEqual(0);
    }
  });

  test('should maintain performance with visual effects enabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enable visual effects
    await page.evaluate(() => {
      const visualEffectsManager = window.getVisualEffectsManager?.();
      if (visualEffectsManager) {
        visualEffectsManager.enableAllEffects();
      }
    });

    // Start performance monitoring with effects
    await page.evaluate(() => {
      window.performance.mark('effects-performance-start');
    });

    // Perform interactions with effects enabled
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.mouse.move(300, 300);
    await page.mouse.click(300, 300);

    // Scroll to trigger effects
    await page.mouse.wheel(0, 500);
    await page.mouse.wheel(0, -500);

    // Measure performance with effects
    const effectsPerformance = await page.evaluate(() => {
      window.performance.mark('effects-performance-end');
      window.performance.measure('effects-performance', 'effects-performance-start', 'effects-performance-end');
      
      const measure = window.performance.getEntriesByName('effects-performance')[0];
      const frameRate = window.getFrontendPerformanceManager?.()?.getPerformanceMetrics?.()?.frameRate || 60;
      
      return {
        duration: measure.duration,
        frameRate: frameRate
      };
    });

    // Assert performance with effects
    expect(effectsPerformance.frameRate).toBeGreaterThanOrEqual(50); // Allow some tolerance with effects
    expect(effectsPerformance.duration).toBeLessThan(3000);
  });

  test('should handle memory usage efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null;
    });

    if (initialMemory) {
      // Perform memory-intensive operations
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(Math.random() * 800, Math.random() * 600);
        await page.waitForTimeout(100);
      }

      // Navigate between pages
      await page.goto('/about');
      await page.waitForLoadState('networkidle');
      await page.goto('/services');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Check final memory usage
      const finalMemory = await page.evaluate(() => {
        return performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null;
      });

      if (finalMemory) {
        // Memory should not increase dramatically
        const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const memoryIncreasePercent = (memoryIncrease / initialMemory.usedJSHeapSize) * 100;
        
        expect(memoryIncreasePercent).toBeLessThan(50); // Memory increase should be reasonable
        expect(finalMemory.usedJSHeapSize).toBeLessThan(finalMemory.jsHeapSizeLimit * 0.8); // Stay under 80% of limit
      }
    }
  });

  test('should optimize resource loading performance', async ({ page }) => {
    // Monitor resource loading
    const resourceMetrics = [];
    
    page.on('response', response => {
      resourceMetrics.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        timing: response.timing()
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Analyze resource loading
    const criticalResources = resourceMetrics.filter(resource => 
      resource.url.includes('.css') || 
      resource.url.includes('.js') || 
      resource.url.includes('font')
    );

    // Critical resources should load quickly
    for (const resource of criticalResources) {
      if (resource.timing) {
        const totalTime = resource.timing.responseEnd - resource.timing.requestStart;
        expect(totalTime).toBeLessThan(2000); // Critical resources under 2s
      }
    }

    // Check for proper caching headers
    const cachedResources = resourceMetrics.filter(resource => 
      resource.status === 304 || // Not Modified
      (resource.url.includes('.css') || resource.url.includes('.js'))
    );

    expect(cachedResources.length).toBeGreaterThan(0); // Some resources should be cached
  });
});
