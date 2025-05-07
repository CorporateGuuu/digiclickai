// Analytics Tracker
// This module tracks analytics for outreach campaigns

import { pool } from './db';

/**
 * Track outreach analytics
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
export async function trackOutreachAnalytics(data) {
  try {
    // Log the analytics event
    await logAnalyticsEvent(data);
    
    // Update campaign metrics
    await updateCampaignMetrics(data);
    
    // Update channel metrics
    await updateChannelMetrics(data);
    
    // Update recipient metrics
    await updateRecipientMetrics(data);
  } catch (error) {
    console.error('Error tracking outreach analytics:', error);
    // Continue execution even if analytics tracking fails
  }
}

/**
 * Log an analytics event
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function logAnalyticsEvent(data) {
  try {
    const query = `
      INSERT INTO outreach_analytics (
        event_type,
        channel,
        campaign_id,
        recipient_id,
        sender_id,
        message_id,
        success,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      data.eventType || 'send',
      data.channel,
      data.campaignId,
      data.recipientData?.id,
      data.senderId,
      data.messageId,
      data.success,
      data.metadata ? JSON.stringify(data.metadata) : null,
      new Date()
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging analytics event:', error);
    // Continue execution even if logging fails
  }
}

/**
 * Update campaign metrics
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function updateCampaignMetrics(data) {
  try {
    if (!data.campaignId) return;
    
    // Get current metrics
    const metricsQuery = `
      SELECT * FROM campaign_metrics
      WHERE campaign_id = $1
    `;
    
    const metricsResult = await pool.query(metricsQuery, [data.campaignId]);
    
    if (metricsResult.rows.length === 0) {
      // Create new metrics record
      const insertQuery = `
        INSERT INTO campaign_metrics (
          campaign_id,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `;
      
      const values = [
        data.campaignId,
        data.eventType === 'send' && data.success ? 1 : 0,
        data.eventType === 'delivered' ? 1 : 0,
        data.eventType === 'send' && !data.success ? 1 : 0,
        data.eventType === 'open' ? 1 : 0,
        data.eventType === 'click' ? 1 : 0,
        data.eventType === 'reply' ? 1 : 0,
        new Date()
      ];
      
      await pool.query(insertQuery, values);
    } else {
      // Update existing metrics
      const metrics = metricsResult.rows[0];
      
      const updateQuery = `
        UPDATE campaign_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE campaign_id = $8
      `;
      
      const values = [
        metrics.total_sent + (data.eventType === 'send' && data.success ? 1 : 0),
        metrics.total_delivered + (data.eventType === 'delivered' ? 1 : 0),
        metrics.total_failed + (data.eventType === 'send' && !data.success ? 1 : 0),
        metrics.total_opened + (data.eventType === 'open' ? 1 : 0),
        metrics.total_clicked + (data.eventType === 'click' ? 1 : 0),
        metrics.total_replied + (data.eventType === 'reply' ? 1 : 0),
        new Date(),
        data.campaignId
      ];
      
      await pool.query(updateQuery, values);
    }
    
    // Update campaign channel metrics
    await updateCampaignChannelMetrics(data);
  } catch (error) {
    console.error('Error updating campaign metrics:', error);
    // Continue execution even if update fails
  }
}

/**
 * Update campaign channel metrics
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function updateCampaignChannelMetrics(data) {
  try {
    if (!data.campaignId || !data.channel) return;
    
    // Get current metrics
    const metricsQuery = `
      SELECT * FROM campaign_channel_metrics
      WHERE campaign_id = $1 AND channel = $2
    `;
    
    const metricsResult = await pool.query(metricsQuery, [data.campaignId, data.channel]);
    
    if (metricsResult.rows.length === 0) {
      // Create new metrics record
      const insertQuery = `
        INSERT INTO campaign_channel_metrics (
          campaign_id,
          channel,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      `;
      
      const values = [
        data.campaignId,
        data.channel,
        data.eventType === 'send' && data.success ? 1 : 0,
        data.eventType === 'delivered' ? 1 : 0,
        data.eventType === 'send' && !data.success ? 1 : 0,
        data.eventType === 'open' ? 1 : 0,
        data.eventType === 'click' ? 1 : 0,
        data.eventType === 'reply' ? 1 : 0,
        new Date()
      ];
      
      await pool.query(insertQuery, values);
    } else {
      // Update existing metrics
      const metrics = metricsResult.rows[0];
      
      const updateQuery = `
        UPDATE campaign_channel_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE campaign_id = $8 AND channel = $9
      `;
      
      const values = [
        metrics.total_sent + (data.eventType === 'send' && data.success ? 1 : 0),
        metrics.total_delivered + (data.eventType === 'delivered' ? 1 : 0),
        metrics.total_failed + (data.eventType === 'send' && !data.success ? 1 : 0),
        metrics.total_opened + (data.eventType === 'open' ? 1 : 0),
        metrics.total_clicked + (data.eventType === 'click' ? 1 : 0),
        metrics.total_replied + (data.eventType === 'reply' ? 1 : 0),
        new Date(),
        data.campaignId,
        data.channel
      ];
      
      await pool.query(updateQuery, values);
    }
  } catch (error) {
    console.error('Error updating campaign channel metrics:', error);
    // Continue execution even if update fails
  }
}

/**
 * Update channel metrics
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function updateChannelMetrics(data) {
  try {
    if (!data.channel) return;
    
    // Get current metrics
    const metricsQuery = `
      SELECT * FROM channel_metrics
      WHERE channel = $1
    `;
    
    const metricsResult = await pool.query(metricsQuery, [data.channel]);
    
    if (metricsResult.rows.length === 0) {
      // Create new metrics record
      const insertQuery = `
        INSERT INTO channel_metrics (
          channel,
          total_sent,
          total_delivered,
          total_failed,
          total_opened,
          total_clicked,
          total_replied,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `;
      
      const values = [
        data.channel,
        data.eventType === 'send' && data.success ? 1 : 0,
        data.eventType === 'delivered' ? 1 : 0,
        data.eventType === 'send' && !data.success ? 1 : 0,
        data.eventType === 'open' ? 1 : 0,
        data.eventType === 'click' ? 1 : 0,
        data.eventType === 'reply' ? 1 : 0,
        new Date()
      ];
      
      await pool.query(insertQuery, values);
    } else {
      // Update existing metrics
      const metrics = metricsResult.rows[0];
      
      const updateQuery = `
        UPDATE channel_metrics
        SET
          total_sent = $1,
          total_delivered = $2,
          total_failed = $3,
          total_opened = $4,
          total_clicked = $5,
          total_replied = $6,
          updated_at = $7
        WHERE channel = $8
      `;
      
      const values = [
        metrics.total_sent + (data.eventType === 'send' && data.success ? 1 : 0),
        metrics.total_delivered + (data.eventType === 'delivered' ? 1 : 0),
        metrics.total_failed + (data.eventType === 'send' && !data.success ? 1 : 0),
        metrics.total_opened + (data.eventType === 'open' ? 1 : 0),
        metrics.total_clicked + (data.eventType === 'click' ? 1 : 0),
        metrics.total_replied + (data.eventType === 'reply' ? 1 : 0),
        new Date(),
        data.channel
      ];
      
      await pool.query(updateQuery, values);
    }
  } catch (error) {
    console.error('Error updating channel metrics:', error);
    // Continue execution even if update fails
  }
}

/**
 * Update recipient metrics
 * @param {Object} data - Analytics data
 * @returns {Promise<void>}
 */
