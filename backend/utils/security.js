const xss = require('xss');
const validator = require('validator');

/**
 * Sanitize input to prevent XSS attacks
 * @param {any} input - Input to sanitize
 * @returns {any} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Remove HTML tags and sanitize
    return xss(input, {
      whiteList: {}, // No HTML tags allowed
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
const isValidURL = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone);
};

/**
 * Escape special characters for MongoDB queries
 * @param {string} input - Input to escape
 * @returns {string} - Escaped input
 */
const escapeRegex = (input) => {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Generate secure random token
 * @param {number} length - Token length
 * @returns {string} - Random token
 */
const generateSecureToken = (length = 32) => {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash sensitive data
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
const hashData = (data) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Rate limiting helper
 * @param {string} key - Rate limit key
 * @param {number} limit - Request limit
 * @param {number} window - Time window in milliseconds
 * @returns {object} - Rate limit configuration
 */
const createRateLimit = (key, limit, window) => {
  return {
    windowMs: window,
    max: limit,
    message: {
      success: false,
      message: `Too many ${key} requests, please try again later`,
      retryAfter: Math.ceil(window / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false
  };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [
    password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  ].filter(Boolean).length;
  
  return {
    isValid: score >= 3 && password.length >= minLength,
    score,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};

module.exports = {
  sanitizeInput,
  isValidEmail,
  isValidURL,
  isValidPhone,
  escapeRegex,
  generateSecureToken,
  hashData,
  createRateLimit,
  validatePasswordStrength
};
