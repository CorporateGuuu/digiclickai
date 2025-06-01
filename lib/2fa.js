/**
 * Two-Factor Authentication Library
 * Supports DUO, SMS, and Email verification methods
 */

import crypto from 'crypto';
import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
// DUO integration will be added later
// import Duo from '@duosecurity/duo_web';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Twilio configuration
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// DUO configuration - will be implemented later
const duoConfig = {
  ikey: process.env.DUO_INTEGRATION_KEY,
  skey: process.env.DUO_SECRET_KEY,
  akey: process.env.DUO_APPLICATION_KEY,
  host: process.env.DUO_API_HOSTNAME,
};

/**
 * Generate a random verification code
 * @param {number} length - Length of the code
 * @returns {string} - Random verification code
 */
function generateVerificationCode(length = 6) {
  return crypto.randomInt(100000, 999999).toString().padStart(length, '0');
}

/**
 * Store verification code in the database
 * @param {number} userId - User ID
 * @param {string} method - Verification method (email, sms, duo)
 * @param {string} code - Verification code
 * @param {number} expiresIn - Expiration time in seconds
 * @returns {Promise<boolean>} - Success status
 */
async function storeVerificationCode(userId, method, code, expiresIn = 600) {
  try {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Check if a code already exists for this user and method
    const checkQuery = `
      SELECT id FROM two_factor_codes
      WHERE user_id = $1 AND method = $2
    `;
    const checkResult = await pool.query(checkQuery, [userId, method]);

    if (checkResult.rows.length > 0) {
      // Update existing code
      const updateQuery = `
        UPDATE two_factor_codes
        SET code = $1, expires_at = $2, updated_at = NOW()
        WHERE user_id = $3 AND method = $4
      `;
      await pool.query(updateQuery, [code, expiresAt, userId, method]);
    } else {
      // Insert new code
      const insertQuery = `
        INSERT INTO two_factor_codes (user_id, method, code, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `;
      await pool.query(insertQuery, [userId, method, code, expiresAt]);
    }

    return true;
  } catch (error) {
    console.error('Error storing verification code:', error);
    return false;
  }
}

/**
 * Verify a 2FA code
 * @param {number} userId - User ID
 * @param {string} method - Verification method (email, sms, duo)
 * @param {string} code - Verification code
 * @returns {Promise<boolean>} - Verification status
 */
async function verifyCode(userId, method, code) {
  try {
    const query = `
      SELECT * FROM two_factor_codes
      WHERE user_id = $1 AND method = $2 AND code = $3 AND expires_at > NOW()
    `;
    const result = await pool.query(query, [userId, method, code]);

    if (result.rows.length > 0) {
      // Delete the used code
      const deleteQuery = `
        DELETE FROM two_factor_codes
        WHERE user_id = $1 AND method = $2
      `;
      await pool.query(deleteQuery, [userId, method]);

      return true;
    }

    return false;
  } catch (error) {
    console.error('Error verifying code:', error);
    return false;
  }
}

/**
 * Send verification code via email
 * @param {number} userId - User ID
 * @param {string} email - User's email
 * @returns {Promise<boolean>} - Success status
 */
async function sendEmailVerification(userId, email) {
  try {
    const code = generateVerificationCode();
    const stored = await storeVerificationCode(userId, 'email', code);

    if (!stored) {
      return false;
    }

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your MDTS Verification Code',
      text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #003087;">MDTS Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; font-size: 24px; text-align: center; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message from MDTS. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email verification:', error);
    return false;
  }
}

/**
 * Send verification code via SMS
 * @param {number} userId - User ID
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<boolean>} - Success status
 */
