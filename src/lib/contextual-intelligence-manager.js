/**
 * DigiClick AI Contextual Intelligence Manager
 * Page-aware responses, intelligent routing, and dynamic FAQ integration
 * Provides context-sensitive chatbot responses based on user location and intent
 */

import { getOpenAIIntegrationManager } from './openai-integration-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class ContextualIntelligenceManager {
  constructor() {
    this.openaiManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    
    this.currentPageContext = null;
    this.userIntent = null;
    this.conversationContext = new Map();
    
    this.pageContexts = {
      '/': {
        name: 'Homepage',
        keywords: ['home', 'main', 'overview', 'company', 'services'],
        intents: ['learn_about_company', 'explore_services', 'get_started'],
        suggestedPages: ['/services', '/about', '/contact'],
        quickResponses: [
          "Welcome to DigiClick AI! We specialize in AI automation and custom software development.",
          "How can I help you learn more about our cutting-edge technology solutions?",
          "Would you like to explore our services or learn about our company?"
        ]
      },
      '/about': {
        name: 'About Us',
        keywords: ['about', 'company', 'team', 'mission', 'vision', 'history'],
        intents: ['learn_about_company', 'meet_team', 'understand_mission'],
        suggestedPages: ['/services', '/contact', '/'],
        quickResponses: [
          "DigiClick AI is a cutting-edge technology company focused on AI automation and digital transformation.",
          "Our team consists of experienced developers and AI specialists dedicated to innovation.",
          "We're committed to delivering accessible, high-performance solutions that exceed expectations."
        ]
      },
      '/services': {
        name: 'Services',
        keywords: ['services', 'development', 'ai', 'automation', 'web', 'mobile', 'consulting'],
        intents: ['explore_services', 'get_quote', 'technical_details'],
        suggestedPages: ['/pricing', '/contact', '/'],
        quickResponses: [
          "We offer comprehensive AI automation, web development, and consulting services.",
          "Our services include custom software development, AI integration, and digital transformation.",
          "Would you like to know more about a specific service or get a custom quote?"
        ]
      },
      '/pricing': {
        name: 'Pricing',
        keywords: ['pricing', 'cost', 'quote', 'package', 'plan', 'budget'],
        intents: ['get_pricing', 'compare_packages', 'request_quote'],
        suggestedPages: ['/contact', '/services', '/'],
        quickResponses: [
          "Our pricing is tailored to your specific needs and project requirements.",
          "We offer flexible packages for different business sizes and requirements.",
          "Would you like to discuss your project for a custom quote?"
        ]
      },
      '/contact': {
        name: 'Contact',
        keywords: ['contact', 'reach', 'talk', 'discuss', 'meeting', 'consultation'],
        intents: ['get_in_touch', 'schedule_meeting', 'ask_question'],
        suggestedPages: ['/services', '/pricing', '/'],
        quickResponses: [
          "I'd be happy to help you get in touch with our team.",
          "You can reach us through the contact form or schedule a consultation.",
          "What type of project or service would you like to discuss?"
        ]
      },
      '/blog': {
        name: 'Blog',
        keywords: ['blog', 'articles', 'insights', 'news', 'updates', 'technology'],
        intents: ['read_content', 'learn_trends', 'technical_insights'],
        suggestedPages: ['/services', '/about', '/'],
        quickResponses: [
          "Our blog covers the latest in AI, web development, and digital transformation.",
          "You'll find technical insights, industry trends, and case studies here.",
          "What topics in technology and AI interest you most?"
        ]
      },
      '/faq': {
        name: 'FAQ',
        keywords: ['faq', 'questions', 'help', 'support', 'answers'],
        intents: ['get_answers', 'find_information', 'troubleshoot'],
        suggestedPages: ['/contact', '/services', '/'],
        quickResponses: [
          "I can help answer common questions about DigiClick AI's services.",
          "What specific information are you looking for?",
          "Feel free to ask about our services, pricing, or technical capabilities."
        ]
      }
    };
    
    this.intentPatterns = {
      get_pricing: [
        /how much/i, /cost/i, /price/i, /pricing/i, /budget/i, /quote/i, /expensive/i
      ],
      technical_details: [
        /how does/i, /technical/i, /technology/i, /implementation/i, /architecture/i
      ],
      get_started: [
        /get started/i, /begin/i, /start/i, /first step/i, /how to/i
      ],
      schedule_meeting: [
        /meeting/i, /call/i, /consultation/i, /demo/i, /schedule/i, /appointment/i
      ],
      compare_services: [
        /compare/i, /difference/i, /vs/i, /versus/i, /which/i, /better/i
      ],
      learn_about_company: [
        /about/i, /company/i, /who are/i, /background/i, /experience/i
      ]
    };
    
    this.routingRules = {
      pricing_inquiry: '/pricing',
      service_details: '/services',
      company_info: '/about',
      contact_request: '/contact',
      technical_blog: '/blog',
      general_questions: '/faq'
    };
    
    this.leadQualificationCriteria = {
      high_value: [
        /enterprise/i, /large scale/i, /million/i, /budget/i, /urgent/i, /asap/i
      ],
      medium_value: [
        /business/i, /company/i, /startup/i, /project/i, /development/i
      ],
      information_seeking: [
        /just looking/i, /curious/i, /learning/i, /research/i, /student/i
      ]
    };
    
    this.multilingualSupport = {
      enabled: true,
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      translations: {
        es: {
          welcome: "¡Bienvenido a DigiClick AI! Nos especializamos en automatización de IA y desarrollo de software personalizado.",
          services: "Ofrecemos servicios integrales de automatización de IA, desarrollo web y consultoría.",
          contact: "Me complace ayudarte a ponerte en contacto con nuestro equipo."
        }
      }
    };
    
    this.init();
  }

  async init() {
    this.openaiManager = getOpenAIIntegrationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.detectCurrentPageContext();
    this.loadDynamicFAQ();
  }

  setupEventListeners() {
    // Listen for page navigation
    window.addEventListener('page-transition-complete', (e) => {
      this.updatePageContext(e.detail.url);
    });

    // Listen for user messages to analyze intent
    window.addEventListener('chatbot-message-sent', (e) => {
      this.analyzeUserIntent(e.detail);
    });

    // Listen for conversation context updates
    window.addEventListener('conversation-updated', (e) => {
      this.updateConversationContext(e.detail);
    });
  }

  detectCurrentPageContext() {
    const currentPath = window.location.pathname;
    this.updatePageContext(currentPath);
  }

  updatePageContext(url) {
    const path = new URL(url, window.location.origin).pathname;
    this.currentPageContext = this.pageContexts[path] || this.pageContexts['/'];
    
    // Dispatch context update
    window.dispatchEvent(new CustomEvent('contextual-intelligence-updated', {
      detail: { pageContext: this.currentPageContext, url: path }
    }));
    
    console.log('Page context updated:', this.currentPageContext.name);
  }

  async analyzeUserIntent(messageData) {
    const message = messageData.message.toLowerCase();
    const detectedIntents = [];
    
    // Pattern-based intent detection
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some(pattern => pattern.test(message))) {
        detectedIntents.push(intent);
      }
    }
    
    // Context-based intent refinement
    if (this.currentPageContext) {
      const contextIntents = this.currentPageContext.intents.filter(intent =>
        this.currentPageContext.keywords.some(keyword =>
          message.includes(keyword)
        )
      );
      detectedIntents.push(...contextIntents);
    }
    
    // Lead qualification
    const leadScore = this.qualifyLead(message);
    
    this.userIntent = {
      primary: detectedIntents[0] || 'general_inquiry',
      secondary: detectedIntents.slice(1),
      confidence: this.calculateIntentConfidence(message, detectedIntents),
      leadScore,
      timestamp: new Date().toISOString()
    };
    
    // Store conversation context
    this.conversationContext.set(messageData.sessionId, {
      intent: this.userIntent,
      pageContext: this.currentPageContext,
      messageHistory: this.getRecentMessages(messageData.sessionId)
    });
    
    // Suggest page routing if appropriate
    const suggestedRoute = this.suggestPageRoute(this.userIntent.primary);
    if (suggestedRoute && suggestedRoute !== window.location.pathname) {
      this.dispatchRoutingSuggestion(suggestedRoute);
    }
    
    return this.userIntent;
  }

  calculateIntentConfidence(message, intents) {
    if (intents.length === 0) return 0;
    
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on keyword matches
    const words = message.split(' ');
    const keywordMatches = words.filter(word =>
      this.currentPageContext?.keywords.includes(word.toLowerCase())
    ).length;
    
    confidence += (keywordMatches / words.length) * 0.3;
    
    // Increase confidence for specific patterns
    if (intents.length === 1) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  }

  qualifyLead(message) {
    let score = 0;
    
    // High-value indicators
    if (this.leadQualificationCriteria.high_value.some(pattern => pattern.test(message))) {
      score += 3;
    }
    
    // Medium-value indicators
    if (this.leadQualificationCriteria.medium_value.some(pattern => pattern.test(message))) {
      score += 2;
    }
    
    // Information-seeking indicators (lower score)
    if (this.leadQualificationCriteria.information_seeking.some(pattern => pattern.test(message))) {
      score += 1;
    }
    
    // Context-based scoring
    if (this.currentPageContext?.name === 'Pricing') score += 2;
    if (this.currentPageContext?.name === 'Contact') score += 3;
    if (this.currentPageContext?.name === 'Services') score += 1;
    
    return Math.min(score, 5); // Max score of 5
  }

  suggestPageRoute(intent) {
    const routingMap = {
      get_pricing: '/pricing',
      explore_services: '/services',
      technical_details: '/services',
      learn_about_company: '/about',
      get_in_touch: '/contact',
      schedule_meeting: '/contact',
      request_quote: '/contact',
      read_content: '/blog',
      get_answers: '/faq'
    };
    
    return routingMap[intent] || null;
  }

  dispatchRoutingSuggestion(suggestedRoute) {
    window.dispatchEvent(new CustomEvent('chatbot-route-suggestion', {
      detail: {
        suggestedRoute,
        currentPage: window.location.pathname,
        intent: this.userIntent.primary,
        confidence: this.userIntent.confidence
      }
    }));
  }

  async getContextualResponse(message, sessionId) {
    const context = this.conversationContext.get(sessionId);
    const pageContext = this.currentPageContext;
    
    // Check for quick responses first
    if (pageContext && this.shouldUseQuickResponse(message)) {
      return this.getQuickResponse(pageContext, message);
    }
    
    // Check dynamic FAQ
    const faqResponse = await this.checkDynamicFAQ(message);
    if (faqResponse) {
      return faqResponse;
    }
    
    // Generate contextual prompt for AI
    const contextualPrompt = this.buildContextualPrompt(message, context, pageContext);
    
    return contextualPrompt;
  }

  shouldUseQuickResponse(message) {
    const quickResponseTriggers = [
      /^hi$/i, /^hello$/i, /^hey$/i, /^help$/i,
      /what do you do/i, /tell me about/i, /how can you help/i
    ];
    
    return quickResponseTriggers.some(trigger => trigger.test(message.trim()));
  }

  getQuickResponse(pageContext, message) {
    const responses = pageContext.quickResponses;
    
    // Select response based on message content
    if (message.toLowerCase().includes('help')) {
      return responses[1] || responses[0];
    }
    
    if (message.toLowerCase().includes('about')) {
      return responses[2] || responses[0];
    }
    
    // Default to first response
    return responses[0];
  }

  async checkDynamicFAQ(message) {
    try {
      const cacheKey = `faq:response:${this.hashMessage(message)}`;
      let faqResponse = await this.cacheManager.get(cacheKey);
      
      if (!faqResponse) {
        // Search FAQ content
        const response = await this.backendManager.makeRequest('/api/faq/search', {
          method: 'POST',
          body: JSON.stringify({ query: message }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const faqData = await response.json();
          if (faqData.matches && faqData.matches.length > 0) {
            faqResponse = faqData.matches[0].answer;
            
            // Cache the response
            await this.cacheManager.set(cacheKey, faqResponse, 3600);
          }
        }
      }
      
      return faqResponse;
    } catch (error) {
      console.error('Error checking dynamic FAQ:', error);
      return null;
    }
  }

  buildContextualPrompt(message, context, pageContext) {
    let prompt = `User is on the ${pageContext.name} page. `;
    
    if (context && context.intent) {
      prompt += `Detected intent: ${context.intent.primary}. `;
      
      if (context.intent.leadScore > 3) {
        prompt += `This appears to be a high-value lead. `;
      }
    }
    
    // Add page-specific context
    if (pageContext.suggestedPages.length > 0) {
      prompt += `Relevant pages to suggest: ${pageContext.suggestedPages.join(', ')}. `;
    }
    
    // Add conversation history context
    if (context && context.messageHistory) {
      prompt += `Recent conversation context available. `;
    }
    
    prompt += `User message: "${message}"`;
    
    return prompt;
  }

  async loadDynamicFAQ() {
    try {
      const response = await this.backendManager.makeRequest('/api/faq');
      
      if (response.ok) {
        const faqData = await response.json();
        this.dynamicFAQ = faqData;
        
        // Cache FAQ data
        await this.cacheManager.set('dynamic:faq', faqData, 3600);
        
        console.log('Dynamic FAQ loaded:', faqData.length, 'entries');
      }
    } catch (error) {
      console.error('Error loading dynamic FAQ:', error);
    }
  }

  getRecentMessages(sessionId, limit = 5) {
    // This would integrate with the conversation manager
    // For now, return empty array
    return [];
  }

  updateConversationContext(conversationData) {
    const { conversationId, message } = conversationData;
    
    if (this.conversationContext.has(conversationId)) {
      const context = this.conversationContext.get(conversationId);
      context.messageHistory = context.messageHistory || [];
      context.messageHistory.push(message);
      
      // Keep only recent messages
      if (context.messageHistory.length > 10) {
        context.messageHistory = context.messageHistory.slice(-10);
      }
    }
  }

  async translateResponse(response, targetLanguage) {
    if (!this.multilingualSupport.enabled || targetLanguage === 'en') {
      return response;
    }
    
    if (this.multilingualSupport.supportedLanguages.includes(targetLanguage)) {
      // Use cached translations for common phrases
      const translations = this.multilingualSupport.translations[targetLanguage];
      
      // Simple keyword-based translation (in production, use proper translation service)
      for (const [key, translation] of Object.entries(translations)) {
        if (response.toLowerCase().includes(key)) {
          return translation;
        }
      }
    }
    
    return response; // Fallback to original
  }

  detectLanguage(message) {
    // Simple language detection (in production, use proper language detection)
    const spanishPatterns = [
      /hola/i, /gracias/i, /por favor/i, /¿/i, /¡/i, /español/i
    ];
    
    if (spanishPatterns.some(pattern => pattern.test(message))) {
      return 'es';
    }
    
    return 'en';
  }

  hashMessage(message) {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Public API methods
  getCurrentContext() {
    return {
      pageContext: this.currentPageContext,
      userIntent: this.userIntent,
      conversationContexts: this.conversationContext.size
    };
  }

  getPageSuggestions(intent) {
    const suggestions = [];
    
    if (this.currentPageContext && this.currentPageContext.suggestedPages) {
      this.currentPageContext.suggestedPages.forEach(page => {
        const pageContext = this.pageContexts[page];
        if (pageContext) {
          suggestions.push({
            path: page,
            name: pageContext.name,
            relevance: this.calculatePageRelevance(intent, pageContext)
          });
        }
      });
    }
    
    return suggestions.sort((a, b) => b.relevance - a.relevance);
  }

  calculatePageRelevance(intent, pageContext) {
    let relevance = 0;
    
    if (pageContext.intents.includes(intent)) {
      relevance += 0.8;
    }
    
    // Add other relevance factors
    relevance += Math.random() * 0.2; // Randomization for variety
    
    return relevance;
  }

  getLeadScore(sessionId) {
    const context = this.conversationContext.get(sessionId);
    return context ? context.intent?.leadScore || 0 : 0;
  }

  shouldEscalateToHuman(sessionId) {
    const leadScore = this.getLeadScore(sessionId);
    const context = this.conversationContext.get(sessionId);
    
    // Escalate high-value leads or complex technical questions
    return leadScore >= 4 || 
           (context && context.intent?.primary === 'technical_details' && 
            context.intent?.confidence > 0.8);
  }
}

// Create global instance
let contextualIntelligenceManager = null;

export function getContextualIntelligenceManager() {
  if (!contextualIntelligenceManager) {
    contextualIntelligenceManager = new ContextualIntelligenceManager();
  }
  return contextualIntelligenceManager;
}

export function initializeContextualIntelligence() {
  return getContextualIntelligenceManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeContextualIntelligence();
  });
}

export default ContextualIntelligenceManager;
