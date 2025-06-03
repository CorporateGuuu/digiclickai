/**
 * DigiClick AI OpenAI Integration Manager
 * Intelligent response system with context-aware AI chatbot functionality
 * Integrates with existing backend and maintains GDPR compliance
 */

import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getAccessibilityManager } from './accessibility-manager';

class OpenAIIntegrationManager {
  constructor() {
    this.backendManager = null;
    this.cacheManager = null;
    this.accessibilityManager = null;
    
    this.apiConfig = {
      model: 'gpt-4',
      maxTokens: 500,
      temperature: 0.7,
      presencePenalty: 0.1,
      frequencyPenalty: 0.1
    };
    
    this.rateLimits = {
      requestsPerHour: 100,
      requestsPerMinute: 10,
      maxConversationLength: 50
    };
    
    this.contextPrompts = {
      system: `You are DigiClick AI's intelligent assistant. DigiClick AI is a cutting-edge technology company specializing in AI automation services, custom software development, and digital transformation solutions. 

Key Services:
- AI Automation & Integration
- Custom Web Development (Next.js, React, Node.js)
- Digital Transformation Consulting
- E-commerce Solutions
- Mobile App Development
- Cloud Infrastructure & DevOps

Company Values:
- Innovation and technical excellence
- Accessibility-first design (WCAG 2.1 AA compliance)
- Performance optimization (60fps standards)
- User-centric solutions
- Professional and futuristic approach

Respond professionally, helpfully, and concisely. Direct users to relevant pages when appropriate. Maintain DigiClick AI's technical expertise positioning while being approachable.`,
      
      pages: {
        '/': 'User is on the homepage. Focus on general company overview and services introduction.',
        '/about': 'User is on the about page. Emphasize company mission, team expertise, and values.',
        '/services': 'User is on the services page. Provide detailed service information and technical capabilities.',
        '/pricing': 'User is on the pricing page. Help with pricing questions and package comparisons.',
        '/contact': 'User is on the contact page. Assist with contact information and inquiry submission.',
        '/blog': 'User is on the blog page. Discuss industry insights and technical content.',
        '/faq': 'User is on the FAQ page. Provide comprehensive answers to common questions.'
      }
    };
    
    this.fallbackResponses = {
      apiError: "I'm experiencing technical difficulties right now. Please try again in a moment, or feel free to contact our team directly for immediate assistance.",
      rateLimited: "I'm currently handling many conversations. Please wait a moment before sending your next message.",
      invalidInput: "I didn't quite understand that. Could you please rephrase your question about DigiClick AI's services?",
      generalError: "Something went wrong on my end. Let me try to help you in a different way. What specific information about DigiClick AI can I provide?"
    };
    
    this.contentFilters = {
      inappropriate: ['spam', 'offensive', 'irrelevant'],
      businessRelevant: ['services', 'pricing', 'development', 'ai', 'automation', 'web', 'mobile', 'consulting']
    };
    
    this.init();
  }

  async init() {
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.accessibilityManager = getAccessibilityManager();
    
    this.setupEventListeners();
    this.initializeRateLimiting();
  }

  setupEventListeners() {
    // Listen for chat messages
    window.addEventListener('chatbot-message-sent', (e) => {
      this.handleUserMessage(e.detail);
    });

    // Listen for page navigation for context updates
    window.addEventListener('page-transition-complete', (e) => {
      this.updatePageContext(e.detail.url);
    });

    // Listen for accessibility settings changes
    window.addEventListener('accessibility-settings-changed', (e) => {
      this.updateAccessibilitySettings(e.detail);
    });
  }

  initializeRateLimiting() {
    this.userRateLimits = new Map();
    
    // Clean up rate limit data every hour
    setInterval(() => {
      this.cleanupRateLimitData();
    }, 3600000);
  }

  async handleUserMessage(messageData) {
    const { message, userId, sessionId, pageContext } = messageData;
    
    try {
      // Check rate limits
      if (!this.checkRateLimit(userId)) {
        return this.createResponse({
          message: this.fallbackResponses.rateLimited,
          type: 'rate_limited',
          userId,
          sessionId
        });
      }
      
      // Validate and filter input
      const filteredMessage = this.filterUserInput(message);
      if (!filteredMessage) {
        return this.createResponse({
          message: this.fallbackResponses.invalidInput,
          type: 'invalid_input',
          userId,
          sessionId
        });
      }
      
      // Check cache for similar responses
      const cachedResponse = await this.getCachedResponse(filteredMessage, pageContext);
      if (cachedResponse) {
        return this.createResponse({
          message: cachedResponse.message,
          type: 'cached',
          userId,
          sessionId,
          cached: true
        });
      }
      
      // Generate AI response
      const aiResponse = await this.generateAIResponse(filteredMessage, pageContext, sessionId);
      
      // Cache the response
      await this.cacheResponse(filteredMessage, pageContext, aiResponse);
      
      return this.createResponse({
        message: aiResponse,
        type: 'ai_generated',
        userId,
        sessionId
      });
      
    } catch (error) {
      console.error('Error handling user message:', error);
      return this.createResponse({
        message: this.fallbackResponses.generalError,
        type: 'error',
        userId,
        sessionId,
        error: error.message
      });
    }
  }

