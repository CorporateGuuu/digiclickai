/**
 * DigiClick AI File Upload E2E Tests
 * Tests critical user journey for file upload with drag-and-drop functionality
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload Critical Journey', () => {
  let testData;

  test.beforeEach(async ({ page }) => {
    // Load test data
    await page.goto('/');
    testData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('e2e-test-data') || '{}');
    });

    // Navigate to contact page with file upload
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
  });

  test('should upload files via drag and drop successfully', async ({ page }) => {
    // Create test file
    const testFilePath = path.join(__dirname, '../../fixtures/test-document.pdf');
    await createTestFile(testFilePath, 'PDF test content');

    // Test drag and drop area visibility
    await expect(page.locator('[data-testid="file-upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="drag-drop-zone"]')).toBeVisible();

    // Test drag enter state
    await page.locator('[data-testid="drag-drop-zone"]').hover();
    await page.setInputFiles('[data-testid="file-input"]', testFilePath);

    // Test file preview
    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-name"]')).toContainText('test-document.pdf');
    await expect(page.locator('[data-testid="file-size"]')).toBeVisible();

    // Test upload progress
    await page.locator('[data-testid="upload-button"]').click();
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();

    // Test upload completion
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="uploaded-file-link"]')).toBeVisible();

    // Cleanup
    await cleanupTestFile(testFilePath);
  });

  test('should handle multiple file uploads', async ({ page }) => {
    const testFiles = [
      path.join(__dirname, '../../fixtures/test-doc1.pdf'),
      path.join(__dirname, '../../fixtures/test-doc2.txt'),
      path.join(__dirname, '../../fixtures/test-image.png')
    ];

    // Create test files
    for (const filePath of testFiles) {
      await createTestFile(filePath, `Test content for ${path.basename(filePath)}`);
    }

    // Upload multiple files
    await page.setInputFiles('[data-testid="file-input"]', testFiles);

    // Test multiple file previews
    await expect(page.locator('[data-testid="file-preview"]')).toHaveCount(3);
    
    // Test individual file management
    await expect(page.locator('[data-testid="file-item-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-item-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-item-2"]')).toBeVisible();

    // Test file removal
    await page.locator('[data-testid="remove-file-1"]').click();
    await expect(page.locator('[data-testid="file-preview"]')).toHaveCount(2);

    // Test batch upload
    await page.locator('[data-testid="upload-all-button"]').click();
    
    // Test batch progress
    await expect(page.locator('[data-testid="batch-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="overall-progress"]')).toBeVisible();

    // Test batch completion
    await expect(page.locator('[data-testid="batch-upload-success"]')).toBeVisible({ timeout: 15000 });

    // Cleanup
    for (const filePath of testFiles) {
      await cleanupTestFile(filePath);
    }
  });

  test('should validate file types and sizes', async ({ page }) => {
    // Test invalid file type
    const invalidFilePath = path.join(__dirname, '../../fixtures/test-invalid.exe');
    await createTestFile(invalidFilePath, 'Invalid file content');

    await page.setInputFiles('[data-testid="file-input"]', invalidFilePath);
    
    // Test validation error
    await expect(page.locator('[data-testid="file-type-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('File type not supported');

    // Test file size validation
    const largeFilePath = path.join(__dirname, '../../fixtures/large-file.pdf');
    await createLargeTestFile(largeFilePath, 15 * 1024 * 1024); // 15MB file

    await page.setInputFiles('[data-testid="file-input"]', largeFilePath);
    
    // Test size validation error
    await expect(page.locator('[data-testid="file-size-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('File size exceeds limit');

    // Cleanup
    await cleanupTestFile(invalidFilePath);
    await cleanupTestFile(largeFilePath);
  });

  test('should support keyboard navigation for file upload', async ({ page }) => {
    // Test keyboard navigation to file input
    await page.keyboard.press('Tab');
    // Navigate to file upload area
    let tabCount = 0;
    while (tabCount < 10) {
      const focused = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
      if (focused === 'file-input' || focused === 'upload-button') {
        break;
      }
      await page.keyboard.press('Tab');
      tabCount++;
    }

    // Test keyboard file selection
    await page.keyboard.press('Enter');
    
    // Test accessibility attributes
    await expect(page.locator('[data-testid="file-upload-area"]')).toHaveAttribute('role', 'button');
    await expect(page.locator('[data-testid="file-input"]')).toHaveAttribute('aria-label');
    
    // Test screen reader announcements
    const testFilePath = path.join(__dirname, '../../fixtures/keyboard-test.pdf');
    await createTestFile(testFilePath, 'Keyboard test content');
    
    await page.setInputFiles('[data-testid="file-input"]', testFilePath);
    
    // Check for ARIA live region updates
    await expect(page.locator('[aria-live="polite"]')).toContainText('File selected');

    await cleanupTestFile(testFilePath);
  });

  test('should handle upload errors gracefully', async ({ page }) => {
    // Mock upload API error
    await page.route('**/api/upload', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Upload failed' })
      });
    });

    const testFilePath = path.join(__dirname, '../../fixtures/error-test.pdf');
    await createTestFile(testFilePath, 'Error test content');

    await page.setInputFiles('[data-testid="file-input"]', testFilePath);
    await page.locator('[data-testid="upload-button"]').click();

    // Test error handling
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="retry-upload-button"]')).toBeVisible();

    // Test retry functionality
    await page.locator('[data-testid="retry-upload-button"]').click();
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();

    await cleanupTestFile(testFilePath);
  });

  test('should work correctly on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test');

    // Test mobile file upload interface
    await expect(page.locator('[data-testid="mobile-upload-button"]')).toBeVisible();
    
    // Test touch interactions
    await page.locator('[data-testid="mobile-upload-button"]').tap();
    
    // Test mobile file selection
    const testFilePath = path.join(__dirname, '../../fixtures/mobile-test.pdf');
    await createTestFile(testFilePath, 'Mobile test content');
    
    await page.setInputFiles('[data-testid="file-input"]', testFilePath);
    
    // Test mobile preview
    await expect(page.locator('[data-testid="mobile-file-preview"]')).toBeVisible();
    
    // Test mobile upload
    await page.locator('[data-testid="mobile-upload-confirm"]').tap();
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });

    await cleanupTestFile(testFilePath);
  });

  test('should maintain performance during file operations', async ({ page }) => {
    // Start performance monitoring
    await page.evaluate(() => {
      window.performance.mark('file-upload-start');
    });

    const testFilePath = path.join(__dirname, '../../fixtures/performance-test.pdf');
    await createTestFile(testFilePath, 'Performance test content');

    // Upload file and measure performance
    await page.setInputFiles('[data-testid="file-input"]', testFilePath);
    await page.locator('[data-testid="upload-button"]').click();
    
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 10000 });

    // Measure performance
    const performanceMetrics = await page.evaluate(() => {
      window.performance.mark('file-upload-end');
      window.performance.measure('file-upload', 'file-upload-start', 'file-upload-end');
      
      const measure = window.performance.getEntriesByName('file-upload')[0];
      return {
        duration: measure.duration,
        frameRate: window.getFrontendPerformanceManager?.()?.getPerformanceMetrics?.()?.frameRate || 60
      };
    });

    // Assert performance targets
    expect(performanceMetrics.duration).toBeLessThan(5000); // Upload under 5s
    expect(performanceMetrics.frameRate).toBeGreaterThanOrEqual(55); // Maintain near 60fps

    await cleanupTestFile(testFilePath);
  });

  test('should integrate with caching system', async ({ page }) => {
    const testFilePath = path.join(__dirname, '../../fixtures/cache-test.pdf');
    await createTestFile(testFilePath, 'Cache test content');

    // Upload file
    await page.setInputFiles('[data-testid="file-input"]', testFilePath);
    await page.locator('[data-testid="upload-button"]').click();
    await page.waitForSelector('[data-testid="upload-success"]', { timeout: 10000 });

    // Test cache integration
    const cacheStatus = await page.evaluate(() => {
      const cacheManager = window.getRedisCacheManager?.();
      return cacheManager ? 'available' : 'unavailable';
    });

    expect(cacheStatus).toBe('available');

    await cleanupTestFile(testFilePath);
  });
});

// Helper functions
async function createTestFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

async function createLargeTestFile(filePath, size) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const buffer = Buffer.alloc(size, 'a');
  fs.writeFileSync(filePath, buffer);
}

async function cleanupTestFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
