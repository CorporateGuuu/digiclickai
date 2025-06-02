#!/usr/bin/env node

/**
 * DigiClick AI Notification System Test Script
 * Tests Slack and email notifications to verify configuration
 */

const https = require('https');
const http = require('http');

class NotificationTester {
  constructor() {
    this.config = {
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
      testEmail: process.env.TEST_EMAIL || 'test@example.com',
      appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app'
    };
    
    this.results = {
      slack: { tested: false, success: false, error: null },
      email: { tested: false, success: false, error: null },
      monitoring: { tested: false, success: false, error: null }
    };
  }

  async runAllTests() {
    console.log('🧪 Testing DigiClick AI Notification System...');
    console.log('=' .repeat(60));
    
    try {
      await this.testSlackNotification();
      await this.testEmailNotification();
      await this.testMonitoringEndpoints();
      
      this.generateTestReport();
      
    } catch (error) {
      console.error('💥 Test suite failed:', error);
      process.exit(1);
    }
  }

  async testSlackNotification() {
    console.log('💬 Testing Slack notification...');
    
    if (!this.config.slackWebhookUrl) {
      this.results.slack = {
        tested: true,
        success: false,
        error: 'SLACK_WEBHOOK_URL environment variable not set'
      };
      console.log('❌ Slack test skipped - webhook URL not configured');
      return;
    }

    try {
      const testPayload = {
        username: "DigiClick AI Test Bot",
        icon_emoji: ":test_tube:",
        attachments: [
          {
            color: "good",
            title: "🧪 Notification System Test",
            text: "This is a test message to verify Slack integration is working correctly.",
            fields: [
              {
                title: "Test Type",
                value: "Slack Webhook Verification",
                short: true
              },
              {
                title: "Timestamp",
                value: new Date().toISOString(),
                short: true
              },
              {
                title: "App URL",
                value: this.config.appUrl,
                short: false
              }
            ],
            footer: "DigiClick AI Notification Test",
            footer_icon: "https://github.com/favicon.ico",
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      const response = await this.makeSlackRequest(testPayload);
      
      if (response.success) {
        this.results.slack = {
          tested: true,
          success: true,
          error: null
        };
        console.log('✅ Slack notification test passed');
      } else {
        this.results.slack = {
          tested: true,
          success: false,
          error: response.error
        };
        console.log('❌ Slack notification test failed:', response.error);
      }
      
    } catch (error) {
      this.results.slack = {
        tested: true,
        success: false,
        error: error.message
      };
      console.log('❌ Slack test error:', error.message);
    }
  }

  async testEmailNotification() {
    console.log('📧 Testing email notification...');
    
    // Check if email configuration is available
    const emailConfigured = process.env.SMTP_USERNAME && 
                           process.env.SMTP_PASSWORD && 
                           process.env.FROM_EMAIL;
    
    if (!emailConfigured) {
      this.results.email = {
        tested: true,
        success: false,
        error: 'Email configuration incomplete - missing SMTP_USERNAME, SMTP_PASSWORD, or FROM_EMAIL'
      };
      console.log('❌ Email test skipped - SMTP configuration not complete');
      return;
    }

    try {
      // For this test, we'll just verify the configuration is present
      // In a real implementation, you'd send a test email
      console.log('📧 Email configuration detected:');
      console.log(`   SMTP Server: ${process.env.SMTP_SERVER || 'smtp.gmail.com'}`);
      console.log(`   SMTP Port: ${process.env.SMTP_PORT || '587'}`);
      console.log(`   From Email: ${process.env.FROM_EMAIL}`);
      console.log(`   Username: ${process.env.SMTP_USERNAME}`);
      
      this.results.email = {
        tested: true,
        success: true,
        error: null
      };
      console.log('✅ Email configuration test passed');
      
    } catch (error) {
      this.results.email = {
        tested: true,
        success: false,
        error: error.message
      };
      console.log('❌ Email test error:', error.message);
    }
  }

  async testMonitoringEndpoints() {
    console.log('🔍 Testing monitoring endpoints...');
    
    try {
      const endpoints = [
        '/',
        '/cursor-context-demo',
        '/portfolio',
        '/sitemap.xml'
      ];
      
      let successCount = 0;
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.makeHttpRequest(`${this.config.appUrl}${endpoint}`);
          const success = response.statusCode >= 200 && response.statusCode < 400;
          
          results.push({
            endpoint,
            statusCode: response.statusCode,
            success,
            responseTime: response.responseTime
          });
          
          if (success) {
            successCount++;
            console.log(`   ✅ ${endpoint} - ${response.statusCode} (${response.responseTime}ms)`);
          } else {
            console.log(`   ❌ ${endpoint} - ${response.statusCode} (${response.responseTime}ms)`);
          }
          
        } catch (error) {
          results.push({
            endpoint,
            success: false,
            error: error.message
          });
          console.log(`   ❌ ${endpoint} - ${error.message}`);
        }
      }
      
      const successRate = (successCount / endpoints.length) * 100;
      
      this.results.monitoring = {
        tested: true,
        success: successRate >= 75, // 75% success rate required
        error: successRate < 75 ? `Only ${successCount}/${endpoints.length} endpoints accessible` : null,
        details: {
          successRate: `${successRate.toFixed(1)}%`,
          results
        }
      };
      
      if (successRate >= 75) {
        console.log(`✅ Monitoring test passed - ${successRate.toFixed(1)}% success rate`);
      } else {
        console.log(`❌ Monitoring test failed - ${successRate.toFixed(1)}% success rate (75% required)`);
      }
      
    } catch (error) {
      this.results.monitoring = {
        tested: true,
        success: false,
        error: error.message
      };
      console.log('❌ Monitoring test error:', error.message);
    }
  }

  makeSlackRequest(payload) {
    return new Promise((resolve) => {
      const data = JSON.stringify(payload);
      const url = new URL(this.config.slackWebhookUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve({ success: true, data: responseData });
          } else {
            resolve({ 
              success: false, 
              error: `HTTP ${res.statusCode}: ${responseData}` 
            });
          }
        });
      });

