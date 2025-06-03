/**
 * DigiClick AI Global Test Teardown
 * Cleans up testing environment and generates reports
 */

import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Cleaning up DigiClick AI E2E testing environment...');

  try {
    // Generate test summary report
    await generateTestSummary();
    
    // Clean up temporary test data
    await cleanupTestData();
    
    // Archive test results
    await archiveTestResults();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
  }
}

async function generateTestSummary() {
  const testResultsDir = path.join(process.cwd(), 'test-results');
  const resultsFile = path.join(testResultsDir, 'results.json');
  
  if (!fs.existsSync(resultsFile)) {
    console.warn('⚠️ No test results file found');
    return;
  }
  
  try {
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    
    const summary = {
      timestamp: new Date().toISOString(),
      totalTests: results.stats?.total || 0,
      passed: results.stats?.passed || 0,
      failed: results.stats?.failed || 0,
      skipped: results.stats?.skipped || 0,
      duration: results.stats?.duration || 0,
      successRate: results.stats?.total > 0 ? 
        ((results.stats.passed / results.stats.total) * 100).toFixed(2) : 0,
      categories: {
        accessibility: extractCategoryStats(results, 'accessibility'),
        performance: extractCategoryStats(results, 'performance'),
        visual: extractCategoryStats(results, 'visual'),
        forms: extractCategoryStats(results, 'forms'),
        navigation: extractCategoryStats(results, 'navigation'),
        cursor: extractCategoryStats(results, 'cursor'),
        mobile: extractCategoryStats(results, 'mobile')
      }
    };
    
    // Write summary report
    const summaryFile = path.join(testResultsDir, 'test-summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    // Generate markdown report
    const markdownReport = generateMarkdownReport(summary);
    const markdownFile = path.join(testResultsDir, 'test-summary.md');
    fs.writeFileSync(markdownFile, markdownReport);
    
    console.log(`📊 Test summary generated: ${summary.successRate}% success rate`);
    
  } catch (error) {
    console.error('Failed to generate test summary:', error);
  }
}

function extractCategoryStats(results, category) {
  if (!results.suites) return { total: 0, passed: 0, failed: 0 };
  
  let total = 0;
  let passed = 0;
  let failed = 0;
  
  const findTestsInSuite = (suite) => {
    if (suite.title && suite.title.toLowerCase().includes(category)) {
      suite.tests?.forEach(test => {
        total++;
        if (test.status === 'passed') passed++;
        if (test.status === 'failed') failed++;
      });
    }
    
    suite.suites?.forEach(findTestsInSuite);
  };
  
  results.suites.forEach(findTestsInSuite);
  
  return { total, passed, failed };
}

function generateMarkdownReport(summary) {
  return `# DigiClick AI E2E Test Report

## Summary
- **Total Tests**: ${summary.totalTests}
- **Passed**: ${summary.passed}
- **Failed**: ${summary.failed}
- **Skipped**: ${summary.skipped}
- **Success Rate**: ${summary.successRate}%
- **Duration**: ${Math.round(summary.duration / 1000)}s
- **Generated**: ${summary.timestamp}

## Category Breakdown

### Accessibility Tests
- Total: ${summary.categories.accessibility.total}
- Passed: ${summary.categories.accessibility.passed}
- Failed: ${summary.categories.accessibility.failed}

### Performance Tests
- Total: ${summary.categories.performance.total}
- Passed: ${summary.categories.performance.passed}
- Failed: ${summary.categories.performance.failed}

### Visual Regression Tests
- Total: ${summary.categories.visual.total}
- Passed: ${summary.categories.visual.passed}
- Failed: ${summary.categories.visual.failed}

### Form Tests
- Total: ${summary.categories.forms.total}
- Passed: ${summary.categories.forms.passed}
- Failed: ${summary.categories.forms.failed}

### Navigation Tests
- Total: ${summary.categories.navigation.total}
- Passed: ${summary.categories.navigation.passed}
- Failed: ${summary.categories.navigation.failed}

### Cursor System Tests
- Total: ${summary.categories.cursor.total}
- Passed: ${summary.categories.cursor.passed}
- Failed: ${summary.categories.cursor.failed}

### Mobile Tests
- Total: ${summary.categories.mobile.total}
- Passed: ${summary.categories.mobile.passed}
- Failed: ${summary.categories.mobile.failed}

## Status
${summary.successRate >= 95 ? '🎉 **EXCELLENT**: All tests passing!' : 
  summary.successRate >= 90 ? '✅ **GOOD**: Most tests passing' : 
  summary.successRate >= 80 ? '⚠️ **NEEDS ATTENTION**: Some tests failing' : 
  '❌ **CRITICAL**: Many tests failing'}
`;
}

async function cleanupTestData() {
  // Clean up any temporary files or data created during testing
  const tempDir = path.join(process.cwd(), 'temp-test-data');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  console.log('🗑️ Temporary test data cleaned up');
}

async function archiveTestResults() {
  const testResultsDir = path.join(process.cwd(), 'test-results');
  const archiveDir = path.join(process.cwd(), 'test-archives');
  
  if (!fs.existsSync(testResultsDir)) {
    return;
  }
  
  // Create archive directory if it doesn't exist
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
  
  // Create timestamped archive
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const archivePath = path.join(archiveDir, `test-results-${timestamp}`);
  
  try {
    // Copy test results to archive
    fs.cpSync(testResultsDir, archivePath, { recursive: true });
    
    // Keep only last 10 archives
    const archives = fs.readdirSync(archiveDir)
      .filter(name => name.startsWith('test-results-'))
      .sort()
      .reverse();
    
    if (archives.length > 10) {
      archives.slice(10).forEach(archive => {
        fs.rmSync(path.join(archiveDir, archive), { recursive: true, force: true });
      });
    }
    
    console.log(`📦 Test results archived to: ${archivePath}`);
    
  } catch (error) {
    console.warn('Failed to archive test results:', error.message);
  }
}

export default globalTeardown;
