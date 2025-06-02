/**
 * UptimeRobot Webhook Handler for DigiClick AI
 * Processes uptime monitoring alerts and integrates with existing alert system
 */

const https = require('https');

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const PERFORMANCE_ALERT_WEBHOOK = process.env.PERFORMANCE_ALERT_WEBHOOK;
const ENVIRONMENT = process.env.NODE_ENV || 'production';

// Alert type mapping
const ALERT_TYPES = {
  1: { name: 'down', emoji: '🔴', priority: 'critical', color: 'danger' },
  2: { name: 'up', emoji: '🟢', priority: 'success', color: 'good' },
  3: { name: 'seems_down', emoji: '🟡', priority: 'warning', color: 'warning' },
  4: { name: 'seems_up', emoji: '🟡', priority: 'info', color: 'warning' }
};

// Monitor type mapping
const MONITOR_TYPES = {
  1: 'HTTP(s)',
  2: 'Keyword',
  3: 'Ping',
  4: 'Port',
  5: 'Heartbeat'
};

exports.handler = async (event, context) => {
  console.log('📊 UptimeRobot webhook received');
  
  try {
    // Parse webhook payload
    let payload;
    
    if (event.httpMethod === 'POST') {
      // Handle POST request with JSON body
      payload = JSON.parse(event.body);
    } else if (event.httpMethod === 'GET') {
      // Handle GET request with query parameters (UptimeRobot format)
      payload = event.queryStringParameters;
    } else {
      throw new Error(`Unsupported HTTP method: ${event.httpMethod}`);
    }
    
    // Extract monitoring information
    const monitoringInfo = {
      monitor_id: payload.monitorID || payload.monitor_id,
      monitor_url: payload.monitorURL || payload.monitor_url,
      monitor_friendly_name: payload.monitorFriendlyName || payload.monitor_friendly_name,
      alert_type: parseInt(payload.alertType || payload.alert_type),
      alert_type_friendly_name: payload.alertTypeFriendlyName || payload.alert_type_friendly_name,
      alert_datetime: payload.alertDateTime || payload.alert_datetime,
      alert_details: payload.alertDetails || payload.alert_details,
      monitor_type: parseInt(payload.monitorType || payload.monitor_type),
      response_time: parseFloat(payload.responseTime || payload.response_time || 0),
      ssl_expiry_date: payload.sslExpiryDate || payload.ssl_expiry_date,
      ssl_expiry_days_left: parseInt(payload.sslExpiryDaysLeft || payload.ssl_expiry_days_left || 0)
    };
    
    // Process uptime alert
    await processUptimeAlert(monitoringInfo);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Uptime webhook processed successfully',
        monitor_id: monitoringInfo.monitor_id,
        alert_type: monitoringInfo.alert_type,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Uptime webhook processing failed:', error);
    
    // Send error notification
    await sendErrorNotification(error, event);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Webhook processing failed',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

async function processUptimeAlert(monitoringInfo) {
  console.log(`📊 Processing uptime alert: ${monitoringInfo.alert_type} for ${monitoringInfo.monitor_friendly_name}`);
  
  const alertType = ALERT_TYPES[monitoringInfo.alert_type] || {
    name: 'unknown',
    emoji: '❓',
    priority: 'info',
    color: '#36a64f'
  };
  
  // Create notification payload
  const notification = await createUptimeNotificationPayload(alertType, monitoringInfo);
  
  // Send Slack notification
  if (SLACK_WEBHOOK_URL) {
    await sendSlackNotification(notification);
  }
  
  // Integrate with performance alert system for critical alerts
  if (alertType.priority === 'critical') {
    await integrateWithPerformanceAlerts(monitoringInfo, alertType);
  }
  
  // Handle specific monitor types
  await handleSpecificMonitorTypes(monitoringInfo, alertType);
}

async function createUptimeNotificationPayload(alertType, monitoringInfo) {
  const timestamp = new Date().toISOString();
  
  // Determine urgency and formatting
  let urgency = '';
  
  switch (alertType.priority) {
    case 'critical':
      urgency = '<!channel> URGENT: ';
      break;
    case 'warning':
      urgency = '<!here> ';
      break;
  }
  
  // Determine monitor category for better context
  const monitorCategory = categorizeMonitor(monitoringInfo.monitor_friendly_name, monitoringInfo.monitor_url);
  
  // Build comprehensive fields
  const fields = [
    {
      title: '📊 Monitor Status',
      value: `${alertType.emoji} ${alertType.name.toUpperCase()}`,
      short: true
    },
    {
      title: '🌐 Monitor Name',
      value: monitoringInfo.monitor_friendly_name || 'Unknown',
      short: true
    },
    {
      title: '🔗 URL',
      value: monitoringInfo.monitor_url || 'Unknown',
      short: false
    },
    {
      title: '📈 Monitor Type',
      value: MONITOR_TYPES[monitoringInfo.monitor_type] || 'Unknown',
      short: true
    },
    {
      title: '📂 Category',
      value: monitorCategory,
      short: true
    }
  ];
  
  // Add response time if available
  if (monitoringInfo.response_time > 0) {
    fields.push({
      title: '⏱️ Response Time',
      value: `${monitoringInfo.response_time}ms`,
      short: true
    });
  }
  
  // Add alert details if available
  if (monitoringInfo.alert_details) {
    fields.push({
      title: '📋 Alert Details',
      value: monitoringInfo.alert_details,
      short: false
    });
  }
  
  // Add SSL information if relevant
  if (monitoringInfo.ssl_expiry_days_left > 0) {
    const sslStatus = monitoringInfo.ssl_expiry_days_left < 30 ? '⚠️ Expiring Soon' : '✅ Valid';
    fields.push({
      title: '🔒 SSL Certificate',
      value: `${sslStatus} (${monitoringInfo.ssl_expiry_days_left} days left)`,
      short: true
    });
  }
  
  // Add quick action links for critical pages
  if (alertType.priority === 'critical' && monitorCategory === 'Critical Page') {
    fields.push({
      title: '🚀 Quick Actions',
      value: generateQuickActionLinks(monitoringInfo.monitor_url),
      short: false
    });
  }
  
  return {
    username: 'DigiClick AI Uptime Monitor',
    icon_emoji: ':chart_with_upwards_trend:',
    text: `${urgency}DigiClick AI ${alertType.name} alert`,
    attachments: [
      {
        color: alertType.color,
        title: `${alertType.emoji} DigiClick AI Uptime Alert: ${alertType.name.charAt(0).toUpperCase() + alertType.name.slice(1)}`,
        text: `Monitor "${monitoringInfo.monitor_friendly_name}" is ${alertType.name}`,
        fields: fields,
        footer: `DigiClick AI Uptime Monitoring • Environment: ${ENVIRONMENT}`,
        footer_icon: 'https://uptimerobot.com/assets/ico/favicon.ico',
        ts: Math.floor(new Date(monitoringInfo.alert_datetime || timestamp).getTime() / 1000)
      }
    ]
  };
}

function categorizeMonitor(friendlyName, url) {
  const name = (friendlyName || '').toLowerCase();
  const urlPath = (url || '').toLowerCase();
  
  // Critical pages
  if (name.includes('homepage') || urlPath.includes('digiclickai.netlify.app/')) {
    return 'Critical Page';
  }
  
  if (name.includes('cursor') || urlPath.includes('cursor-context-demo')) {
    return 'Cursor System';
  }
  
  if (name.includes('a/b') || name.includes('ab') || urlPath.includes('admin/ab-test')) {
    return 'A/B Testing';
  }
  
  if (name.includes('backend') || name.includes('api') || urlPath.includes('onrender.com')) {
    return 'Backend API';
  }
  
  if (name.includes('contact') || urlPath.includes('contact')) {
    return 'Contact System';
  }
  
  if (name.includes('pricing') || urlPath.includes('pricing')) {
    return 'Pricing Page';
  }
  
  // Asset monitoring
  if (name.includes('css') || name.includes('js') || urlPath.includes('_next/static')) {
    return 'Static Assets';
  }
  
  return 'Standard Page';
}

function generateQuickActionLinks(monitorUrl) {
  const baseUrl = monitorUrl.split('/')[0] + '//' + monitorUrl.split('/')[2];
  
  return [
    `<${baseUrl}|🌐 Homepage>`,
    `<${baseUrl}/cursor-context-demo|🖱️ Cursor Demo>`,
    `<${baseUrl}/admin/ab-test|🧪 A/B Dashboard>`,
    `<https://app.netlify.com|⚙️ Netlify Dashboard>`
  ].join(' • ');
}

async function sendSlackNotification(notification) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(notification);
    const url = new URL(SLACK_WEBHOOK_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Uptime Slack notification sent successfully');
          resolve(data);
        } else {
          console.error('❌ Uptime Slack notification failed:', res.statusCode, data);
          reject(new Error(`Slack notification failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Uptime Slack request error:', error);
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

async function integrateWithPerformanceAlerts(monitoringInfo, alertType) {
  if (!PERFORMANCE_ALERT_WEBHOOK) {
    console.log('⚠️ Performance alert webhook not configured');
    return;
  }
  
  // Create performance alert payload
  const performanceAlertPayload = {
    alert_type: 'uptime_critical',
    monitor_name: monitoringInfo.monitor_friendly_name,
    monitor_url: monitoringInfo.monitor_url,
    alert_details: monitoringInfo.alert_details,
    response_time: monitoringInfo.response_time,
    timestamp: new Date().toISOString(),
    integration_source: 'uptimerobot'
  };
  
  try {
    const response = await fetch(PERFORMANCE_ALERT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(performanceAlertPayload)
    });
    
    if (response.ok) {
      console.log('✅ Performance alert integration successful');
    } else {
      console.error('❌ Performance alert integration failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Performance alert integration error:', error);
  }
}

async function handleSpecificMonitorTypes(monitoringInfo, alertType) {
  const monitorCategory = categorizeMonitor(monitoringInfo.monitor_friendly_name, monitoringInfo.monitor_url);
  
  // Handle cursor system specific alerts
  if (monitorCategory === 'Cursor System' && alertType.priority === 'critical') {
    console.log('🖱️ Cursor system critical alert detected');
    
    // Could trigger specific cursor system diagnostics
    // This would integrate with the cursor system monitoring
  }
  
  // Handle A/B testing specific alerts
  if (monitorCategory === 'A/B Testing' && alertType.priority === 'critical') {
    console.log('🧪 A/B testing system critical alert detected');
    
    // Could trigger A/B testing system diagnostics
    // This would integrate with the A/B testing monitoring
  }
  
  // Handle backend API specific alerts
  if (monitorCategory === 'Backend API' && alertType.priority === 'critical') {
    console.log('🔗 Backend API critical alert detected');
    
    // Could trigger backend health checks
    // This would integrate with the backend monitoring
  }
}

async function sendErrorNotification(error, originalEvent) {
  if (!SLACK_WEBHOOK_URL) return;
  
  const errorNotification = {
    username: 'DigiClick AI Error Monitor',
    icon_emoji: ':warning:',
    text: '🚨 Uptime webhook processing error',
    attachments: [
      {
        color: 'danger',
        title: '❌ Uptime Webhook Processing Error',
        text: `Error processing uptime webhook: ${error.message}`,
        fields: [
          {
            title: 'Error Type',
            value: error.name || 'Unknown',
            short: true
          },
          {
            title: 'HTTP Method',
            value: originalEvent.httpMethod || 'Unknown',
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: false
          }
        ],
        footer: 'DigiClick AI Uptime Monitoring Error',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  try {
    await sendSlackNotification(errorNotification);
  } catch (notificationError) {
    console.error('❌ Failed to send uptime error notification:', notificationError);
  }
}
