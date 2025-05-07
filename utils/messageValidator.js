// Message Validator
// This module validates messages for different channels

/**
 * Validate a message for a specific channel
 * @param {string} message - The message to validate
 * @param {string} channel - The channel to validate for
 * @returns {Object} - Validation result
 */
export function validateMessage(message, channel) {
  // Common validation
  if (!message || message.trim() === '') {
    return {
      isValid: false,
      validationErrors: ['Message cannot be empty']
    };
  }
  
  // Channel-specific validation
  switch (channel.toLowerCase()) {
    case 'email':
      return validateEmailMessage(message);
    case 'whatsapp':
      return validateWhatsAppMessage(message);
    case 'linkedin':
      return validateLinkedInMessage(message);
    case 'facebook':
      return validateFacebookMessage(message);
    case 'instagram':
      return validateInstagramMessage(message);
    case 'telegram':
      return validateTelegramMessage(message);
    default:
      return {
        isValid: true,
        validationErrors: []
      };
  }
}

/**
 * Validate an email message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateEmailMessage(message) {
  const errors = [];
  
  // Check for potentially spammy content
  if (message.includes('FREE') || message.includes('GUARANTEED') || 
      message.includes('ACT NOW') || message.includes('LIMITED TIME')) {
    errors.push('Message contains potential spam trigger words (all caps)');
  }
  
  // Check for excessive exclamation marks
  if ((message.match(/!/g) || []).length > 3) {
    errors.push('Message contains too many exclamation marks');
  }
  
  // Check for excessive links
  const linkMatches = message.match(/(https?:\/\/[^\s]+)/g) || [];
  if (linkMatches.length > 3) {
    errors.push('Message contains too many links');
  }
  
  // Check for HTML validity if it contains HTML
  if (message.includes('<html') || message.includes('<body')) {
    // Simple check for unclosed tags
    const openTags = (message.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (message.match(/<\/[^>]*>/g) || []).length;
    
    if (openTags !== closeTags) {
      errors.push('HTML in message has unclosed tags');
    }
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validate a WhatsApp message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateWhatsAppMessage(message) {
  const errors = [];
  
  // Check message length (WhatsApp has a limit of around 65536 characters)
  if (message.length > 65000) {
    errors.push('Message exceeds WhatsApp character limit (65000)');
  }
  
  // Check for excessive emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (message.match(emojiRegex) || []).length;
  
  if (emojiCount > 15) {
    errors.push('Message contains too many emojis');
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validate a LinkedIn message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateLinkedInMessage(message) {
  const errors = [];
  
  // Check message length (LinkedIn has a limit of 1900 characters for messages)
  if (message.length > 1900) {
    errors.push(`Message exceeds LinkedIn character limit (1900). Current length: ${message.length}`);
  }
  
  // Check for excessive hashtags
  const hashtagCount = (message.match(/#[a-zA-Z0-9_]+/g) || []).length;
  if (hashtagCount > 5) {
    errors.push('Message contains too many hashtags for LinkedIn');
  }
  
  // Check for excessive links
  const linkMatches = message.match(/(https?:\/\/[^\s]+)/g) || [];
  if (linkMatches.length > 2) {
    errors.push('Message contains too many links for LinkedIn');
  }
  
  // Check for overly casual language in a professional context
  const casualPhrases = ['hey there', 'what\'s up', 'sup', 'yo', 'wanna'];
  for (const phrase of casualPhrases) {
    if (message.toLowerCase().includes(phrase)) {
      errors.push(`Message contains casual language ("${phrase}") which may be inappropriate for LinkedIn`);
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validate a Facebook message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateFacebookMessage(message) {
  const errors = [];
  
  // Check message length (Facebook Messenger has a limit of 20000 characters)
  if (message.length > 20000) {
    errors.push('Message exceeds Facebook Messenger character limit (20000)');
  }
  
  // Check for excessive emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojiCount = (message.match(emojiRegex) || []).length;
  
  if (emojiCount > 20) {
    errors.push('Message contains too many emojis');
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validate an Instagram message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateInstagramMessage(message) {
  const errors = [];
  
  // Check message length (Instagram DMs have a limit of around 1000 characters)
  if (message.length > 1000) {
    errors.push(`Message exceeds Instagram DM character limit (1000). Current length: ${message.length}`);
  }
  
  // Check for excessive hashtags
  const hashtagCount = (message.match(/#[a-zA-Z0-9_]+/g) || []).length;
  if (hashtagCount > 10) {
    errors.push('Message contains too many hashtags');
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}

/**
 * Validate a Telegram message
 * @param {string} message - The message to validate
 * @returns {Object} - Validation result
 */
function validateTelegramMessage(message) {
  const errors = [];
  
  // Check message length (Telegram has a limit of 4096 characters)
  if (message.length > 4096) {
    errors.push(`Message exceeds Telegram character limit (4096). Current length: ${message.length}`);
  }
  
  // Check for valid Markdown if using Markdown
  if (message.includes('*') || message.includes('_') || message.includes('`') || message.includes('```')) {
    // Simple check for unclosed Markdown
    const asteriskCount = (message.match(/\*/g) || []).length;
    if (asteriskCount % 2 !== 0) {
      errors.push('Message has unclosed bold/italic Markdown (*)');
    }
    
    const underscoreCount = (message.match(/_/g) || []).length;
    if (underscoreCount % 2 !== 0) {
      errors.push('Message has unclosed italic Markdown (_)');
    }
    
    const codeCount = (message.match(/`/g) || []).length;
    if (codeCount % 2 !== 0 && codeCount % 6 !== 0) { // Account for ```code blocks```
      errors.push('Message has unclosed code Markdown (`)');
    }
  }
  
  return {
    isValid: errors.length === 0,
    validationErrors: errors
  };
}
