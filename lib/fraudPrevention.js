/**
 * Fraud Prevention Service
 * Provides tools for detecting and preventing fraudulent activities
 */

import crypto from 'crypto';

/**
 * IP-based rate limiting cache
 * In production, this would use Redis or another distributed cache
 */
const rateLimitCache = new Map();

/**
 * Device fingerprint cache
 * In production, this would use a database
 */
const deviceFingerprintCache = new Map();

/**
 * Suspicious activity patterns
 */
const suspiciousPatterns = {
  // Multiple failed login attempts
  failedLogins: new Map(),
  // Multiple account creations from same IP
  accountCreations: new Map(),
  // Multiple checkout attempts with different cards
  checkoutAttempts: new Map(),
};

/**
 * Check if an IP is rate limited
 * @param {string} ip - IP address
 * @param {string} action - Action being performed (e.g., 'login', 'checkout')
 * @param {number} limit - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether the IP is rate limited
 */
function isRateLimited(ip, action, limit = 5, windowMs = 60000) {
  const key = `${ip}:${action}`;
  const now = Date.now();
  
  // Get or initialize the rate limit entry
  let entry = rateLimitCache.get(key);
  if (!entry) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitCache.set(key, entry);
  }
  
  // Reset count if the window has expired
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  
  // Increment count and check if rate limited
  entry.count += 1;
  return entry.count > limit;
}

/**
 * Generate a device fingerprint
 * @param {Object} data - Device data
 * @returns {string} - Device fingerprint
 */
function generateDeviceFingerprint(data) {
  const {
    userAgent,
    ip,
    screenResolution,
    timezone,
    language,
    platform,
  } = data;
  
  // Create a string from the device data
  const deviceString = `${userAgent}|${ip}|${screenResolution}|${timezone}|${language}|${platform}`;
  
  // Generate a hash of the device string
  return crypto.createHash('sha256').update(deviceString).digest('hex');
}

/**
 * Check if a device fingerprint is suspicious
 * @param {string} fingerprint - Device fingerprint
 * @param {string} userId - User ID
 * @returns {boolean} - Whether the device is suspicious
 */
function isSuspiciousDevice(fingerprint, userId) {
  // Get the device entry
  const entry = deviceFingerprintCache.get(fingerprint);
  
  // If this is a new device, add it to the cache
  if (!entry) {
    deviceFingerprintCache.set(fingerprint, {
      userIds: [userId],
      firstSeen: Date.now(),
    });
    return false;
  }
  
  // Check if this device has been used by multiple users
  if (!entry.userIds.includes(userId)) {
    entry.userIds.push(userId);
    
    // If the device has been used by more than 3 different users, it's suspicious
    if (entry.userIds.length > 3) {
      return true;
    }
  }
  
  return false;
}

/**
 * Record a failed login attempt
 * @param {string} ip - IP address
 * @param {string} email - Email address
 * @returns {boolean} - Whether the activity is suspicious
 */
function recordFailedLogin(ip, email) {
  const now = Date.now();
  const key = ip;
  
  // Get or initialize the entry
  let entry = suspiciousPatterns.failedLogins.get(key);
  if (!entry) {
    entry = {
      attempts: [],
      emails: new Set(),
    };
    suspiciousPatterns.failedLogins.set(key, entry);
  }
  
  // Add the attempt
  entry.attempts.push(now);
  entry.emails.add(email);
  
  // Remove attempts older than 1 hour
  entry.attempts = entry.attempts.filter(time => now - time < 3600000);
  
  // Check if the activity is suspicious
  // More than 5 failed attempts in the last hour
  if (entry.attempts.length > 5) {
    return true;
  }
  
  // Attempts on multiple different accounts
  if (entry.emails.size > 3) {
    return true;
  }
  
  return false;
}

/**
 * Record an account creation
 * @param {string} ip - IP address
 * @returns {boolean} - Whether the activity is suspicious
 */
function recordAccountCreation(ip) {
  const now = Date.now();
  const key = ip;
  
  // Get or initialize the entry
  let entry = suspiciousPatterns.accountCreations.get(key);
  if (!entry) {
    entry = {
      times: [],
    };
    suspiciousPatterns.accountCreations.set(key, entry);
  }
  
  // Add the time
  entry.times.push(now);
  
  // Remove times older than 24 hours
  entry.times = entry.times.filter(time => now - time < 86400000);
  
  // Check if the activity is suspicious
  // More than 3 accounts created in 24 hours
  return entry.times.length > 3;
}

/**
 * Record a checkout attempt
 * @param {string} ip - IP address
 * @param {string} cardFingerprint - Card fingerprint (last 4 digits + bin)
 * @returns {boolean} - Whether the activity is suspicious
 */
