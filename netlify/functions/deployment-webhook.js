/**
 * Netlify Deployment Webhook Handler
 * Processes deployment events and sends structured notifications
 */

const https = require('https');

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const EMERGENCY_EMAIL_WEBHOOK = process.env.EMERGENCY_EMAIL_WEBHOOK;
const ENVIRONMENT = process.env.NODE_ENV || 'production';

// Deployment event types
const DEPLOYMENT_EVENTS = {
  'deploy-building': { emoji: '🔨', status: 'building', priority: 'info' },
  'deploy-created': { emoji: '📦', status: 'created', priority: 'info' },
  'deploy-ready': { emoji: '✅', status: 'success', priority: 'success' },
  'deploy-failed': { emoji: '❌', status: 'failed', priority: 'critical' },
  'deploy-locked': { emoji: '🔒', status: 'locked', priority: 'warning' },
  'deploy-unlocked': { emoji: '🔓', status: 'unlocked', priority: 'info' }
};

exports.handler = async (event, context) => {
  console.log('🔔 Netlify deployment webhook received');
  
  try {
    // Parse webhook payload
    const payload = JSON.parse(event.body);
    const deploymentEvent = DEPLOYMENT_EVENTS[payload.state] || { 
      emoji: '❓', 
      status: 'unknown', 
      priority: 'info' 
    };
    
    // Extract deployment information
    const deploymentInfo = {
      id: payload.id,
      state: payload.state,
      url: payload.url || payload.ssl_url,
      admin_url: payload.admin_url,
      deploy_url: payload.deploy_ssl_url || payload.deploy_url,
      branch: payload.branch,
      commit_ref: payload.commit_ref,
      commit_url: payload.commit_url,
      created_at: payload.created_at,
      updated_at: payload.updated_at,
      build_id: payload.build_id,
      context: payload.context,
      title: payload.title,
      review_url: payload.review_url,
      site_name: payload.name,
      site_id: payload.site_id
    };
    
    // Process deployment event
    await processDeploymentEvent(deploymentEvent, deploymentInfo);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Deployment webhook processed successfully',
        deployment_id: deploymentInfo.id,
        state: deploymentInfo.state,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('❌ Deployment webhook processing failed:', error);
    
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

async function processDeploymentEvent(deploymentEvent, deploymentInfo) {
  console.log(`📊 Processing deployment event: ${deploymentInfo.state}`);
  
  // Create notification payload
  const notification = await createNotificationPayload(deploymentEvent, deploymentInfo);
  
  // Send Slack notification
  if (SLACK_WEBHOOK_URL) {
    await sendSlackNotification(notification);
  }
  
  // Send email notification for critical events
  if (deploymentEvent.priority === 'critical' && EMERGENCY_EMAIL_WEBHOOK) {
    await sendEmailNotification(notification);
  }
  
  // Trigger additional monitoring for successful deployments
  if (deploymentEvent.status === 'success') {
    await triggerPostDeploymentMonitoring(deploymentInfo);
  }
}

async function createNotificationPayload(deploymentEvent, deploymentInfo) {
  const timestamp = new Date().toISOString();
  const buildTime = calculateBuildTime(deploymentInfo.created_at, deploymentInfo.updated_at);
  
  // Determine urgency and formatting
  let urgency = '';
  let color = 'good';
  
  switch (deploymentEvent.priority) {
    case 'critical':
      urgency = '<!channel> URGENT: ';
      color = 'danger';
      break;
    case 'warning':
      urgency = '<!here> ';
      color = 'warning';
      break;
    case 'success':
      color = 'good';
      break;
    default:
      color = '#36a64f';
  }
  
  // Build comprehensive fields
  const fields = [
    {
      title: '🚀 Deployment Status',
      value: `${deploymentEvent.emoji} ${deploymentEvent.status.toUpperCase()}`,
      short: true
    },
    {
      title: '🌿 Branch',
      value: deploymentInfo.branch || 'main',
      short: true
    },
    {
      title: '⏱️ Build Time',
      value: buildTime || 'Unknown',
      short: true
    },
    {
      title: '🆔 Deploy ID',
      value: deploymentInfo.id?.substring(0, 8) || 'Unknown',
      short: true
    }
  ];
  
  // Add links
  if (deploymentInfo.url) {
    fields.push({
      title: '🌐 Live Site',
      value: `<${deploymentInfo.url}|View Site>`,
      short: true
    });
  }
  
  if (deploymentInfo.admin_url) {
    fields.push({
      title: '⚙️ Netlify Dashboard',
      value: `<${deploymentInfo.admin_url}|View Dashboard>`,
      short: true
    });
  }
  
  // Add cursor demo and A/B testing links for successful deployments
  if (deploymentEvent.status === 'success' && deploymentInfo.url) {
    fields.push({
      title: '🖱️ Cursor Demo',
      value: `<${deploymentInfo.url}/cursor-context-demo|Test Cursor>`,
      short: true
    });
    
    fields.push({
      title: '🧪 A/B Testing Dashboard',
      value: `<${deploymentInfo.url}/admin/ab-test|View A/B Tests>`,
      short: true
    });
  }
  
  // Add commit information
  if (deploymentInfo.commit_ref) {
    fields.push({
      title: '📝 Commit',
      value: deploymentInfo.commit_url ? 
        `<${deploymentInfo.commit_url}|${deploymentInfo.commit_ref.substring(0, 7)}>` :
        deploymentInfo.commit_ref.substring(0, 7),
      short: true
    });
  }
  
  return {
    username: 'DigiClick AI Deployment Monitor',
    icon_emoji: ':rocket:',
    text: `${urgency}DigiClick AI Deployment ${deploymentEvent.status}`,
    attachments: [
      {
        color: color,
        title: `${deploymentEvent.emoji} DigiClick AI Deployment ${deploymentEvent.status.charAt(0).toUpperCase() + deploymentEvent.status.slice(1)}`,
        text: deploymentInfo.title || `Deployment ${deploymentEvent.status} for ${deploymentInfo.site_name}`,
        fields: fields,
        footer: `DigiClick AI Production Monitoring • Environment: ${ENVIRONMENT}`,
        footer_icon: 'https://www.netlify.com/img/press/logos/logomark.png',
        ts: Math.floor(new Date(deploymentInfo.updated_at || timestamp).getTime() / 1000)
      }
    ]
  };
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
          console.log('✅ Slack notification sent successfully');
          resolve(data);
        } else {
          console.error('❌ Slack notification failed:', res.statusCode, data);
          reject(new Error(`Slack notification failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Slack request error:', error);
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

async function sendEmailNotification(notification) {
  if (!EMERGENCY_EMAIL_WEBHOOK) {
    console.log('⚠️ Emergency email webhook not configured');
    return;
  }
  
  const emailPayload = {
    subject: `🚨 DigiClick AI Critical Deployment Alert`,
    text: notification.text,
    html: generateEmailHTML(notification),
    priority: 'high',
    timestamp: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(emailPayload);
    const url = new URL(EMERGENCY_EMAIL_WEBHOOK);
    
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
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Emergency email sent successfully');
          resolve(data);
        } else {
          console.error('❌ Emergency email failed:', res.statusCode, data);
          reject(new Error(`Emergency email failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Emergency email request error:', error);
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

async function triggerPostDeploymentMonitoring(deploymentInfo) {
  console.log('🔍 Triggering post-deployment monitoring...');
  
  // In a real implementation, this would trigger:
  // 1. Deployment verification script
  // 2. Performance monitoring
  // 3. Uptime monitoring updates
  // 4. Error tracking release creation
  
  // For now, we'll log the trigger
  console.log('📊 Post-deployment monitoring triggered for:', {
    deployment_id: deploymentInfo.id,
    url: deploymentInfo.url,
    branch: deploymentInfo.branch,
    commit: deploymentInfo.commit_ref
  });
}

async function sendErrorNotification(error, originalEvent) {
  if (!SLACK_WEBHOOK_URL) return;
  
  const errorNotification = {
    username: 'DigiClick AI Error Monitor',
    icon_emoji: ':warning:',
    text: '🚨 Deployment webhook processing error',
    attachments: [
      {
        color: 'danger',
        title: '❌ Webhook Processing Error',
        text: `Error processing deployment webhook: ${error.message}`,
        fields: [
          {
            title: 'Error Type',
            value: error.name || 'Unknown',
            short: true
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: true
          }
        ],
        footer: 'DigiClick AI Error Monitoring',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };
  
  try {
    await sendSlackNotification(errorNotification);
  } catch (notificationError) {
    console.error('❌ Failed to send error notification:', notificationError);
  }
}

function generateEmailHTML(notification) {
  const attachment = notification.attachments[0];
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>DigiClick AI Deployment Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #121212, #1a1a1a); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .field { margin: 10px 0; }
        .field strong { display: inline-block; width: 150px; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DigiClick AI Deployment Alert</h1>
        </div>
        <div class="content">
          <h2>${attachment.title}</h2>
          <p>${attachment.text}</p>
          ${attachment.fields.map(field => 
            `<div class="field"><strong>${field.title}:</strong> ${field.value.replace(/<[^>]*>/g, '')}</div>`
          ).join('')}
        </div>
        <div class="footer">
          <p>DigiClick AI Production Monitoring System</p>
          <p>This is an automated alert. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function calculateBuildTime(createdAt, updatedAt) {
  if (!createdAt || !updatedAt) return null;
  
  const start = new Date(createdAt);
  const end = new Date(updatedAt);
  const diffMs = end - start;
  
  if (diffMs < 0) return null;
  
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
