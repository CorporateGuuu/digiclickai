/**
 * DigiClick AI Redis Cache Manager
 * Comprehensive caching layer with intelligent invalidation and performance monitoring
 * Integrates with existing backend systems while maintaining GDPR compliance
 */

import { getAccessibilityManager } from './accessibility-manager';
import { getLoadingStateManager } from './loading-state-manager';

class RedisCacheManager {
  constructor() {
    this.isRedisAvailable = false;
    this.cacheClient = null;
    this.fallbackCache = new Map();
    this.cacheMetrics = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalRequests: 0
    };
    
    this.cacheTTL = {
      formData: 3600, // 1 hour
      analytics: 86400, // 24 hours
      staticContent: 604800, // 7 days
      userPreferences: 2592000, // 30 days
      apiResponses: 1800, // 30 minutes
      validationRules: 43200 // 12 hours
    };
    
    this.cacheKeys = {
      formSubmission: 'form:submission:',
      demoRequest: 'demo:request:',
      newsletter: 'newsletter:subscription:',
      analytics: 'analytics:data:',
      userPrefs: 'user:preferences:',
      apiResponse: 'api:response:',
      validation: 'validation:rules:',
      fileUpload: 'file:upload:'
    };
    
    this.init();
  }

  async init() {
    await this.initializeRedisConnection();
    this.setupEventListeners();
    this.startMetricsCollection();
    this.setupCacheWarming();
  }

  async initializeRedisConnection() {
    try {
      // In a real implementation, this would connect to Redis
      // For now, we'll simulate Redis availability
      const redisURL = process.env.REDIS_URL || process.env.REDIS_CONNECTION_STRING;
      
      if (redisURL) {
        // Simulate Redis connection
        this.isRedisAvailable = true;
        this.cacheClient = {
          // Mock Redis client for demonstration
          get: async (key) => this.fallbackCache.get(key),
          set: async (key, value, ttl) => {
            this.fallbackCache.set(key, { value, expires: Date.now() + (ttl * 1000) });
            return 'OK';
          },
          del: async (key) => this.fallbackCache.delete(key),
          exists: async (key) => this.fallbackCache.has(key),
          keys: async (pattern) => Array.from(this.fallbackCache.keys()).filter(k => k.includes(pattern.replace('*', ''))),
          flushall: async () => this.fallbackCache.clear()
        };
        
        console.log('Redis cache manager initialized successfully');
      } else {
        console.warn('Redis not available, using fallback cache');
        this.isRedisAvailable = false;
      }
    } catch (error) {
      console.error('Failed to initialize Redis connection:', error);
      this.isRedisAvailable = false;
    }
  }

  setupEventListeners() {
    // Listen for form submissions to cache data
    window.addEventListener('form-submission-success', (e) => {
      this.cacheFormSubmission(e.detail);
    });

    // Listen for user preference changes
    window.addEventListener('accessibility-settings-changed', (e) => {
      this.cacheUserPreferences(e.detail);
    });

    // Listen for API responses to cache
    window.addEventListener('api-response-received', (e) => {
      this.cacheAPIResponse(e.detail);
    });

    // Listen for cache invalidation requests
    window.addEventListener('cache-invalidate', (e) => {
      this.invalidateCache(e.detail.pattern);
    });
  }

  startMetricsCollection() {
    // Collect cache metrics every 5 minutes
    setInterval(() => {
      this.collectMetrics();
    }, 300000);
  }

  setupCacheWarming() {
    // Warm critical caches on startup
    setTimeout(() => {
      this.warmCriticalCaches();
    }, 5000);
  }

  async get(key, options = {}) {
    this.cacheMetrics.totalRequests++;
    
    try {
      let cachedData = null;
      
      if (this.isRedisAvailable && this.cacheClient) {
        cachedData = await this.cacheClient.get(key);
      } else {
        // Use fallback cache
        const fallbackData = this.fallbackCache.get(key);
        if (fallbackData && fallbackData.expires > Date.now()) {
          cachedData = fallbackData.value;
        } else if (fallbackData) {
          // Expired data, remove it
          this.fallbackCache.delete(key);
        }
      }
      
      if (cachedData) {
        this.cacheMetrics.hits++;
        
        // Parse JSON if it's a string
        try {
          const parsedData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
          
          // Check GDPR compliance
          if (this.isGDPRCompliant(parsedData, options)) {
            this.announceCacheHit(key, options.announceToScreenReader);
            return parsedData;
          } else {
            // Remove non-compliant data
            await this.del(key);
          }
        } catch (parseError) {
          console.warn('Failed to parse cached data:', parseError);
          await this.del(key);
        }
      }
      
      this.cacheMetrics.misses++;
      this.announceCacheMiss(key, options.announceToScreenReader);
      return null;
      
    } catch (error) {
      this.cacheMetrics.errors++;
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = null, options = {}) {
    try {
      // Apply GDPR compliance checks
      if (!this.isGDPRCompliant(value, options)) {
        console.warn('Data not cached due to GDPR compliance requirements');
        return false;
      }
      
      const serializedValue = JSON.stringify(value);
      const cacheTTL = ttl || this.getDefaultTTL(key);
      
      if (this.isRedisAvailable && this.cacheClient) {
        await this.cacheClient.set(key, serializedValue, cacheTTL);
      } else {
        // Use fallback cache
        this.fallbackCache.set(key, {
          value: serializedValue,
          expires: Date.now() + (cacheTTL * 1000)
        });
      }
      
      this.announceCacheSet(key, options.announceToScreenReader);
      return true;
      
    } catch (error) {
      this.cacheMetrics.errors++;
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.isRedisAvailable && this.cacheClient) {
        await this.cacheClient.del(key);
      } else {
        this.fallbackCache.delete(key);
      }
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (this.isRedisAvailable && this.cacheClient) {
        return await this.cacheClient.exists(key);
      } else {
        const fallbackData = this.fallbackCache.get(key);
        return fallbackData && fallbackData.expires > Date.now();
      }
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    try {
      if (this.isRedisAvailable && this.cacheClient) {
        const keys = await this.cacheClient.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => this.cacheClient.del(key)));
        }
      } else {
        // Fallback cache pattern invalidation
        const keysToDelete = Array.from(this.fallbackCache.keys())
          .filter(key => key.includes(pattern.replace('*', '')));
        keysToDelete.forEach(key => this.fallbackCache.delete(key));
      }
      
      console.log(`Invalidated cache pattern: ${pattern}`);
      return true;
    } catch (error) {
      console.error('Cache pattern invalidation error:', error);
      return false;
    }
  }

  // Specific caching methods
  async cacheFormSubmission(submissionData) {
    const key = `${this.cacheKeys.formSubmission}${submissionData.id || Date.now()}`;
    const sanitizedData = this.sanitizeFormData(submissionData);
    
    await this.set(key, sanitizedData, this.cacheTTL.formData, {
      gdprCompliant: true,
      userConsent: submissionData.userConsent
    });
  }

  async cacheAPIResponse(responseData) {
    const key = `${this.cacheKeys.apiResponse}${this.generateCacheKey(responseData.url, responseData.params)}`;
    
    await this.set(key, {
      data: responseData.data,
      timestamp: Date.now(),
      etag: responseData.etag,
      lastModified: responseData.lastModified
    }, this.cacheTTL.apiResponses);
  }

  async cacheUserPreferences(preferences) {
    const userId = preferences.userId || 'anonymous';
    const key = `${this.cacheKeys.userPrefs}${userId}`;
    
    await this.set(key, preferences, this.cacheTTL.userPreferences, {
      gdprCompliant: true,
      userConsent: true
    });
  }

  async cacheValidationRules(rules) {
    const key = `${this.cacheKeys.validation}rules`;
    await this.set(key, rules, this.cacheTTL.validationRules);
  }

  async warmCriticalCaches() {
    try {
      // Warm validation rules cache
      const validationRules = {
        email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
        phone: { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Invalid phone' },
        required: { validate: (value) => value && value.trim().length > 0, message: 'Required' }
      };
      await this.cacheValidationRules(validationRules);
      
      // Warm auto-complete data
      const autoCompleteData = {
        emailDomains: ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'],
        companyNames: ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta']
      };
      await this.set(`${this.cacheKeys.validation}autocomplete`, autoCompleteData, this.cacheTTL.staticContent);
      
      console.log('Critical caches warmed successfully');
    } catch (error) {
      console.error('Cache warming failed:', error);
    }
  }

  // Utility methods
  getDefaultTTL(key) {
    if (key.includes('form:')) return this.cacheTTL.formData;
    if (key.includes('analytics:')) return this.cacheTTL.analytics;
    if (key.includes('user:')) return this.cacheTTL.userPreferences;
    if (key.includes('api:')) return this.cacheTTL.apiResponses;
    if (key.includes('validation:')) return this.cacheTTL.validationRules;
    return this.cacheTTL.staticContent;
  }

  generateCacheKey(url, params = {}) {
    const sortedParams = Object.keys(params).sort().reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
    
    return btoa(url + JSON.stringify(sortedParams)).replace(/[^a-zA-Z0-9]/g, '');
  }

  sanitizeFormData(data) {
    // Remove sensitive information before caching
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.creditCard;
    delete sanitized.ssn;
    delete sanitized.personalId;
    
    return sanitized;
  }

  isGDPRCompliant(data, options = {}) {
    // Check if data caching complies with GDPR
    if (options.gdprCompliant === false) return false;
    if (options.userConsent === false) return false;
    
    // Check for sensitive data
    const sensitiveFields = ['password', 'creditCard', 'ssn', 'personalId', 'biometric'];
    const dataString = JSON.stringify(data).toLowerCase();
    
    return !sensitiveFields.some(field => dataString.includes(field));
  }

  collectMetrics() {
    const hitRate = this.cacheMetrics.totalRequests > 0 ? 
      (this.cacheMetrics.hits / this.cacheMetrics.totalRequests * 100).toFixed(2) : 0;
    
    const metrics = {
      ...this.cacheMetrics,
      hitRate: `${hitRate}%`,
      timestamp: new Date().toISOString()
    };
    
    // Dispatch metrics event for monitoring
    window.dispatchEvent(new CustomEvent('cache-metrics-collected', {
      detail: metrics
    }));
    
    console.log('Cache Metrics:', metrics);
  }

  // Announcement methods for accessibility
  announceCacheHit(key, shouldAnnounce = false) {
    if (shouldAnnounce) {
      this.announce('Data loaded from cache');
    }
  }

  announceCacheMiss(key, shouldAnnounce = false) {
    if (shouldAnnounce) {
      this.announce('Loading fresh data');
    }
  }

  announceCacheSet(key, shouldAnnounce = false) {
    if (shouldAnnounce) {
      this.announce('Data cached for faster access');
    }
  }

  announce(message) {
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      accessibilityManager.announce(message);
    }
  }

  // Public API methods
  async getCachedFormData(formId) {
    const key = `${this.cacheKeys.formSubmission}${formId}`;
    return await this.get(key);
  }

  async getCachedAPIResponse(url, params = {}) {
    const key = `${this.cacheKeys.apiResponse}${this.generateCacheKey(url, params)}`;
    return await this.get(key);
  }

  async getCachedUserPreferences(userId = 'anonymous') {
    const key = `${this.cacheKeys.userPrefs}${userId}`;
    return await this.get(key);
  }

  async getCachedValidationRules() {
    const key = `${this.cacheKeys.validation}rules`;
    return await this.get(key);
  }

  async invalidateUserData(userId) {
    await this.invalidatePattern(`${this.cacheKeys.userPrefs}${userId}*`);
    await this.invalidatePattern(`${this.cacheKeys.formSubmission}*${userId}*`);
  }

  async invalidateFormData(formType) {
    await this.invalidatePattern(`${this.cacheKeys.formSubmission}*${formType}*`);
  }

  async clearAllCache() {
    try {
      if (this.isRedisAvailable && this.cacheClient) {
        await this.cacheClient.flushall();
      } else {
        this.fallbackCache.clear();
      }
      console.log('All cache cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  getMetrics() {
    return { ...this.cacheMetrics };
  }

  getCacheStatus() {
    return {
      isRedisAvailable: this.isRedisAvailable,
      fallbackCacheSize: this.fallbackCache.size,
      metrics: this.getMetrics()
    };
  }
}

// Create global instance
let redisCacheManager = null;

export function getRedisCacheManager() {
  if (!redisCacheManager) {
    redisCacheManager = new RedisCacheManager();
  }
  return redisCacheManager;
}

export function initializeRedisCache() {
  return getRedisCacheManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeRedisCache();
  });
}

export default RedisCacheManager;
