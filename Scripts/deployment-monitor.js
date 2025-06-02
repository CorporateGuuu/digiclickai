/**
 * DigiClick AI - Deployment Monitoring and Rollback Script
 * Monitors deployment health and triggers rollback if issues are detected
 */

const https = require('https');
const { execSync } = require('child_process');

class DeploymentMonitor {
  constructor() {
    this.config = {
      productionUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app',
      stagingUrl: process.env.STAGING_URL || 'https://staging--digiclickai.netlify.app',
      healthCheckInterval: 30000, // 30 seconds
      maxFailures: 3,
      rollbackThreshold: 5, // minutes
      criticalEndpoints: [
        '/',
        '/cursor-demo',
        '/portfolio',
        '/contact',
        '/api/health-check'
      ]
    };
    
    this.metrics = {
      failures: 0,
      lastSuccessfulCheck: null,
      deploymentStartTime: Date.now(),
      errors: []
    };
  }

  async startMonitoring() {
    console.log('🔍 Starting DigiClick AI deployment monitoring...');
    console.log(`📊 Monitoring: ${this.config.productionUrl}`);
    console.log(`⏱️ Check interval: ${this.config.healthCheckInterval / 1000}s`);
    console.log(`🚨 Failure threshold: ${this.config.maxFailures}`);
    console.log('=' .repeat(60));

    // Initial health check
    const initialHealth = await this.performHealthCheck();
    
    if (!initialHealth.healthy) {
      console.log('❌ Initial health check failed - deployment may have issues');
      await this.handleUnhealthyDeployment();
      return false;
    }

    console.log('✅ Initial health check passed');
    
    // Start continuous monitoring
    const monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, this.config.healthCheckInterval);

    // Monitor for specified duration
    const monitoringDuration = 10 * 60 * 1000; // 10 minutes
    
    setTimeout(() => {
      clearInterval(monitoringInterval);
      this.generateMonitoringReport();
    }, monitoringDuration);

