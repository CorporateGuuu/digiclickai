/**
 * DigiClick AI Enhanced Cursor System - Comprehensive Test Runner
 * Orchestrates all cursor testing suites and generates unified reports
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Import test classes
const CursorPerformanceTester = require('./performance/cursor-performance');
const CursorE2ETester = require('./e2e/cursor-e2e');
const CursorAccessibilityTester = require('./accessibility/cursor-a11y');
const CrossDeviceTester = require('./cross-device/device-tests');

class ComprehensiveTestRunner {
  constructor() {
    this.results = {
      functional: null,
      performance: null,
      e2e: null,
      accessibility: null,
      crossDevice: null,
    };
    this.startTime = Date.now();
  }

  async runFunctionalTests() {
    console.log('🧪 Running functional tests...');
    
    return new Promise((resolve, reject) => {
      const jest = spawn('npm', ['run', 'test:cursor'], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      jest.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      jest.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });

      jest.on('close', (code) => {
        const result = {
          testType: 'functional',
          passed: code === 0,
          exitCode: code,
          output: output,
          errorOutput: errorOutput,
          duration: Date.now() - this.startTime
        };

        this.results.functional = result;
        
        if (code === 0) {
          console.log('✅ Functional tests completed successfully');
          resolve(result);
        } else {
          console.log('❌ Functional tests failed');
          resolve(result); // Don't reject, continue with other tests
        }
      });

      jest.on('error', (error) => {
        console.error('❌ Error running functional tests:', error);
        this.results.functional = {
          testType: 'functional',
          passed: false,
          error: error.message,
          duration: Date.now() - this.startTime
        };
        resolve(this.results.functional);
      });
    });
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');
    
    try {
      const tester = new CursorPerformanceTester();
      const result = await tester.runAllTests();
      
      this.results.performance = {
        testType: 'performance',
        passed: result.recommendations.filter(r => r.severity === 'high').length === 0,
        ...result
      };
      
      console.log('✅ Performance tests completed');
      return this.results.performance;
    } catch (error) {
      console.error('❌ Performance tests failed:', error);
      this.results.performance = {
        testType: 'performance',
        passed: false,
        error: error.message
      };
      return this.results.performance;
    }
  }

  async runE2ETests() {
    console.log('🔄 Running end-to-end tests...');
    
    try {
      const tester = new CursorE2ETester();
      const result = await tester.runAllTests();
      
      this.results.e2e = {
        testType: 'e2e',
        passed: result.summary.failedTests === 0,
        ...result
      };
      
      console.log('✅ E2E tests completed');
      return this.results.e2e;
    } catch (error) {
      console.error('❌ E2E tests failed:', error);
      this.results.e2e = {
        testType: 'e2e',
        passed: false,
        error: error.message
      };
      return this.results.e2e;
    }
  }

  async runAccessibilityTests() {
    console.log('♿ Running accessibility tests...');
    
    try {
      const tester = new CursorAccessibilityTester();
      const result = await tester.runAllTests();
      
      this.results.accessibility = {
        testType: 'accessibility',
        passed: result.summary.failedTests === 0,
        ...result
      };
      
      console.log('✅ Accessibility tests completed');
      return this.results.accessibility;
    } catch (error) {
      console.error('❌ Accessibility tests failed:', error);
      this.results.accessibility = {
        testType: 'accessibility',
        passed: false,
        error: error.message
      };
      return this.results.accessibility;
    }
  }

  async runCrossDeviceTests() {
    console.log('📱 Running cross-device tests...');
    
    try {
      const tester = new CrossDeviceTester();
      const result = await tester.runAllTests();
      
      this.results.crossDevice = {
        testType: 'crossDevice',
        passed: result.summary.overall.failedTests === 0,
        ...result
      };
      
      console.log('✅ Cross-device tests completed');
      return this.results.crossDevice;
    } catch (error) {
      console.error('❌ Cross-device tests failed:', error);
      this.results.crossDevice = {
        testType: 'crossDevice',
        passed: false,
        error: error.message
      };
      return this.results.crossDevice;
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking test prerequisites...');
    
    // Check if development server is running
    try {
      const response = await fetch('http://localhost:3000');
      if (!response.ok) {
        throw new Error('Development server not responding');
      }
      console.log('✅ Development server is running');
    } catch (error) {
      console.error('❌ Development server is not running. Please start it with: npm run dev');
      throw new Error('Development server required for testing');
    }

    // Check if required directories exist
    const requiredDirs = ['tests/reports'];
    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });

    console.log('✅ Prerequisites check completed');
  }

  generateUnifiedReport() {
    console.log('📝 Generating unified test report...');
    
    const totalDuration = Date.now() - this.startTime;
    const testTypes = Object.keys(this.results);
    const passedTests = testTypes.filter(type => this.results[type]?.passed).length;
    const totalTests = testTypes.length;
    
    const unifiedReport = {
      timestamp: new Date().toISOString(),
      duration: totalDuration,
      summary: {
        totalTestSuites: totalTests,
        passedTestSuites: passedTests,
        failedTestSuites: totalTests - passedTests,
        overallSuccessRate: (passedTests / totalTests) * 100
      },
      results: this.results,
      recommendations: this.generateUnifiedRecommendations(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        timestamp: new Date().toISOString()
      }
    };

    // Save unified report
    const reportPath = path.join(__dirname, 'reports/unified-cursor-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(unifiedReport, null, 2));
    
    // Generate HTML report
    this.generateHTMLReport(unifiedReport);
    
    console.log(`📝 Unified report saved to: ${reportPath}`);
    
    return unifiedReport;
  }

  generateUnifiedRecommendations() {
    const allRecommendations = [];
    
    Object.values(this.results).forEach(result => {
      if (result && result.recommendations) {
        result.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            source: result.testType
          });
        });
      }
    });

    // Prioritize recommendations
    const prioritized = allRecommendations.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1, critical: 4 };
      return (priority[b.severity] || 0) - (priority[a.severity] || 0);
    });

    return prioritized;
  }

  generateHTMLReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DigiClick AI Cursor Test Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #00d4ff; margin: 0; }
        .header p { color: #666; margin: 5px 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #00d4ff, #7b2cbf); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .test-section { margin-bottom: 30px; }
        .test-section h2 { color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 10px; }
        .test-result { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 10px; border-left: 4px solid #ddd; }
        .test-result.passed { border-left-color: #4CAF50; }
        .test-result.failed { border-left-color: #f44336; }
        .status { font-weight: bold; }
        .status.passed { color: #4CAF50; }
        .status.failed { color: #f44336; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; }
        .recommendation { margin-bottom: 10px; padding: 10px; border-radius: 3px; }
        .recommendation.high { background: #ffebee; border-left: 4px solid #f44336; }
        .recommendation.medium { background: #fff3e0; border-left: 4px solid #ff9800; }
        .recommendation.low { background: #e8f5e8; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DigiClick AI Enhanced Cursor System</h1>
            <p>Comprehensive Test Report</p>
            <p>Generated: ${report.timestamp}</p>
            <p>Duration: ${(report.duration / 1000).toFixed(2)}s</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Test Suites</h3>
                <div class="value">${report.summary.totalTestSuites}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value">${report.summary.passedTestSuites}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value">${report.summary.failedTestSuites}</div>
            </div>
            <div class="summary-card">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.overallSuccessRate.toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="test-section">
            <h2>Test Results</h2>
            ${Object.entries(report.results).map(([type, result]) => `
                <div class="test-result ${result?.passed ? 'passed' : 'failed'}">
                    <h3>${type.charAt(0).toUpperCase() + type.slice(1)} Tests</h3>
                    <p class="status ${result?.passed ? 'passed' : 'failed'}">
                        Status: ${result?.passed ? 'PASSED' : 'FAILED'}
                    </p>
                    ${result?.error ? `<p>Error: ${result.error}</p>` : ''}
                </div>
            `).join('')}
        </div>
        
        ${report.recommendations.length > 0 ? `
        <div class="test-section">
            <h2>Recommendations</h2>
            <div class="recommendations">
                ${report.recommendations.map(rec => `
                    <div class="recommendation ${rec.severity || rec.type}">
                        <strong>${rec.message}</strong><br>
                        <em>${rec.suggestion}</em><br>
                        <small>Source: ${rec.source}</small>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>
</body>
</html>`;

    const htmlPath = path.join(__dirname, 'reports/cursor-test-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }

  async runAllTests() {
    try {
      console.log('🚀 Starting comprehensive cursor testing suite...');
      console.log('=' .repeat(60));
      
      await this.checkPrerequisites();
      
      // Run all test suites
      await this.runFunctionalTests();
      await this.runPerformanceTests();
      await this.runE2ETests();
      await this.runAccessibilityTests();
      await this.runCrossDeviceTests();
      
      // Generate unified report
      const report = this.generateUnifiedReport();
      
      console.log('=' .repeat(60));
      console.log('🎉 Comprehensive testing completed!');
      console.log(`📊 Overall Success Rate: ${report.summary.overallSuccessRate.toFixed(1)}%`);
      console.log(`⏱️ Total Duration: ${(report.duration / 1000).toFixed(2)}s`);
      
      return report;
    } catch (error) {
      console.error('❌ Comprehensive testing failed:', error);
      throw error;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  
  runner.runAllTests()
    .then((report) => {
      console.log('✅ All tests completed successfully');
      
      // Exit with error code if any test suite failed
      const hasFailures = report.summary.failedTestSuites > 0;
      process.exit(hasFailures ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Testing suite failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveTestRunner;
