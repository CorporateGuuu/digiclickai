// LinkedIn Connector
// This module handles sending messages through LinkedIn

const axios = require('axios');
const { pool } = require('../db');

// LinkedIn configuration
let apiConfig = null;

// Initialize the LinkedIn connector
async function initialize() {
  try {
    // Get LinkedIn configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'linkedin' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active LinkedIn configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    apiConfig = JSON.parse(config.settings);
    
    // // // console.log('LinkedIn connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing LinkedIn connector:', error);
    return false;
  }
}

/**
 * Send a message through LinkedIn
 * @param {string} message - The message to send
 * @param {Object} recipientData - Data about the recipient
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendMessage(message, recipientData, options = {}) {
  try {
    // Initialize if not already initialized
    if (!apiConfig) {
      const initialized = await initialize();
      if (!initialized) {
        throw new Error('LinkedIn connector not initialized');
      }
    }
    
    // Validate recipient LinkedIn ID
    if (!recipientData.platform_id && recipientData.platform !== 'linkedin') {
      throw new Error('Recipient LinkedIn ID is required');
    }
    
    // Get sender information
    const senderInfo = await getSenderInfo(options.senderId);
    
    // Determine which method to use based on configuration
    if (apiConfig.useOfficialApi) {
      return await sendViaOfficialApi(message, recipientData.platform_id, senderInfo, options);
    } else {
      return await sendViaAutomation(message, recipientData.platform_id, senderInfo, options);
    }
  } catch (error) {
    console.error('Error sending LinkedIn message:', error);
    
    // Log the failure
    await logLinkedInSend({
      recipientId: recipientData.id,
      recipientLinkedInId: recipientData.platform_id,
      senderId: options.senderId,
      campaignId: options.campaignId,
      status: 'failed',
      errorDetails: error.message,
      sentAt: new Date()
    });
    
    return {
      success: false,
      error: 'Failed to send LinkedIn message',
      details: error.message
    };
  }
}

/**
 * Get sender information
 * @param {number} senderId - The ID of the sender
 * @returns {Promise<Object>} - Sender information
 */
async function getSenderInfo(senderId) {
  try {
    if (senderId) {
      // Get sender from database
      const senderQuery = `
        SELECT * FROM outreach_senders
        WHERE id = $1 AND channel = 'linkedin'
      `;
      
      const senderResult = await pool.query(senderQuery, [senderId]);
      
      if (senderResult.rows.length > 0) {
        return senderResult.rows[0];
      }
    }
    
    // Get default sender
    const defaultSenderQuery = `
      SELECT * FROM outreach_senders
      WHERE channel = 'linkedin' AND is_default = true
      LIMIT 1
    `;
    
    const defaultSenderResult = await pool.query(defaultSenderQuery);
    
    if (defaultSenderResult.rows.length > 0) {
      return defaultSenderResult.rows[0];
    }
    
    // Fallback to configuration
    return {
      id: null,
      name: apiConfig.profileName || 'MDTS Outreach',
      linkedinId: apiConfig.profileId,
      channel: 'linkedin'
    };
  } catch (error) {
    console.error('Error getting sender info:', error);
    
    // Fallback
    return {
      id: null,
      name: 'MDTS Outreach',
      linkedinId: apiConfig.profileId,
      channel: 'linkedin'
    };
  }
}

/**
 * Send a LinkedIn message via the official API
 * @param {string} message - The message to send
 * @param {string} recipientId - The recipient's LinkedIn ID
 * @param {Object} senderInfo - Information about the sender
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaOfficialApi(message, recipientId, senderInfo, options = {}) {
  try {
    // Refresh access token if needed
    await refreshAccessTokenIfNeeded();
    
    // Send message using LinkedIn's Messaging API
    const response = await axios.post(
      'https://api.linkedin.com/v2/messaging/conversations',
      {
        recipients: {
          values: [{
            person: {
              'urn:li:person': recipientId
            }
          }]
        },
        body: {
          'com.linkedin.ugc.MemberShareMediaContent': {
            shareMediaCategory: 'NONE',
            shareCommentary: {
              text: message
            }
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiConfig.accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );
    
    // Log the successful send
    await logLinkedInSend({
      recipientId: options.recipientId,
      recipientLinkedInId: recipientId,
      senderId: senderInfo.id,
      senderLinkedInId: senderInfo.linkedinId,
      messageId: response.data.id,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.data.id,
      status: 'sent'
    };
  } catch (error) {
    console.error('Error sending LinkedIn message via official API:', error);
    
    // Check if token expired
    if (error.response && error.response.status === 401) {
      apiConfig.tokenExpired = true;
      await updateConfigInDatabase();
    }
    
    throw error;
  }
}

/**
 * Send a LinkedIn message via automation
 * @param {string} message - The message to send
 * @param {string} recipientId - The recipient's LinkedIn ID
 * @param {Object} senderInfo - Information about the sender
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaAutomation(message, recipientId, senderInfo, options = {}) {
  try {
    // In a real implementation, this would use a service like Phantombuster or a custom automation
    // For this implementation, we'll simulate the send
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a fake message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Log the successful send
    await logLinkedInSend({
      recipientId: options.recipientId,
      recipientLinkedInId: recipientId,
      senderId: senderInfo.id,
      senderLinkedInId: senderInfo.linkedinId,
      messageId: messageId,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: messageId,
      status: 'sent',
      note: 'Sent via automation (simulated)'
    };
  } catch (error) {
    console.error('Error sending LinkedIn message via automation:', error);
    throw error;
  }
}

/**
 * Refresh the LinkedIn access token if needed
 * @returns {Promise<void>}
 */
async function refreshAccessTokenIfNeeded() {
  try {
    // Check if token is expired or about to expire
    const now = Date.now();
    const tokenExpiresAt = apiConfig.tokenExpiresAt || 0;
    
    if (now >= tokenExpiresAt - 300000) { // Refresh if less than 5 minutes left
      // // // console.log('LinkedIn access token expired or about to expire, refreshing...');
      
      // Refresh token
      const response = await axios.post(
        'https://www.linkedin.com/oauth/v2/accessToken',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: apiConfig.refreshToken,
          client_id: apiConfig.clientId,
          client_secret: apiConfig.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      // Update configuration
      apiConfig.accessToken = response.data.access_token;
      apiConfig.refreshToken = response.data.refresh_token || apiConfig.refreshToken;
      apiConfig.tokenExpiresAt = now + (response.data.expires_in * 1000);
      apiConfig.tokenExpired = false;
      
      // Update in database
      await updateConfigInDatabase();
      
      // // // console.log('LinkedIn access token refreshed successfully');
    }
  } catch (error) {
    console.error('Error refreshing LinkedIn access token:', error);
    throw error;
  }
}

/**
 * Update the LinkedIn configuration in the database
 * @returns {Promise<void>}
 */
async function updateConfigInDatabase() {
  try {
    const query = `
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'linkedin' AND is_active = true
    `;
    
    await pool.query(query, [JSON.stringify(apiConfig), new Date()]);
  } catch (error) {
    console.error('Error updating LinkedIn configuration in database:', error);
    // Continue execution even if update fails
  }
}

/**
 * Log a LinkedIn send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logLinkedInSend(logData) {
  try {
    const query = `
      INSERT INTO linkedin_logs (
        recipient_id,
        recipient_linkedin_id,
        sender_id,
        sender_linkedin_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientLinkedInId,
      logData.senderId,
      logData.senderLinkedInId,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging LinkedIn send:', error);
    // Continue execution even if logging fails
  }
}

module.exports = {
  initialize,
  sendMessage
};
