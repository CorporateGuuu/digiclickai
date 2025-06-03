/**
 * DigiClick AI Global Test Setup
 * Prepares testing environment and initializes test data
 */

import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup() {
  console.log('🚀 Setting up DigiClick AI E2E testing environment...');

  // Create test results directory
  const testResultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }

  // Create screenshots directory
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Create videos directory
  const videosDir = path.join(testResultsDir, 'videos');
  if (!fs.existsSync(videosDir)) {
    fs.mkdirSync(videosDir, { recursive: true });
  }

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(process.env.BASE_URL || 'http://localhost:3000');
    
    // Wait for critical resources to load
    await page.waitForSelector('[data-testid="app-ready"]', { timeout: 60000 });
    
    // Initialize test data
    console.log('📊 Initializing test data...');
    await initializeTestData(page);
    
    // Warm up caches
    console.log('🔥 Warming up caches...');
    await warmUpCaches(page);
    
    // Verify accessibility manager is loaded
    console.log('♿ Verifying accessibility systems...');
    await verifyAccessibilitySetup(page);
    
    // Verify cursor system is loaded
    console.log('🖱️ Verifying cursor systems...');
    await verifyCursorSetup(page);
    
    // Verify performance systems
    console.log('⚡ Verifying performance systems...');
    await verifyPerformanceSetup(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function initializeTestData(page) {
  // Initialize test user data
  await page.evaluate(() => {
    const testData = {
      users: [
        {
          id: 'test-user-1',
          name: 'John Doe',
          email: 'john.doe@test.com',
          preferences: {
            accessibility: {
              reducedMotion: false,
              highContrast: false,
              screenReader: false
            },
            cursor: {
              theme: 'control',
              size: 'medium',
              effects: true
            },
            visualEffects: {
              enabled: true,
              intensity: 'medium'
            }
          }
        },
        {
          id: 'test-user-2',
          name: 'Jane Smith',
          email: 'jane.smith@test.com',
          preferences: {
            accessibility: {
              reducedMotion: true,
              highContrast: true,
              screenReader: true
            },
            cursor: {
              theme: 'minimalist',
              size: 'large',
              effects: false
            },
            visualEffects: {
              enabled: false,
              intensity: 'low'
            }
          }
        }
      ],
      forms: {
        contact: {
          validData: {
            name: 'Test User',
            email: 'test@example.com',
            company: 'Test Company',
            message: 'This is a test message for E2E testing purposes.'
          },
          invalidData: {
            name: '',
            email: 'invalid-email',
            company: '',
            message: ''
          }
        },
        demo: {
          validData: {
            name: 'Demo User',
            email: 'demo@example.com',
            company: 'Demo Company',
            phone: '+1234567890',
            preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        },
        newsletter: {
          validData: {
            email: 'newsletter@example.com',
            preferences: ['ai-updates', 'product-news']
          }
        }
      },
      files: {
        testPdf: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFRlc3QgUERGKQovQ3JlYXRvciAoVGVzdCBDcmVhdG9yKQovUHJvZHVjZXIgKFRlc3QgUHJvZHVjZXIpCi9DcmVhdGlvbkRhdGUgKEQ6MjAyNDAxMDEwMDAwMDBaKQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3MDAgVGQKKFRlc3QgUERGIENvbnRlbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAxNzQgMDAwMDAgbiAKMDAwMDAwMDIyMSAwMDAwMCBuIAowMDAwMDAwMjc4IDAwMDAwIG4gCjAwMDAwMDAzNzggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDIgMCBSCj4+CnN0YXJ0eHJlZgo0NzAKJSVFT0Y=',
        testImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }
    };
    
    // Store test data in localStorage
    localStorage.setItem('e2e-test-data', JSON.stringify(testData));
    
    // Mark app as ready for testing
    const readyElement = document.createElement('div');
    readyElement.setAttribute('data-testid', 'app-ready');
    readyElement.style.display = 'none';
    document.body.appendChild(readyElement);
  });
}

async function warmUpCaches(page) {
  // Warm up critical caches
  const criticalPages = [
    '/',
    '/about',
    '/services',
    '/pricing',
    '/contact'
  ];
  
  for (const pagePath of criticalPages) {
    try {
      await page.goto(`${process.env.BASE_URL || 'http://localhost:3000'}${pagePath}`);
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.warn(`Failed to warm cache for ${pagePath}:`, error.message);
    }
  }
}

async function verifyAccessibilitySetup(page) {
  const accessibilityReady = await page.evaluate(() => {
    return window.getAccessibilityManager && 
           typeof window.getAccessibilityManager === 'function';
  });
  
  if (!accessibilityReady) {
    throw new Error('Accessibility manager not loaded');
  }
}

async function verifyCursorSetup(page) {
  const cursorReady = await page.evaluate(() => {
    return window.getCustomCursor && 
           typeof window.getCustomCursor === 'function';
  });
  
  if (!cursorReady) {
    throw new Error('Cursor system not loaded');
  }
}

async function verifyPerformanceSetup(page) {
  const performanceReady = await page.evaluate(() => {
    return window.getFrontendPerformanceManager && 
           typeof window.getFrontendPerformanceManager === 'function';
  });
  
  if (!performanceReady) {
    throw new Error('Performance manager not loaded');
  }
}

export default globalSetup;