async function updateRecipientMetrics(data) {
  try {
    if (!data.recipientData || !data.recipientData.id) return;
    
    // Get current metrics
    const metricsQuery = `
      SELECT * FROM recipient_metrics
      WHERE recipient_id = $1
    `;
    
    const metricsResult = await pool.query(metricsQuery, [data.recipientData.id]);
    
    if (metricsResult.rows.length === 0) {
      // Create new metrics record
      const insertQuery = `
        INSERT INTO recipient_metrics (
          recipient_id,
          total_received,
          total_opened,
          total_clicked,
          total_replied,
          last_interaction,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
      `;
      
      const values = [
        data.recipientData.id,
        (data.eventType === 'send' && data.success) || data.eventType === 'delivered' ? 1 : 0,
        data.eventType === 'open' ? 1 : 0,
        data.eventType === 'click' ? 1 : 0,
        data.eventType === 'reply' ? 1 : 0,
        new Date(),
        new Date()
      ];
      
      await pool.query(insertQuery, values);
    } else {
      // Update existing metrics
      const metrics = metricsResult.rows[0];
      
      const updateQuery = `
        UPDATE recipient_metrics
        SET
          total_received = $1,
          total_opened = $2,
          total_clicked = $3,
          total_replied = $4,
          last_interaction = $5,
          updated_at = $6
        WHERE recipient_id = $7
      `;
      
      const values = [
        metrics.total_received + ((data.eventType === 'send' && data.success) || data.eventType === 'delivered' ? 1 : 0),
        metrics.total_opened + (data.eventType === 'open' ? 1 : 0),
        metrics.total_clicked + (data.eventType === 'click' ? 1 : 0),
        metrics.total_replied + (data.eventType === 'reply' ? 1 : 0),
        new Date(),
        new Date(),
        data.recipientData.id
      ];
      
      await pool.query(updateQuery, values);
    }
  } catch (error) {
    console.error('Error updating recipient metrics:', error);
    // Continue execution even if update fails
  }
}
