// Email Connector
// This module handles sending messages through email

const nodemailer = require('nodemailer');
const { pool } = require('../db');

// Email configuration
let transporter;

// Initialize the email connector
async function initialize() {
  try {
    // Get email configuration from database
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'email' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length === 0) {
      console.error('No active email configuration found');
      return false;
    }
    
    const config = configResult.rows[0];
    const settings = JSON.parse(config.settings);
    
    // Create transporter
    transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.username,
        pass: settings.password
      }
    });
    
    // Verify connection
    await transporter.verify();
    
    // // // console.log('Email connector initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing email connector:', error);
    return false;
  }
}

/**
 * Send a message through email
 * @param {string} message - The message to send
 * @param {Object} recipientData - Data about the recipient
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - Result of the send operation
 */
async function sendMessage(message, recipientData, options = {}) {
  try {
    // Initialize if not already initialized
    if (!transporter) {
      const initialized = await initialize();
      if (!initialized) {
        throw new Error('Email connector not initialized');
      }
    }
    
    // Get sender information
    const senderInfo = await getSenderInfo(options.senderId);
    
    // Validate recipient email
    if (!recipientData.email) {
      throw new Error('Recipient email is required');
    }
    
    // Prepare email options
    const mailOptions = {
      from: senderInfo.email,
      to: recipientData.email,
      subject: options.subject || 'Important message from ' + senderInfo.name,
      html: message,
      headers: {
        'X-Campaign-ID': options.campaignId || 'unknown',
        'X-Recipient-ID': recipientData.id || 'unknown'
      }
    };
    
    // Add CC if specified
    if (options.cc) {
      mailOptions.cc = options.cc;
    }
    
    // Add BCC if specified
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }
    
    // Add attachments if specified
    if (options.attachments && Array.isArray(options.attachments)) {
      mailOptions.attachments = options.attachments;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    // Log the send
    await logEmailSend({
      recipientId: recipientData.id,
      recipientEmail: recipientData.email,
      senderId: senderInfo.id,
      senderEmail: senderInfo.email,
      subject: mailOptions.subject,
      messageId: info.messageId,
      campaignId: options.campaignId,
      status: 'sent',
      sentAt: new Date()
    });
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log the failure
    if (recipientData && recipientData.email) {
      await logEmailSend({
        recipientId: recipientData.id,
        recipientEmail: recipientData.email,
        senderId: options.senderId,
        subject: options.subject,
        campaignId: options.campaignId,
        status: 'failed',
        errorDetails: error.message,
        sentAt: new Date()
      });
    }
    
    return {
      success: false,
      error: 'Failed to send email',
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
        WHERE id = $1 AND channel = 'email'
      `;
      
      const senderResult = await pool.query(senderQuery, [senderId]);
      
      if (senderResult.rows.length > 0) {
        return senderResult.rows[0];
      }
    }
    
    // Get default sender
    const defaultSenderQuery = `
      SELECT * FROM outreach_senders
      WHERE channel = 'email' AND is_default = true
      LIMIT 1
    `;
    
    const defaultSenderResult = await pool.query(defaultSenderQuery);
    
    if (defaultSenderResult.rows.length > 0) {
      return defaultSenderResult.rows[0];
    }
    
    // Fallback to configuration
    const configQuery = `
      SELECT * FROM outreach_channel_config
      WHERE channel = 'email' AND is_active = true
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const configResult = await pool.query(configQuery);
    
    if (configResult.rows.length > 0) {
      const config = configResult.rows[0];
      const settings = JSON.parse(config.settings);
      
      return {
        id: null,
        name: settings.senderName || 'MDTS Outreach',
        email: settings.username,
        channel: 'email'
      };
    }
    
    // Last resort fallback
    return {
      id: null,
      name: 'MDTS Outreach',
      email: 'outreach@mdtstech.store',
      channel: 'email'
    };
  } catch (error) {
    console.error('Error getting sender info:', error);
    
    // Fallback
    return {
      id: null,
      name: 'MDTS Outreach',
      email: 'outreach@mdtstech.store',
      channel: 'email'
    };
  }
}

/**
 * Log an email send
 * @param {Object} logData - Data to log
 * @returns {Promise<void>}
 */
async function logEmailSend(logData) {
  try {
    const query = `
      INSERT INTO email_logs (
        recipient_id,
        recipient_email,
        sender_id,
        sender_email,
        subject,
        message_id,
        campaign_id,
        status,
        error_details,
        sent_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    
    const values = [
      logData.recipientId,
      logData.recipientEmail,
      logData.senderId,
      logData.senderEmail,
      logData.subject,
      logData.messageId,
      logData.campaignId,
      logData.status,
      logData.errorDetails,
      logData.sentAt
    ];
    
    await pool.query(query, values);
  } catch (error) {
    console.error('Error logging email send:', error);
    // Continue execution even if logging fails
  }
}

module.exports = {
  initialize,
  sendMessage
};