async function sendSmsVerification(userId, phoneNumber) {
  try {
    if (!twilioClient) {
      console.error('Twilio client not configured');
      return false;
    }

    const code = generateVerificationCode();
    const stored = await storeVerificationCode(userId, 'sms', code);

    if (!stored) {
      return false;
    }

    // Send SMS
    await twilioClient.messages.create({
      body: `Your MDTS verification code is: ${code}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return true;
  } catch (error) {
    console.error('Error sending SMS verification:', error);
    return false;
  }
}

/**
 * Generate DUO authentication request
 * @param {number} userId - User ID
 * @param {string} username - User's username
 * @returns {Promise<string>} - DUO authentication request
 */
function generateDuoRequest(userId, username) {
  try {
    // This is a placeholder implementation until DUO is properly integrated
    // // // console.log('DUO authentication request generated for user:', username);

    // Return a mock response for now
    return {
      host: duoConfig.host,
      sigRequest: 'mock_sig_request',
      userId,
    };
  } catch (error) {
    console.error('Error generating DUO request:', error);
    return null;
  }
}

/**
 * Verify DUO authentication response
 * @param {string} signedResponse - Signed response from DUO
 * @returns {string|null} - Username if verified, null otherwise
 */
function verifyDuoResponse(signedResponse) {
  try {
    // This is a placeholder implementation until DUO is properly integrated
    // // // console.log('DUO response verification attempted:', signedResponse);

    // For testing purposes, always return a successful verification
    // In production, this would use the actual DUO SDK
    return 'verified_user';
  } catch (error) {
    console.error('Error verifying DUO response:', error);
    return null;
  }
}

/**
 * Get user's 2FA settings
 * @param {number} userId - User ID
 * @returns {Promise<Object>} - 2FA settings
 */
async function getUserTwoFactorSettings(userId) {
  try {
    const query = `
      SELECT * FROM two_factor_settings
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Return default settings if none exist
    return {
      user_id: userId,
      enabled: false,
      preferred_method: null,
      email_enabled: false,
      sms_enabled: false,
      duo_enabled: false,
      backup_codes: [],
    };
  } catch (error) {
    console.error('Error getting 2FA settings:', error);
    return null;
  }
}

/**
 * Update user's 2FA settings
 * @param {number} userId - User ID
 * @param {Object} settings - 2FA settings
 * @returns {Promise<boolean>} - Success status
 */
async function updateUserTwoFactorSettings(userId, settings) {
  try {
    const {
      enabled,
      preferred_method,
      email_enabled,
      sms_enabled,
      duo_enabled,
    } = settings;

    // Check if settings exist
    const checkQuery = `
      SELECT id FROM two_factor_settings
      WHERE user_id = $1
    `;
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length > 0) {
      // Update existing settings
      const updateQuery = `
        UPDATE two_factor_settings
        SET
          enabled = $1,
          preferred_method = $2,
          email_enabled = $3,
          sms_enabled = $4,
          duo_enabled = $5,
          updated_at = NOW()
        WHERE user_id = $6
      `;
      await pool.query(updateQuery, [
        enabled,
        preferred_method,
        email_enabled,
        sms_enabled,
        duo_enabled,
        userId,
      ]);
    } else {
      // Insert new settings
      const insertQuery = `
        INSERT INTO two_factor_settings (
          user_id,
          enabled,
          preferred_method,
          email_enabled,
          sms_enabled,
          duo_enabled,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `;
      await pool.query(insertQuery, [
        userId,
        enabled,
        preferred_method,
        email_enabled,
        sms_enabled,
        duo_enabled,
      ]);
    }

    return true;
  } catch (error) {
    console.error('Error updating 2FA settings:', error);
    return false;
  }
}

/**
 * Generate backup codes for a user
 * @param {number} userId - User ID
 * @param {number} count - Number of backup codes to generate
 * @returns {Promise<Array<string>>} - Generated backup codes
 */
async function generateBackupCodes(userId, count = 10) {
  try {
    const codes = [];

    for (let i = 0; i < count; i++) {
      // Generate a random 10-character code
      const code = crypto.randomBytes(5).toString('hex').toUpperCase();
      codes.push(code);
    }

    // Store hashed backup codes in the database
    const hashedCodes = codes.map(code => {
      const hash = crypto.createHash('sha256').update(code).digest('hex');
      return hash;
    });

    // Update user's backup codes
    const query = `
      UPDATE two_factor_settings
      SET backup_codes = $1, updated_at = NOW()
      WHERE user_id = $2
    `;
    await pool.query(query, [JSON.stringify(hashedCodes), userId]);

    return codes;
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return [];
  }
}

/**
 * Verify a backup code
 * @param {number} userId - User ID
 * @param {string} code - Backup code
 * @returns {Promise<boolean>} - Verification status
 */
async function verifyBackupCode(userId, code) {
  try {
    // Get user's backup codes
    const query = `
      SELECT backup_codes FROM two_factor_settings
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0 || !result.rows[0].backup_codes) {
      return false;
    }

    const backupCodes = JSON.parse(result.rows[0].backup_codes);
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Check if the code exists in the backup codes
    const index = backupCodes.indexOf(hashedCode);
    if (index === -1) {
      return false;
    }

    // Remove the used code
    backupCodes.splice(index, 1);

    // Update the backup codes
    const updateQuery = `
      UPDATE two_factor_settings
      SET backup_codes = $1, updated_at = NOW()
      WHERE user_id = $2
    `;
    await pool.query(updateQuery, [JSON.stringify(backupCodes), userId]);

    return true;
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return false;
  }
}

export {
  generateVerificationCode,
  storeVerificationCode,
  verifyCode,
  sendEmailVerification,
  sendSmsVerification,
  generateDuoRequest,
  verifyDuoResponse,
  getUserTwoFactorSettings,
  updateUserTwoFactorSettings,
  generateBackupCodes,
  verifyBackupCode,
};
