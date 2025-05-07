const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ROUTES_TO_TEST = [
  '/',
  '/products',
  '/categories',
  '/lcd-buyback',
  '/gapp',
  '/about',
  '/contact',
  '/faq',
  '/cart',
  '/checkout',
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/search',
  '/compare',
  '/terms',
  '/privacy',
  '/shipping',
  '/returns'
];

// Function to test if a route is accessible
function testRoute(route) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${route}`;
    // // console.log(`Testing route: ${url}`);
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          // // console.log(`✅ Route ${route} is accessible (${res.statusCode})`);
          resolve({ route, status: res.statusCode, success: true });
        } else {
          console.error(`❌ Route ${route} returned status code ${res.statusCode}`);
          resolve({ route, status: res.statusCode, success: false });
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Error accessing route ${route}: ${err.message}`);
      resolve({ route, error: err.message, success: false });
    });
  });
}

// Function to run component tests
async function runComponentTests() {
  // // console.log('\n🧪 Running component tests...');
  try {
    execSync('npm test', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ Component tests failed');
    return false;
  }
}

// Function to run ESLint
async function runLint() {
  // // console.log('\n🔍 Running ESLint...');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('❌ ESLint found issues');
    return false;
  }
}

// Function to check for broken links
async function checkBrokenLinks() {
  // // console.log('\n🔗 Checking for broken links...');
  const results = [];
  
  for (const route of ROUTES_TO_TEST) {
    const result = await testRoute(route);
    results.push(result);
  }
  
  const successCount = results.filter(r => r.success).length;
  // // console.log(`\n✅ ${successCount}/${results.length} routes are accessible`);
  
  if (successCount < results.length) {
    console.error('❌ Some routes are not accessible:');
    results.filter(r => !r.success).forEach(r => {
      console.error(`  - ${r.route}: ${r.status || r.error}`);
    });
    return false;
  }
  
  return true;
}

// Function to check for performance issues
async function checkPerformance() {
  // // console.log('\n⚡ Checking performance...');
  try {
    // This is a simple check - in a real scenario, you'd use Lighthouse or similar tools
    const startTime = Date.now();
    await testRoute('/');
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    // // console.log(`Home page load time: ${loadTime}ms`);
    
    if (loadTime > 3000) {
      console.warn('⚠️ Home page load time is high (> 3000ms)');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Performance check failed:', error);
    return false;
  }
}

// Main function
async function main() {
  // // console.log('🚀 Starting comprehensive tests...');
  
  // Check if the server is running
  try {
    await testRoute('/');
  } catch (error) {
    console.error('❌ Server is not running. Please start the server with "npm run dev" first.');
    process.exit(1);
  }
  
  // Run all tests
  const results = {
    brokenLinks: await checkBrokenLinks(),
    performance: await checkPerformance(),
    lint: await runLint(),
    componentTests: await runComponentTests()
  };
  
  // Print summary
  // // console.log('\n📊 Test Summary:');
  // // console.log(`Broken Links Check: ${results.brokenLinks ? '✅ PASS' : '❌ FAIL'}`);
  // // console.log(`Performance Check: ${results.performance ? '✅ PASS' : '⚠️ WARNING'}`);
  // // console.log(`ESLint: ${results.lint ? '✅ PASS' : '❌ FAIL'}`);
  // // console.log(`Component Tests: ${results.componentTests ? '✅ PASS' : '❌ FAIL'}`);
  
  // Overall result
  const overallSuccess = Object.values(results).every(Boolean);
  // // console.log(`\nOverall Result: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    overallSuccess
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../test-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // // console.log('\n📝 Test report saved to test-report.json');
}

main().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});
