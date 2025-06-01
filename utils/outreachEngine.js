// Core Outreach Engine
// This module handles the core functionality for the AI outreach system

import { pool } from './db';
import { generatePersonalizedMessage } from './aiMessageGenerator';
import { validateMessage } from './messageValidator';
import { trackOutreachAnalytics } from './analyticsTracker';

/**
 * Send a message through a specific channel
 * @param {Object} messageData - The message data
 * @param {string} channel - The channel to send through (email, whatsapp, linkedin, facebook, instagram, telegram)
 * @param {Object} recipientData - Data about the recipient for personalization
 * @param {Object} campaignData - Data about the campaign
 * @returns {Promise<Object>} - Result of the send operation
 */
export async function sendMessage(messageData, channel, recipientData, campaignData) {
  try {
    // 1. Generate personalized message using AI
    const personalizedMessage = await generatePersonalizedMessage(
      messageData.template,
      recipientData,
      campaignData,
      channel
    );
    
    // 2. Validate the message for the specific channel
    const { isValid, validationErrors } = validateMessage(personalizedMessage, channel);
    
    if (!isValid) {
      console.error('Message validation failed:', validationErrors);
      return {
        success: false,
        error: 'Message validation failed',
        details: validationErrors
      };
    }
    
    // 3. Get the appropriate connector for the channel
    const connector = getChannelConnector(channel);
    
    if (!connector) {
      return {
        success: false,
        error: `No connector available for channel: ${channel}`
      };
    }
    
    // 4. Send the message through the connector
    const sendResult = await connector.sendMessage(personalizedMessage, recipientData);
    
    // 5. Log the outreach attempt
    await logOutreachAttempt({
      channel,
      recipientId: recipientData.id,
      campaignId: campaignData.id,
      messageId: messageData.id,
      status: sendResult.success ? 'sent' : 'failed',
      errorDetails: sendResult.success ? null : sendResult.error,
      sentAt: new Date(),
      messageContent: personalizedMessage
    });
    
    // 6. Track analytics
    trackOutreachAnalytics({
      channel,
      campaignId: campaignData.id,
      success: sendResult.success,
      recipientData
    });
    
    return sendResult;
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: 'Failed to send message',
      details: error.message
    };
  }
}

/**
 * Get the appropriate connector for a channel
 * @param {string} channel - The channel to get connector for
 * @returns {Object} - The connector for the specified channel
 */
function getChannelConnector(channel) {
  switch (channel.toLowerCase()) {
    case 'email':
      return require('./connectors/emailConnector');
    case 'whatsapp':
      return require('./connectors/whatsappConnector');
    case 'linkedin':
      return require('./connectors/linkedinConnector');
    case 'facebook':
      return require('./connectors/facebookConnector');
    case 'instagram':
      return require('./connectors/instagramConnector');
    case 'telegram':
      return require('./connectors/telegramConnector');
    default:
      console.error(`Unknown channel: ${channel}`);
      return null;
  }
}

/**
 * Log an outreach attempt to the database
 * @param {Object} attemptData - Data about the outreach attempt
 * @returns {Promise<void>}
 */