  async generateAIResponse(message, pageContext, sessionId) {
    try {
      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(sessionId);
      
      // Build context-aware prompt
      const prompt = this.buildContextPrompt(message, pageContext, conversationHistory);
      
      // Make API request to backend
      const response = await this.backendManager.makeRequest('/api/chat/openai', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          config: this.apiConfig,
          sessionId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter and validate response
      const filteredResponse = this.filterAIResponse(data.message);
      
      return filteredResponse;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Return contextual fallback based on page
      return this.getContextualFallback(pageContext);
    }
  }

  buildContextPrompt(message, pageContext, conversationHistory) {
    let prompt = this.contextPrompts.system;
    
    // Add page context
    if (pageContext && this.contextPrompts.pages[pageContext]) {
      prompt += `\n\nPage Context: ${this.contextPrompts.pages[pageContext]}`;
    }
    
    // Add conversation history (last 5 messages)
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += '\n\nRecent conversation:';
      const recentHistory = conversationHistory.slice(-5);
      recentHistory.forEach(entry => {
        prompt += `\nUser: ${entry.userMessage}`;
        prompt += `\nAssistant: ${entry.aiResponse}`;
      });
    }
    
    prompt += `\n\nUser's current message: ${message}`;
    prompt += '\n\nProvide a helpful, professional response:';
    
    return prompt;
  }

  filterUserInput(message) {
    if (!message || typeof message !== 'string') {
      return null;
    }
    
    // Basic sanitization
    const sanitized = message.trim().substring(0, 500);
    
    // Check for inappropriate content
    const inappropriate = this.contentFilters.inappropriate.some(term => 
      sanitized.toLowerCase().includes(term)
    );
    
    if (inappropriate) {
      return null;
    }
    
    return sanitized;
  }

  filterAIResponse(response) {
    if (!response || typeof response !== 'string') {
      return this.fallbackResponses.generalError;
    }
    
    // Ensure response is professional and brand-appropriate
    let filtered = response.trim();
    
    // Add DigiClick AI branding if not present
    if (!filtered.toLowerCase().includes('digiclick')) {
      // Contextually add branding
      if (filtered.includes('we') || filtered.includes('our')) {
        filtered = filtered.replace(/\bwe\b/gi, 'DigiClick AI');
        filtered = filtered.replace(/\bour\b/gi, 'DigiClick AI\'s');
      }
    }
    
    return filtered;
  }

  checkRateLimit(userId) {
    const now = Date.now();
    const userLimits = this.userRateLimits.get(userId) || {
      hourlyRequests: [],
      minuteRequests: []
    };
    
    // Clean old requests
    userLimits.hourlyRequests = userLimits.hourlyRequests.filter(
      timestamp => now - timestamp < 3600000 // 1 hour
    );
    userLimits.minuteRequests = userLimits.minuteRequests.filter(
      timestamp => now - timestamp < 60000 // 1 minute
    );
    
    // Check limits
    if (userLimits.hourlyRequests.length >= this.rateLimits.requestsPerHour) {
      return false;
    }
    
    if (userLimits.minuteRequests.length >= this.rateLimits.requestsPerMinute) {
      return false;
    }
    
    // Add current request
    userLimits.hourlyRequests.push(now);
    userLimits.minuteRequests.push(now);
    
    this.userRateLimits.set(userId, userLimits);
    
    return true;
  }

  async getCachedResponse(message, pageContext) {
    try {
      const cacheKey = `chat:response:${this.hashMessage(message)}:${pageContext || 'general'}`;
      return await this.cacheManager.get(cacheKey);
    } catch (error) {
      console.error('Error getting cached response:', error);
      return null;
    }
  }

  async cacheResponse(message, pageContext, response) {
    try {
      const cacheKey = `chat:response:${this.hashMessage(message)}:${pageContext || 'general'}`;
      await this.cacheManager.set(cacheKey, { message: response }, 3600); // 1 hour TTL
    } catch (error) {
      console.error('Error caching response:', error);
    }
  }

