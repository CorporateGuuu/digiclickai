// WhatsApp Connector
// This module handles sending messages through WhatsApp

const axios = require('axios');
const { pool } = require('../db');

// WhatsApp configuration
let apiConfig = null;

// Initialize the WhatsApp connector
async function initialize() {
  try {
    // Get WhatsApp configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'whatsapp' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active WhatsApp configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    apiConfig = JSON.parse(config.settings);
    
    // // // console.log('WhatsApp connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing WhatsApp connector:', error);
    return false;
  }
}

/**
 * Send a message through WhatsApp
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
        throw new Error('WhatsApp connector not initialized');
      }
    }
    
    // Validate recipient phone
    if (!recipientData.phone) {
      throw new Error('Recipient phone number is required');
    }
    
    // Format phone number (remove non-numeric characters and ensure it starts with country code)
    const phoneNumber = formatPhoneNumber(recipientData.phone);
    
    // Determine which API to use based on configuration
    if (apiConfig.provider === 'twilio') {
      return await sendViaTwilio(message, phoneNumber, options);
    } else if (apiConfig.provider === 'messagebird') {
      return await sendViaMessageBird(message, phoneNumber, options);
    } else if (apiConfig.provider === 'whatsapp-business') {
      return await sendViaWhatsAppBusiness(message, phoneNumber, options);
    } else {
      throw new Error(`Unsupported WhatsApp provider: ${apiConfig.provider}`);
    }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    
    // Log the failure
    await logWhatsAppSend({
      recipientId: recipientData.id,
      recipientPhone: recipientData.phone,
      campaignId: options.campaignId,
      status: 'failed',
      errorDetails: error.message,
      sentAt: new Date()
    });
    
    return {
      success: false,
      error: 'Failed to send WhatsApp message',
      details: error.message
    };
  }
}

/**
 * Format a phone number for WhatsApp
 * @param {string} phone - The phone number to format
 * @returns {string} - The formatted phone number
 */
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  let formatted = phone.replace(/\D/g, '');
  
  // Ensure it starts with a country code (default to +1 if none)
  if (!formatted.startsWith('1') && !formatted.startsWith('+1')) {
    formatted = '1' + formatted;
  }
  
  // Ensure it starts with a plus sign
  if (!formatted.startsWith('+')) {
    formatted = '+' + formatted;
  }
  
  return formatted;
}

/**
 * Send a WhatsApp message via Twilio
 * @param {string} message - The message to send
 * @param {string} phoneNumber - The recipient's phone number
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaTwilio(message, phoneNumber, options = {}) {
  try {
    const twilioClient = require('twilio')(apiConfig.accountSid, apiConfig.authToken);
    
    const response = await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${apiConfig.fromNumber}`,
      to: `whatsapp:${phoneNumber}`
    });
    
    // Log the successful send
    await logWhatsAppSend({
      recipientId: options.recipientId,
      recipientPhone: phoneNumber,
      messageId: response.sid,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.sid,
      status: response.status
    };
  } catch (error) {
    console.error('Error sending WhatsApp message via Twilio:', error);
    throw error;
  }
}

/**
 * Send a WhatsApp message via MessageBird
 * @param {string} message - The message to send
 * @param {string} phoneNumber - The recipient's phone number
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaMessageBird(message, phoneNumber, options = {}) {
  try {
    const messagebird = require('messagebird')(apiConfig.apiKey);
    
    const response = await new Promise((resolve, reject) => {
      messagebird.conversations.start(
        {
          channelId: apiConfig.channelId,
          to: phoneNumber,
          type: 'text',
          content: { text: message }
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    // Log the successful send
    await logWhatsAppSend({
      recipientId: options.recipientId,
      recipientPhone: phoneNumber,
      messageId: response.id,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.id,
      status: response.status
    };
  } catch (error) {
    console.error('Error sending WhatsApp message via MessageBird:', error);
    throw error;
  }
}

/**
 * Send a WhatsApp message via WhatsApp Business API
 * @param {string} message - The message to send
 * @param {string} phoneNumber - The recipient's phone number
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendViaWhatsAppBusiness(message, phoneNumber, options = {}) {
  try {
    // Remove the '+' from the phone number
    const formattedPhone = phoneNumber.replace('+', '');
    
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${apiConfig.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiConfig.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Log the successful send
    await logWhatsAppSend({
      recipientId: options.recipientId,
      recipientPhone: phoneNumber,
      messageId: response.data.messages[0].id,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.data.messages[0].id,
      status: 'sent'
    };
  } catch (error) {
    console.error('Error sending WhatsApp message via WhatsApp Business API:', error);
    throw error;
  }
}

/**
 * Log a WhatsApp send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logWhatsAppSend(logData) {
  try {
    const query = `
      INSERT INTO whatsapp_logs (
        recipient_id,
        recipient_phone,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientPhone,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging WhatsApp send:', error);
    // Continue execution even if logging fails
  }
}

module.exports = {
  initialize,
  sendMessage
};
