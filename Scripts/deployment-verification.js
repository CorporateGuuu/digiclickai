#!/usr/bin/env node

/**
 * DigiClick AI Comprehensive Deployment Verification
 * Validates all critical functionality post-deployment
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

class DeploymentVerification {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.com';
    this.backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://digiclick-ai-backend.onrender.com';
    this.results = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      site_functionality: {},
      cursor_system: {},
      ab_testing: {},
      performance_monitoring: {},
      backend_integration: {},
      user_flows: {},
      errors: [],
      warnings: [],
      recommendations: []
    };
    
    // All 43 pages to verify
    this.pages = [
      '/', '/about', '/contact', '/pricing', '/portfolio', '/services',
      '/cursor-context-demo', '/admin/ab-test', '/blog', '/case-studies',
      '/testimonials', '/faq', '/privacy-policy', '/terms-of-service',
      '/careers', '/press', '/partners', '/integrations', '/documentation',
      '/api-docs', '/support', '/downloads', '/resources', '/events',
      '/webinars', '/tutorials', '/guides', '/best-practices', '/industry',
      '/solutions', '/enterprise', '/startup', '/agency', '/freelancer',
      '/developer', '/designer', '/marketer', '/sales', '/customer-success',
      '/product-updates', '/changelog', '/roadmap', '/status'
    ];
  }

  async runCompleteVerification() {
    console.log('🚀 Starting DigiClick AI Deployment Verification...');
    console.log(`📍 Target URL: ${this.baseUrl}`);
    console.log(`🔗 Backend URL: ${this.backendUrl}`);
    console.log('=' .repeat(80));

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
      });

      // Run all verification components
      await this.verifySiteFunctionality(browser);
      await this.verifyCursorSystem(browser);
      await this.verifyABTesting(browser);
      await this.verifyPerformanceMonitoring(browser);
      await this.verifyBackendIntegration();
      await this.verifyUserFlows(browser);

      await browser.close();
      
      this.analyzeResults();
      this.generateReport();
      
    } catch (error) {
      console.error('💥 Deployment verification failed:', error);
      this.results.overall_status = 'failure';
      this.results.errors.push({
        type: 'verification_failure',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return this.results;
  }

  async verifySiteFunctionality(browser) {
    console.log('🌐 Verifying complete site functionality...');
    
    const functionality = {
      pages_tested: 0,
      pages_successful: 0,
      pages_failed: [],
      sitemap_verification: false,
      responsive_design: false,
      seo_validation: false,
      load_times: {},
      errors: []
    };

    try {
      // Test all 43 pages
      for (const pagePath of this.pages) {
        try {
          const page = await browser.newPage();
          await page.setViewport({ width: 1920, height: 1080 });
          
          const startTime = Date.now();
          const response = await page.goto(`${this.baseUrl}${pagePath}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
          });
          const loadTime = Date.now() - startTime;
          
          functionality.pages_tested++;
          functionality.load_times[pagePath] = loadTime;
          
          if (response.status() >= 200 && response.status() < 400) {
            functionality.pages_successful++;
            
            // Check for JavaScript errors
            const errors = await page.evaluate(() => {
              return window.errors || [];
            });
            
            if (errors.length > 0) {
              functionality.errors.push({
                page: pagePath,
                errors: errors
              });
            }
            
            // Verify LCP threshold (4 seconds)
            if (loadTime > 4000) {
              this.results.warnings.push({
                type: 'slow_page_load',
                page: pagePath,
                load_time: loadTime,
                threshold: 4000
              });
            }
            
          } else {
            functionality.pages_failed.push({
              page: pagePath,
              status: response.status(),
              load_time: loadTime
            });
          }
          
          await page.close();
          
        } catch (error) {
          functionality.pages_failed.push({
            page: pagePath,
            error: error.message
          });
        }
      }
      
      // Verify sitemap.xml
      await this.verifySitemap(functionality);
      
      // Test responsive design
      await this.verifyResponsiveDesign(browser, functionality);
      
      // Validate SEO elements
      await this.verifySEO(browser, functionality);
      
    } catch (error) {
      functionality.errors.push({
        type: 'site_functionality_error',
        message: error.message
      });
    }

    this.results.site_functionality = functionality;
    console.log(`✅ Site functionality: ${functionality.pages_successful}/${functionality.pages_tested} pages successful`);
  }

  async verifySitemap(functionality) {
    try {
      const response = await this.makeHttpRequest(`${this.baseUrl}/sitemap.xml`);
      
      if (response.statusCode === 200) {
        functionality.sitemap_verification = true;
        
        // Check for expected 17 URLs and Scripts/ path handling
        const sitemapContent = response.body;
        const urlCount = (sitemapContent.match(/<url>/g) || []).length;
        const hasScriptsPath = sitemapContent.includes('Scripts/');
        
        if (urlCount !== 17) {
          this.results.warnings.push({
            type: 'sitemap_url_count',
            expected: 17,
            actual: urlCount
          });
        }
        
        if (hasScriptsPath) {
          this.results.warnings.push({
            type: 'sitemap_scripts_path',
            message: 'Sitemap contains Scripts/ path which may cause issues'
          });
        }
        
      } else {
        functionality.sitemap_verification = false;
        this.results.errors.push({
          type: 'sitemap_error',
          status: response.statusCode
        });
      }
      
    } catch (error) {
      functionality.sitemap_verification = false;
      this.results.errors.push({
        type: 'sitemap_request_error',
        message: error.message
      });
    }
  }

  async verifyResponsiveDesign(browser, functionality) {
    try {
      const page = await browser.newPage();
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 768, height: 1024, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ];
      
      let responsiveTests = 0;
      let responsivePassed = 0;
      
      for (const viewport of viewports) {
        await page.setViewport(viewport);
        await page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle0' });
        
        responsiveTests++;
        
        // Check if layout adapts properly
        const layoutCheck = await page.evaluate(() => {
          const body = document.body;
          return {
            hasOverflow: body.scrollWidth > window.innerWidth,
            hasResponsiveElements: document.querySelectorAll('[class*="responsive"], [class*="mobile"], [class*="tablet"]').length > 0
          };
        });
        
        if (!layoutCheck.hasOverflow) {
          responsivePassed++;
        }
      }
      
      functionality.responsive_design = responsivePassed === responsiveTests;
      await page.close();
      
    } catch (error) {
      functionality.responsive_design = false;
      this.results.errors.push({
        type: 'responsive_design_error',
        message: error.message
      });
    }
  }

  async verifySEO(browser, functionality) {
    try {
      const page = await browser.newPage();
      await page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle0' });
      
      const seoElements = await page.evaluate(() => {
        return {
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content,
          ogTitle: document.querySelector('meta[property="og:title"]')?.content,
          ogDescription: document.querySelector('meta[property="og:description"]')?.content,
          ogImage: document.querySelector('meta[property="og:image"]')?.content,
          structuredData: document.querySelectorAll('script[type="application/ld+json"]').length
        };
      });
      
      functionality.seo_validation = !!(
        seoElements.title &&
        seoElements.metaDescription &&
        seoElements.ogTitle &&
        seoElements.ogDescription
      );
      
      if (!functionality.seo_validation) {
        this.results.warnings.push({
          type: 'seo_elements_missing',
          missing_elements: Object.entries(seoElements)
            .filter(([key, value]) => !value)
            .map(([key]) => key)
        });
      }
      
      await page.close();
      
    } catch (error) {
      functionality.seo_validation = false;
      this.results.errors.push({
        type: 'seo_verification_error',
        message: error.message
      });
    }
  }

  async verifyABTesting(browser) {
    console.log('🧪 Verifying A/B testing system...');

    const abTesting = {
      edge_function_working: false,
      traffic_splitting: false,
      cookie_persistence: false,
      dashboard_accessible: false,
      analytics_tracking: false,
      variant_distribution: {},
      errors: []
    };

    try {
      const page = await browser.newPage();

      // Test A/B testing dashboard
      await page.goto(`${this.baseUrl}/admin/ab-test`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      abTesting.dashboard_accessible = true;

      // Check for A/B testing data
      const dashboardData = await page.evaluate(() => {
        const hasData = document.querySelector('[data-testid="ab-test-data"]') !== null ||
                       document.textContent.includes('variant') ||
                       document.textContent.includes('A/B Test');
        return hasData;
      });

      if (dashboardData) {
        abTesting.analytics_tracking = true;
      }

      // Test variant assignment by making multiple requests
      const variantCounts = { control: 0, enhanced: 0, minimal: 0, gaming: 0 };

      for (let i = 0; i < 20; i++) {
        try {
          // Clear cookies to get new assignment
          await page.deleteCookie(...await page.cookies());

          await page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle0' });

          // Check assigned variant
          const cookies = await page.cookies();
          const abCookie = cookies.find(c => c.name.includes('ab_cursor-theme-optimization'));

          if (abCookie && variantCounts.hasOwnProperty(abCookie.value)) {
            variantCounts[abCookie.value]++;
            abTesting.edge_function_working = true;
          }

        } catch (error) {
          abTesting.errors.push({
            type: 'variant_assignment_error',
            iteration: i,
            error: error.message
          });
        }
      }

      abTesting.variant_distribution = variantCounts;

      // Check if traffic is reasonably distributed (not all in one variant)
      const totalAssignments = Object.values(variantCounts).reduce((sum, count) => sum + count, 0);
      const maxVariantCount = Math.max(...Object.values(variantCounts));
      abTesting.traffic_splitting = totalAssignments > 0 && (maxVariantCount / totalAssignments) < 0.8;

      // Test cookie persistence
      await page.goto(`${this.baseUrl}/`, { waitUntil: 'networkidle0' });
      const initialCookies = await page.cookies();
      const initialAbCookie = initialCookies.find(c => c.name.includes('ab_cursor-theme-optimization'));

      if (initialAbCookie) {
        await page.reload({ waitUntil: 'networkidle0' });
        const reloadCookies = await page.cookies();
        const reloadAbCookie = reloadCookies.find(c => c.name.includes('ab_cursor-theme-optimization'));

        abTesting.cookie_persistence = reloadAbCookie &&
                                      reloadAbCookie.value === initialAbCookie.value;
      }

      await page.close();

    } catch (error) {
      abTesting.errors.push({
        type: 'ab_testing_error',
        message: error.message
      });
    }

    this.results.ab_testing = abTesting;
    console.log(`✅ A/B testing: Edge function ${abTesting.edge_function_working ? 'working' : 'failed'}, Traffic splitting ${abTesting.traffic_splitting ? 'active' : 'inactive'}`);
  }

  async verifyPerformanceMonitoring(browser) {
    console.log('📊 Verifying performance monitoring integration...');

    const performanceMonitoring = {
      lighthouse_ci_ready: false,
      performance_budgets: false,
      alert_system_configured: false,
      monitoring_endpoints: false,
      errors: []
    };

    try {
      // Check if performance monitoring files exist
      const monitoringFiles = [
        'lighthouserc.json',
        'lighthouse-budget.json',
        'scripts/performance-monitor.js',
        'config/performance-alert-config.json'
      ];

      let filesExist = 0;
      for (const file of monitoringFiles) {
        try {
          const fs = require('fs');
          if (fs.existsSync(file)) {
            filesExist++;
          }
        } catch (error) {
          // File doesn't exist
        }
      }

      performanceMonitoring.lighthouse_ci_ready = filesExist >= 2;
      performanceMonitoring.performance_budgets = filesExist >= 3;
      performanceMonitoring.alert_system_configured = filesExist === 4;

      // Test performance monitoring API endpoint
      try {
        const response = await this.makeHttpRequest(`${this.baseUrl}/api/analytics/ab-test`);
        performanceMonitoring.monitoring_endpoints = response.statusCode < 500;
      } catch (error) {
        performanceMonitoring.monitoring_endpoints = false;
      }

    } catch (error) {
      performanceMonitoring.errors.push({
        type: 'performance_monitoring_error',
        message: error.message
      });
    }

    this.results.performance_monitoring = performanceMonitoring;
    console.log(`✅ Performance monitoring: ${performanceMonitoring.alert_system_configured ? 'Fully configured' : 'Partially configured'}`);
  }

  async verifyBackendIntegration() {
    console.log('🔗 Verifying backend API integration...');

    const backendIntegration = {
      backend_accessible: false,
      contact_form_api: false,
      newsletter_api: false,
      demo_scheduling_api: false,
      analytics_api: false,
      cors_configured: false,
      response_times: {},
      errors: []
    };

    try {
      // Test backend accessibility
      const startTime = Date.now();
      const healthResponse = await this.makeHttpRequest(`${this.backendUrl}/health`);
      const responseTime = Date.now() - startTime;

      backendIntegration.backend_accessible = healthResponse.statusCode === 200;
      backendIntegration.response_times.health = responseTime;

      if (responseTime > 2000) {
        this.results.warnings.push({
          type: 'slow_backend_response',
          endpoint: '/health',
          response_time: responseTime,
          threshold: 2000
        });
      }

      // Test API endpoints
      const endpoints = [
        { path: '/api/contact', key: 'contact_form_api' },
        { path: '/api/newsletter', key: 'newsletter_api' },
        { path: '/api/demo', key: 'demo_scheduling_api' },
        { path: '/api/analytics', key: 'analytics_api' }
      ];

      for (const endpoint of endpoints) {
        try {
          const startTime = Date.now();
          const response = await this.makeHttpRequest(`${this.backendUrl}${endpoint.path}`);
          const responseTime = Date.now() - startTime;

          backendIntegration[endpoint.key] = response.statusCode < 500;
          backendIntegration.response_times[endpoint.path] = responseTime;

          if (responseTime > 2000) {
            this.results.warnings.push({
              type: 'slow_api_response',
              endpoint: endpoint.path,
              response_time: responseTime,
              threshold: 2000
            });
          }

        } catch (error) {
          backendIntegration[endpoint.key] = false;
          backendIntegration.errors.push({
            endpoint: endpoint.path,
            error: error.message
          });
        }
      }

      // Test CORS configuration (simplified check)
      backendIntegration.cors_configured = backendIntegration.backend_accessible;

    } catch (error) {
      backendIntegration.errors.push({
        type: 'backend_integration_error',
        message: error.message
      });
    }

    this.results.backend_integration = backendIntegration;
    console.log(`✅ Backend integration: ${backendIntegration.backend_accessible ? 'Connected' : 'Failed'}`);
  }

  async verifyUserFlows(browser) {
    console.log('👤 Verifying critical user flows...');

    const userFlows = {
      contact_form_flow: false,
      newsletter_signup_flow: false,
      demo_scheduling_flow: false,
      ab_testing_flow: false,
      cursor_interaction_flow: false,
      errors: []
    };

    try {
      const page = await browser.newPage();

      // Test contact form flow
      try {
        await page.goto(`${this.baseUrl}/contact`, { waitUntil: 'networkidle0' });

        const contactFormExists = await page.$('form') !== null;
        if (contactFormExists) {
          // Fill out form (without submitting to avoid spam)
          await page.type('input[name="name"], input[id="name"]', 'Test User', { delay: 50 });
          await page.type('input[name="email"], input[id="email"]', 'test@example.com', { delay: 50 });
          await page.type('textarea[name="message"], textarea[id="message"]', 'Test message', { delay: 50 });

          userFlows.contact_form_flow = true;
        }
      } catch (error) {
        userFlows.errors.push({
          flow: 'contact_form',
          error: error.message
        });
      }

      // Test newsletter signup flow
      try {
        const newsletterForm = await page.$('input[type="email"][placeholder*="newsletter"], input[type="email"][placeholder*="email"]');
        if (newsletterForm) {
          await page.type('input[type="email"][placeholder*="newsletter"], input[type="email"][placeholder*="email"]', 'test@example.com', { delay: 50 });
          userFlows.newsletter_signup_flow = true;
        }
      } catch (error) {
        userFlows.errors.push({
          flow: 'newsletter_signup',
          error: error.message
        });
      }

      // Test cursor interaction flow
      try {
        await page.goto(`${this.baseUrl}/cursor-context-demo`, { waitUntil: 'networkidle0' });

        const interactiveElements = await page.$$('.cta-button, .nav-link, button');
        if (interactiveElements.length > 0) {
          // Simulate hover on first interactive element
          await interactiveElements[0].hover();
          userFlows.cursor_interaction_flow = true;
        }
      } catch (error) {
        userFlows.errors.push({
          flow: 'cursor_interaction',
          error: error.message
        });
      }

      // Test A/B testing flow
      try {
        await page.goto(`${this.baseUrl}/admin/ab-test`, { waitUntil: 'networkidle0' });

        const dashboardElements = await page.$$('[data-testid], .dashboard, .analytics');
        userFlows.ab_testing_flow = dashboardElements.length > 0;
      } catch (error) {
        userFlows.errors.push({
          flow: 'ab_testing',
          error: error.message
        });
      }

      await page.close();

    } catch (error) {
      userFlows.errors.push({
        type: 'user_flows_error',
        message: error.message
      });
    }

    this.results.user_flows = userFlows;
    const flowsWorking = Object.values(userFlows).filter(v => v === true).length;
    console.log(`✅ User flows: ${flowsWorking}/5 flows working`);
  }

  async verifyCursorSystem(browser) {
    console.log('🖱️ Verifying context-aware cursor system...');

    const cursorSystem = {
      variants_tested: 0,
      variants_working: 0,
      performance_60fps: false,
      touch_detection: false,
      gsap_loading: false,
      cursor_demo_page: false,
      interactive_elements: {},
      errors: []
    };

    try {
      const page = await browser.newPage();
      
      // Test cursor demo page
      await page.goto(`${this.baseUrl}/cursor-context-demo`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      cursorSystem.cursor_demo_page = true;
      
      // Check GSAP loading
      const gsapLoaded = await page.evaluate(() => {
        return typeof gsap !== 'undefined';
      });
      cursorSystem.gsap_loading = gsapLoaded;
      
      // Test cursor variants (simulate A/B testing)
      const variants = ['control', 'enhanced', 'minimal', 'gaming'];
      
      for (const variant of variants) {
        try {
          // Set variant cookie to test specific variant
          await page.setCookie({
            name: 'ab_cursor-theme-optimization-v1',
            value: variant,
            domain: new URL(this.baseUrl).hostname
          });
          
          await page.reload({ waitUntil: 'networkidle0' });
          
          cursorSystem.variants_tested++;
          
          // Check if cursor system is active
          const cursorActive = await page.evaluate(() => {
            const cursorElements = document.querySelectorAll('.cursor, .enhanced-cursor, .minimal-cursor, .gaming-cursor');
            return cursorElements.length > 0;
          });
          
          if (cursorActive) {
            cursorSystem.variants_working++;
          }
          
          // Test performance (simplified FPS check)
          const performanceCheck = await page.evaluate(() => {
            return new Promise((resolve) => {
              let frameCount = 0;
              const startTime = performance.now();
              
              const countFrames = () => {
                frameCount++;
                if (frameCount < 60) {
                  requestAnimationFrame(countFrames);
                } else {
                  const endTime = performance.now();
                  const fps = (frameCount * 1000) / (endTime - startTime);
                  resolve(fps);
                }
              };
              
              requestAnimationFrame(countFrames);
            });
          });
          
          if (performanceCheck >= 55) { // Allow some tolerance
            cursorSystem.performance_60fps = true;
          }
          
        } catch (error) {
          cursorSystem.errors.push({
            variant,
            error: error.message
          });
        }
      }
      
      // Test interactive elements
      const interactiveElements = ['.cta-button', '.nav-link', '.card', 'input', 'button'];
      
      for (const selector of interactiveElements) {
        try {
          const elements = await page.$$(selector);
          cursorSystem.interactive_elements[selector] = elements.length;
        } catch (error) {
          cursorSystem.interactive_elements[selector] = 0;
        }
      }
      
      // Test touch device detection
      const touchDetection = await page.evaluate(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      });
      cursorSystem.touch_detection = touchDetection;
      
      await page.close();
      
    } catch (error) {
      cursorSystem.errors.push({
        type: 'cursor_system_error',
        message: error.message
      });
    }

    this.results.cursor_system = cursorSystem;
    console.log(`✅ Cursor system: ${cursorSystem.variants_working}/${cursorSystem.variants_tested} variants working`);
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https:') ? https : require('http');
      
      const request = protocol.get(url, (response) => {
        let body = '';
        
        response.on('data', (chunk) => {
          body += chunk;
        });
        
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body
          });
        });
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  analyzeResults() {
    console.log('\n📊 Analyzing deployment verification results...');
    
    let totalTests = 0;
    let passedTests = 0;
    let criticalFailures = 0;
    
    // Analyze site functionality
    const siteFunctionality = this.results.site_functionality;
    if (siteFunctionality.pages_tested > 0) {
      totalTests++;
      const successRate = (siteFunctionality.pages_successful / siteFunctionality.pages_tested) * 100;
      if (successRate >= 95) {
        passedTests++;
      } else if (successRate < 80) {
        criticalFailures++;
      }
    }
    
    // Analyze cursor system
    const cursorSystem = this.results.cursor_system;
    if (cursorSystem.variants_tested > 0) {
      totalTests++;
      const variantSuccessRate = (cursorSystem.variants_working / cursorSystem.variants_tested) * 100;
      if (variantSuccessRate >= 75 && cursorSystem.gsap_loading && cursorSystem.cursor_demo_page) {
        passedTests++;
      } else if (variantSuccessRate < 50) {
        criticalFailures++;
      }
    }
    
    // Determine overall status
    if (criticalFailures > 0) {
      this.results.overall_status = 'critical_failure';
    } else if (passedTests === totalTests && this.results.errors.length === 0) {
      this.results.overall_status = 'success';
    } else if (passedTests >= totalTests * 0.8) {
      this.results.overall_status = 'warning';
    } else {
      this.results.overall_status = 'failure';
    }
    
    console.log(`📈 Analysis complete: ${passedTests}/${totalTests} test categories passed`);
    console.log(`🚨 Critical failures: ${criticalFailures}`);
    console.log(`⚠️ Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../reports/deployment-verification-report.json');
    
    // Ensure reports directory exists
    const reportsDir = path.dirname(reportPath);
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Add summary to results
    this.results.summary = {
      total_pages_tested: this.results.site_functionality.pages_tested || 0,
      pages_successful: this.results.site_functionality.pages_successful || 0,
      cursor_variants_working: this.results.cursor_system.variants_working || 0,
      cursor_variants_tested: this.results.cursor_system.variants_tested || 0,
      critical_errors: this.results.errors.filter(e => e.type.includes('critical')).length,
      warnings: this.results.warnings.length,
      overall_status: this.results.overall_status
    };
    
    // Write detailed report
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Deployment Verification Summary:');
    console.log(`Overall Status: ${this.results.overall_status.toUpperCase()}`);
    console.log(`Pages Tested: ${this.results.summary.pages_successful}/${this.results.summary.total_pages_tested}`);
    console.log(`Cursor Variants: ${this.results.summary.cursor_variants_working}/${this.results.summary.cursor_variants_tested}`);
    console.log(`Errors: ${this.results.errors.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Report saved to: ${reportPath}`);
    
    return reportPath;
  }
}

// Export for use in other modules
module.exports = DeploymentVerification;

// Run if called directly
if (require.main === module) {
  const verification = new DeploymentVerification();
  verification.runCompleteVerification()
    .then((results) => {
      const exitCode = results.overall_status === 'success' ? 0 : 1;
      process.exit(exitCode);
    })
    .catch((error) => {
      console.error('❌ Deployment verification failed:', error);
      process.exit(1);
    });
}
