/**
 * DigiClick AI Custom Analytics Dashboard
 * Track cursor interactions, AI features, conversion funnels, and custom KPIs
 * Integrates with existing infrastructure and maintains privacy compliance
 */

import { getPersonalizationManager } from './personalization-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getAuthenticationManager } from './authentication-manager';

class AnalyticsDashboard {
  constructor() {
    this.personalizationManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    this.authManager = null;
    
    this.analyticsData = new Map();
    this.realTimeMetrics = new Map();
    this.kpiTargets = new Map();
    
    this.trackingConfig = {
      cursorInteractions: {
        enabled: true,
        trackHovers: true,
        trackClicks: true,
        trackMovement: false, // Performance consideration
        trackCustomStates: true,
        sampleRate: 0.1 // 10% sampling for performance
      },
      aiFeatures: {
        enabled: true,
        trackChatbotUsage: true,
        trackContentGeneration: true,
        trackPersonalization: true,
        trackRecommendations: true
      },
      conversionFunnel: {
        enabled: true,
        stages: ['landing', 'engagement', 'interest', 'consideration', 'conversion'],
        trackDropoffs: true,
        trackTimeSpent: true
      },
      customKPIs: {
        enabled: true,
        realTimeUpdates: true,
        alertThresholds: true,
        historicalComparison: true
      }
    };
    
    this.kpiDefinitions = {
      cursor_engagement: {
        name: 'Cursor Engagement Rate',
        description: 'Percentage of users actively using custom cursor features',
        calculation: 'cursor_interactions / total_sessions * 100',
        target: 75,
        unit: '%',
        category: 'engagement'
      },
      ai_feature_adoption: {
        name: 'AI Feature Adoption',
        description: 'Percentage of users engaging with AI features',
        calculation: 'ai_feature_users / total_users * 100',
        target: 60,
        unit: '%',
        category: 'ai_features'
      },
      chatbot_satisfaction: {
        name: 'Chatbot Satisfaction Score',
        description: 'Average user satisfaction with AI chatbot interactions',
        calculation: 'sum(satisfaction_ratings) / total_ratings',
        target: 4.5,
        unit: '/5',
        category: 'ai_features'
      },
      conversion_rate: {
        name: 'Overall Conversion Rate',
        description: 'Percentage of visitors who complete desired actions',
        calculation: 'conversions / total_visitors * 100',
        target: 3.5,
        unit: '%',
        category: 'conversion'
      },
      page_performance: {
        name: 'Page Performance Score',
        description: 'Average Lighthouse performance score across all pages',
        calculation: 'sum(lighthouse_scores) / total_pages',
        target: 90,
        unit: '/100',
        category: 'performance'
      },
      accessibility_compliance: {
        name: 'Accessibility Compliance',
        description: 'WCAG 2.1 AA compliance score across all pages',
        calculation: 'compliant_elements / total_elements * 100',
        target: 100,
        unit: '%',
        category: 'accessibility'
      },
      user_engagement_time: {
        name: 'Average Engagement Time',
        description: 'Average time users spend actively engaging with the site',
        calculation: 'sum(engagement_time) / total_sessions',
        target: 180,
        unit: 'seconds',
        category: 'engagement'
      },
      portfolio_interaction_rate: {
        name: 'Portfolio Interaction Rate',
        description: 'Percentage of users who interact with portfolio elements',
        calculation: 'portfolio_interactions / portfolio_views * 100',
        target: 80,
        unit: '%',
        category: 'portfolio'
      }
    };
    
    this.conversionFunnelStages = {
      landing: {
        name: 'Landing',
        description: 'User arrives on the website',
        events: ['page_view'],
        target: 100
      },
      engagement: {
        name: 'Engagement',
        description: 'User interacts with content or features',
        events: ['scroll', 'click', 'cursor_interaction'],
        target: 70
      },
      interest: {
        name: 'Interest',
        description: 'User shows interest in services',
        events: ['portfolio_view', 'service_page_view', 'chatbot_interaction'],
        target: 40
      },
      consideration: {
        name: 'Consideration',
        description: 'User explores specific solutions',
        events: ['case_study_view', 'pricing_view', 'contact_form_start'],
        target: 15
      },
      conversion: {
        name: 'Conversion',
        description: 'User completes desired action',
        events: ['contact_form_submit', 'demo_request', 'consultation_book'],
        target: 5
      }
    };
    
    this.dashboardViews = {
      overview: {
        name: 'Overview Dashboard',
        widgets: ['kpi_summary', 'conversion_funnel', 'real_time_users', 'top_pages']
      },
      cursor_analytics: {
        name: 'Cursor Analytics',
        widgets: ['cursor_heatmap', 'cursor_interactions', 'cursor_performance', 'cursor_adoption']
      },
      ai_features: {
        name: 'AI Features Analytics',
        widgets: ['chatbot_metrics', 'content_generation', 'personalization_effectiveness', 'ai_satisfaction']
      },
      conversion: {
        name: 'Conversion Analytics',
        widgets: ['funnel_analysis', 'conversion_paths', 'dropoff_analysis', 'goal_completion']
      },
      performance: {
        name: 'Performance Analytics',
        widgets: ['page_speed', 'core_web_vitals', 'accessibility_scores', 'technical_metrics']
      }
    };
    
    this.init();
  }

