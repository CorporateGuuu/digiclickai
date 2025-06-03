const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runTests() {
  console.log('Starting performance tests...\n');
  console.log('=== Critical Path Testing ===\n');

  // Launch browser
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  console.log('Testing Service Worker...');
  await page.goto('https://digiclickai.netlify.app/');
  const swRegistration = await page.evaluate(() => navigator.serviceWorker.getRegistration());
  console.log('Service Worker registered:', swRegistration !== undefined);

  // Test Offline Functionality
  console.log('\nTesting Offline Functionality...');
  await page.setOfflineMode(true);
  const offlineResponse = await page.goto('https://digiclickai.netlify.app/');
  console.log('Offline page loaded:', offlineResponse.ok);
  await page.setOfflineMode(false);

  // Test Cache Headers
  console.log('\nTesting Cache Headers...');
  const response = await page.goto('https://digiclickai.netlify.app/static/css/styles.css');
  const headers = response.headers();
  console.log('Cache-Control:', headers['cache-control']);
  console.log('ETag:', headers['etag']);

  // Test Core Web Vitals
  console.log('\n=== Core Web Vitals Testing ===\n');
  
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };

  const runnerResult = await lighthouse('https://digiclickai.netlify.app', options);
  const lhr = runnerResult.lhr;

  console.log('Performance score:', lhr.categories.performance.score * 100);
  console.log('First Contentful Paint:', lhr.audits['first-contentful-paint'].displayValue);
  console.log('Largest Contentful Paint:', lhr.audits['largest-contentful-paint'].displayValue);
  console.log('Cumulative Layout Shift:', lhr.audits['cumulative-layout-shift'].displayValue);

  await browser.close();
  await chrome.kill();
}

runTests().catch(console.error);
