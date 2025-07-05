// AI Message Generator
// This module handles the generation of personalized messages using AI

/**
 * Generate a personalized message using AI
 * @param {string} template - The message template
 * @param {Object} recipientData - Data about the recipient for personalization
 * @param {Object} campaignData - Data about the campaign
 * @param {string} channel - The channel to send through
 * @returns {Promise<string>} - The personalized message
 */
export async function generatePersonalizedMessage(template, recipientData, campaignData, channel) {
  try {
    // Check if we have a template
    if (!template) {
      throw new Error('No template provided for message generation');
    }
    
    // Replace template variables with recipient data
    let personalizedMessage = replaceTemplateVariables(template, recipientData, campaignData);
    
    // Apply AI enhancement if enabled
    if (campaignData.useAiEnhancement) {
      personalizedMessage = await enhanceMessageWithAI(personalizedMessage, recipientData, campaignData, channel);
    }
    
    // Format message for the specific channel
    personalizedMessage = formatMessageForChannel(personalizedMessage, channel);
    
    return personalizedMessage;
  } catch (error) {
    console.error('Error generating personalized message:', error);
    // Return the original template with basic variable replacement as fallback
    return replaceTemplateVariables(template, recipientData, campaignData);
  }
}

/**
 * Replace template variables with actual data
 * @param {string} template - The message template
 * @param {Object} recipientData - Data about the recipient
 * @param {Object} campaignData - Data about the campaign
 * @returns {string} - The message with variables replaced
 */
function replaceTemplateVariables(template, recipientData, campaignData) {
  let message = template;
  
  // Replace recipient variables
  if (recipientData) {
    message = message.replace(/{{recipient\.name}}/g, recipientData.name || '');
    message = message.replace(/{{recipient\.firstName}}/g, getFirstName(recipientData.name) || '');
    message = message.replace(/{{recipient\.email}}/g, recipientData.email || '');
    message = message.replace(/{{recipient\.phone}}/g, recipientData.phone || '');
    message = message.replace(/{{recipient\.company}}/g, recipientData.metadata?.company || '');
    message = message.replace(/{{recipient\.position}}/g, recipientData.metadata?.position || '');
    
    // Replace any other custom metadata fields
    if (recipientData.metadata) {
      for (const [key, value] of Object.entries(recipientData.metadata)) {
        message = message.replace(new RegExp(`{{recipient\\.metadata\\.${key}}}`, 'g'), value || '');
      }
    }
  }
  
  // Replace campaign variables
  if (campaignData) {
    message = message.replace(/{{campaign\.name}}/g, campaignData.name || '');
    message = message.replace(/{{campaign\.company}}/g, campaignData.company || '');
    message = message.replace(/{{campaign\.website}}/g, campaignData.website || '');
    message = message.replace(/{{campaign\.phone}}/g, campaignData.phone || '');
    message = message.replace(/{{campaign\.email}}/g, campaignData.email || '');
  }
  
  // Replace date variables
  const now = new Date();
  message = message.replace(/{{date}}/g, now.toLocaleDateString());
  message = message.replace(/{{time}}/g, now.toLocaleTimeString());
  
  return message;
}

/**
 * Get the first name from a full name
 * @param {string} fullName - The full name
 * @returns {string} - The first name
 */