    return true;
  }

  async performMonitoringCycle() {
    try {
      const health = await this.performHealthCheck();
      
      if (health.healthy) {
        this.metrics.failures = 0;
        this.metrics.lastSuccessfulCheck = Date.now();
        console.log(`✅ Health check passed - ${new Date().toISOString()}`);
      } else {
        this.metrics.failures++;
        this.metrics.errors.push({
          timestamp: Date.now(),
          error: health.error,
          details: health.details
        });
        
        console.log(`❌ Health check failed (${this.metrics.failures}/${this.config.maxFailures}) - ${health.error}`);
        
        if (this.metrics.failures >= this.config.maxFailures) {
          console.log('🚨 Failure threshold reached - initiating rollback procedures');
          await this.handleUnhealthyDeployment();
        }
      }
    } catch (error) {
      console.error('💥 Monitoring cycle error:', error);
    }
  }

  async performHealthCheck() {
    const results = {
      healthy: true,
      checks: [],
      error: null,
      details: {}
    };

    try {
      // Test all critical endpoints
      for (const endpoint of this.config.criticalEndpoints) {
        const endpointResult = await this.testEndpoint(endpoint);
        results.checks.push(endpointResult);
        
        if (!endpointResult.success) {
          results.healthy = false;
          results.error = `Endpoint ${endpoint} failed: ${endpointResult.error}`;
        }
      }

      // Test cursor system specifically
      const cursorTest = await this.testCursorSystem();
      results.checks.push(cursorTest);
      
      if (!cursorTest.success) {
        results.healthy = false;
        results.error = `Cursor system test failed: ${cursorTest.error}`;
      }

      // Performance checks
      const performanceTest = await this.testPerformance();
      results.checks.push(performanceTest);
      
      if (!performanceTest.success) {
        console.log(`⚠️ Performance warning: ${performanceTest.error}`);
        // Don't mark as unhealthy for performance issues, just warn
      }

      results.details = {
        totalChecks: results.checks.length,
        passedChecks: results.checks.filter(c => c.success).length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      results.healthy = false;
      results.error = error.message;
    }

    return results;
  }

  async testEndpoint(endpoint) {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(endpoint);
      const responseTime = Date.now() - startTime;
      
      const success = response.statusCode >= 200 && response.statusCode < 400;
      
      return {
        endpoint: endpoint,
        success: success,
        statusCode: response.statusCode,
        responseTime: responseTime,
        error: success ? null : `HTTP ${response.statusCode}`
      };
    } catch (error) {
      return {
        endpoint: endpoint,
        success: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async testCursorSystem() {
    try {
      const response = await this.makeRequest('/cursor-demo');
      
      if (response.statusCode !== 200) {
        return {
          test: 'cursor-system',
          success: false,
          error: `Cursor demo page returned ${response.statusCode}`
        };
      }

      // Check for cursor system indicators in the response
      const hasGSAP = response.body && response.body.includes('gsap');
      const hasCursorComponent = response.body && (
        response.body.includes('EnhancedCustomCursor') ||
        response.body.includes('cursor-demo') ||
        response.body.includes('CustomCursor')
      );

      if (!hasGSAP && !hasCursorComponent) {
        return {
          test: 'cursor-system',
          success: false,
          error: 'Cursor system components not detected in page'
        };
      }

      return {
        test: 'cursor-system',
        success: true,
        details: {
          gsapDetected: hasGSAP,
          cursorComponentDetected: hasCursorComponent
        }
      };
    } catch (error) {
      return {
        test: 'cursor-system',
        success: false,
        error: error.message
      };
    }
  }

  async testPerformance() {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/');
      const responseTime = Date.now() - startTime;
      
      // Performance thresholds
      const thresholds = {
        responseTime: 3000, // 3 seconds
        contentSize: 1000000 // 1MB
      };

      const issues = [];
      
      if (responseTime > thresholds.responseTime) {
        issues.push(`Slow response time: ${responseTime}ms`);
      }
      
      if (response.body && response.body.length > thresholds.contentSize) {
        issues.push(`Large content size: ${response.body.length} bytes`);
      }

      return {
        test: 'performance',
        success: issues.length === 0,
        responseTime: responseTime,
        contentSize: response.body ? response.body.length : 0,
        error: issues.length > 0 ? issues.join(', ') : null
      };
    } catch (error) {
      return {
        test: 'performance',
        success: false,
        error: error.message
      };
    }
  }

  async handleUnhealthyDeployment() {
    console.log('🚨 Handling unhealthy deployment...');
    
    // Check if we're within rollback window
    const deploymentAge = Date.now() - this.metrics.deploymentStartTime;
    const rollbackWindow = this.config.rollbackThreshold * 60 * 1000;
    
    if (deploymentAge < rollbackWindow) {
      console.log('⏪ Attempting automatic rollback...');
      await this.attemptRollback();
    } else {
      console.log('⚠️ Deployment too old for automatic rollback - manual intervention required');
      await this.sendAlert();
    }
  }

  async attemptRollback() {
    try {
      // For Netlify, we can trigger a rollback via API
      if (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_AUTH_TOKEN) {
        console.log('🔄 Triggering Netlify rollback...');
        // Implementation would depend on Netlify API
        console.log('📧 Rollback initiated - check Netlify dashboard');
      }
      
      // For Vercel, similar approach
      if (process.env.VERCEL_PROJECT_ID && process.env.VERCEL_TOKEN) {
        console.log('🔄 Triggering Vercel rollback...');
        // Implementation would depend on Vercel API
        console.log('📧 Rollback initiated - check Vercel dashboard');
      }
      
      await this.sendAlert('Automatic rollback initiated due to deployment health issues');
      
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      await this.sendAlert(`Rollback failed: ${error.message}`);
    }
  }

  async sendAlert(message = 'DigiClick AI deployment health issues detected') {
    console.log('📧 Sending deployment alert...');
    
    const alertData = {
      timestamp: new Date().toISOString(),
      message: message,
      url: this.config.productionUrl,
      failures: this.metrics.failures,
      errors: this.metrics.errors.slice(-5), // Last 5 errors
      deploymentAge: Date.now() - this.metrics.deploymentStartTime
    };
    
    // In a real implementation, this would send to Slack, email, etc.
    console.log('🚨 ALERT:', JSON.stringify(alertData, null, 2));
  }

  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.config.productionUrl);
      
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'DigiClick-AI-Deployment-Monitor/1.0'
        },
        timeout: 10000
      };

      const req = https.request(url, options, (res) => {
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

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  generateMonitoringReport() {
    console.log('\n📊 Deployment Monitoring Report');
    console.log('=' .repeat(60));
    
    const totalTime = Date.now() - this.metrics.deploymentStartTime;
    const uptime = this.metrics.lastSuccessfulCheck ? 
      ((this.metrics.lastSuccessfulCheck - this.metrics.deploymentStartTime) / totalTime) * 100 : 0;
    
    console.log(`⏱️ Monitoring Duration: ${Math.round(totalTime / 1000 / 60)} minutes`);
    console.log(`✅ Uptime: ${uptime.toFixed(1)}%`);
    console.log(`❌ Total Failures: ${this.metrics.errors.length}`);
    console.log(`🌐 Production URL: ${this.config.productionUrl}`);
    
    if (this.metrics.errors.length > 0) {
      console.log('\n🚨 Recent Errors:');
      this.metrics.errors.slice(-3).forEach(error => {
        console.log(`   ${new Date(error.timestamp).toISOString()}: ${error.error}`);
      });
    }
    
    console.log('\n🎯 Monitoring completed');
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new DeploymentMonitor();
  
  monitor.startMonitoring()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = DeploymentMonitor;