async function logOutreachAttempt(attemptData) {
  try {
    const query = `
      INSERT INTO outreach_attempts (
        channel,
        recipient_id,
        campaign_id,
        message_id,
        status,
        error_details,
        sent_at,
        message_content
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const values = [
      attemptData.channel,
      attemptData.recipientId,
      attemptData.campaignId,
      attemptData.messageId,
      attemptData.status,
      attemptData.errorDetails,
      attemptData.sentAt,
      attemptData.messageContent
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging outreach attempt:', error);
    // Continue execution even if logging fails
  }
}

/**
 * Create a new outreach campaign
 * @param {Object} campaignData - Data for the new campaign
 * @returns {Promise<Object>} - The created campaign
 */
export async function createCampaign(campaignData) {
  try {
    const query = `
      INSERT INTO outreach_campaigns (
        name,
        description,
        channels,
        start_date,
        end_date,
        status,
        created_by,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      RETURNING id
    `;
    
    const values = [
      campaignData.name,
      campaignData.description,
      JSON.stringify(campaignData.channels),
      campaignData.startDate,
      campaignData.endDate,
      campaignData.status || 'draft',
      campaignData.createdBy,
      new Date()
    ];
    
    const result = await pool.query(query, values);
    const campaignId = result.rows[0].id;
    
    return {
      success: true,
      campaignId,
      message: 'Campaign created successfully'
    };
  } catch (error) {
    console.error('Error creating campaign:', error);
    return {
      success: false,
      error: 'Failed to create campaign',
      details: error.message
    };
  }
}

/**
 * Get campaign details
 * @param {number} campaignId - The ID of the campaign
 * @returns {Promise<Object>} - The campaign details
 */
export async function getCampaign(campaignId) {
  try {
    const query = `
      SELECT 
        c.*,
        COUNT(DISTINCT r.id) AS total_recipients,
        COUNT(DISTINCT CASE WHEN a.status = 'sent' THEN a.recipient_id END) AS reached_recipients,
        COUNT(DISTINCT CASE WHEN a.status = 'failed' THEN a.recipient_id END) AS failed_recipients
      FROM outreach_campaigns c
      LEFT JOIN campaign_recipients r ON c.id = r.campaign_id
      LEFT JOIN outreach_attempts a ON c.id = a.campaign_id
      WHERE c.id = $1
      GROUP BY c.id
    `;
    
    const result = await pool.query(query, [campaignId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Campaign not found'
      };
    }
    
    return {
      success: true,
      campaign: result.rows[0]
    };
  } catch (error) {
    console.error('Error getting campaign:', error);
    return {
      success: false,
      error: 'Failed to get campaign',
      details: error.message
    };
  }
}

/**
 * Add recipients to a campaign
 * @param {number} campaignId - The ID of the campaign
 * @param {Array<Object>} recipients - Array of recipient data
 * @returns {Promise<Object>} - Result of the operation
 */
export async function addRecipientsToCampaign(campaignId, recipients) {
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    for (const recipient of recipients) {
      // Check if recipient already exists
      const checkQuery = `
        SELECT id FROM recipients
        WHERE email = $1 OR phone = $2 OR (platform = $3 AND platform_id = $4)
      `;
      
      const checkResult = await pool.query(checkQuery, [
        recipient.email || null,
        recipient.phone || null,
        recipient.platform || null,
        recipient.platformId || null
      ]);
      
      let recipientId;
      
      if (checkResult.rows.length > 0) {
        // Recipient exists, update their information
        recipientId = checkResult.rows[0].id;
        
        const updateQuery = `
          UPDATE recipients
          SET 
            name = COALESCE($1, name),
            email = COALESCE($2, email),
            phone = COALESCE($3, phone),
            platform = COALESCE($4, platform),
            platform_id = COALESCE($5, platform_id),
            metadata = COALESCE($6, metadata),
            updated_at = $7
          WHERE id = $8
        `;
        
        await pool.query(updateQuery, [
          recipient.name || null,
          recipient.email || null,
          recipient.phone || null,
          recipient.platform || null,
          recipient.platformId || null,
          recipient.metadata ? JSON.stringify(recipient.metadata) : null,
          new Date(),
          recipientId
        ]);
      } else {
        // Recipient doesn't exist, create a new one
        const insertQuery = `
          INSERT INTO recipients (
            name,
            email,
            phone,
            platform,
            platform_id,
            metadata,
            created_at,
            updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
          RETURNING id
        `;
        
        const insertResult = await pool.query(insertQuery, [
          recipient.name || null,
          recipient.email || null,
          recipient.phone || null,
          recipient.platform || null,
          recipient.platformId || null,
          recipient.metadata ? JSON.stringify(recipient.metadata) : null,
          new Date()
        ]);
        
        recipientId = insertResult.rows[0].id;
      }
      
      // Add recipient to campaign
      const addToCampaignQuery = `
        INSERT INTO campaign_recipients (
          campaign_id,
          recipient_id,
          status,
          added_at
        ) VALUES ($1, $2, $3, $4)
        ON CONFLICT (campaign_id, recipient_id) DO NOTHING
      `;
      
      await pool.query(addToCampaignQuery, [
        campaignId,
        recipientId,
        'pending',
        new Date()
      ]);
    }
    
    // Commit the transaction
    await pool.query('COMMIT');
    
    return {
      success: true,
      message: `Added ${recipients.length} recipients to campaign`
    };
  } catch (error) {
    // Rollback the transaction on error
    await pool.query('ROLLBACK');
    
    console.error('Error adding recipients to campaign:', error);
    return {
      success: false,
      error: 'Failed to add recipients to campaign',
      details: error.message
    };
  }
}

/**
 * Schedule a campaign for execution
 * @param {number} campaignId - The ID of the campaign
 * @param {Object} scheduleOptions - Options for scheduling
 * @returns {Promise<Object>} - Result of the operation
 */
export async function scheduleCampaign(campaignId, scheduleOptions) {
  try {
    // Update campaign status
    const updateQuery = `
      UPDATE outreach_campaigns
      SET 
        status = 'scheduled',
        start_date = $1,
        end_date = $2,
        schedule_options = $3,
        updated_at = $4
      WHERE id = $5
      RETURNING id
    `;
    
    const values = [
      scheduleOptions.startDate,
      scheduleOptions.endDate,
      JSON.stringify(scheduleOptions),
      new Date(),
      campaignId
    ];
    
    const result = await pool.query(updateQuery, values);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Campaign not found'
      };
    }
    
    // Add job to the scheduler
    const scheduler = require('./scheduler');
    await scheduler.scheduleCampaign(campaignId, scheduleOptions);
    
    return {
      success: true,
      message: 'Campaign scheduled successfully'
    };
  } catch (error) {
    console.error('Error scheduling campaign:', error);
    return {
      success: false,
      error: 'Failed to schedule campaign',
      details: error.message
    };
  }
}

/**
 * Execute a campaign immediately
 * @param {number} campaignId - The ID of the campaign
 * @returns {Promise<Object>} - Result of the operation
 */
export async function executeCampaignNow(campaignId) {
  try {
    // Get campaign details
    const campaignResult = await getCampaign(campaignId);
    
    if (!campaignResult.success) {
      return campaignResult;
    }
    
    const campaign = campaignResult.campaign;
    
    // Get campaign recipients
    const recipientsQuery = `
      SELECT r.*
      FROM recipients r
      JOIN campaign_recipients cr ON r.id = cr.recipient_id
      WHERE cr.campaign_id = $1 AND cr.status = 'pending'
    `;
    
    const recipientsResult = await pool.query(recipientsQuery, [campaignId]);
    const recipients = recipientsResult.rows;
    
    // Get campaign messages
    const messagesQuery = `
      SELECT m.*
      FROM outreach_messages m
      WHERE m.campaign_id = $1
    `;
    
    const messagesResult = await pool.query(messagesQuery, [campaignId]);
    const messages = messagesResult.rows;
    
    if (messages.length === 0) {
      return {
        success: false,
        error: 'No messages found for campaign'
      };
    }
    
    // Update campaign status
    await pool.query(`
      UPDATE outreach_campaigns
      SET status = 'in_progress', updated_at = $1
      WHERE id = $2
    `, [new Date(), campaignId]);
    
    // Process each recipient
    const results = {
      total: recipients.length,
      successful: 0,
      failed: 0,
      details: []
    };
    
    for (const recipient of recipients) {
      // Determine which channels to use for this recipient
      const channels = determineChannelsForRecipient(recipient, JSON.parse(campaign.channels));
      
      if (channels.length === 0) {
        results.failed++;
        results.details.push({
          recipientId: recipient.id,
          success: false,
          error: 'No suitable channels available for recipient'
        });
        continue;
      }
      
      // Try each channel until successful
      let sent = false;
      
      for (const channel of channels) {
        // Find appropriate message for this channel
        const message = messages.find(m => m.channel === channel);
        
        if (!message) {
          continue; // No message template for this channel
        }
        
        // Send message
        const sendResult = await sendMessage(
          message,
          channel,
          recipient,
          campaign
        );
        
        if (sendResult.success) {
          sent = true;
          
          // Update recipient status
          await pool.query(`
            UPDATE campaign_recipients
            SET status = 'sent', updated_at = $1
            WHERE campaign_id = $2 AND recipient_id = $3
          `, [new Date(), campaignId, recipient.id]);
          
          break; // Stop trying other channels
        }
      }
      
      if (sent) {
        results.successful++;
      } else {
        results.failed++;
        
        // Update recipient status
        await pool.query(`
          UPDATE campaign_recipients
          SET status = 'failed', updated_at = $1
          WHERE campaign_id = $2 AND recipient_id = $3
        `, [new Date(), campaignId, recipient.id]);
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Update campaign status if all recipients processed
    if (results.total === results.successful + results.failed) {
      await pool.query(`
        UPDATE outreach_campaigns
        SET status = 'completed', updated_at = $1
        WHERE id = $2
      `, [new Date(), campaignId]);
    }
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error executing campaign:', error);
    return {
      success: false,
      error: 'Failed to execute campaign',
      details: error.message
    };
  }
}

/**
 * Determine which channels to use for a recipient
 * @param {Object} recipient - The recipient data
 * @param {Array<string>} campaignChannels - Available channels for the campaign
 * @returns {Array<string>} - Channels to use for this recipient
 */
function determineChannelsForRecipient(recipient, campaignChannels) {
  const availableChannels = [];
  
  // Check each channel for availability
  if (recipient.email && campaignChannels.includes('email')) {
    availableChannels.push('email');
  }
  
  if (recipient.phone && campaignChannels.includes('whatsapp')) {
    availableChannels.push('whatsapp');
  }
  
  if (recipient.platform === 'linkedin' && recipient.platform_id && campaignChannels.includes('linkedin')) {
    availableChannels.push('linkedin');
  }
  
  if (recipient.platform === 'facebook' && recipient.platform_id && campaignChannels.includes('facebook')) {
    availableChannels.push('facebook');
  }
  
  if (recipient.platform === 'instagram' && recipient.platform_id && campaignChannels.includes('instagram')) {
    availableChannels.push('instagram');
  }
  
  if (recipient.platform === 'telegram' && recipient.platform_id && campaignChannels.includes('telegram')) {
    availableChannels.push('telegram');
  }
  
  return availableChannels;
}