  async init() {
    this.personalizationManager = getPersonalizationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.authManager = getAuthenticationManager();
    
    this.setupEventListeners();
    this.initializeTracking();
    this.loadKPITargets();
    this.startRealTimeUpdates();
  }

  setupEventListeners() {
    // Cursor interaction tracking
    if (this.trackingConfig.cursorInteractions.enabled) {
      this.setupCursorTracking();
    }
    
    // AI feature tracking
    if (this.trackingConfig.aiFeatures.enabled) {
      this.setupAIFeatureTracking();
    }
    
    // Conversion funnel tracking
    if (this.trackingConfig.conversionFunnel.enabled) {
      this.setupConversionTracking();
    }
    
    // Dashboard events
    window.addEventListener('analytics-dashboard-requested', (e) => {
      this.generateDashboard(e.detail);
    });

    window.addEventListener('kpi-update-requested', (e) => {
      this.updateKPI(e.detail);
    });

    window.addEventListener('analytics-export-requested', (e) => {
      this.exportAnalytics(e.detail);
    });
  }

  setupCursorTracking() {
    // Track cursor hover interactions
    if (this.trackingConfig.cursorInteractions.trackHovers) {
      document.addEventListener('mouseover', (e) => {
        if (Math.random() < this.trackingConfig.cursorInteractions.sampleRate) {
          this.trackCursorInteraction('hover', e);
        }
      });
    }
    
    // Track cursor clicks
    if (this.trackingConfig.cursorInteractions.trackClicks) {
      document.addEventListener('click', (e) => {
        this.trackCursorInteraction('click', e);
      });
    }
    
    // Track custom cursor states
    if (this.trackingConfig.cursorInteractions.trackCustomStates) {
      window.addEventListener('cursor-state-changed', (e) => {
        this.trackCursorInteraction('state_change', e);
      });
    }
  }

  setupAIFeatureTracking() {
    // Track chatbot interactions
    if (this.trackingConfig.aiFeatures.trackChatbotUsage) {
      window.addEventListener('chatbot-message-sent', (e) => {
        this.trackAIFeature('chatbot_interaction', e.detail);
      });
      
      window.addEventListener('chatbot-satisfaction-rated', (e) => {
        this.trackAIFeature('chatbot_satisfaction', e.detail);
      });
    }
    
    // Track content generation
    if (this.trackingConfig.aiFeatures.trackContentGeneration) {
      window.addEventListener('content-generated', (e) => {
        this.trackAIFeature('content_generation', e.detail);
      });
    }
    
    // Track personalization
    if (this.trackingConfig.aiFeatures.trackPersonalization) {
      window.addEventListener('personalization-applied', (e) => {
        this.trackAIFeature('personalization', e.detail);
      });
    }
  }

