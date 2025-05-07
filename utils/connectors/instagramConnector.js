// Instagram Connector
// This module handles sending messages through Instagram

const axios = require('axios');
const { pool } = require('../db');

// Instagram configuration
let apiConfig = null;

// Initialize the Instagram connector
async function initialize() {
  try {
    // Get Instagram configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'instagram' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active Instagram configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    apiConfig = JSON.parse(config.settings);
    
    // // // console.log('Instagram connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Instagram connector:', error);
    return false;
  }
}

/**
 * Send a message through Instagram
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
        throw new Error('Instagram connector not initialized');
      }
    }
    
    // Validate recipient Instagram ID
    if (!recipientData.platform_id && recipientData.platform !== 'instagram') {
      throw new Error('Recipient Instagram ID is required');
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
    console.error('Error sending Instagram message:', error);
    
    // Log the failure
    await logInstagramSend({
      recipientId: recipientData.id,
      recipientInstagramId: recipientData.platform_id,
      senderId: options.senderId,
      campaignId: options.campaignId,
      status: 'failed',
      errorDetails: error.message,
      sentAt: new Date()
    });
    
    return {
      success: false,
      error: 'Failed to send Instagram message',
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
        WHERE id = $1 AND channel = 'instagram'
      `;
      
      const senderResult = await pool.query(senderQuery, [senderId]);
      
      if (senderResult.rows.length > 0) {
        return senderResult.rows[0];
      }
    }
    
    // Get default sender
    const defaultSenderQuery = `
      SELECT * FROM outreach_senders
      WHERE channel = 'instagram' AND is_default = true
      LIMIT 1
    `;
    
    const defaultSenderResult = await pool.query(defaultSenderQuery);
    
    if (defaultSenderResult.rows.length > 0) {
      return defaultSenderResult.rows[0];
    }
    
    // Fallback to configuration
    return {
      id: null,
      name: apiConfig.username || 'MDTS Outreach',
      instagramId: apiConfig.businessAccountId,
      channel: 'instagram'
    };
  } catch (error) {
    console.error('Error getting sender info:', error);
    
    // Fallback
    return {
      id: null,
      name: 'MDTS Outreach',
      instagramId: apiConfig.businessAccountId,
      channel: 'instagram'
    };
  }
}

/**
 * Send an Instagram message via the official API
 * @param {string} message - The message to send
 * @param {string} recipientId - The recipient's Instagram ID
 * @param {Object} senderInfo - Information about the sender
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaOfficialApi(message, recipientId, senderInfo, options = {}) {
  try {
    // Refresh access token if needed
    await refreshAccessTokenIfNeeded();
    
    // Send message using Instagram's Messaging API (via Facebook Graph API)
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${apiConfig.businessAccountId}/messages`,
      {
        recipient: {
          id: recipientId
        },
        message: {
          text: message
        },
        messaging_type: 'MESSAGE_TAG',
        tag: 'ACCOUNT_UPDATE' // Use appropriate tag based on your use case
      },
      {
        headers: {
          'Authorization': `Bearer ${apiConfig.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log the successful send
    await logInstagramSend({
      recipientId: options.recipientId,
      recipientInstagramId: recipientId,
      senderId: senderInfo.id,
      senderInstagramId: senderInfo.instagramId,
      messageId: response.data.message_id,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.data.message_id,
      status: 'sent'
    };
  } catch (error) {
    console.error('Error sending Instagram message via official API:', error);
    
    // Check if token expired
    if (error.response && error.response.status === 401) {
      apiConfig.tokenExpired = true;
      await updateConfigInDatabase();
    }
    
    throw error;
  }
}

/**
 * Send an Instagram message via automation
 * @param {string} message - The message to send
 * @param {string} recipientId - The recipient's Instagram ID
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
    const messageId = `ig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Log the successful send
    await logInstagramSend({
      recipientId: options.recipientId,
      recipientInstagramId: recipientId,
      senderId: senderInfo.id,
      senderInstagramId: senderInfo.instagramId,
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
    console.error('Error sending Instagram message via automation:', error);
    throw error;
  }
}

/**
 * Refresh the Instagram access token if needed
 * @returns {Promise<void>}
 */
async function refreshAccessTokenIfNeeded() {
  try {
    // Check if token is expired or about to expire
    const now = Date.now();
    const tokenExpiresAt = apiConfig.tokenExpiresAt || 0;
    
    if (now >= tokenExpiresAt - 300000) { // Refresh if less than 5 minutes left
      // // // console.log('Instagram access token expired or about to expire, refreshing...');
      
      // Refresh token (Instagram uses Facebook's token system)
      const response = await axios.get(
        `https://graph.facebook.com/v13.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: apiConfig.appId,
            client_secret: apiConfig.appSecret,
            fb_exchange_token: apiConfig.accessToken
          }
        }
      );
      
      // Update configuration
      apiConfig.accessToken = response.data.access_token;
      apiConfig.tokenExpiresAt = now + (response.data.expires_in * 1000);
      apiConfig.tokenExpired = false;
      
      // Update in database
      await updateConfigInDatabase();
      
      // // // console.log('Instagram access token refreshed successfully');
    }
  } catch (error) {
    console.error('Error refreshing Instagram access token:', error);
    throw error;
  }
}

/**
 * Update the Instagram configuration in the database
 * @returns {Promise<void>}
 */
async function updateConfigInDatabase() {
  try {
    const query = `
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'instagram' AND is_active = true
    `;
    
    await pool.query(query, [JSON.stringify(apiConfig), new Date()]);
  } catch (error) {
    console.error('Error updating Instagram configuration in database:', error);
    // Continue execution even if update fails
  }
}

/**
 * Log an Instagram send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logInstagramSend(logData) {
  try {
    const query = `
      INSERT INTO instagram_logs (
        recipient_id,
        recipient_instagram_id,
        sender_id,
        sender_instagram_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientInstagramId,
      logData.senderId,
      logData.senderInstagramId,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging Instagram send:', error);
    // Continue execution even if logging fails
  }
}

module.exports = {
  initialize,
  sendMessage
};
