// Facebook Connector
// This module handles sending messages through Facebook

const axios = require('axios');
const { pool } = require('../db');

// Facebook configuration
let apiConfig = null;

// Initialize the Facebook connector
async function initialize() {
  try {
    // Get Facebook configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'facebook' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active Facebook configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    apiConfig = JSON.parse(config.settings);
    
    // // // console.log('Facebook connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Facebook connector:', error);
    return false;
  }
}

/**
 * Send a message through Facebook
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
        throw new Error('Facebook connector not initialized');
      }
    }
    
    // Validate recipient Facebook ID
    if (!recipientData.platform_id && recipientData.platform !== 'facebook') {
      throw new Error('Recipient Facebook ID is required');
    }
    
    // Get sender information
    const senderInfo = await getSenderInfo(options.senderId);
    
    // Send message using Facebook's Messenger API
    return await sendViaMessengerApi(message, recipientData.platform_id, senderInfo, options);
  } catch (error) {
    console.error('Error sending Facebook message:', error);
    
    // Log the failure
    await logFacebookSend({
      recipientId: recipientData.id,
      recipientFacebookId: recipientData.platform_id,
      senderId: options.senderId,
      campaignId: options.campaignId,
      status: 'failed',
      errorDetails: error.message,
      sentAt: new Date()
    });
    
    return {
      success: false,
      error: 'Failed to send Facebook message',
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
        WHERE id = $1 AND channel = 'facebook'
      `;
      
      const senderResult = await pool.query(senderQuery, [senderId]);
      
      if (senderResult.rows.length > 0) {
        return senderResult.rows[0];
      }
    }
    
    // Get default sender
    const defaultSenderQuery = `
      SELECT * FROM outreach_senders
      WHERE channel = 'facebook' AND is_default = true
      LIMIT 1
    `;
    
    const defaultSenderResult = await pool.query(defaultSenderQuery);
    
    if (defaultSenderResult.rows.length > 0) {
      return defaultSenderResult.rows[0];
    }
    
    // Fallback to configuration
    return {
      id: null,
      name: apiConfig.pageName || 'MDTS Outreach',
      facebookId: apiConfig.pageId,
      channel: 'facebook'
    };
  } catch (error) {
    console.error('Error getting sender info:', error);
    
    // Fallback
    return {
      id: null,
      name: 'MDTS Outreach',
      facebookId: apiConfig.pageId,
      channel: 'facebook'
    };
  }
}

/**
 * Send a Facebook message via the Messenger API
 * @param {string} message - The message to send
 * @param {string} recipientId - The recipient's Facebook ID
 * @param {Object} senderInfo - Information about the sender
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaMessengerApi(message, recipientId, senderInfo, options = {}) {
  try {
    // Refresh access token if needed
    await refreshAccessTokenIfNeeded();
    
    // Send message using Facebook's Messenger API
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${apiConfig.pageId}/messages`,
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
          'Authorization': `Bearer ${apiConfig.pageAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log the successful send
    await logFacebookSend({
      recipientId: options.recipientId,
      recipientFacebookId: recipientId,
      senderId: senderInfo.id,
      senderFacebookId: senderInfo.facebookId,
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
    console.error('Error sending Facebook message via Messenger API:', error);
    
    // Check if token expired
    if (error.response && error.response.status === 401) {
      apiConfig.tokenExpired = true;
      await updateConfigInDatabase();
    }
    
    throw error;
  }
}

/**
 * Refresh the Facebook access token if needed
 * @returns {Promise<void>}
 */
async function refreshAccessTokenIfNeeded() {
  try {
    // Check if token is expired or about to expire
    const now = Date.now();
    const tokenExpiresAt = apiConfig.tokenExpiresAt || 0;
    
    if (now >= tokenExpiresAt - 300000) { // Refresh if less than 5 minutes left
      // // // console.log('Facebook access token expired or about to expire, refreshing...');
      
      // Refresh token
      const response = await axios.get(
        `https://graph.facebook.com/v13.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: apiConfig.appId,
            client_secret: apiConfig.appSecret,
            fb_exchange_token: apiConfig.pageAccessToken
          }
        }
      );
      
      // Update configuration
      apiConfig.pageAccessToken = response.data.access_token;
      apiConfig.tokenExpiresAt = now + (response.data.expires_in * 1000);
      apiConfig.tokenExpired = false;
      
      // Update in database
      await updateConfigInDatabase();
      
      // // // console.log('Facebook access token refreshed successfully');
    }
  } catch (error) {
    console.error('Error refreshing Facebook access token:', error);
    throw error;
  }
}

/**
 * Update the Facebook configuration in the database
 * @returns {Promise<void>}
 */
async function updateConfigInDatabase() {
  try {
    const query = `
      UPDATE outreach_channel_config
      SET settings = $1, updated_at = $2
      WHERE channel = 'facebook' AND is_active = true
    `;
    
    await pool.query(query, [JSON.stringify(apiConfig), new Date()]);
  } catch (error) {
    console.error('Error updating Facebook configuration in database:', error);
    // Continue execution even if update fails
  }
}

/**
 * Log a Facebook send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logFacebookSend(logData) {
  try {
    const query = `
      INSERT INTO facebook_logs (
        recipient_id,
        recipient_facebook_id,
        sender_id,
        sender_facebook_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientFacebookId,
      logData.senderId,
      logData.senderFacebookId,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging Facebook send:', error);
    // Continue execution even if logging fails
  }
}

module.exports = {
  initialize,
  sendMessage
};
