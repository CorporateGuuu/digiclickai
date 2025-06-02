#!/usr/bin/env node

/**
 * DigiClick AI Performance Alert Manager
 * Implements tiered alerting system with escalation protocols
 */

const fs = require('fs');
const path = require('path');

class PerformanceAlertManager {
  constructor() {
    this.config = this.loadConfig();
    this.alertHistory = new Map();
    this.baselineMetrics = new Map();
    this.currentAlerts = new Map();
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, '../config/performance-alert-config.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load alert configuration:', error);
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      alertLevels: {
        warning: { thresholds: {}, channels: ['slack'] },
        critical: { thresholds: {}, channels: ['slack', 'email'] },
        emergency: { thresholds: {}, channels: ['slack', 'email', 'escalation'] }
      }
    };
  }

  async analyzePerformanceMetrics(metrics) {
    console.log('🔍 Analyzing performance metrics for alert conditions...');
    
    const alerts = [];
    const timestamp = new Date().toISOString();

    // Update baseline metrics
    this.updateBaseline(metrics);

    // Check each alert level
    for (const [level, config] of Object.entries(this.config.alertLevels)) {
      const violations = this.checkThresholds(metrics, config.thresholds, level);
      
      if (violations.length > 0) {
        const alert = {
          level,
          timestamp,
          violations,
          metrics,
          config,
          recommendations: this.generateRecommendations(violations),
          trend: this.analyzeTrend(metrics),
          impact: this.assessImpact(violations, level)
        };

        alerts.push(alert);
        
        // Check for escalation
        if (this.shouldEscalate(alert)) {
          const escalatedAlert = this.escalateAlert(alert);
          alerts.push(escalatedAlert);
        }
      }
    }

    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert);
    }

    return alerts;
  }

  checkThresholds(metrics, thresholds, level) {
    const violations = [];

    // Check Lighthouse score
    if (thresholds.lighthouse_score && metrics.lighthouse_score) {
      const score = metrics.lighthouse_score;
      const threshold = thresholds.lighthouse_score;
      
      if (level === 'warning' && score >= threshold.min && score <= threshold.max) {
        violations.push({
          type: 'lighthouse_score',
          current: score,
          threshold: threshold.baseline,
          severity: 'warning',
          message: `Lighthouse score ${score} below target ${threshold.baseline}`
        });
      } else if (level === 'critical' && score <= threshold.max) {
        violations.push({
          type: 'lighthouse_score',
          current: score,
          threshold: threshold.baseline,
          severity: 'critical',
          message: `Lighthouse score ${score} below minimum ${threshold.baseline}`
        });
      }
    }

    // Check Core Web Vitals
    if (thresholds.core_web_vitals && metrics.core_web_vitals) {
      for (const [metric, config] of Object.entries(thresholds.core_web_vitals)) {
        const current = metrics.core_web_vitals[metric];
        if (current && current > config.threshold) {
          violations.push({
            type: 'core_web_vitals',
            metric,
            current,
            threshold: config.threshold,
            severity: level,
            message: `${metric.toUpperCase()} ${current}${config.unit} exceeds ${config.threshold}${config.unit}`,
            google_standard: config.google_standard || 'unknown'
          });
        }
      }
    }

    // Check Cursor Performance
    if (thresholds.cursor_performance && metrics.cursor_performance) {
      const cursorMetrics = metrics.cursor_performance;
      
      // FPS check
      if (thresholds.cursor_performance.fps && cursorMetrics.fps) {
        const fpsConfig = thresholds.cursor_performance.fps;
        if (level === 'warning' && cursorMetrics.fps >= fpsConfig.min && cursorMetrics.fps <= fpsConfig.max) {
          violations.push({
            type: 'cursor_fps',
            current: cursorMetrics.fps,
            threshold: fpsConfig.target,
            severity: 'warning',
            message: `Cursor FPS ${cursorMetrics.fps} below target ${fpsConfig.target}`,
            variant: cursorMetrics.variant || 'unknown'
          });
        } else if (level === 'critical' && cursorMetrics.fps <= fpsConfig.max) {
          violations.push({
            type: 'cursor_fps',
            current: cursorMetrics.fps,
            threshold: fpsConfig.target,
            severity: 'critical',
            message: `Cursor FPS ${cursorMetrics.fps} critically low (target: ${fpsConfig.target})`,
            variant: cursorMetrics.variant || 'unknown'
          });
        }
      }

      // Memory usage check
      if (thresholds.cursor_performance.memory_usage && cursorMetrics.memory_usage) {
        const memoryThreshold = thresholds.cursor_performance.memory_usage.threshold;
        if (cursorMetrics.memory_usage > memoryThreshold) {
          violations.push({
            type: 'cursor_memory',
            current: cursorMetrics.memory_usage,
            threshold: memoryThreshold,
            severity: level,
            message: `Cursor memory usage ${cursorMetrics.memory_usage}MB exceeds ${memoryThreshold}MB`,
            variant: cursorMetrics.variant || 'unknown'
          });
        }
      }
    }

    // Check Bundle Sizes
    if (thresholds.bundle_sizes && metrics.bundle_sizes) {
      for (const [bundleType, config] of Object.entries(thresholds.bundle_sizes)) {
        const current = metrics.bundle_sizes[bundleType];
        if (current) {
          const thresholdValue = config.degradation_percent ? 
            config.threshold * (1 + config.degradation_percent / 100) : 
            config.threshold;
          
          if (current > thresholdValue) {
            violations.push({
              type: 'bundle_size',
              bundle_type: bundleType,
              current: Math.round(current / 1024),
              threshold: config.threshold,
              severity: level,
              message: `${bundleType} bundle ${Math.round(current / 1024)}KB exceeds ${config.threshold}KB`,
              degradation_percent: config.degradation_percent
            });
          }
        }
      }
    }

    // Check for emergency conditions
    if (level === 'emergency' && thresholds.multiple_failures) {
      const criticalCount = violations.filter(v => v.severity === 'critical').length;
      if (criticalCount >= thresholds.multiple_failures.min_critical_count) {
        violations.push({
          type: 'multiple_failures',
          current: criticalCount,
          threshold: thresholds.multiple_failures.min_critical_count,
          severity: 'emergency',
          message: `${criticalCount} critical performance failures detected simultaneously`
        });
      }
    }

    return violations;
  }

  generateRecommendations(violations) {
    const recommendations = new Set();
    
    for (const violation of violations) {
      const recConfig = this.config.recommendations;
      
      switch (violation.type) {
        case 'lighthouse_score':
          const scoreRecs = violation.current < 85 ? 
            recConfig.lighthouse_score?.below_85 : 
            recConfig.lighthouse_score?.['85_to_89'];
          if (scoreRecs) scoreRecs.forEach(rec => recommendations.add(rec));
          break;
          
        case 'core_web_vitals':
          const cwvRecs = recConfig.core_web_vitals?.[violation.metric];
          if (cwvRecs) cwvRecs.forEach(rec => recommendations.add(rec));
          break;
          
        case 'cursor_fps':
        case 'cursor_memory':
          const cursorRecs = recConfig.cursor_performance?.fps || 
                           recConfig.cursor_performance?.memory;
          if (cursorRecs) cursorRecs.forEach(rec => recommendations.add(rec));
          break;
          
        case 'bundle_size':
          const bundleRecs = recConfig.bundle_sizes?.[violation.bundle_type];
          if (bundleRecs) bundleRecs.forEach(rec => recommendations.add(rec));
          break;
      }
    }
    
    return Array.from(recommendations);
  }

  analyzeTrend(metrics) {
    // Simple trend analysis - in production, use time series data
    const baseline = this.baselineMetrics.get('lighthouse_score') || 90;
    const current = metrics.lighthouse_score || 0;
    const change = current - baseline;
    
    return {
      direction: change > 0 ? 'improving' : change < 0 ? 'degrading' : 'stable',
      change_percent: baseline > 0 ? ((change / baseline) * 100).toFixed(2) : 0,
      baseline,
      current
    };
  }

  assessImpact(violations, level) {
    const impact = {
      user_experience: 'minimal',
      seo_ranking: 'minimal',
      conversion_rate: 'minimal',
      estimated_users_affected: 0
    };

    // Assess impact based on violation types and severity
    const hasLighthouseIssue = violations.some(v => v.type === 'lighthouse_score');
    const hasCoreWebVitals = violations.some(v => v.type === 'core_web_vitals');
    const hasCursorIssue = violations.some(v => v.type.startsWith('cursor_'));

    if (level === 'emergency') {
      impact.user_experience = 'severe';
      impact.seo_ranking = 'high';
      impact.conversion_rate = 'high';
      impact.estimated_users_affected = 1000;
    } else if (level === 'critical') {
      impact.user_experience = 'moderate';
      impact.seo_ranking = hasCoreWebVitals ? 'moderate' : 'low';
      impact.conversion_rate = 'moderate';
      impact.estimated_users_affected = 500;
    } else if (level === 'warning') {
      impact.user_experience = 'low';
      impact.seo_ranking = 'low';
      impact.conversion_rate = 'low';
      impact.estimated_users_affected = 100;
    }

    return impact;
  }

  shouldEscalate(alert) {
    const alertKey = `${alert.level}_${alert.violations.map(v => v.type).join('_')}`;
    const lastAlert = this.alertHistory.get(alertKey);
    
    if (!lastAlert) {
      this.alertHistory.set(alertKey, { timestamp: alert.timestamp, count: 1 });
      return false;
    }

    const timeDiff = new Date(alert.timestamp) - new Date(lastAlert.timestamp);
    const escalationConfig = this.config.escalation;
    
    // Escalate warning to critical after 5 minutes
    if (alert.level === 'warning' && timeDiff > escalationConfig.warning_to_critical.time_threshold * 1000) {
      return true;
    }
    
    // Escalate critical to emergency after 3 minutes
    if (alert.level === 'critical' && timeDiff > escalationConfig.critical_to_emergency.time_threshold * 1000) {
      return true;
    }
    
    return false;
  }

  escalateAlert(alert) {
    const escalationMap = {
      'warning': 'critical',
      'critical': 'emergency'
    };
    
    const newLevel = escalationMap[alert.level];
    if (!newLevel) return alert;
    
    return {
      ...alert,
      level: newLevel,
      escalated: true,
      original_level: alert.level,
      escalation_reason: `Escalated from ${alert.level} due to persistence`
    };
  }

  async processAlert(alert) {
    console.log(`🚨 Processing ${alert.level} alert with ${alert.violations.length} violations`);
    
    // Store alert
    this.currentAlerts.set(alert.timestamp, alert);
    
    // Send notifications based on configured channels
    const config = this.config.alertLevels[alert.level];
    
    for (const channel of config.channels) {
      try {
        switch (channel) {
          case 'slack':
            await this.sendSlackAlert(alert);
            break;
          case 'email':
            await this.sendEmailAlert(alert);
            break;
          case 'escalation':
            await this.sendEscalationAlert(alert);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} alert:`, error);
      }
    }
  }

  async sendSlackAlert(alert) {
    // This would integrate with the existing Slack notification system
    console.log(`📱 Sending Slack alert for ${alert.level} performance issue`);
    
    const payload = {
      level: alert.level,
      violations: alert.violations,
      recommendations: alert.recommendations,
      trend: alert.trend,
      impact: alert.impact,
      timestamp: alert.timestamp
    };
    
    // In production, this would call the actual Slack webhook
    console.log('Slack payload:', JSON.stringify(payload, null, 2));
  }

  async sendEmailAlert(alert) {
    console.log(`📧 Sending email alert for ${alert.level} performance issue`);
    
    // In production, this would send actual emails
    const emailData = {
      subject: `${alert.config.emoji} DigiClick AI ${alert.config.name}`,
      violations: alert.violations,
      recommendations: alert.recommendations,
      impact: alert.impact
    };
    
    console.log('Email data:', JSON.stringify(emailData, null, 2));
  }

  async sendEscalationAlert(alert) {
    console.log(`🚨 Sending escalation alert for ${alert.level} performance issue`);
    
    // In production, this would trigger emergency protocols
    const escalationData = {
      alert,
      emergency_contacts: this.config.escalation.emergency_contacts,
      immediate_actions: [
        'Check system status dashboard',
        'Verify cursor demo functionality',
        'Consider rollback if necessary',
        'Contact on-call engineer'
      ]
    };
    
    console.log('Escalation data:', JSON.stringify(escalationData, null, 2));
  }

  updateBaseline(metrics) {
    // Update baseline metrics for trend analysis
    if (metrics.lighthouse_score) {
      this.baselineMetrics.set('lighthouse_score', metrics.lighthouse_score);
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      active_alerts: Array.from(this.currentAlerts.values()),
      alert_history_count: this.alertHistory.size,
      baseline_metrics: Object.fromEntries(this.baselineMetrics),
      system_status: this.currentAlerts.size === 0 ? 'healthy' : 'degraded'
    };
    
    return report;
  }
}

// Export for use in other modules
module.exports = PerformanceAlertManager;

// Run if called directly
if (require.main === module) {
  const alertManager = new PerformanceAlertManager();
  
  // Example usage with mock metrics
  const mockMetrics = {
    lighthouse_score: 82,
    core_web_vitals: {
      fcp: 2800,
      lcp: 4500,
      cls: 0.15
    },
    cursor_performance: {
      fps: 48,
      memory_usage: 75,
      variant: 'gaming'
    },
    bundle_sizes: {
      javascript: 650 * 1024,
      css: 120 * 1024
    }
  };
  
  alertManager.analyzePerformanceMetrics(mockMetrics)
    .then(alerts => {
      console.log(`\n📊 Alert Analysis Complete: ${alerts.length} alerts generated`);
      const report = alertManager.generateReport();
      console.log('\n📋 System Report:', JSON.stringify(report, null, 2));
    })
    .catch(error => {
      console.error('Alert analysis failed:', error);
      process.exit(1);
    });
}