function recordCheckoutAttempt(ip, cardFingerprint) {
  const now = Date.now();
  const key = ip;
  
  // Get or initialize the entry
  let entry = suspiciousPatterns.checkoutAttempts.get(key);
  if (!entry) {
    entry = {
      times: [],
      cards: new Set(),
    };
    suspiciousPatterns.checkoutAttempts.set(key, entry);
  }
  
  // Add the attempt
  entry.times.push(now);
  entry.cards.add(cardFingerprint);
  
  // Remove attempts older than 1 hour
  entry.times = entry.times.filter(time => now - time < 3600000);
  
  // Check if the activity is suspicious
  // More than 3 different cards used in 1 hour
  if (entry.cards.size > 3) {
    return true;
  }
  
  // More than 5 checkout attempts in 1 hour
  if (entry.times.length > 5) {
    return true;
  }
  
  return false;
}

/**
 * Check if an order is potentially fraudulent
 * @param {Object} order - Order data
 * @param {Object} user - User data
 * @param {Object} device - Device data
 * @returns {Object} - Fraud assessment
 */
function assessOrderRisk(order, user, device) {
  let riskScore = 0;
  const riskFactors = [];
  
  // Check if the IP is rate limited
  if (isRateLimited(device.ip, 'checkout', 10, 3600000)) {
    riskScore += 20;
    riskFactors.push('High checkout frequency');
  }
  
  // Check if the device is suspicious
  const fingerprint = generateDeviceFingerprint(device);
  if (isSuspiciousDevice(fingerprint, user.id)) {
    riskScore += 30;
    riskFactors.push('Device associated with multiple users');
  }
  
  // Check for mismatched billing/shipping addresses
  if (order.billingAddress.country !== order.shippingAddress.country) {
    riskScore += 15;
    riskFactors.push('Mismatched billing and shipping countries');
  }
  
  // Check for high-value orders from new accounts
  const userAccountAge = Date.now() - new Date(user.createdAt).getTime();
  if (order.total > 500 && userAccountAge < 7 * 24 * 60 * 60 * 1000) {
    riskScore += 25;
    riskFactors.push('High-value order from new account');
  }
  
  // Check for suspicious card usage
  const cardFingerprint = `${order.payment.cardBin}:${order.payment.cardLast4}`;
  if (recordCheckoutAttempt(device.ip, cardFingerprint)) {
    riskScore += 35;
    riskFactors.push('Multiple cards used from same IP');
  }
  
  // Determine risk level
  let riskLevel = 'low';
  if (riskScore >= 50) {
    riskLevel = 'high';
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
  }
  
  return {
    riskScore,
    riskLevel,
    riskFactors,
    requiresReview: riskLevel === 'high',
  };
}

/**
 * Clean up old entries from caches
 * This should be called periodically
 */
function cleanupCaches() {
  const now = Date.now();
  
  // Clean up rate limit cache
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now > entry.resetAt) {
      rateLimitCache.delete(key);
    }
  }
  
  // Clean up device fingerprint cache (remove entries older than 90 days)
  for (const [key, entry] of deviceFingerprintCache.entries()) {
    if (now - entry.firstSeen > 90 * 24 * 60 * 60 * 1000) {
      deviceFingerprintCache.delete(key);
    }
  }
  
  // Clean up suspicious patterns
  const oneDay = 24 * 60 * 60 * 1000;
  
  for (const [key, entry] of suspiciousPatterns.failedLogins.entries()) {
    if (entry.attempts.length === 0 || now - Math.max(...entry.attempts) > oneDay) {
      suspiciousPatterns.failedLogins.delete(key);
    }
  }
  
  for (const [key, entry] of suspiciousPatterns.accountCreations.entries()) {
    if (entry.times.length === 0 || now - Math.max(...entry.times) > oneDay) {
      suspiciousPatterns.accountCreations.delete(key);
    }
  }
  
  for (const [key, entry] of suspiciousPatterns.checkoutAttempts.entries()) {
    if (entry.times.length === 0 || now - Math.max(...entry.times) > oneDay) {
      suspiciousPatterns.checkoutAttempts.delete(key);
    }
  }
}

// Set up a cleanup interval (every hour)
if (typeof window === 'undefined') { // Only run on server
  setInterval(cleanupCaches, 60 * 60 * 1000);
}

export {
  isRateLimited,
  generateDeviceFingerprint,
  isSuspiciousDevice,
  recordFailedLogin,
  recordAccountCreation,
  recordCheckoutAttempt,
  assessOrderRisk,
};
