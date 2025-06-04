/**
 * DigiClick AI - Deployment Verification Script
 * Verifies enhanced cursor system functionality after deployment
 */

const https = require('https');
const http = require('http');

class DeploymentVerifier {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.DEPLOY_URL || 'https://digiclickai.com';
    this.results = {
      accessibility: [],
      performance: [],
      functionality: [],
      seo: []
    };
  }

  async verifyDeployment() {
    console.log('🔍 Starting DigiClick AI deployment verification...');
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log('=' .repeat(60));

    try {
      // Core functionality tests
      await this.testCorePages();
      await this.testCursorSystemAssets();
      await this.testAPIEndpoints();
      await this.testSEOElements();
      await this.testPerformanceMetrics();
      
      // Generate report
      this.generateReport();
      
      console.log('✅ Deployment verification completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Deployment verification failed:', error);
      return false;
    }
  }

  async testCorePages() {
    console.log('📄 Testing core pages...');
    
    const pages = [
      { path: '/', name: 'Homepage' },
      { path: '/portfolio', name: 'Portfolio' },
      { path: '/cursor-demo', name: 'Cursor Demo' },
      { path: '/contact', name: 'Contact' },
      { path: '/about', name: 'About' }
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(page.path);
        const success = response.statusCode === 200;
        
        console.log(`${success ? '✅' : '❌'} ${page.name}: ${response.statusCode}`);
        
        this.results.functionality.push({
          test: 'page-accessibility',
          page: page.name,
          path: page.path,
          status: response.statusCode,
          success: success
        });

        // Check for cursor system indicators in HTML
        if (success && response.body) {
          const hasCursorSystem = response.body.includes('EnhancedCustomCursor') || 
                                 response.body.includes('cursor-demo') ||
                                 response.body.includes('gsap');
          
          console.log(`   🖱️ Cursor system indicators: ${hasCursorSystem ? 'Found' : 'Not found'}`);
          
          this.results.functionality.push({
            test: 'cursor-system-presence',
            page: page.name,
            success: hasCursorSystem
          });
        }
      } catch (error) {
        console.log(`❌ ${page.name}: Error - ${error.message}`);
        this.results.functionality.push({
          test: 'page-accessibility',
          page: page.name,
          success: false,
          error: error.message
        });
      }
    }
  }

  async testCursorSystemAssets() {
    console.log('🖱️ Testing cursor system assets...');
    
    const assets = [
      '/_next/static/chunks/pages/_app.js',
      '/_next/static/chunks/main.js',
      '/sitemap.xml'
    ];

    for (const asset of assets) {
      try {
        const response = await this.makeRequest(asset);
        const success = response.statusCode === 200;
        
        console.log(`${success ? '✅' : '⚠️'} ${asset}: ${response.statusCode}`);
        
        this.results.functionality.push({
          test: 'asset-availability',
          asset: asset,
          status: response.statusCode,
          success: success
        });
      } catch (error) {
        console.log(`⚠️ ${asset}: ${error.message}`);
      }
    }
  }

  async testAPIEndpoints() {
    console.log('🔌 Testing API endpoints...');
    
    const endpoints = [
      { path: '/api/contact', method: 'POST', name: 'Contact Form' },
      { path: '/api/recommendations', method: 'GET', name: 'Recommendations' },
      { path: '/api/team', method: 'GET', name: 'Team Data' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint.path, endpoint.method);
        const success = response.statusCode < 500; // Allow 4xx but not 5xx
        
        console.log(`${success ? '✅' : '❌'} ${endpoint.name}: ${response.statusCode}`);
        
        this.results.functionality.push({
          test: 'api-endpoint',
          endpoint: endpoint.name,
          path: endpoint.path,
          method: endpoint.method,
          status: response.statusCode,
          success: success
        });
      } catch (error) {
        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }

  async testSEOElements() {
    console.log('🔍 Testing SEO elements...');
    
    try {
      const response = await this.makeRequest('/');
      if (response.statusCode === 200 && response.body) {
        const html = response.body;
        
        // Check for essential SEO elements
        const seoChecks = [
          { name: 'Title tag', regex: /<title[^>]*>.*DigiClick.*AI.*<\/title>/i },
          { name: 'Meta description', regex: /<meta[^>]*name=["\']description["\'][^>]*content=["\'][^"\']*DigiClick[^"\']*["\'][^>]*>/i },
          { name: 'Meta viewport', regex: /<meta[^>]*name=["\']viewport["\'][^>]*>/i },
          { name: 'Canonical URL', regex: /<link[^>]*rel=["\']canonical["\'][^>]*>/i },
          { name: 'Open Graph title', regex: /<meta[^>]*property=["\']og:title["\'][^>]*>/i },
          { name: 'Structured data', regex: /<script[^>]*type=["\']application\/ld\+json["\'][^>]*>/i }
        ];

        seoChecks.forEach(check => {
          const found = check.regex.test(html);
          console.log(`${found ? '✅' : '⚠️'} ${check.name}: ${found ? 'Found' : 'Missing'}`);
          
          this.results.seo.push({
            test: check.name.toLowerCase().replace(/\s+/g, '-'),
            success: found
          });
        });

        // Check for DigiClick AI specific content
        const brandingChecks = [
          { name: 'DigiClick AI branding', regex: /DigiClick\s*AI/i },
          { name: 'Cursor demo mention', regex: /cursor.*demo/i },
          { name: 'AI automation content', regex: /AI.*automation/i }
        ];

        brandingChecks.forEach(check => {
          const found = check.regex.test(html);
          console.log(`${found ? '✅' : '⚠️'} ${check.name}: ${found ? 'Found' : 'Missing'}`);
          
          this.results.seo.push({
            test: check.name.toLowerCase().replace(/\s+/g, '-'),
            success: found
          });
        });
      }
    } catch (error) {
      console.log(`❌ SEO check failed: ${error.message}`);
    }
  }

  async testPerformanceMetrics() {
    console.log('⚡ Testing performance metrics...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest('/');
      const loadTime = Date.now() - startTime;
      
      const performanceChecks = [
        { name: 'Page load time', value: loadTime, threshold: 3000, unit: 'ms' },
        { name: 'Response status', value: response.statusCode, threshold: 200, unit: '' },
        { name: 'Content length', value: response.body?.length || 0, threshold: 1000, unit: 'chars' }
      ];

      performanceChecks.forEach(check => {
        const success = check.name === 'Response status' ? 
          check.value === check.threshold : 
          check.value >= check.threshold;
        
        console.log(`${success ? '✅' : '⚠️'} ${check.name}: ${check.value}${check.unit} ${success ? '(Good)' : '(Needs improvement)'}`);
        
        this.results.performance.push({
          test: check.name.toLowerCase().replace(/\s+/g, '-'),
          value: check.value,
          threshold: check.threshold,
          unit: check.unit,
          success: success
        });
      });
    } catch (error) {
      console.log(`❌ Performance check failed: ${error.message}`);
    }
  }

  makeRequest(path, method = 'GET') {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const options = {
        method: method,
        headers: {
          'User-Agent': 'DigiClick-AI-Deployment-Verifier/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      };

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(url, options, (res) => {
        let body = '';
        
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (method === 'POST') {
        req.write(JSON.stringify({ test: 'deployment-verification' }));
      }

      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 Deployment Verification Report');
    console.log('=' .repeat(60));

    const categories = ['functionality', 'performance', 'seo'];
    let totalTests = 0;
    let passedTests = 0;

    categories.forEach(category => {
      const tests = this.results[category];
      const passed = tests.filter(t => t.success).length;
      const total = tests.length;
      
      totalTests += total;
      passedTests += passed;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`  ✅ Passed: ${passed}/${total} (${((passed/total)*100).toFixed(1)}%)`);
      
      if (passed < total) {
        const failed = tests.filter(t => !t.success);
        console.log(`  ❌ Failed tests:`);
        failed.forEach(test => {
          console.log(`     - ${test.test}: ${test.error || 'Failed'}`);
        });
      }
    });

    const overallSuccess = (passedTests / totalTests) * 100;
    console.log(`\n🎯 OVERALL SUCCESS RATE: ${overallSuccess.toFixed(1)}% (${passedTests}/${totalTests})`);
    
    if (overallSuccess >= 80) {
      console.log('🎉 Deployment verification PASSED!');
      console.log('🖱️ Enhanced Cursor System is ready for production use');
    } else {
      console.log('⚠️ Deployment verification needs attention');
      console.log('🔧 Some issues detected that should be addressed');
    }

    // Save report to file
    try {
      const fs = require('fs');
      const reportPath = './deployment-verification-report.json';
      
      const report = {
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        overallSuccessRate: overallSuccess,
        totalTests: totalTests,
        passedTests: passedTests,
        results: this.results
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    } catch (error) {
      console.log(`⚠️ Could not save report: ${error.message}`);
    }
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  
  verifier.verifyDeployment()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Verification script crashed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentVerifier;
