/**
 * DigiClick AI Personalization Manager
 * User behavior tracking, dynamic content personalization, and adaptive navigation
 * GDPR compliant with privacy controls and transparent data usage
 */

import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getAccessibilityManager } from './accessibility-manager';

class PersonalizationManager {
  constructor() {
    this.backendManager = null;
    this.cacheManager = null;
    this.accessibilityManager = null;
    
    this.userBehaviorData = new Map();
    this.contentRecommendations = new Map();
    this.navigationAdaptations = new Map();
    
    this.trackingConfig = {
      enabled: true,
      gdprCompliant: true,
      anonymousTracking: true,
      dataRetentionDays: 30,
      cookieConsent: false,
      optOutAvailable: true
    };
    
    this.behaviorMetrics = {
      pageViews: {
        weight: 0.2,
        threshold: 3,
        categories: ['interest_indicator', 'engagement_signal']
      },
      timeSpent: {
        weight: 0.3,
        threshold: 30, // seconds
        categories: ['engagement_depth', 'content_relevance']
      },
      interactions: {
        weight: 0.25,
        threshold: 5,
        categories: ['active_engagement', 'feature_usage']
      },
      conversionActions: {
        weight: 0.25,
        threshold: 1,
        categories: ['purchase_intent', 'lead_quality']
      }
    };
    
    this.contentCategories = {
      'ai_automation': {
        name: 'AI Automation',
        keywords: ['AI', 'automation', 'machine learning', 'intelligent'],
        relatedServices: ['ai_consulting', 'process_automation', 'ml_development'],
        targetAudience: 'technical_leaders'
      },
      'web_development': {
        name: 'Web Development',
        keywords: ['web', 'frontend', 'backend', 'React', 'Next.js'],
        relatedServices: ['web_apps', 'e_commerce', 'responsive_design'],
        targetAudience: 'business_owners'
      },
      'digital_transformation': {
        name: 'Digital Transformation',
        keywords: ['digital', 'transformation', 'modernization', 'cloud'],
        relatedServices: ['consulting', 'migration', 'optimization'],
        targetAudience: 'executives'
      },
      'accessibility': {
        name: 'Accessibility',
        keywords: ['accessibility', 'WCAG', 'inclusive', 'compliance'],
        relatedServices: ['accessibility_audit', 'compliance_consulting', 'inclusive_design'],
        targetAudience: 'compliance_officers'
      },
      'performance': {
        name: 'Performance Optimization',
        keywords: ['performance', 'speed', 'optimization', 'Core Web Vitals'],
        relatedServices: ['performance_audit', 'optimization', 'monitoring'],
        targetAudience: 'technical_teams'
      }
    };
    
    this.userJourneyStages = {
      'awareness': {
        name: 'Awareness',
        content: ['blog_posts', 'case_studies', 'industry_insights'],
        cta: ['learn_more', 'download_guide', 'subscribe_newsletter'],
        nextStage: 'consideration'
      },
      'consideration': {
        name: 'Consideration',
        content: ['service_details', 'portfolio_examples', 'testimonials'],
        cta: ['view_services', 'see_portfolio', 'read_testimonials'],
        nextStage: 'decision'
      },
      'decision': {
        name: 'Decision',
        content: ['pricing_info', 'consultation_offer', 'contact_form'],
        cta: ['get_quote', 'schedule_consultation', 'contact_us'],
        nextStage: 'action'
      },
      'action': {
        name: 'Action',
        content: ['onboarding', 'project_planning', 'success_stories'],
        cta: ['start_project', 'book_meeting', 'get_started'],
        nextStage: 'retention'
      },
      'retention': {
        name: 'Retention',
        content: ['updates', 'new_features', 'additional_services'],
        cta: ['explore_features', 'upgrade_service', 'refer_friend'],
        nextStage: 'advocacy'
      }
    };
    
    this.personalizationRules = {
      'high_engagement': {
        condition: (user) => user.totalTimeSpent > 300 && user.pageViews > 5,
        adaptations: ['show_advanced_content', 'highlight_technical_services', 'offer_consultation']
      },
      'mobile_user': {
        condition: (user) => user.deviceType === 'mobile',
        adaptations: ['optimize_mobile_navigation', 'show_mobile_cta', 'simplify_forms']
      },
      'returning_visitor': {
        condition: (user) => user.visitCount > 1,
        adaptations: ['show_personalized_greeting', 'highlight_new_content', 'remember_preferences']
      },
      'technical_interest': {
        condition: (user) => user.interests.includes('ai_automation') || user.interests.includes('performance'),
        adaptations: ['show_technical_details', 'highlight_code_examples', 'offer_technical_consultation']
      },
      'business_focus': {
        condition: (user) => user.interests.includes('digital_transformation'),
        adaptations: ['show_business_benefits', 'highlight_roi', 'offer_business_consultation']
      }
    };
    
    this.privacySettings = {
      trackingEnabled: true,
      analyticsEnabled: true,
      personalizationEnabled: true,
      cookiesAccepted: false,
      dataProcessingConsent: false,
      marketingConsent: false
    };
    
    this.init();
  }