  async getConversationHistory(sessionId) {
    try {
      const cacheKey = `chat:history:${sessionId}`;
      return await this.cacheManager.get(cacheKey) || [];
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  async saveConversationHistory(sessionId, userMessage, aiResponse) {
    try {
      const history = await this.getConversationHistory(sessionId);
      
      history.push({
        userMessage,
        aiResponse,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 messages
      if (history.length > this.rateLimits.maxConversationLength) {
        history.splice(0, history.length - this.rateLimits.maxConversationLength);
      }
      
      const cacheKey = `chat:history:${sessionId}`;
      await this.cacheManager.set(cacheKey, history, 86400); // 24 hours TTL
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  getContextualFallback(pageContext) {
    const fallbacks = {
      '/': "Welcome to DigiClick AI! We specialize in AI automation and custom software development. How can I help you learn more about our services?",
      '/about': "DigiClick AI is a cutting-edge technology company focused on AI automation and digital transformation. Would you like to know more about our team or mission?",
      '/services': "We offer AI automation, web development, mobile apps, and consulting services. Which service interests you most?",
      '/pricing': "Our pricing is tailored to your specific needs. Would you like to discuss a particular service or get a custom quote?",
      '/contact': "I'd be happy to help you get in touch with our team. What type of project or service are you interested in discussing?",
      '/blog': "Our blog covers the latest in AI, web development, and digital transformation. What topics interest you most?",
      '/faq': "I can help answer common questions about DigiClick AI's services. What would you like to know?"
    };
    
    return fallbacks[pageContext] || this.fallbackResponses.generalError;
  }

  createResponse(responseData) {
    const response = {
      id: this.generateResponseId(),
      timestamp: new Date().toISOString(),
      ...responseData
    };
    
    // Save to conversation history if it's a valid response
    if (responseData.type === 'ai_generated' || responseData.type === 'cached') {
      this.saveConversationHistory(
        responseData.sessionId,
        responseData.originalMessage || '',
        responseData.message
      );
    }
    
    // Dispatch response event
    window.dispatchEvent(new CustomEvent('chatbot-response-generated', {
      detail: response
    }));
    
    // Announce to screen readers if accessibility is enabled
    if (this.accessibilityManager && this.accessibilityManager.isScreenReaderEnabled()) {
      this.accessibilityManager.announce(`Chatbot response: ${responseData.message}`);
    }
    
    return response;
  }

  updatePageContext(url) {
    this.currentPageContext = url;
    
    // Dispatch context update event
    window.dispatchEvent(new CustomEvent('chatbot-context-updated', {
      detail: { pageContext: url }
    }));
  }

  updateAccessibilitySettings(settings) {
    this.accessibilitySettings = settings;
    
    // Adjust chatbot behavior based on accessibility needs
    if (settings.reducedMotion) {
      this.disableTypingAnimations = true;
    }
    
    if (settings.screenReader) {
      this.enableScreenReaderSupport = true;
    }
  }

  cleanupRateLimitData() {
    const now = Date.now();
    
    for (const [userId, limits] of this.userRateLimits.entries()) {
      limits.hourlyRequests = limits.hourlyRequests.filter(
        timestamp => now - timestamp < 3600000
      );
      
      if (limits.hourlyRequests.length === 0) {
        this.userRateLimits.delete(userId);
      }
    }
  }

  hashMessage(message) {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  generateResponseId() {
    return `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  async sendMessage(message, options = {}) {
    const messageData = {
      message,
      userId: options.userId || 'anonymous',
      sessionId: options.sessionId || this.generateSessionId(),
      pageContext: options.pageContext || this.currentPageContext
    };
    
    return await this.handleUserMessage(messageData);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async clearConversationHistory(sessionId) {
    try {
      const cacheKey = `chat:history:${sessionId}`;
      await this.cacheManager.del(cacheKey);
      return true;
    } catch (error) {
      console.error('Error clearing conversation history:', error);
      return false;
    }
  }

  getApiStatus() {
    return {
      available: this.backendManager ? this.backendManager.isOnline() : false,
      rateLimits: this.rateLimits,
      activeUsers: this.userRateLimits.size
    };
  }
}

// Create global instance
let openaiIntegrationManager = null;

export function getOpenAIIntegrationManager() {
  if (!openaiIntegrationManager) {
    openaiIntegrationManager = new OpenAIIntegrationManager();
  }
  return openaiIntegrationManager;
}

export function initializeOpenAIIntegration() {
  return getOpenAIIntegrationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeOpenAIIntegration();
  });
}

export default OpenAIIntegrationManager;
