/**
 * DigiClick AI API Cache Manager
 * Intelligent API response caching with smart invalidation and conditional requests
 * Integrates with existing backend integration manager and Redis cache
 */

import { getRedisCacheManager } from './redis-cache-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';

class APICacheManager {
  constructor() {
    this.cacheManager = null;
    this.backendManager = null;
    this.cacheStrategies = {
      GET: 'cache-first', // Try cache first, then network
      POST: 'network-only', // Always go to network
      PUT: 'network-first', // Network first, update cache
      DELETE: 'network-only' // Always go to network, invalidate cache
    };
    
    this.cacheDurations = {
      '/api/contact': 0, // Don't cache contact submissions
      '/api/demo': 0, // Don't cache demo requests
      '/api/newsletter': 300, // 5 minutes
      '/api/analytics': 1800, // 30 minutes
      '/api/services': 3600, // 1 hour
      '/api/pricing': 3600, // 1 hour
      '/api/team': 86400, // 24 hours
      '/api/testimonials': 3600, // 1 hour
      '/api/blog': 1800, // 30 minutes
      '/api/faq': 86400 // 24 hours
    };
    
    this.compressionEnabled = true;
    this.etagSupport = true;
    this.conditionalRequests = true;
    
    this.init();
  }

  async init() {
    this.cacheManager = getRedisCacheManager();
    this.backendManager = getBackendIntegrationManager();
    this.setupInterceptors();
    this.setupEventListeners();
  }

  setupInterceptors() {
    // Intercept API requests to add caching logic
    if (typeof window !== 'undefined') {
      this.originalFetch = window.fetch;
      window.fetch = this.cachedFetch.bind(this);
    }
  }

  setupEventListeners() {
    // Listen for cache invalidation events
    window.addEventListener('api-data-updated', (e) => {
      this.invalidateRelatedCache(e.detail);
    });

    // Listen for user logout to clear user-specific cache
    window.addEventListener('user-logout', () => {
      this.clearUserSpecificCache();
    });

    // Listen for cache warming requests
    window.addEventListener('cache-warm-request', (e) => {
      this.warmCache(e.detail.endpoints);
    });
  }

  async cachedFetch(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const strategy = this.cacheStrategies[method];
    
    // Generate cache key
    const cacheKey = this.generateCacheKey(url, options);
    
    switch (strategy) {
      case 'cache-first':
        return await this.cacheFirstStrategy(url, options, cacheKey);
      case 'network-first':
        return await this.networkFirstStrategy(url, options, cacheKey);
      case 'network-only':
        return await this.networkOnlyStrategy(url, options, cacheKey);
      default:
        return await this.originalFetch(url, options);
    }
  }

  async cacheFirstStrategy(url, options, cacheKey) {
    try {
      // Try to get from cache first
      const cachedResponse = await this.getCachedResponse(cacheKey);
      
      if (cachedResponse && this.isCacheValid(cachedResponse)) {
        // Add conditional request headers if supported
        if (this.conditionalRequests && cachedResponse.etag) {
          options.headers = {
            ...options.headers,
            'If-None-Match': cachedResponse.etag
          };
        }
        
        if (this.conditionalRequests && cachedResponse.lastModified) {
          options.headers = {
            ...options.headers,
            'If-Modified-Since': cachedResponse.lastModified
          };
        }
        
        // Make conditional request
        const response = await this.originalFetch(url, options);
        
        if (response.status === 304) {
          // Not modified, return cached data
          return this.createResponseFromCache(cachedResponse);
        } else {
          // Modified, cache new response and return it
          await this.cacheResponse(cacheKey, response.clone());
          return response;
        }
      } else {
        // No cache or invalid, make network request
        const response = await this.originalFetch(url, options);
        
        if (response.ok) {
          await this.cacheResponse(cacheKey, response.clone());
        }
        
        return response;
      }
    } catch (error) {
      // Network error, try to return stale cache if available
      const staleCache = await this.getCachedResponse(cacheKey);
      if (staleCache) {
        console.warn('Network error, returning stale cache:', error);
        return this.createResponseFromCache(staleCache);
      }
      throw error;
    }
  }