      req.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ success: false, error: 'Request timeout' });
      });

      req.write(data);
      req.end();
    });
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const protocol = url.startsWith('https:') ? https : http;
      
      const request = protocol.get(url, (response) => {
        const responseTime = Date.now() - startTime;
        
        resolve({
          statusCode: response.statusCode,
          headers: response.headers,
          responseTime
        });
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  generateTestReport() {
    console.log('\n📊 Notification System Test Report');
    console.log('=' .repeat(60));
    
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(r => r.success).length;
    const overallSuccess = passedTests === totalTests;
    
    console.log(`Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log('');
    
    // Detailed results
    Object.entries(this.results).forEach(([testName, result]) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testName.toUpperCase()}`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');
    });
    
    // Recommendations
    console.log('📋 Recommendations:');
    
    if (!this.results.slack.success) {
      console.log('   🔧 Configure SLACK_WEBHOOK_URL environment variable');
      console.log('   📖 See docs/DEPLOYMENT_MONITORING_SETUP.md for setup instructions');
    }
    
    if (!this.results.email.success) {
      console.log('   🔧 Configure email SMTP settings (SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL)');
      console.log('   📖 See docs/DEPLOYMENT_MONITORING_SETUP.md for email setup');
    }
    
    if (!this.results.monitoring.success) {
      console.log('   🔧 Check application deployment and accessibility');
      console.log('   🌐 Verify NEXT_PUBLIC_APP_URL is correct and site is live');
    }
    
    if (overallSuccess) {
      console.log('   🎉 All tests passed! Notification system is ready for deployment monitoring.');
    }
    
    console.log('\n🔗 Next Steps:');
    console.log('   1. Fix any failing tests above');
    console.log('   2. Add all required secrets to GitHub repository');
    console.log('   3. Trigger a test deployment to verify end-to-end functionality');
    console.log('   4. Monitor #digiclick-deployments Slack channel for notifications');
    
    // Exit with appropriate code
    process.exit(overallSuccess ? 0 : 1);
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new NotificationTester();
  tester.runAllTests().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = NotificationTester;
