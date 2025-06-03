/**
 * DigiClick AI Contact Form E2E Tests
 * Tests critical user journey for contact form submission with real-time validation
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Form Critical Journey', () => {
  let testData;

  test.beforeEach(async ({ page }) => {
    // Load test data
    await page.goto('/');
    testData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('e2e-test-data') || '{}');
    });

    // Navigate to contact page
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should complete successful contact form submission with real-time validation', async ({ page }) => {
    const formData = testData.forms?.contact?.validData;
    
    // Test form visibility and accessibility
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toBeVisible();
    await expect(page.locator('form')).toHaveAttribute('role', 'form');
    
    // Test real-time validation - empty fields
    await page.locator('[data-testid="contact-name"]').focus();
    await page.locator('[data-testid="contact-email"]').focus();
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    
    // Test real-time validation - invalid email
    await page.locator('[data-testid="contact-email"]').fill('invalid-email');
    await page.locator('[data-testid="contact-name"]').focus();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email');
    
    // Fill form with valid data
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    await page.locator('[data-testid="contact-email"]').fill(formData.email);
    await page.locator('[data-testid="contact-company"]').fill(formData.company);
    await page.locator('[data-testid="contact-message"]').fill(formData.message);
    
    // Test auto-complete functionality
    await page.locator('[data-testid="contact-email"]').clear();
    await page.locator('[data-testid="contact-email"]').type('test@gm');
    await expect(page.locator('[data-testid="email-suggestions"]')).toBeVisible();
    await page.locator('[data-testid="suggestion-gmail"]').click();
    await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('test@gmail.com');
    
    // Test form validation success states
    await expect(page.locator('[data-testid="name-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-success"]')).toBeVisible();
    
    // Test auto-save functionality
    await page.waitForTimeout(2000); // Wait for auto-save
    await expect(page.locator('[data-testid="auto-save-indicator"]')).toContainText('Saved');
    
    // Test form submission
    await page.locator('[data-testid="submit-contact-form"]').click();
    
    // Test loading state
    await expect(page.locator('[data-testid="submit-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-contact-form"]')).toBeDisabled();
    
    // Test success state
    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Thank you');
    
    // Test form reset
    await expect(page.locator('[data-testid="contact-name"]')).toHaveValue('');
    await expect(page.locator('[data-testid="contact-email"]')).toHaveValue('');
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    const formData = testData.forms?.contact?.validData;
    
    // Fill and submit form
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    await page.locator('[data-testid="contact-email"]').fill(formData.email);
    await page.locator('[data-testid="contact-message"]').fill(formData.message);
    await page.locator('[data-testid="submit-contact-form"]').click();
    
    // Test error handling
    await expect(page.locator('[data-testid="submission-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Test retry functionality
    await page.locator('[data-testid="retry-button"]').click();
    await expect(page.locator('[data-testid="submit-loading"]')).toBeVisible();
  });

  test('should support keyboard navigation and accessibility', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="contact-name"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="contact-email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="contact-company"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="contact-message"]')).toBeFocused();
    
    // Test ARIA labels and roles
    await expect(page.locator('[data-testid="contact-name"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="contact-email"]')).toHaveAttribute('aria-required', 'true');
    
    // Test screen reader announcements
    const formData = testData.forms?.contact?.validData;
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    
    // Check for live region updates
    await expect(page.locator('[aria-live="polite"]')).toBeVisible();
  });

  test('should work correctly on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');
    
    // Test mobile form layout
    await expect(page.locator('[data-testid="enhanced-contact-form"]')).toBeVisible();
    
    // Test touch interactions
    const nameField = page.locator('[data-testid="contact-name"]');
    await nameField.tap();
    await expect(nameField).toBeFocused();
    
    // Test mobile keyboard
    await nameField.fill('Mobile Test User');
    
    // Test mobile-specific validation
    const emailField = page.locator('[data-testid="contact-email"]');
    await emailField.tap();
    await emailField.fill('mobile@test.com');
    
    // Test mobile submission
    await page.locator('[data-testid="contact-message"]').fill('Mobile test message');
    await page.locator('[data-testid="submit-contact-form"]').tap();
    
    // Test mobile success state
    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible({ timeout: 10000 });
  });

  test('should maintain performance during form interactions', async ({ page }) => {
    // Start performance monitoring
    await page.evaluate(() => {
      window.performanceMarks = [];
      window.performance.mark('form-interaction-start');
    });

    const formData = testData.forms?.contact?.validData;
    
    // Fill form rapidly to test performance
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    await page.locator('[data-testid="contact-email"]').fill(formData.email);
    await page.locator('[data-testid="contact-company"]').fill(formData.company);
    await page.locator('[data-testid="contact-message"]').fill(formData.message);
    
    // Measure performance
    const performanceMetrics = await page.evaluate(() => {
      window.performance.mark('form-interaction-end');
      window.performance.measure('form-interaction', 'form-interaction-start', 'form-interaction-end');
      
      const measure = window.performance.getEntriesByName('form-interaction')[0];
      return {
        duration: measure.duration,
        frameRate: window.getFrontendPerformanceManager?.()?.getPerformanceMetrics?.()?.frameRate || 60
      };
    });
    
    // Assert performance targets
    expect(performanceMetrics.duration).toBeLessThan(1000); // Form interaction under 1s
    expect(performanceMetrics.frameRate).toBeGreaterThanOrEqual(55); // Maintain near 60fps
  });

  test('should handle offline scenarios gracefully', async ({ page }) => {
    const formData = testData.forms?.contact?.validData;
    
    // Fill form
    await page.locator('[data-testid="contact-name"]').fill(formData.name);
    await page.locator('[data-testid="contact-email"]').fill(formData.email);
    await page.locator('[data-testid="contact-message"]').fill(formData.message);
    
    // Go offline
    await page.context().setOffline(true);
    
    // Try to submit
    await page.locator('[data-testid="submit-contact-form"]').click();
    
    // Test offline handling
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="offline-queue-message"]')).toContainText('queued');
    
    // Go back online
    await page.context().setOffline(false);
    
    // Test automatic retry
    await expect(page.locator('[data-testid="submission-success"]')).toBeVisible({ timeout: 15000 });
  });

  test('should integrate with A/B testing variants', async ({ page }) => {
    // Test different form variants
    const variants = ['control', 'enhanced', 'minimalist'];
    
    for (const variant of variants) {
      await page.evaluate((v) => {
        localStorage.setItem('ab-test-variant', v);
      }, variant);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Test form exists for all variants
      await expect(page.locator('[data-testid="enhanced-contact-form"]')).toBeVisible();
      
      // Test variant-specific features
      if (variant === 'enhanced') {
        await expect(page.locator('[data-testid="enhanced-features"]')).toBeVisible();
      }
    }
  });
});