  setupConversionTracking() {
    // Track funnel stage progression
    Object.keys(this.conversionFunnelStages).forEach(stage => {
      const stageConfig = this.conversionFunnelStages[stage];
      
      stageConfig.events.forEach(eventType => {
        window.addEventListener(eventType, (e) => {
          this.trackConversionStage(stage, eventType, e);
        });
      });
    });
    
    // Track page views for funnel analysis
    window.addEventListener('page-transition-complete', (e) => {
      this.trackConversionStage('landing', 'page_view', e);
    });
  }

  async trackCursorInteraction(type, event) {
    try {
      const interactionData = {
        type,
        timestamp: Date.now(),
        element: event.target?.tagName?.toLowerCase(),
        elementClass: event.target?.className,
        elementId: event.target?.id,
        pageUrl: window.location.pathname,
        cursorState: this.getCurrentCursorState(),
        coordinates: type === 'click' ? { x: event.clientX, y: event.clientY } : null
      };
      
      // Store locally
      this.addToAnalyticsData('cursor_interactions', interactionData);
      
      // Update real-time metrics
      this.updateRealTimeMetric('cursor_interactions_per_minute', 1);
      
      // Send to backend (batched)
      this.queueForBackend('cursor_interaction', interactionData);
      
    } catch (error) {
      console.error('Error tracking cursor interaction:', error);
    }
  }

  async trackAIFeature(featureType, data) {
    try {
      const featureData = {
        featureType,
        timestamp: Date.now(),
        userId: this.authManager?.getCurrentUser()?.id || 'anonymous',
        sessionId: this.getSessionId(),
        pageUrl: window.location.pathname,
        data
      };
      
      // Store locally
      this.addToAnalyticsData('ai_features', featureData);
      
      // Update KPIs
      this.updateKPIMetric('ai_feature_adoption');
      
      if (featureType === 'chatbot_satisfaction' && data.rating) {
        this.updateKPIMetric('chatbot_satisfaction', data.rating);
      }
      
      // Send to backend
      this.queueForBackend('ai_feature', featureData);
      
    } catch (error) {
      console.error('Error tracking AI feature:', error);
    }
  }

  async trackConversionStage(stage, eventType, event) {
    try {
      const conversionData = {
        stage,
        eventType,
        timestamp: Date.now(),
        userId: this.authManager?.getCurrentUser()?.id || 'anonymous',
        sessionId: this.getSessionId(),
        pageUrl: window.location.pathname,
        previousStage: this.getPreviousConversionStage(),
        timeFromPrevious: this.getTimeFromPreviousStage()
      };
      
      // Store locally
      this.addToAnalyticsData('conversion_funnel', conversionData);
      
      // Update funnel metrics
      this.updateFunnelMetrics(stage);
      
      // Check for conversion completion
      if (stage === 'conversion') {
        this.updateKPIMetric('conversion_rate');
      }
      
      // Send to backend
      this.queueForBackend('conversion_stage', conversionData);
      
    } catch (error) {
      console.error('Error tracking conversion stage:', error);
    }
  }

  async generateDashboard(options = {}) {
    try {
      const { view = 'overview', timeRange = '7d', filters = {} } = options;
      
      const dashboardConfig = this.dashboardViews[view];
      if (!dashboardConfig) {
        throw new Error(`Unknown dashboard view: ${view}`);
      }
      
      const dashboardData = {
        view,
        timeRange,
        generatedAt: new Date().toISOString(),
        widgets: {}
      };
      
      // Generate data for each widget
      for (const widgetType of dashboardConfig.widgets) {
        dashboardData.widgets[widgetType] = await this.generateWidgetData(widgetType, timeRange, filters);
      }
      
      // Cache dashboard data
      await this.cacheManager.set(
        `analytics:dashboard:${view}:${timeRange}`,
        dashboardData,
        300 // 5 minutes TTL
      );
      
      // Dispatch dashboard ready event
      window.dispatchEvent(new CustomEvent('analytics-dashboard-ready', {
        detail: dashboardData
      }));
      
      return dashboardData;
      
    } catch (error) {
      console.error('Error generating dashboard:', error);
      throw error;
    }
  }

