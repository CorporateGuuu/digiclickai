#!/usr/bin/env node

/**
 * DigiClick AI Continuous Monitoring System
 * Provides ongoing validation and monitoring post-deployment
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class ContinuousMonitoring {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://digiclickai.netlify.app';
    this.backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://digiclick-ai-backend.onrender.com';
    this.monitoringInterval = parseInt(process.env.MONITORING_INTERVAL) || 300000; // 5 minutes
    this.alertThresholds = {
      response_time: 5000, // 5 seconds
      error_rate: 0.05, // 5%
      availability: 0.99 // 99%
    };
    
    this.metrics = {
      uptime_checks: 0,
      successful_checks: 0,
      failed_checks: 0,
      average_response_time: 0,
      last_check: null,
      alerts_sent: 0,
      status: 'unknown'
    };
    
    this.criticalPages = [
      '/',
      '/cursor-context-demo',
      '/admin/ab-test',
      '/contact',
      '/pricing'
    ];
    
    this.isRunning = false;
  }

  async startMonitoring() {
    console.log('🔍 Starting DigiClick AI Continuous Monitoring...');
    console.log(`📍 Monitoring URL: ${this.baseUrl}`);
    console.log(`🔗 Backend URL: ${this.backendUrl}`);
    console.log(`⏱️ Check interval: ${this.monitoringInterval / 1000} seconds`);
    console.log('=' .repeat(80));

    this.isRunning = true;
    
    // Initial health check
    await this.performHealthCheck();
    
    // Start continuous monitoring
    this.monitoringTimer = setInterval(async () => {
      if (this.isRunning) {
        await this.performHealthCheck();
      }
    }, this.monitoringInterval);
    
    // Graceful shutdown handling
    process.on('SIGINT', () => this.stopMonitoring());
    process.on('SIGTERM', () => this.stopMonitoring());
    
    console.log('✅ Continuous monitoring started successfully');
  }

  async performHealthCheck() {
    console.log(`\n🔍 Performing health check at ${new Date().toISOString()}`);
    
    const checkResults = {
      timestamp: new Date().toISOString(),
      overall_status: 'unknown',
      site_availability: false,
      backend_availability: false,
      cursor_system_status: 'unknown',
      ab_testing_status: 'unknown',
      response_times: {},
      errors: [],
      warnings: []
    };

    try {
      // Check site availability
      await this.checkSiteAvailability(checkResults);
      
      // Check backend availability
      await this.checkBackendAvailability(checkResults);
      
      // Check cursor system functionality
      await this.checkCursorSystem(checkResults);
      
      // Check A/B testing system
      await this.checkABTesting(checkResults);
      
      // Update metrics
      this.updateMetrics(checkResults);
      
      // Determine overall status
      this.determineOverallStatus(checkResults);
      
      // Send alerts if necessary
      await this.checkAlertConditions(checkResults);
      
      // Log results
      this.logResults(checkResults);
      
      // Save monitoring data
      this.saveMonitoringData(checkResults);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      checkResults.overall_status = 'error';
      checkResults.errors.push({
        type: 'health_check_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.metrics.failed_checks++;
    }

    this.metrics.uptime_checks++;
    this.metrics.last_check = checkResults.timestamp;
    
    return checkResults;
  }

  async checkSiteAvailability(checkResults) {
    console.log('🌐 Checking site availability...');
    
    let successfulPages = 0;
    let totalResponseTime = 0;
    
    for (const page of this.criticalPages) {
      try {
        const startTime = Date.now();
        const response = await this.makeHttpRequest(`${this.baseUrl}${page}`);
        const responseTime = Date.now() - startTime;
        
        checkResults.response_times[page] = responseTime;
        totalResponseTime += responseTime;
        
        if (response.statusCode >= 200 && response.statusCode < 400) {
          successfulPages++;
          
          // Check for specific content indicators
          if (page === '/cursor-context-demo' && !response.body.includes('cursor')) {
            checkResults.warnings.push({
              type: 'missing_cursor_content',
              page: page,
              message: 'Cursor demo page missing expected content'
            });
          }
          
          if (page === '/admin/ab-test' && !response.body.includes('test')) {
            checkResults.warnings.push({
              type: 'missing_ab_test_content',
              page: page,
              message: 'A/B test dashboard missing expected content'
            });
          }
          
        } else {
          checkResults.errors.push({
            type: 'page_error',
            page: page,
            status_code: response.statusCode,
            response_time: responseTime
          });
        }
        
        // Check response time threshold
        if (responseTime > this.alertThresholds.response_time) {
          checkResults.warnings.push({
            type: 'slow_response',
            page: page,
            response_time: responseTime,
            threshold: this.alertThresholds.response_time
          });
        }
        
      } catch (error) {
        checkResults.errors.push({
          type: 'page_request_error',
          page: page,
          error: error.message
        });
      }
    }
    
    const availabilityRate = successfulPages / this.criticalPages.length;
    checkResults.site_availability = availabilityRate >= this.alertThresholds.availability;
    checkResults.average_response_time = totalResponseTime / this.criticalPages.length;
    
    console.log(`✅ Site availability: ${successfulPages}/${this.criticalPages.length} pages (${(availabilityRate * 100).toFixed(1)}%)`);
  }

  async checkBackendAvailability(checkResults) {
    console.log('🔗 Checking backend availability...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeHttpRequest(`${this.backendUrl}/health`);
      const responseTime = Date.now() - startTime;
      
      checkResults.response_times.backend = responseTime;
      checkResults.backend_availability = response.statusCode === 200;
      
      if (responseTime > this.alertThresholds.response_time) {
        checkResults.warnings.push({
          type: 'slow_backend_response',
          response_time: responseTime,
          threshold: this.alertThresholds.response_time
        });
      }
      
      console.log(`✅ Backend availability: ${checkResults.backend_availability ? 'Online' : 'Offline'} (${responseTime}ms)`);
      
    } catch (error) {
      checkResults.backend_availability = false;
      checkResults.errors.push({
        type: 'backend_error',
        error: error.message
      });
      console.log('❌ Backend availability: Offline');
    }
  }

  async checkCursorSystem(checkResults) {
    console.log('🖱️ Checking cursor system...');
    
    try {
      const response = await this.makeHttpRequest(`${this.baseUrl}/cursor-context-demo`);
      
      if (response.statusCode === 200) {
        // Check for cursor system indicators
        const hasGSAP = response.body.includes('gsap') || response.body.includes('GSAP');
        const hasCursorElements = response.body.includes('cursor') || response.body.includes('Cursor');
        const hasVariants = response.body.includes('variant') || response.body.includes('control');
        
        if (hasGSAP && hasCursorElements) {
          checkResults.cursor_system_status = 'operational';
        } else if (hasCursorElements) {
          checkResults.cursor_system_status = 'partial';
          checkResults.warnings.push({
            type: 'cursor_system_partial',
            message: 'Cursor system partially functional - missing GSAP or variants'
          });
        } else {
          checkResults.cursor_system_status = 'failed';
          checkResults.errors.push({
            type: 'cursor_system_failed',
            message: 'Cursor system not detected on demo page'
          });
        }
        
      } else {
        checkResults.cursor_system_status = 'inaccessible';
        checkResults.errors.push({
          type: 'cursor_demo_inaccessible',
          status_code: response.statusCode
        });
      }
      
      console.log(`✅ Cursor system: ${checkResults.cursor_system_status}`);
      
    } catch (error) {
      checkResults.cursor_system_status = 'error';
      checkResults.errors.push({
        type: 'cursor_check_error',
        error: error.message
      });
      console.log('❌ Cursor system: Error');
    }
  }

  async checkABTesting(checkResults) {
    console.log('🧪 Checking A/B testing system...');
    
    try {
      // Check A/B testing dashboard
      const dashboardResponse = await this.makeHttpRequest(`${this.baseUrl}/admin/ab-test`);
      
      if (dashboardResponse.statusCode === 200) {
        const hasABContent = dashboardResponse.body.includes('variant') || 
                           dashboardResponse.body.includes('A/B') ||
                           dashboardResponse.body.includes('test');
        
        if (hasABContent) {
          checkResults.ab_testing_status = 'operational';
        } else {
          checkResults.ab_testing_status = 'partial';
          checkResults.warnings.push({
            type: 'ab_testing_partial',
            message: 'A/B testing dashboard accessible but missing expected content'
          });
        }
      } else {
        checkResults.ab_testing_status = 'inaccessible';
        checkResults.errors.push({
          type: 'ab_dashboard_inaccessible',
          status_code: dashboardResponse.statusCode
        });
      }
      
      // Check for edge function headers (simplified)
      const homeResponse = await this.makeHttpRequest(`${this.baseUrl}/`);
      const hasEdgeFunctionHeaders = homeResponse.headers && 
                                   Object.keys(homeResponse.headers).some(header => 
                                     header.toLowerCase().includes('x-') || 
                                     header.toLowerCase().includes('cf-')
                                   );
      
      if (!hasEdgeFunctionHeaders) {
        checkResults.warnings.push({
          type: 'edge_function_headers_missing',
          message: 'Edge function headers not detected - A/B testing may not be working'
        });
      }
      
      console.log(`✅ A/B testing: ${checkResults.ab_testing_status}`);
      
    } catch (error) {
      checkResults.ab_testing_status = 'error';
      checkResults.errors.push({
        type: 'ab_testing_check_error',
        error: error.message
      });
      console.log('❌ A/B testing: Error');
    }
  }

  updateMetrics(checkResults) {
    if (checkResults.overall_status === 'operational' || checkResults.overall_status === 'warning') {
      this.metrics.successful_checks++;
    } else {
      this.metrics.failed_checks++;
    }
    
    // Update average response time
    if (checkResults.average_response_time) {
      this.metrics.average_response_time = 
        (this.metrics.average_response_time * (this.metrics.uptime_checks - 1) + checkResults.average_response_time) / 
        this.metrics.uptime_checks;
    }
    
    this.metrics.status = checkResults.overall_status;
  }

  determineOverallStatus(checkResults) {
    const criticalErrors = checkResults.errors.filter(e => 
      e.type.includes('failed') || e.type.includes('inaccessible')
    ).length;
    
    if (criticalErrors > 0 || !checkResults.site_availability || !checkResults.backend_availability) {
      checkResults.overall_status = 'critical';
    } else if (checkResults.warnings.length > 0 || 
               checkResults.cursor_system_status === 'partial' ||
               checkResults.ab_testing_status === 'partial') {
      checkResults.overall_status = 'warning';
    } else if (checkResults.site_availability && 
               checkResults.backend_availability &&
               checkResults.cursor_system_status === 'operational' &&
               checkResults.ab_testing_status === 'operational') {
      checkResults.overall_status = 'operational';
    } else {
      checkResults.overall_status = 'unknown';
    }
  }

  async checkAlertConditions(checkResults) {
    // Check if we need to send alerts
    const shouldAlert = 
      checkResults.overall_status === 'critical' ||
      (checkResults.overall_status === 'warning' && checkResults.warnings.length >= 3) ||
      checkResults.average_response_time > this.alertThresholds.response_time * 2;
    
    if (shouldAlert) {
      await this.sendAlert(checkResults);
    }
  }

  async sendAlert(checkResults) {
    console.log('🚨 Sending monitoring alert...');
    
    // In a real implementation, this would send to Slack, email, etc.
    const alertData = {
      timestamp: checkResults.timestamp,
      status: checkResults.overall_status,
      site_availability: checkResults.site_availability,
      backend_availability: checkResults.backend_availability,
      cursor_system: checkResults.cursor_system_status,
      ab_testing: checkResults.ab_testing_status,
      errors: checkResults.errors.length,
      warnings: checkResults.warnings.length,
      average_response_time: checkResults.average_response_time
    };
    
    console.log('Alert data:', JSON.stringify(alertData, null, 2));
    this.metrics.alerts_sent++;
  }

  logResults(checkResults) {
    const statusEmoji = {
      'operational': '✅',
      'warning': '⚠️',
      'critical': '❌',
      'error': '💥',
      'unknown': '❓'
    };
    
    console.log(`\n${statusEmoji[checkResults.overall_status]} Overall Status: ${checkResults.overall_status.toUpperCase()}`);
    console.log(`🌐 Site: ${checkResults.site_availability ? 'Available' : 'Unavailable'}`);
    console.log(`🔗 Backend: ${checkResults.backend_availability ? 'Available' : 'Unavailable'}`);
    console.log(`🖱️ Cursor: ${checkResults.cursor_system_status}`);
    console.log(`🧪 A/B Testing: ${checkResults.ab_testing_status}`);
    console.log(`⏱️ Avg Response: ${Math.round(checkResults.average_response_time)}ms`);
    console.log(`❌ Errors: ${checkResults.errors.length}`);
    console.log(`⚠️ Warnings: ${checkResults.warnings.length}`);
  }

  saveMonitoringData(checkResults) {
    const reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    // Save latest check results
    const latestReportPath = path.join(reportsDir, 'latest-monitoring-check.json');
    fs.writeFileSync(latestReportPath, JSON.stringify(checkResults, null, 2));
    
    // Append to monitoring history
    const historyPath = path.join(reportsDir, 'monitoring-history.jsonl');
    fs.appendFileSync(historyPath, JSON.stringify(checkResults) + '\n');
    
    // Save current metrics
    const metricsPath = path.join(reportsDir, 'monitoring-metrics.json');
    fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));
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

  stopMonitoring() {
    console.log('\n🛑 Stopping continuous monitoring...');
    this.isRunning = false;
    
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    
    console.log('📊 Final Monitoring Statistics:');
    console.log(`Total checks: ${this.metrics.uptime_checks}`);
    console.log(`Successful: ${this.metrics.successful_checks}`);
    console.log(`Failed: ${this.metrics.failed_checks}`);
    console.log(`Success rate: ${((this.metrics.successful_checks / this.metrics.uptime_checks) * 100).toFixed(2)}%`);
    console.log(`Average response time: ${Math.round(this.metrics.average_response_time)}ms`);
    console.log(`Alerts sent: ${this.metrics.alerts_sent}`);
    
    console.log('✅ Monitoring stopped successfully');
    process.exit(0);
  }

  getMetrics() {
    return this.metrics;
  }
}

// Export for use in other modules
module.exports = ContinuousMonitoring;

// Run if called directly
if (require.main === module) {
  const monitoring = new ContinuousMonitoring();
  monitoring.startMonitoring().catch(error => {
    console.error('❌ Monitoring failed to start:', error);
    process.exit(1);
  });
}
