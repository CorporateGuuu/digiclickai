// Scheduler
// This module handles scheduling of outreach campaigns

const cron = require('node-cron');
const { pool } = require('./db');
const { executeCampaignNow } = require('./outreachEngine');

// Store scheduled jobs
const scheduledJobs = new Map();

// Initialize the scheduler
async function initialize() {
  try {
    // // // console.log('Initializing outreach scheduler...');
    
    // Load scheduled campaigns from database
    const campaignsQuery = `
      SELECT * FROM outreach_campaigns
      WHERE status = 'scheduled'
      AND start_date <= NOW()
      AND (end_date IS NULL OR end_date >= NOW())
    `;
    
    const campaignsResult = await pool.query(campaignsQuery);
    
    // Schedule each campaign
    for (const campaign of campaignsResult.rows) {
      await scheduleCampaign(campaign.id, JSON.parse(campaign.schedule_options));
    }
    
    // // // console.log(`Initialized scheduler with ${scheduledJobs.size} campaigns`);
    
    // Set up daily maintenance job
    cron.schedule('0 0 * * *', async () => {
      await performMaintenance();
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing scheduler:', error);
    return false;
  }
}

/**
 * Schedule a campaign
 * @param {number} campaignId - The ID of the campaign
 * @param {Object} options - Scheduling options
 * @returns {Promise<boolean>} - Whether scheduling was successful
 */
async function scheduleCampaign(campaignId, options) {
  try {
    // Cancel existing job if it exists
    if (scheduledJobs.has(campaignId)) {
      scheduledJobs.get(campaignId).stop();
      scheduledJobs.delete(campaignId);
    }
    
    // Determine cron expression based on options
    const cronExpression = getCronExpression(options);
    
    if (!cronExpression) {
      console.error(`Invalid scheduling options for campaign ${campaignId}`);
      return false;
    }
    
    // Create the job
    const job = cron.schedule(cronExpression, async () => {
      await executeCampaignBatch(campaignId, options);
    });
    
    // Store the job
    scheduledJobs.set(campaignId, job);
    
    // // // console.log(`Scheduled campaign ${campaignId} with cron: ${cronExpression}`);
    
    return true;
  } catch (error) {
    console.error(`Error scheduling campaign ${campaignId}:`, error);
    return false;
  }
}

/**
 * Get a cron expression from scheduling options
 * @param {Object} options - Scheduling options
 * @returns {string|null} - Cron expression or null if invalid
 */
function getCronExpression(options) {
  try {
    if (!options) return null;
    
    // If a custom cron expression is provided, use it
    if (options.cronExpression) {
      return options.cronExpression;
    }
    
    // Build cron expression based on frequency
    switch (options.frequency) {
      case 'once':
        // For one-time execution, we'll use the start date
        const startDate = new Date(options.startDate);
        return `${startDate.getMinutes()} ${startDate.getHours()} ${startDate.getDate()} ${startDate.getMonth() + 1} *`;
      
      case 'hourly':
        // Run at the specified minute every hour
        return `${options.minute || 0} * * * *`;
      
      case 'daily':
        // Run at the specified time every day
        return `${options.minute || 0} ${options.hour || 9} * * *`;
      
      case 'weekly':
        // Run at the specified time on the specified day of the week
        return `${options.minute || 0} ${options.hour || 9} * * ${options.dayOfWeek || 1}`;
      
      case 'monthly':
        // Run at the specified time on the specified day of the month
        return `${options.minute || 0} ${options.hour || 9} ${options.dayOfMonth || 1} * *`;
      
      default:
        // Default to daily at 9 AM
        return '0 9 * * *';
    }
  } catch (error) {
    console.error('Error creating cron expression:', error);
    return null;
  }
}

/**
 * Execute a batch of messages for a campaign
 * @param {number} campaignId - The ID of the campaign
 * @param {Object} options - Scheduling options
 * @returns {Promise<void>}
 */
async function executeCampaignBatch(campaignId, options) {
  try {
    // // // console.log(`Executing batch for campaign ${campaignId}`);
    
    // Get campaign details
    const campaignQuery = `
      SELECT * FROM outreach_campaigns
      WHERE id = $1
    `;
    
    const campaignResult = await pool.query(campaignQuery, [campaignId]);
    
    if (campaignResult.rows.length === 0) {
      console.error(`Campaign ${campaignId} not found`);
      return;
    }
    
    const campaign = campaignResult.rows[0];
    
    // Check if campaign should still be executed
    if (campaign.status !== 'scheduled' && campaign.status !== 'in_progress') {
      // // // console.log(`Campaign ${campaignId} is no longer active (status: ${campaign.status})`);
      
      // Stop the scheduled job
      if (scheduledJobs.has(campaignId)) {
        scheduledJobs.get(campaignId).stop();
        scheduledJobs.delete(campaignId);
      }
      
      return;
    }
    
    // Check if end date has passed
    if (campaign.end_date && new Date(campaign.end_date) < new Date()) {
      // // // console.log(`Campaign ${campaignId} has reached its end date`);
      
      // Update campaign status
      await pool.query(`
        UPDATE outreach_campaigns
        SET status = 'completed', updated_at = $1
        WHERE id = $2
      `, [new Date(), campaignId]);
      
      // Stop the scheduled job
      if (scheduledJobs.has(campaignId)) {
        scheduledJobs.get(campaignId).stop();
        scheduledJobs.delete(campaignId);
      }
      
      return;
    }
    
    // Determine batch size
    const batchSize = options.batchSize || 50;
    
    // Get recipients for this batch
    const recipientsQuery = `
      SELECT r.*
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1 AND cr.status = 'pending'
      ORDER BY cr.added_at ASC
      LIMIT $2
    `;
    
    const recipientsResult = await pool.query(recipientsQuery, [campaignId, batchSize]);
    const recipients = recipientsResult.rows;
    
    if (recipients.length === 0) {
      // // // console.log(`No pending recipients for campaign ${campaignId}`);
      
      // Check if all recipients have been processed
      const pendingCountQuery = `
        SELECT COUNT(*) as count
        FROM campaign_recipients
        WHERE campaign_id = $1 AND status = 'pending'
      `;
      
      const pendingCountResult = await pool.query(pendingCountQuery, [campaignId]);
      
      if (pendingCountResult.rows[0].count === 0) {
        // // // console.log(`All recipients processed for campaign ${campaignId}`);
        
        // Update campaign status
        await pool.query(`
          UPDATE outreach_campaigns
          SET status = 'completed', updated_at = $1
          WHERE id = $2
        `, [new Date(), campaignId]);
        
        // Stop the scheduled job
        if (scheduledJobs.has(campaignId)) {
          scheduledJobs.get(campaignId).stop();
          scheduledJobs.delete(campaignId);
        }
      }
      
      return;
    }
    
    // Update campaign status to in_progress if it's not already
    if (campaign.status !== 'in_progress') {
      await pool.query(`
        UPDATE outreach_campaigns
        SET status = 'in_progress', updated_at = $1
        WHERE id = $2
      `, [new Date(), campaignId]);
    }
    
    // Execute the campaign for this batch
    const result = await executeCampaignNow(campaignId);
    
    // // // console.log(`Executed batch for campaign ${campaignId}: ${result.success ? 'Success' : 'Failed'}`);
    
    if (result.success) {
      // // // console.log(`Results: ${result.results.successful} successful, ${result.results.failed} failed`);
    }
  } catch (error) {
    console.error(`Error executing campaign batch ${campaignId}:`, error);
  }
}

/**
 * Perform maintenance on the scheduler
 * @returns {Promise<void>}
 */
async function performMaintenance() {
  try {
    // // // console.log('Performing scheduler maintenance...');
    
    // Check for new scheduled campaigns
    const newCampaignsQuery = `
      SELECT * FROM outreach_campaigns
      WHERE status = 'scheduled'
      AND start_date <= NOW()
      AND (end_date IS NULL OR end_date >= NOW())
      AND id NOT IN (${Array.from(scheduledJobs.keys()).join(',') || 0})
    `;
    
    const newCampaignsResult = await pool.query(newCampaignsQuery);
    
    // Schedule new campaigns
    for (const campaign of newCampaignsResult.rows) {
      await scheduleCampaign(campaign.id, JSON.parse(campaign.schedule_options));
    }
    
    // Check for campaigns that should be stopped
    const completedCampaignsQuery = `
      SELECT id FROM outreach_campaigns
      WHERE id IN (${Array.from(scheduledJobs.keys()).join(',') || 0})
      AND (
        status NOT IN ('scheduled', 'in_progress')
        OR (end_date IS NOT NULL AND end_date < NOW())
      )
    `;
    
    const completedCampaignsResult = await pool.query(completedCampaignsQuery);
    
    // Stop completed campaigns
    for (const campaign of completedCampaignsResult.rows) {
      if (scheduledJobs.has(campaign.id)) {
        scheduledJobs.get(campaign.id).stop();
        scheduledJobs.delete(campaign.id);
        // // // console.log(`Stopped scheduled job for campaign ${campaign.id}`);
      }
    }
    
    // // // console.log(`Maintenance complete. Active scheduled campaigns: ${scheduledJobs.size}`);
  } catch (error) {
    console.error('Error performing scheduler maintenance:', error);
  }
}

/**
 * Stop all scheduled jobs
 * @returns {void}
 */
function stopAll() {
  for (const [campaignId, job] of scheduledJobs.entries()) {
    job.stop();
    // // // console.log(`Stopped scheduled job for campaign ${campaignId}`);
  }
  
  scheduledJobs.clear();
  // // // console.log('All scheduled jobs stopped');
}

module.exports = {
  initialize,
  scheduleCampaign,
  stopAll
};