  async generateWidgetData(widgetType, timeRange, filters) {
    switch (widgetType) {
      case 'kpi_summary':
        return this.generateKPISummary(timeRange);
      
      case 'conversion_funnel':
        return this.generateConversionFunnelData(timeRange);
      
      case 'cursor_heatmap':
        return this.generateCursorHeatmapData(timeRange);
      
      case 'chatbot_metrics':
        return this.generateChatbotMetrics(timeRange);
      
      case 'real_time_users':
        return this.generateRealTimeUsersData();
      
      case 'page_speed':
        return this.generatePageSpeedData(timeRange);
      
      default:
        return { error: `Unknown widget type: ${widgetType}` };
    }
  }

  async generateKPISummary(timeRange) {
    const kpiData = {};
    
    for (const [kpiId, kpiConfig] of Object.entries(this.kpiDefinitions)) {
      try {
        const currentValue = await this.calculateKPI(kpiId, timeRange);
        const previousValue = await this.calculateKPI(kpiId, this.getPreviousTimeRange(timeRange));
        const change = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : 0;
        
        kpiData[kpiId] = {
          name: kpiConfig.name,
          value: currentValue,
          target: kpiConfig.target,
          unit: kpiConfig.unit,
          change: Math.round(change * 100) / 100,
          status: this.getKPIStatus(currentValue, kpiConfig.target),
          category: kpiConfig.category
        };
      } catch (error) {
        console.error(`Error calculating KPI ${kpiId}:`, error);
        kpiData[kpiId] = { error: 'Calculation failed' };
      }
    }
    
    return kpiData;
  }

  async generateConversionFunnelData(timeRange) {
    const funnelData = {};
    
    for (const [stage, config] of Object.entries(this.conversionFunnelStages)) {
      const stageData = this.getAnalyticsData('conversion_funnel')
        .filter(item => item.stage === stage && this.isInTimeRange(item.timestamp, timeRange));
      
      funnelData[stage] = {
        name: config.name,
        count: stageData.length,
        target: config.target,
        conversionRate: stage === 'landing' ? 100 : this.calculateStageConversionRate(stage, timeRange),
        dropoffRate: this.calculateStageDropoffRate(stage, timeRange)
      };
    }
    
    return funnelData;
  }

  async generateCursorHeatmapData(timeRange) {
    const cursorData = this.getAnalyticsData('cursor_interactions')
      .filter(item => this.isInTimeRange(item.timestamp, timeRange));
    
    const heatmapData = {};
    
    cursorData.forEach(interaction => {
      if (interaction.coordinates) {
        const key = `${Math.floor(interaction.coordinates.x / 50)}_${Math.floor(interaction.coordinates.y / 50)}`;
        heatmapData[key] = (heatmapData[key] || 0) + 1;
      }
    });
    
    return {
      data: heatmapData,
      totalInteractions: cursorData.length,
      uniqueElements: new Set(cursorData.map(item => item.element)).size
    };
  }

  async generateChatbotMetrics(timeRange) {
    const chatbotData = this.getAnalyticsData('ai_features')
      .filter(item => item.featureType === 'chatbot_interaction' && this.isInTimeRange(item.timestamp, timeRange));
    
    const satisfactionData = this.getAnalyticsData('ai_features')
      .filter(item => item.featureType === 'chatbot_satisfaction' && this.isInTimeRange(item.timestamp, timeRange));
    
    return {
      totalInteractions: chatbotData.length,
      uniqueUsers: new Set(chatbotData.map(item => item.userId)).size,
      averageSatisfaction: satisfactionData.length > 0 
        ? satisfactionData.reduce((sum, item) => sum + item.data.rating, 0) / satisfactionData.length 
        : 0,
      responseTime: this.calculateAverageResponseTime(chatbotData),
      topQueries: this.getTopChatbotQueries(chatbotData)
    };
  }