function getFirstName(fullName) {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

/**
 * Enhance a message using AI
 * @param {string} message - The message to enhance
 * @param {Object} recipientData - Data about the recipient
 * @param {Object} campaignData - Data about the campaign
 * @param {string} channel - The channel to send through
 * @returns {Promise<string>} - The enhanced message
 */
async function enhanceMessageWithAI(message, recipientData, campaignData, channel) {
  try {
    // Prepare context for AI
    const context = {
      recipientName: recipientData.name,
      recipientCompany: recipientData.metadata?.company,
      recipientPosition: recipientData.metadata?.position,
      recipientIndustry: recipientData.metadata?.industry,
      campaignPurpose: campaignData.purpose,
      campaignCompany: campaignData.company,
      channel: channel,
      originalMessage: message
    };
    
    // Call AI service
    const aiResponse = await callAIService(message, context, channel);
    
    // If AI enhancement failed, return original message
    if (!aiResponse || !aiResponse.enhancedMessage) {
      console.warn('AI enhancement failed, using original message');
      return message;
    }
    
    return aiResponse.enhancedMessage;
  } catch (error) {
    console.error('Error enhancing message with AI:', error);
    return message; // Return original message as fallback
  }
}

/**
 * Call the AI service to enhance a message
 * @param {string} message - The message to enhance
 * @param {Object} context - Context for the AI
 * @param {string} channel - The channel to send through
 * @returns {Promise<Object>} - The AI response
 */
async function callAIService(message, context, channel) {
  try {
    // In a production environment, this would call an external AI service
    // For this implementation, we'll simulate AI enhancement
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get tone and style based on channel
    const { tone, style } = getChannelToneAndStyle(channel);
    
    // Simulate AI enhancement
    let enhancedMessage = message;
    
    // Add personalization based on context
    if (context.recipientName) {
      // Make sure we're not duplicating the name if it's already in the message
      if (!message.includes(context.recipientName)) {
        enhancedMessage = `Hi ${context.recipientName}, \n\n${enhancedMessage}`;
      }
    }
    
    // Adjust tone based on channel
    if (tone === 'professional') {
      // Make more formal for professional channels like LinkedIn
      enhancedMessage = enhancedMessage
        .replace(/Hey/g, 'Hello')
        .replace(/Hi there/g, 'Greetings')
        .replace(/Thanks/g, 'Thank you')
        .replace(/Cheers/g, 'Best regards');
    } else if (tone === 'casual') {
      // Make more casual for channels like WhatsApp
      enhancedMessage = enhancedMessage
        .replace(/Dear/g, 'Hi')
        .replace(/Greetings/g, 'Hey there')
        .replace(/Best regards/g, 'Cheers')
        .replace(/Thank you/g, 'Thanks');
    }
    
    // Add industry-specific content if available
    if (context.recipientIndustry) {
      const industryPhrases = {
        technology: "As someone working in technology, you'll appreciate how our solution leverages cutting-edge innovations.",
        healthcare: "In the healthcare sector, compliance and security are paramount, which is why our solution was designed with these priorities in mind.",
        finance: "For finance professionals like yourself, ROI and data security are critical factors that our solution addresses.",
        education: "Educators like you understand the importance of scalable and accessible solutions, which is exactly what we provide.",
        retail: "In the competitive retail space, customer engagement is key, and our solution helps you stand out."
      };
      
      const industryPhrase = industryPhrases[context.recipientIndustry.toLowerCase()] || 
        `In the ${context.recipientIndustry} industry, staying ahead of trends is crucial.`;
      
      // Add the industry phrase if it makes sense in the context
      if (!enhancedMessage.includes(context.recipientIndustry)) {
        enhancedMessage += `\n\n${industryPhrase}`;
      }
    }
    
    // Add appropriate sign-off if missing
    if (!enhancedMessage.match(/Regards|Sincerely|Cheers|Thanks|Thank you/i)) {
      if (tone === 'professional') {
        enhancedMessage += `\n\nBest regards,\n${context.campaignCompany} Team`;
      } else {
        enhancedMessage += `\n\nCheers,\n${context.campaignCompany} Team`;
      }
    }
    
    return {
      enhancedMessage,
      confidence: 0.92,
      tone,
      style
    };
  } catch (error) {
    console.error('Error calling AI service:', error);
    return null;
  }
}

/**
 * Get the appropriate tone and style for a channel
 * @param {string} channel - The channel
 * @returns {Object} - The tone and style
 */
function getChannelToneAndStyle(channel) {
  switch (channel.toLowerCase()) {
    case 'linkedin':
      return { tone: 'professional', style: 'concise' };
    case 'email':
      return { tone: 'professional', style: 'detailed' };
    case 'whatsapp':
      return { tone: 'casual', style: 'concise' };
    case 'facebook':
      return { tone: 'casual', style: 'friendly' };
    case 'instagram':
      return { tone: 'casual', style: 'visual' };
    case 'telegram':
      return { tone: 'casual', style: 'direct' };
    default:
      return { tone: 'neutral', style: 'balanced' };
  }
}

/**
 * Format a message for a specific channel
 * @param {string} message - The message to format
 * @param {string} channel - The channel
 * @returns {string} - The formatted message
 */
function formatMessageForChannel(message, channel) {
  switch (channel.toLowerCase()) {
    case 'email':
      // Email can handle HTML formatting
      return formatForEmail(message);
    case 'whatsapp':
      // WhatsApp supports basic formatting
      return formatForWhatsApp(message);
    case 'linkedin':
      // LinkedIn has character limits and formatting restrictions
      return formatForLinkedIn(message);
    case 'facebook':
      // Facebook Messenger formatting
      return formatForFacebook(message);
    case 'instagram':
      // Instagram DM formatting
      return formatForInstagram(message);
    case 'telegram':
      // Telegram supports markdown
      return formatForTelegram(message);
    default:
      // Default formatting (plain text)
      return message;
  }
}

/**
 * Format a message for email
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForEmail(message) {
  // Convert line breaks to HTML breaks
  let formatted = message.replace(/\n/g, '<br>');
  
  // Add basic HTML structure
  formatted = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${formatted}</div>`;
  
  return formatted;
}

/**
 * Format a message for WhatsApp
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForWhatsApp(message) {
  // WhatsApp supports basic formatting like *bold*, _italic_, ~strikethrough~, ```code```
  let formatted = message;
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace multiple line breaks with max two
  
  return formatted;
}

/**
 * Format a message for LinkedIn
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForLinkedIn(message) {
  // LinkedIn has a character limit for messages
  const MAX_LENGTH = 1900;
  
  let formatted = message;
  
  // Truncate if too long
  if (formatted.length > MAX_LENGTH) {
    formatted = formatted.substring(0, MAX_LENGTH - 3) + '...';
  }
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace multiple line breaks with max two
  
  return formatted;
}

/**
 * Format a message for Facebook
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForFacebook(message) {
  // Facebook Messenger has similar formatting to WhatsApp
  let formatted = message;
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace multiple line breaks with max two
  
  return formatted;
}

/**
 * Format a message for Instagram
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForInstagram(message) {
  // Instagram DMs have character limits
  const MAX_LENGTH = 1000;
  
  let formatted = message;
  
  // Truncate if too long
  if (formatted.length > MAX_LENGTH) {
    formatted = formatted.substring(0, MAX_LENGTH - 3) + '...';
  }
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace multiple line breaks with max two
  
  return formatted;
}

/**
 * Format a message for Telegram
 * @param {string} message - The message to format
 * @returns {string} - The formatted message
 */
function formatForTelegram(message) {
  // Telegram supports Markdown formatting
  let formatted = message;
  
  // Ensure proper spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n'); // Replace multiple line breaks with max two
  
  return formatted;
}