  async networkFirstStrategy(url, options, cacheKey) {
    try {
      // Try network first
      const response = await this.originalFetch(url, options);
      
      if (response.ok) {
        // Cache successful response
        await this.cacheResponse(cacheKey, response.clone());
        
        // Invalidate related cache if this was a mutation
        if (['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase())) {
          await this.invalidateRelatedCache({ url, method: options.method });
        }
      }
      
      return response;
    } catch (error) {
      // Network failed, try cache as fallback
      const cachedResponse = await this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.warn('Network failed, returning cached response:', error);
        return this.createResponseFromCache(cachedResponse);
      }
      throw error;
    }
  }

  async networkOnlyStrategy(url, options, cacheKey) {
    const response = await this.originalFetch(url, options);
    
    // Invalidate cache for mutations
    if (['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase())) {
      await this.invalidateRelatedCache({ url, method: options.method });
    }
    
    return response;
  }

  async getCachedResponse(cacheKey) {
    try {
      return await this.cacheManager.get(cacheKey);
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  async cacheResponse(cacheKey, response) {
    try {
      const url = response.url;
      const cacheDuration = this.getCacheDuration(url);
      
      if (cacheDuration === 0) {
        return; // Don't cache
      }
      
      // Extract response data
      const responseData = {
        status: response.status,
        statusText: response.statusText,
        headers: this.extractHeaders(response),
        body: await response.text(),
        timestamp: Date.now(),
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
        cacheControl: response.headers.get('cache-control')
      };
      
      // Compress if enabled
      if (this.compressionEnabled) {
        responseData.body = this.compressData(responseData.body);
        responseData.compressed = true;
      }
      
      await this.cacheManager.set(cacheKey, responseData, cacheDuration);
      
      // Dispatch cache event
      window.dispatchEvent(new CustomEvent('api-response-cached', {
        detail: { url, cacheKey, size: responseData.body.length }
      }));
      
    } catch (error) {
      console.error('Failed to cache response:', error);
    }
  }

  createResponseFromCache(cachedData) {
    let body = cachedData.body;
    
    // Decompress if needed
    if (cachedData.compressed) {
      body = this.decompressData(body);
    }
    
    const response = new Response(body, {
      status: cachedData.status,
      statusText: cachedData.statusText,
      headers: cachedData.headers
    });
    
    // Add cache headers
    response.headers.set('X-Cache', 'HIT');
    response.headers.set('X-Cache-Date', new Date(cachedData.timestamp).toISOString());
    
    return response;
  }

  generateCacheKey(url, options = {}) {
    const method = options.method || 'GET';
    const headers = this.normalizeHeaders(options.headers || {});
    const body = options.body || '';
    
    // Create a unique key based on URL, method, relevant headers, and body
    const keyData = {
      url: url.split('?')[0], // Remove query params for base URL
      method,
      headers: this.getRelevantHeaders(headers),
      body: method !== 'GET' ? body : undefined,
      query: this.extractQueryParams(url)
    };
    
    return `api:${this.hashObject(keyData)}`;
  }

  getCacheDuration(url) {
    // Extract path from URL
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    
    // Check for exact match
    if (this.cacheDurations[path] !== undefined) {
      return this.cacheDurations[path];
    }
    
    // Check for pattern matches
    for (const pattern in this.cacheDurations) {
      if (path.startsWith(pattern)) {
        return this.cacheDurations[pattern];
      }
    }
    
    // Default cache duration
    return 300; // 5 minutes
  }

  isCacheValid(cachedData) {
    const now = Date.now();
    const cacheAge = now - cachedData.timestamp;
    const maxAge = this.getMaxAgeFromCacheControl(cachedData.cacheControl) * 1000;
    
    return cacheAge < maxAge;
  }

  getMaxAgeFromCacheControl(cacheControl) {
    if (!cacheControl) return 300; // Default 5 minutes
    
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    return maxAgeMatch ? parseInt(maxAgeMatch[1]) : 300;
  }

  extractHeaders(response) {
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key] = value;
    }
    return headers;
  }

  normalizeHeaders(headers) {
    const normalized = {};
    for (const [key, value] of Object.entries(headers)) {
      normalized[key.toLowerCase()] = value;
    }
    return normalized;
  }

  getRelevantHeaders(headers) {
    // Only include headers that affect caching
    const relevantHeaders = ['authorization', 'accept', 'content-type'];
    const relevant = {};
    
    for (const header of relevantHeaders) {
      if (headers[header]) {
        relevant[header] = headers[header];
      }
    }
    
    return relevant;
  }

  extractQueryParams(url) {
    const urlObj = new URL(url, window.location.origin);
    const params = {};
    
    for (const [key, value] of urlObj.searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }

  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  compressData(data) {
    // Simple compression simulation (in real implementation, use proper compression)
    try {
      return btoa(data);
    } catch (error) {
      return data;
    }
  }

  decompressData(data) {
    // Simple decompression simulation
    try {
      return atob(data);
    } catch (error) {
      return data;
    }
  }

  async invalidateRelatedCache(details) {
    const { url, method } = details;
    const urlObj = new URL(url, window.location.origin);
    const basePath = urlObj.pathname.split('/').slice(0, 3).join('/'); // e.g., /api/contact
    
    // Invalidate all cache entries for this API endpoint
    await this.cacheManager.invalidatePattern(`api:*${basePath}*`);
    
    // Invalidate related endpoints based on the operation
    const relatedEndpoints = this.getRelatedEndpoints(basePath, method);
    for (const endpoint of relatedEndpoints) {
      await this.cacheManager.invalidatePattern(`api:*${endpoint}*`);
    }
    
    console.log(`Invalidated cache for ${basePath} and related endpoints`);
  }

  getRelatedEndpoints(basePath, method) {
    const related = [];
    
    // Define relationships between endpoints
    const relationships = {
      '/api/contact': ['/api/analytics'],
      '/api/demo': ['/api/analytics'],
      '/api/newsletter': ['/api/analytics'],
      '/api/services': ['/api/pricing'],
      '/api/team': ['/api/services'],
      '/api/blog': ['/api/analytics']
    };
    
    if (relationships[basePath]) {
      related.push(...relationships[basePath]);
    }
    
    return related;
  }

  async clearUserSpecificCache() {
    // Clear cache entries that might contain user-specific data
    await this.cacheManager.invalidatePattern('api:*user*');
    await this.cacheManager.invalidatePattern('api:*profile*');
    await this.cacheManager.invalidatePattern('api:*preferences*');
  }

  async warmCache(endpoints = []) {
    const defaultEndpoints = [
      '/api/services',
      '/api/pricing',
      '/api/team',
      '/api/testimonials',
      '/api/faq'
    ];
    
    const endpointsToWarm = endpoints.length > 0 ? endpoints : defaultEndpoints;
    
    for (const endpoint of endpointsToWarm) {
      try {
        const fullUrl = `${window.location.origin}${endpoint}`;
        await this.originalFetch(fullUrl);
        console.log(`Warmed cache for ${endpoint}`);
      } catch (error) {
        console.warn(`Failed to warm cache for ${endpoint}:`, error);
      }
    }
  }

  // Public API methods
  async preloadEndpoint(endpoint) {
    try {
      const fullUrl = `${window.location.origin}${endpoint}`;
      await fetch(fullUrl);
      return true;
    } catch (error) {
      console.error(`Failed to preload ${endpoint}:`, error);
      return false;
    }
  }

  async invalidateEndpoint(endpoint) {
    await this.cacheManager.invalidatePattern(`api:*${endpoint}*`);
  }

  setCacheDuration(endpoint, duration) {
    this.cacheDurations[endpoint] = duration;
  }

  setCacheStrategy(method, strategy) {
    if (['cache-first', 'network-first', 'network-only'].includes(strategy)) {
      this.cacheStrategies[method.toUpperCase()] = strategy;
    }
  }

  enableCompression() {
    this.compressionEnabled = true;
  }

  disableCompression() {
    this.compressionEnabled = false;
  }

  enableConditionalRequests() {
    this.conditionalRequests = true;
  }

  disableConditionalRequests() {
    this.conditionalRequests = false;
  }

  getCacheStats() {
    return {
      strategies: this.cacheStrategies,
      durations: this.cacheDurations,
      compressionEnabled: this.compressionEnabled,
      conditionalRequests: this.conditionalRequests,
      etagSupport: this.etagSupport
    };
  }
}

// Create global instance
let apiCacheManager = null;

export function getAPICacheManager() {
  if (!apiCacheManager) {
    apiCacheManager = new APICacheManager();
  }
  return apiCacheManager;
}

export function initializeAPICache() {
  return getAPICacheManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAPICache();
  });
}

export default APICacheManager;