  addToAnalyticsData(category, data) {
    if (!this.analyticsData.has(category)) {
      this.analyticsData.set(category, []);
    }
    
    const categoryData = this.analyticsData.get(category);
    categoryData.push(data);
    
    // Limit data size for performance
    if (categoryData.length > 10000) {
      categoryData.splice(0, categoryData.length - 10000);
    }
  }

  getAnalyticsData(category) {
    return this.analyticsData.get(category) || [];
  }

  updateRealTimeMetric(metric, value) {
    const current = this.realTimeMetrics.get(metric) || 0;
    this.realTimeMetrics.set(metric, current + value);
  }

  async updateKPIMetric(kpiId, value = null) {
    try {
      const kpiConfig = this.kpiDefinitions[kpiId];
      if (!kpiConfig) return;
      
      // Calculate current KPI value
      const currentValue = value !== null ? value : await this.calculateKPI(kpiId, '1d');
      
      // Check if alert threshold is met
      const target = kpiConfig.target;
      const threshold = target * 0.9; // 90% of target
      
      if (currentValue < threshold) {
        this.triggerKPIAlert(kpiId, currentValue, target);
      }
      
      // Update real-time display
      window.dispatchEvent(new CustomEvent('kpi-updated', {
        detail: { kpiId, value: currentValue, target }
      }));
      
    } catch (error) {
      console.error(`Error updating KPI ${kpiId}:`, error);
    }
  }

  async calculateKPI(kpiId, timeRange) {
    // Simplified KPI calculations - in production, these would be more sophisticated
    switch (kpiId) {
      case 'cursor_engagement':
        const cursorInteractions = this.getAnalyticsData('cursor_interactions')
          .filter(item => this.isInTimeRange(item.timestamp, timeRange));
        return Math.min(100, (cursorInteractions.length / 100) * 100); // Simplified
      
      case 'ai_feature_adoption':
        const aiFeatures = this.getAnalyticsData('ai_features')
          .filter(item => this.isInTimeRange(item.timestamp, timeRange));
        return Math.min(100, (aiFeatures.length / 50) * 100); // Simplified
      
      case 'conversion_rate':
        const conversions = this.getAnalyticsData('conversion_funnel')
          .filter(item => item.stage === 'conversion' && this.isInTimeRange(item.timestamp, timeRange));
        const visitors = this.getAnalyticsData('conversion_funnel')
          .filter(item => item.stage === 'landing' && this.isInTimeRange(item.timestamp, timeRange));
        return visitors.length > 0 ? (conversions.length / visitors.length) * 100 : 0;
      
      default:
        return Math.random() * 100; // Placeholder for other KPIs
    }
  }

  getKPIStatus(currentValue, target) {
    const percentage = (currentValue / target) * 100;
    
    if (percentage >= 100) return 'excellent';
    if (percentage >= 90) return 'good';
    if (percentage >= 70) return 'warning';
    return 'critical';
  }

  isInTimeRange(timestamp, timeRange) {
    const now = Date.now();
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    const range = ranges[timeRange] || ranges['7d'];
    return timestamp >= (now - range);
  }

  getCurrentCursorState() {
    // Get current cursor state from cursor system
    return document.body.getAttribute('data-cursor-state') || 'default';
  }

  getSessionId() {
    return sessionStorage.getItem('analytics_session_id') || 
           this.generateSessionId();
  }