  async init() {
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.accessibilityManager = getAccessibilityManager();
    
    this.setupEventListeners();
    this.initializeUserTracking();
    this.loadUserPreferences();
    this.checkGDPRCompliance();
  }

  setupEventListeners() {
    // Page view tracking
    window.addEventListener('page-transition-complete', (e) => {
      this.trackPageView(e.detail);
    });

    // Interaction tracking
    window.addEventListener('click', (e) => {
      this.trackInteraction(e);
    });

    // Time tracking
    window.addEventListener('beforeunload', () => {
      this.trackTimeSpent();
    });

    // Scroll tracking
    window.addEventListener('scroll', this.throttle(() => {
      this.trackScrollBehavior();
    }, 1000));

    // Form interactions
    window.addEventListener('form-interaction', (e) => {
      this.trackFormInteraction(e.detail);
    });

    // Conversion tracking
    window.addEventListener('conversion-action', (e) => {
      this.trackConversionAction(e.detail);
    });

    // Privacy settings changes
    window.addEventListener('privacy-settings-changed', (e) => {
      this.updatePrivacySettings(e.detail);
    });
  }

  async trackPageView(pageData) {
    if (!this.trackingConfig.enabled || !this.privacySettings.trackingEnabled) {
      return;
    }

    try {
      const userId = this.getUserId();
      const sessionId = this.getSessionId();
      
      const pageViewData = {
        userId,
        sessionId,
        url: pageData.url,
        title: pageData.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        deviceType: this.detectDeviceType(),
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      };
      
      // Update user behavior data
      await this.updateUserBehaviorData(userId, 'pageView', pageViewData);
      
      // Analyze content interests
      const contentCategory = this.categorizeContent(pageData.url, pageData.title);
      if (contentCategory) {
        await this.updateUserInterests(userId, contentCategory);
      }
      
      // Generate personalized recommendations
      await this.generateContentRecommendations(userId);
      
      // Adapt navigation if needed
      await this.adaptNavigation(userId);
      
      // Cache user data
      await this.cacheUserData(userId);
      
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  async trackInteraction(event) {
    if (!this.trackingConfig.enabled || !this.privacySettings.trackingEnabled) {
      return;
    }

    try {
      const userId = this.getUserId();
      const element = event.target;
      
      // Only track meaningful interactions
      if (!this.isMeaningfulInteraction(element)) {
        return;
      }
      
      const interactionData = {
        userId,
        type: 'click',
        element: element.tagName.toLowerCase(),
        elementId: element.id,
        elementClass: element.className,
        elementText: element.textContent?.substring(0, 100),
        url: window.location.pathname,
        timestamp: new Date().toISOString(),
        coordinates: { x: event.clientX, y: event.clientY }
      };
      
      await this.updateUserBehaviorData(userId, 'interaction', interactionData);
      
      // Check for conversion actions
      if (this.isConversionAction(element)) {
        await this.trackConversionAction({
          type: 'click_conversion',
          element: element,
          userId: userId
        });
      }
      
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  async trackTimeSpent() {
    if (!this.trackingConfig.enabled || !this.privacySettings.trackingEnabled) {
      return;
    }

    try {
      const userId = this.getUserId();
      const currentTime = Date.now();
      const startTime = this.getPageStartTime();
      const timeSpent = Math.round((currentTime - startTime) / 1000);
      
      if (timeSpent > 5) { // Only track if spent more than 5 seconds
        const timeData = {
          userId,
          url: window.location.pathname,
          timeSpent,
          timestamp: new Date().toISOString()
        };
        
        await this.updateUserBehaviorData(userId, 'timeSpent', timeData);
      }
      
    } catch (error) {
      console.error('Error tracking time spent:', error);
    }
  }

  async trackScrollBehavior() {
    if (!this.trackingConfig.enabled || !this.privacySettings.trackingEnabled) {
      return;
    }

    try {
      const userId = this.getUserId();
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      // Track significant scroll milestones
      const milestones = [25, 50, 75, 90];
      const currentMilestone = milestones.find(milestone => 
        scrollPercentage >= milestone && !this.hasReachedMilestone(userId, milestone)
      );
      
      if (currentMilestone) {
        const scrollData = {
          userId,
          url: window.location.pathname,
          scrollPercentage: currentMilestone,
          timestamp: new Date().toISOString()
        };
        
        await this.updateUserBehaviorData(userId, 'scroll', scrollData);
        this.markMilestoneReached(userId, currentMilestone);
      }
      
    } catch (error) {
      console.error('Error tracking scroll behavior:', error);
    }
  }

  async generateContentRecommendations(userId) {
    try {
      const userData = await this.getUserBehaviorData(userId);
      if (!userData) return;
      
      // Analyze user interests and behavior
      const interests = this.analyzeUserInterests(userData);
      const journeyStage = this.determineJourneyStage(userData);
      const engagementLevel = this.calculateEngagementLevel(userData);
      
      // Generate recommendations based on analysis
      const recommendations = {
        content: this.recommendContent(interests, journeyStage, engagementLevel),
        services: this.recommendServices(interests, journeyStage),
        actions: this.recommendActions(journeyStage, engagementLevel),
        navigation: this.recommendNavigationChanges(interests, engagementLevel)
      };
      
      // Cache recommendations
      this.contentRecommendations.set(userId, recommendations);
      await this.cacheManager.set(
        `personalization:recommendations:${userId}`,
        recommendations,
        3600 // 1 hour TTL
      );
      
      // Dispatch recommendations event
      window.dispatchEvent(new CustomEvent('content-recommendations-updated', {
        detail: { userId, recommendations }
      }));
      
      return recommendations;
      
    } catch (error) {
      console.error('Error generating content recommendations:', error);
      return this.getDefaultRecommendations();
    }
  }

  async adaptNavigation(userId) {
    try {
      const userData = await this.getUserBehaviorData(userId);
      if (!userData) return;
      
      const adaptations = [];
      
      // Apply personalization rules
      for (const [ruleName, rule] of Object.entries(this.personalizationRules)) {
        if (rule.condition(userData)) {
          adaptations.push(...rule.adaptations);
        }
      }
      
      // Generate navigation adaptations
      const navigationAdaptations = {
        highlightedSections: this.getHighlightedSections(userData.interests),
        prioritizedMenuItems: this.getPrioritizedMenuItems(userData.interests),
        customCTAs: this.getCustomCTAs(userData.journeyStage),
        adaptiveLayout: this.getAdaptiveLayout(userData.deviceType, userData.engagementLevel),
        accessibilityEnhancements: this.getAccessibilityEnhancements(userData)
      };
      
      // Cache adaptations
      this.navigationAdaptations.set(userId, navigationAdaptations);
      await this.cacheManager.set(
        `personalization:navigation:${userId}`,
        navigationAdaptations,
        3600
      );
      
      // Dispatch navigation adaptations event
      window.dispatchEvent(new CustomEvent('navigation-adaptations-updated', {
        detail: { userId, adaptations: navigationAdaptations }
      }));
      
      return navigationAdaptations;
      
    } catch (error) {
      console.error('Error adapting navigation:', error);
      return this.getDefaultNavigationAdaptations();
    }
  }

  analyzeUserInterests(userData) {
    const interests = {};
    
    // Analyze page views
    if (userData.pageViews) {
      userData.pageViews.forEach(pageView => {
        const category = this.categorizeContent(pageView.url, pageView.title);
        if (category) {
          interests[category] = (interests[category] || 0) + 1;
        }
      });
    }
    
    // Analyze interactions
    if (userData.interactions) {
      userData.interactions.forEach(interaction => {
        const category = this.categorizeInteraction(interaction);
        if (category) {
          interests[category] = (interests[category] || 0) + 0.5;
        }
      });
    }
    
    // Convert to sorted array
    return Object.entries(interests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, score]) => ({ category, score }));
  }

  determineJourneyStage(userData) {
    const pageViews = userData.pageViews?.length || 0;
    const timeSpent = userData.totalTimeSpent || 0;
    const interactions = userData.interactions?.length || 0;
    const conversions = userData.conversions?.length || 0;
    
    if (conversions > 0) return 'action';
    if (interactions > 10 && timeSpent > 300) return 'decision';
    if (pageViews > 3 && timeSpent > 120) return 'consideration';
    return 'awareness';
  }

  calculateEngagementLevel(userData) {
    let score = 0;
    
    // Page views contribution
    const pageViews = userData.pageViews?.length || 0;
    score += Math.min(pageViews * this.behaviorMetrics.pageViews.weight, 2);
    
    // Time spent contribution
    const timeSpent = userData.totalTimeSpent || 0;
    score += Math.min((timeSpent / 60) * this.behaviorMetrics.timeSpent.weight, 3);
    
    // Interactions contribution
    const interactions = userData.interactions?.length || 0;
    score += Math.min(interactions * this.behaviorMetrics.interactions.weight, 2.5);
    
    // Conversions contribution
    const conversions = userData.conversions?.length || 0;
    score += conversions * this.behaviorMetrics.conversionActions.weight;
    
    // Normalize to 0-10 scale
    return Math.min(Math.round(score), 10);
  }

  recommendContent(interests, journeyStage, engagementLevel) {
    const stageConfig = this.userJourneyStages[journeyStage];
    const recommendations = [];
    
    // Add stage-appropriate content
    stageConfig.content.forEach(contentType => {
      recommendations.push({
        type: contentType,
        priority: 'high',
        reason: `Relevant for ${journeyStage} stage`
      });
    });
    
    // Add interest-based content
    interests.forEach(interest => {
      const categoryConfig = this.contentCategories[interest.category];
      if (categoryConfig) {
        recommendations.push({
          type: 'related_content',
          category: interest.category,
          priority: 'medium',
          reason: `Based on interest in ${categoryConfig.name}`
        });
      }
    });
    
    // Add engagement-based content
    if (engagementLevel > 7) {
      recommendations.push({
        type: 'advanced_content',
        priority: 'high',
        reason: 'High engagement level detected'
      });
    }
    
    return recommendations.slice(0, 5); // Limit to top 5
  }

  recommendServices(interests, journeyStage) {
    const recommendations = [];
    
    interests.forEach(interest => {
      const categoryConfig = this.contentCategories[interest.category];
      if (categoryConfig && categoryConfig.relatedServices) {
        categoryConfig.relatedServices.forEach(service => {
          recommendations.push({
            service,
            category: interest.category,
            priority: this.calculateServicePriority(service, journeyStage),
            reason: `Based on interest in ${categoryConfig.name}`
          });
        });
      }
    });
    
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 3);
  }

  recommendActions(journeyStage, engagementLevel) {
    const stageConfig = this.userJourneyStages[journeyStage];
    const actions = [];
    
    // Add stage-appropriate CTAs
    stageConfig.cta.forEach(cta => {
      actions.push({
        action: cta,
        priority: 'high',
        reason: `Appropriate for ${journeyStage} stage`
      });
    });
    
    // Add engagement-based actions
    if (engagementLevel > 8) {
      actions.push({
        action: 'schedule_consultation',
        priority: 'urgent',
        reason: 'Very high engagement detected'
      });
    }
    
    return actions.slice(0, 2);
  }

  categorizeContent(url, title = '') {
    const content = (url + ' ' + title).toLowerCase();
    
    for (const [category, config] of Object.entries(this.contentCategories)) {
      if (config.keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return null;
  }

  categorizeInteraction(interaction) {
    const text = (interaction.elementText || '').toLowerCase();
    const className = (interaction.elementClass || '').toLowerCase();
    const id = (interaction.elementId || '').toLowerCase();
    
    const combined = text + ' ' + className + ' ' + id;
    
    return this.categorizeContent(interaction.url, combined);
  }

  isMeaningfulInteraction(element) {
    const meaningfulElements = ['a', 'button', 'input', 'select', 'textarea'];
    const meaningfulClasses = ['cta', 'button', 'link', 'nav', 'menu'];
    
    return meaningfulElements.includes(element.tagName.toLowerCase()) ||
           meaningfulClasses.some(cls => element.className.toLowerCase().includes(cls));
  }

  isConversionAction(element) {
    const conversionIndicators = [
      'contact', 'submit', 'send', 'schedule', 'book', 'get-quote',
      'start', 'begin', 'signup', 'register', 'download'
    ];
    
    const text = element.textContent?.toLowerCase() || '';
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    return conversionIndicators.some(indicator => 
      text.includes(indicator) || className.includes(indicator) || id.includes(indicator)
    );
  }

  getUserId() {
    // Generate or retrieve anonymous user ID
    let userId = localStorage.getItem('digiclick_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('digiclick_user_id', userId);
    }
    return userId;
  }

  getSessionId() {
    // Generate or retrieve session ID
    let sessionId = sessionStorage.getItem('digiclick_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('digiclick_session_id', sessionId);
    }
    return sessionId;
  }

  detectDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  getPageStartTime() {
    if (!window.pageStartTime) {
      window.pageStartTime = Date.now();
    }
    return window.pageStartTime;
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  async updateUserBehaviorData(userId, type, data) {
    try {
      // Update local data
      if (!this.userBehaviorData.has(userId)) {
        this.userBehaviorData.set(userId, {
          userId,
          pageViews: [],
          interactions: [],
          timeSpent: [],
          conversions: [],
          interests: [],
          totalTimeSpent: 0,
          visitCount: 0,
          deviceType: this.detectDeviceType(),
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString()
        });
      }
      
      const userData = this.userBehaviorData.get(userId);
      
      if (type === 'pageView') {
        userData.pageViews.push(data);
        userData.visitCount++;
      } else if (type === 'interaction') {
        userData.interactions.push(data);
      } else if (type === 'timeSpent') {
        userData.timeSpent.push(data);
        userData.totalTimeSpent += data.timeSpent;
      } else if (type === 'conversion') {
        userData.conversions.push(data);
      }
      
      userData.lastActivity = new Date().toISOString();
      
      // Limit data size for performance
      this.limitUserDataSize(userData);
      
      // Update cache
      await this.cacheManager.set(
        `personalization:user_data:${userId}`,
        userData,
        86400 // 24 hours TTL
      );
      
    } catch (error) {
      console.error('Error updating user behavior data:', error);
    }
  }

  async getUserBehaviorData(userId) {
    try {
      // Try local data first
      if (this.userBehaviorData.has(userId)) {
        return this.userBehaviorData.get(userId);
      }
      
      // Try cache
      const cachedData = await this.cacheManager.get(`personalization:user_data:${userId}`);
      if (cachedData) {
        this.userBehaviorData.set(userId, cachedData);
        return cachedData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user behavior data:', error);
      return null;
    }
  }

  limitUserDataSize(userData) {
    // Limit arrays to prevent memory issues
    const limits = {
      pageViews: 50,
      interactions: 100,
      timeSpent: 50,
      conversions: 20
    };
    
    Object.keys(limits).forEach(key => {
      if (userData[key] && userData[key].length > limits[key]) {
        userData[key] = userData[key].slice(-limits[key]);
      }
    });
  }

  // Public API methods
  async getPersonalizedContent(userId) {
    const recommendations = this.contentRecommendations.get(userId);
    if (recommendations) {
      return recommendations;
    }
    
    return await this.generateContentRecommendations(userId);
  }

  async getNavigationAdaptations(userId) {
    const adaptations = this.navigationAdaptations.get(userId);
    if (adaptations) {
      return adaptations;
    }
    
    return await this.adaptNavigation(userId);
  }

  updatePrivacySettings(settings) {
    this.privacySettings = { ...this.privacySettings, ...settings };
    
    // If tracking is disabled, clear user data
    if (!settings.trackingEnabled) {
      this.clearUserData();
    }
    
    // Save settings
    localStorage.setItem('digiclick_privacy_settings', JSON.stringify(this.privacySettings));
  }

  clearUserData() {
    const userId = this.getUserId();
    
    // Clear local data
    this.userBehaviorData.delete(userId);
    this.contentRecommendations.delete(userId);
    this.navigationAdaptations.delete(userId);
    
    // Clear cache
    this.cacheManager.del(`personalization:user_data:${userId}`);
    this.cacheManager.del(`personalization:recommendations:${userId}`);
    this.cacheManager.del(`personalization:navigation:${userId}`);
    
    // Clear localStorage
    localStorage.removeItem('digiclick_user_id');
  }

  getPrivacySettings() {
    return this.privacySettings;
  }

  isGDPRCompliant() {
    return this.trackingConfig.gdprCompliant && 
           this.trackingConfig.optOutAvailable &&
           this.privacySettings.dataProcessingConsent;
  }
}

// Create global instance
let personalizationManager = null;

export function getPersonalizationManager() {
  if (!personalizationManager) {
    personalizationManager = new PersonalizationManager();
  }
  return personalizationManager;
}

export function initializePersonalizationManager() {
  return getPersonalizationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializePersonalizationManager();
  });
}

export default PersonalizationManager;
