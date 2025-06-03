/**
 * DigiClick AI Visual Regression Tests
 * Comprehensive visual testing for UI components and responsive design
 */

import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ];

  const pages = [
    { path: '/', name: 'home' },
    { path: '/about', name: 'about' },
    { path: '/services', name: 'services' },
    { path: '/pricing', name: 'pricing' },
    { path: '/contact', name: 'contact' }
  ];

  // Test each page across different viewports
  for (const pageInfo of pages) {
    for (const viewport of viewports) {
      test(`should match visual baseline for ${pageInfo.name} page on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(pageInfo.path);
        await page.waitForLoadState('networkidle');
        
        // Wait for animations to complete
        await page.waitForTimeout(2000);
        
        // Hide dynamic content that changes between runs
        await page.addStyleTag({
          content: `
            [data-testid="current-time"],
            [data-testid="random-content"],
            .cursor-trail,
            .particle-effect {
              visibility: hidden !important;
            }
          `
        });
        
        await expect(page).toHaveScreenshot(`${pageInfo.name}-${viewport.name}.png`);
      });
    }
  }

  test('should match visual baseline for contact form states', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Test empty form state
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('contact-form-empty.png');

    // Test filled form state
    await page.locator('[data-testid="contact-name"]').fill('John Doe');
    await page.locator('[data-testid="contact-email"]').fill('john@example.com');
    await page.locator('[data-testid="contact-company"]').fill('Test Company');
    await page.locator('[data-testid="contact-message"]').fill('Test message');
    
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('contact-form-filled.png');

    // Test validation error state
    await page.locator('[data-testid="contact-email"]').clear();
    await page.locator('[data-testid="contact-email"]').fill('invalid-email');
    await page.locator('[data-testid="contact-name"]').focus();
    
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('contact-form-error.png');

    // Test success state
    await page.locator('[data-testid="contact-email"]').fill('john@example.com');
    
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('contact-form-valid.png');
  });

  test('should match visual baseline for cursor customization panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open cursor customization panel
    await page.locator('[data-testid="cursor-settings-trigger"]').click();
    await page.waitForSelector('[data-testid="cursor-customization-panel"]');
    
    // Test panel default state
    await expect(page.locator('[data-testid="cursor-customization-panel"]')).toHaveScreenshot('cursor-panel-default.png');

    // Test different cursor themes
    const themes = ['control', 'enhanced', 'minimalist', 'gaming'];
    
    for (const theme of themes) {
      await page.locator(`[data-testid="cursor-theme-${theme}"]`).click();
      await page.waitForTimeout(500); // Wait for theme change
      
      await expect(page.locator('[data-testid="cursor-customization-panel"]')).toHaveScreenshot(`cursor-panel-${theme}.png`);
    }

    // Test accessibility settings
    await page.locator('[data-testid="accessibility-tab"]').click();
    await expect(page.locator('[data-testid="cursor-customization-panel"]')).toHaveScreenshot('cursor-panel-accessibility.png');
  });

  test('should match visual baseline for visual effects panel', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open visual effects panel
    await page.locator('[data-testid="visual-effects-trigger"]').click();
    await page.waitForSelector('[data-testid="visual-effects-panel"]');
    
    // Test panel default state
    await expect(page.locator('[data-testid="visual-effects-panel"]')).toHaveScreenshot('visual-effects-panel-default.png');

    // Test different effect intensities
    const intensities = ['low', 'medium', 'high'];
    
    for (const intensity of intensities) {
      await page.locator(`[data-testid="intensity-${intensity}"]`).click();
      await page.waitForTimeout(500);
      
      await expect(page.locator('[data-testid="visual-effects-panel"]')).toHaveScreenshot(`visual-effects-panel-${intensity}.png`);
    }

    // Test individual effect toggles
    await page.locator('[data-testid="glow-effects-toggle"]').click();
    await expect(page.locator('[data-testid="visual-effects-panel"]')).toHaveScreenshot('visual-effects-panel-glow-disabled.png');
  });

  test('should match visual baseline for navigation states', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test navigation default state
    await expect(page.locator('[data-testid="main-navigation"]')).toHaveScreenshot('navigation-default.png');

    // Test navigation hover states
    await page.locator('[data-testid="nav-services"]').hover();
    await expect(page.locator('[data-testid="main-navigation"]')).toHaveScreenshot('navigation-services-hover.png');

    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('[data-testid="mobile-navigation"]')).toHaveScreenshot('navigation-mobile.png');

    // Test mobile menu open
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toHaveScreenshot('navigation-mobile-open.png');
  });

  test('should match visual baseline for loading states', async ({ page }) => {
    // Intercept requests to simulate loading
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }, 2000);
    });

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Fill and submit form to trigger loading state
    await page.locator('[data-testid="contact-name"]').fill('Test User');
    await page.locator('[data-testid="contact-email"]').fill('test@example.com');
    await page.locator('[data-testid="contact-message"]').fill('Test message');
    
    await page.locator('[data-testid="submit-contact-form"]').click();
    
    // Capture loading state
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('form-loading-state.png');
  });

  test('should match visual baseline for error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Fill and submit form to trigger error state
    await page.locator('[data-testid="contact-name"]').fill('Test User');
    await page.locator('[data-testid="contact-email"]').fill('test@example.com');
    await page.locator('[data-testid="contact-message"]').fill('Test message');
    
    await page.locator('[data-testid="submit-contact-form"]').click();
    await page.waitForSelector('[data-testid="submission-error"]');
    
    // Capture error state
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toHaveScreenshot('form-error-state.png');
  });

  test('should match visual baseline for dark theme consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test dark theme colors
    const darkThemeElements = [
      '[data-testid="hero-section"]',
      '[data-testid="services-section"]',
      '[data-testid="footer"]'
    ];

    for (const selector of darkThemeElements) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await expect(element).toHaveScreenshot(`dark-theme-${selector.replace(/[[\]"=]/g, '').replace(/data-testid-/, '')}.png`);
      }
    }
  });

  test('should match visual baseline for accessibility features', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Test high contrast mode
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            filter: contrast(150%);
          }
        }
      `
    });
    
    await expect(page).toHaveScreenshot('high-contrast-mode.png');

    // Test reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('reduced-motion-mode.png');

    // Test focus indicators
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    await expect(page).toHaveScreenshot('focus-indicators.png');
  });

  test('should match visual baseline for A/B testing variants', async ({ page }) => {
    const variants = ['control', 'enhanced', 'minimalist', 'gaming'];
    
    for (const variant of variants) {
      await page.evaluate((v) => {
        localStorage.setItem('ab-test-variant', v);
      }, variant);
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Wait for variant to apply
      
      await expect(page).toHaveScreenshot(`ab-variant-${variant}.png`);
    }
  });

  test('should match visual baseline for responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile-small', width: 320, height: 568 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'desktop-small', width: 1366, height: 768 },
      { name: 'desktop-large', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Hide dynamic content
      await page.addStyleTag({
        content: `
          .cursor-trail,
          .particle-effect,
          [data-testid="current-time"] {
            display: none !important;
          }
        `
      });
      
      await expect(page).toHaveScreenshot(`responsive-${breakpoint.name}.png`);
    }
  });
});