  generateSessionId() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
    return sessionId;
  }

  queueForBackend(type, data) {
    // Queue data for batch sending to backend
    if (!window.analyticsQueue) {
      window.analyticsQueue = [];
    }
    
    window.analyticsQueue.push({ type, data, timestamp: Date.now() });
    
    // Send batch every 30 seconds
    if (!window.analyticsBatchTimer) {
      window.analyticsBatchTimer = setInterval(() => {
        this.sendBatchToBackend();
      }, 30000);
    }
  }

  async sendBatchToBackend() {
    if (!window.analyticsQueue || window.analyticsQueue.length === 0) {
      return;
    }

    try {
      const batch = window.analyticsQueue.splice(0, 100); // Send max 100 items

      await this.backendManager.makeRequest('/api/analytics/batch', {
        method: 'POST',
        body: JSON.stringify({ events: batch }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authManager?.getAccessToken()}`
        }
      });

    } catch (error) {
      console.error('Error sending analytics batch:', error);
      // Re-queue failed items for retry
      window.analyticsQueue.unshift(...batch);
    }
  }

  triggerKPIAlert(kpiId, currentValue, target) {
    const alert = {
      id: `alert_${Date.now()}_${kpiId}`,
      kpiId,
      currentValue,
      target,
      severity: this.calculateAlertSeverity(currentValue, target),
      timestamp: new Date().toISOString(),
      message: this.generateAlertMessage(kpiId, currentValue, target)
    };

    // Dispatch alert event
    window.dispatchEvent(new CustomEvent('kpi-alert-triggered', {
      detail: alert
    }));

    // Send to backend for notification
    this.queueForBackend('kpi_alert', alert);

    console.warn(`KPI Alert: ${alert.message}`);
  }

  calculateAlertSeverity(currentValue, target) {
    const percentage = (currentValue / target) * 100;

    if (percentage < 50) return 'critical';
    if (percentage < 70) return 'high';
    if (percentage < 90) return 'medium';
    return 'low';
  }

  generateAlertMessage(kpiId, currentValue, target) {
    const kpiConfig = this.kpiDefinitions[kpiId];
    const percentage = Math.round((currentValue / target) * 100);

    return `${kpiConfig.name} is at ${currentValue}${kpiConfig.unit} (${percentage}% of target ${target}${kpiConfig.unit})`;
  }

  calculateActiveUsers() {
    // Calculate active users in the last 5 minutes
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentActivity = [];

    // Combine all activity types
    ['cursor_interactions', 'ai_features', 'conversion_funnel'].forEach(category => {
      const categoryData = this.getAnalyticsData(category);
      recentActivity.push(...categoryData.filter(item => item.timestamp > fiveMinutesAgo));
    });

    // Count unique users/sessions
    const uniqueUsers = new Set();
    recentActivity.forEach(activity => {
      const identifier = activity.userId || activity.sessionId || 'anonymous';
      uniqueUsers.add(identifier);
    });

    return uniqueUsers.size;
  }

  calculateCurrentPageViews() {
    // Calculate page views in the last minute
    const oneMinuteAgo = Date.now() - (60 * 1000);
    const recentPageViews = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === 'landing' && item.timestamp > oneMinuteAgo);

    return recentPageViews.length;
  }

  getPreviousConversionStage() {
    // Get the previous conversion stage for the current session
    const sessionId = this.getSessionId();
    const sessionData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.sessionId === sessionId)
      .sort((a, b) => b.timestamp - a.timestamp);

    return sessionData.length > 1 ? sessionData[1].stage : null;
  }

  getTimeFromPreviousStage() {
    // Calculate time from previous conversion stage
    const sessionId = this.getSessionId();
    const sessionData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.sessionId === sessionId)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (sessionData.length < 2) return 0;

    return sessionData[0].timestamp - sessionData[1].timestamp;
  }

  updateFunnelMetrics(stage) {
    // Update funnel progression metrics
    const funnelKey = `funnel_${stage}`;
    this.updateRealTimeMetric(funnelKey, 1);

    // Calculate conversion rate for this stage
    const conversionRate = this.calculateStageConversionRate(stage, '1h');
    this.updateRealTimeMetric(`${funnelKey}_conversion_rate`, conversionRate);
  }

  calculateStageConversionRate(stage, timeRange) {
    const stageIndex = Object.keys(this.conversionFunnelStages).indexOf(stage);
    if (stageIndex === 0) return 100; // Landing stage is always 100%

    const previousStage = Object.keys(this.conversionFunnelStages)[stageIndex - 1];

    const currentStageData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === stage && this.isInTimeRange(item.timestamp, timeRange));

    const previousStageData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === previousStage && this.isInTimeRange(item.timestamp, timeRange));

    if (previousStageData.length === 0) return 0;

    return Math.round((currentStageData.length / previousStageData.length) * 100);
  }

  calculateStageDropoffRate(stage, timeRange) {
    const conversionRate = this.calculateStageConversionRate(stage, timeRange);
    return 100 - conversionRate;
  }

  generateRealTimeUsersData() {
    return {
      activeUsers: this.calculateActiveUsers(),
      currentPageViews: this.calculateCurrentPageViews(),
      sessionsToday: this.calculateSessionsToday(),
      bounceRate: this.calculateBounceRate('24h'),
      averageSessionDuration: this.calculateAverageSessionDuration('24h')
    };
  }

  calculateSessionsToday() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sessionsToday = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === 'landing' && item.timestamp >= todayStart.getTime());

    const uniqueSessions = new Set(sessionsToday.map(item => item.sessionId));
    return uniqueSessions.size;
  }

  calculateBounceRate(timeRange) {
    const landingData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === 'landing' && this.isInTimeRange(item.timestamp, timeRange));

    const engagementData = this.getAnalyticsData('conversion_funnel')
      .filter(item => item.stage === 'engagement' && this.isInTimeRange(item.timestamp, timeRange));

    const uniqueLandingSessions = new Set(landingData.map(item => item.sessionId));
    const uniqueEngagementSessions = new Set(engagementData.map(item => item.sessionId));

    const bouncedSessions = uniqueLandingSessions.size - uniqueEngagementSessions.size;

    return uniqueLandingSessions.size > 0
      ? Math.round((bouncedSessions / uniqueLandingSessions.size) * 100)
      : 0;
  }

  calculateAverageSessionDuration(timeRange) {
    const sessionDurations = new Map();

    this.getAnalyticsData('conversion_funnel')
      .filter(item => this.isInTimeRange(item.timestamp, timeRange))
      .forEach(item => {
        const sessionId = item.sessionId;
        if (!sessionDurations.has(sessionId)) {
          sessionDurations.set(sessionId, { start: item.timestamp, end: item.timestamp });
        } else {
          const session = sessionDurations.get(sessionId);
          session.start = Math.min(session.start, item.timestamp);
          session.end = Math.max(session.end, item.timestamp);
        }
      });

    const durations = Array.from(sessionDurations.values())
      .map(session => session.end - session.start)
      .filter(duration => duration > 0);

    return durations.length > 0
      ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length / 1000)
      : 0;
  }

  generatePageSpeedData(timeRange) {
    // Generate page speed analytics data
    return {
      averageLoadTime: this.calculateAverageLoadTime(timeRange),
      coreWebVitals: this.getCoreWebVitals(timeRange),
      performanceScore: this.getPerformanceScore(timeRange),
      slowestPages: this.getSlowestPages(timeRange),
      performanceTrends: this.getPerformanceTrends(timeRange)
    };
  }

  calculateAverageLoadTime(timeRange) {
    // Simulate load time data - in production, this would come from real performance metrics
    return Math.random() * 1000 + 1500; // 1.5-2.5 seconds
  }

  getCoreWebVitals(timeRange) {
    return {
      lcp: Math.random() * 1000 + 2000, // Largest Contentful Paint
      fid: Math.random() * 50 + 50,     // First Input Delay
      cls: Math.random() * 0.1 + 0.05   // Cumulative Layout Shift
    };
  }

  getPerformanceScore(timeRange) {
    return Math.floor(Math.random() * 20) + 80; // 80-100 score
  }

  getSlowestPages(timeRange) {
    return [
      { page: '/portfolio', loadTime: 2100, visits: 150 },
      { page: '/services', loadTime: 1900, visits: 200 },
      { page: '/about', loadTime: 1800, visits: 120 }
    ];
  }

  getPerformanceTrends(timeRange) {
    // Generate trend data for the specified time range
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 1;
    const trends = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      trends.push({
        date: date.toISOString().split('T')[0],
        loadTime: Math.random() * 500 + 1500,
        performanceScore: Math.floor(Math.random() * 20) + 80
      });
    }

    return trends;
  }

  calculateAverageResponseTime(chatbotData) {
    if (chatbotData.length === 0) return 0;

    // Simulate response time calculation
    const responseTimes = chatbotData.map(() => Math.random() * 2000 + 500); // 0.5-2.5 seconds
    return Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length);
  }

  getTopChatbotQueries(chatbotData) {
    // Simulate top queries analysis
    const queries = [
      'How can AI help my business?',
      'What services do you offer?',
      'Can you show me your portfolio?',
      'What is your pricing?',
      'How long does a project take?'
    ];

    return queries.map(query => ({
      query,
      count: Math.floor(Math.random() * 50) + 10,
      satisfaction: Math.random() * 2 + 3 // 3-5 rating
    }));
  }

  getPreviousTimeRange(timeRange) {
    // Get the equivalent previous time range for comparison
    const ranges = {
      '1h': '1h_prev',
      '24h': '24h_prev',
      '7d': '7d_prev',
      '30d': '30d_prev'
    };

    return ranges[timeRange] || '7d_prev';
  }

  startRealTimeUpdates() {
    // Update real-time metrics every 5 seconds
    setInterval(() => {
      this.updateRealTimeDisplay();
    }, 5000);
  }

  updateRealTimeDisplay() {
    const realTimeData = {
      activeUsers: this.calculateActiveUsers(),
      currentPageViews: this.calculateCurrentPageViews(),
      cursorInteractionsPerMinute: this.realTimeMetrics.get('cursor_interactions_per_minute') || 0,
      aiInteractionsPerMinute: this.realTimeMetrics.get('ai_interactions_per_minute') || 0
    };
    
    window.dispatchEvent(new CustomEvent('analytics-real-time-update', {
      detail: realTimeData
    }));
    
    // Reset per-minute counters
    this.realTimeMetrics.set('cursor_interactions_per_minute', 0);
    this.realTimeMetrics.set('ai_interactions_per_minute', 0);
  }

  // Public API methods
  async getDashboard(view = 'overview', timeRange = '7d') {
    return await this.generateDashboard({ view, timeRange });
  }

  getKPIDefinitions() {
    return this.kpiDefinitions;
  }

  getDashboardViews() {
    return this.dashboardViews;
  }

  getTrackingConfig() {
    return this.trackingConfig;
  }

  async exportAnalytics(options = {}) {
    const { format = 'json', timeRange = '30d', categories = [] } = options;
    
    const exportData = {};
    
    if (categories.length === 0 || categories.includes('cursor_interactions')) {
      exportData.cursor_interactions = this.getAnalyticsData('cursor_interactions')
        .filter(item => this.isInTimeRange(item.timestamp, timeRange));
    }
    
    if (categories.length === 0 || categories.includes('ai_features')) {
      exportData.ai_features = this.getAnalyticsData('ai_features')
        .filter(item => this.isInTimeRange(item.timestamp, timeRange));
    }
    
    if (categories.length === 0 || categories.includes('conversion_funnel')) {
      exportData.conversion_funnel = this.getAnalyticsData('conversion_funnel')
        .filter(item => this.isInTimeRange(item.timestamp, timeRange));
    }
    
    return exportData;
  }
}

// Create global instance
let analyticsDashboard = null;

export function getAnalyticsDashboard() {
  if (!analyticsDashboard) {
    analyticsDashboard = new AnalyticsDashboard();
  }
  return analyticsDashboard;
}

export function initializeAnalyticsDashboard() {
  return getAnalyticsDashboard();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAnalyticsDashboard();
  });
}

export default AnalyticsDashboard;
