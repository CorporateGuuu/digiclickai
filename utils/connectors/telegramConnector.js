// Telegram Connector
// This module handles sending messages through Telegram

const { Telegraf } = require('telegraf');
const { pool } = require('../db');

// Telegram configuration
let apiConfig = null;
let bot = null;

// Initialize the Telegram connector
async function initialize() {
  try {
    // Get Telegram configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'telegram' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active Telegram configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    apiConfig = JSON.parse(config.settings);
    
    // Initialize Telegram bot
    bot = new Telegraf(apiConfig.botToken);
    
    // Start the bot
    if (apiConfig.useWebhook) {
      // Use webhook mode
      await bot.telegram.setWebhook(`${apiConfig.webhookUrl}/telegram-webhook`);
      // // // console.log('Telegram bot initialized in webhook mode');
    } else {
      // Use polling mode
      bot.launch();
      // // // console.log('Telegram bot initialized in polling mode');
    }
    
    // // // console.log('Telegram connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Telegram connector:', error);
    return false;
  }
}

/**
 * Send a message through Telegram
 * @param {string} message - The message to send
 * @param {Object} recipientData - Data about the recipient
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendMessage(message, recipientData, options = {}) {
  try {
    // Initialize if not already initialized
    if (!bot) {
      const initialized = await initialize();
      if (!initialized) {
        throw new Error('Telegram connector not initialized');
      }
    }
    
    // Validate recipient Telegram ID
    if (!recipientData.platform_id && recipientData.platform !== 'telegram') {
      throw new Error('Recipient Telegram ID is required');
    }
    
    // Get sender information
    const senderInfo = await getSenderInfo(options.senderId);
    
    // Send message using Telegram Bot API
    const response = await bot.telegram.sendMessage(
      recipientData.platform_id,
      message,
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: options.disablePreview || false
      }
    );
    
    // Log the successful send
    await logTelegramSend({
      recipientId: recipientData.id,
      recipientTelegramId: recipientData.platform_id,
      senderId: senderInfo.id,
      senderTelegramId: senderInfo.telegramId,
      messageId: response.message_id.toString(),
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: response.message_id.toString(),
      status: 'sent'
    };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    
    // Log the failure
    await logTelegramSend({
      recipientId: recipientData.id,
      recipientTelegramId: recipientData.platform_id,
      senderId: options.senderId,
      campaignId: options.campaignId,
      status: 'failed',
      errorDetails: error.message,
      sentAt: new Date()
    });
    
    return {
      success: false,
      error: 'Failed to send Telegram message',
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
        WHERE id = $1 AND channel = 'telegram'
      `;
      
      const senderResult = await pool.query(senderQuery, [senderId]);
      
      if (senderResult.rows.length > 0) {
        return senderResult.rows[0];
      }
    }
    
    // Get default sender
    const defaultSenderQuery = `
      SELECT * FROM outreach_senders
      WHERE channel = 'telegram' AND is_default = true
      LIMIT 1
    `;
    
    const defaultSenderResult = await pool.query(defaultSenderQuery);
    
    if (defaultSenderResult.rows.length > 0) {
      return defaultSenderResult.rows[0];
    }
    
    // Fallback to configuration
    return {
      id: null,
      name: apiConfig.botName || 'MDTS Outreach Bot',
      telegramId: apiConfig.botUsername,
      channel: 'telegram'
    };
  } catch (error) {
    console.error('Error getting sender info:', error);
    
    // Fallback
    return {
      id: null,
      name: 'MDTS Outreach Bot',
      telegramId: apiConfig.botUsername,
      channel: 'telegram'
    };
  }
}

/**
 * Log a Telegram send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logTelegramSend(logData) {
  try {
    const query = `
      INSERT INTO telegram_logs (
        recipient_id,
        recipient_telegram_id,
        sender_id,
        sender_telegram_id,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientTelegramId,
      logData.senderId,
      logData.senderTelegramId,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging Telegram send:', error);
    // Continue execution even if logging fails
  }
}

/**
 * Stop the Telegram bot
 * @returns {Promise<void>}
 */
async function stop() {
  if (bot) {
    if (apiConfig.useWebhook) {
      await bot.telegram.deleteWebhook();
    } else {
      bot.stop();
    }
    // // // console.log('Telegram bot stopped');
  }
}

module.exports = {
  initialize,
  sendMessage,
  stop
};
