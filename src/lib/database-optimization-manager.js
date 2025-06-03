/**
 * DigiClick AI Database Optimization Manager
 * MongoDB query optimization, indexing strategies, and performance monitoring
 * Integrates with existing backend systems and caching layers
 */

import { getRedisCacheManager } from './redis-cache-manager';

class DatabaseOptimizationManager {
  constructor() {
    this.cacheManager = null;
    this.queryCache = new Map();
    this.slowQueryThreshold = 1000; // 1 second
    this.queryMetrics = {
      totalQueries: 0,
      slowQueries: 0,
      cachedQueries: 0,
      averageResponseTime: 0,
      queryTypes: {}
    };
    
    this.indexingStrategies = {
      contacts: [
        { email: 1 },
        { createdAt: -1 },
        { 'metadata.source': 1 },
        { email: 1, createdAt: -1 } // Compound index
      ],
      demos: [
        { email: 1 },
        { scheduledDate: 1 },
        { status: 1 },
        { createdAt: -1 }
      ],
      newsletters: [
        { email: 1 },
        { subscribed: 1 },
        { createdAt: -1 }
      ],
      analytics: [
        { event: 1 },
        { timestamp: -1 },
        { userId: 1 },
        { event: 1, timestamp: -1 } // Compound index
      ],
      files: [
        { uploadId: 1 },
        { userId: 1 },
        { mimeType: 1 },
        { createdAt: -1 }
      ]
    };
    
    this.queryOptimizations = {
      pagination: {
        defaultLimit: 20,
        maxLimit: 100
      },
      aggregation: {
        allowDiskUse: true,
        maxTimeMS: 30000
      },
      connection: {
        poolSize: 10,
        bufferMaxEntries: 0,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    };
    
    this.init();
  }

  async init() {
    this.cacheManager = getRedisCacheManager();
    this.setupQueryMonitoring();
    this.setupEventListeners();
  }

  setupQueryMonitoring() {
    // Monitor query performance
    setInterval(() => {
      this.analyzeQueryPerformance();
    }, 60000); // Every minute
  }

  setupEventListeners() {
    // Listen for database operations
    window.addEventListener('database-query-executed', (e) => {
      this.recordQueryMetrics(e.detail);
    });

    // Listen for cache invalidation requests
    window.addEventListener('database-data-updated', (e) => {
      this.invalidateQueryCache(e.detail);
    });
  }

  // Query optimization methods
  optimizeQuery(collection, query, options = {}) {
    const optimizedQuery = { ...query };
    const optimizedOptions = { ...options };
    
    // Apply pagination limits
    if (optimizedOptions.limit && optimizedOptions.limit > this.queryOptimizations.pagination.maxLimit) {
      optimizedOptions.limit = this.queryOptimizations.pagination.maxLimit;
    }
    
    if (!optimizedOptions.limit) {
      optimizedOptions.limit = this.queryOptimizations.pagination.defaultLimit;
    }
    
    // Add query hints based on collection
    optimizedOptions.hint = this.getOptimalIndex(collection, optimizedQuery);
    
    // Set timeout
    optimizedOptions.maxTimeMS = optimizedOptions.maxTimeMS || 30000;
    
    return { query: optimizedQuery, options: optimizedOptions };
  }

  getOptimalIndex(collection, query) {
    const indexes = this.indexingStrategies[collection] || [];
    const queryFields = Object.keys(query);
    
    // Find the best matching index
    let bestIndex = null;
    let bestScore = 0;
    
    for (const index of indexes) {
      const indexFields = Object.keys(index);
      const matchingFields = queryFields.filter(field => indexFields.includes(field));
      const score = matchingFields.length / indexFields.length;
      
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
    
    return bestIndex;
  }

  // Caching methods
  async getCachedQuery(cacheKey) {
    try {
      return await this.cacheManager.get(cacheKey);
    } catch (error) {
      console.error('Failed to get cached query:', error);
      return null;
    }
  }

  async setCachedQuery(cacheKey, result, ttl = 300) {
    try {
      await this.cacheManager.set(cacheKey, result, ttl);
      this.queryMetrics.cachedQueries++;
    } catch (error) {
      console.error('Failed to cache query result:', error);
    }
  }

  generateQueryCacheKey(collection, query, options = {}) {
    const keyData = {
      collection,
      query: this.normalizeQuery(query),
      options: this.normalizeOptions(options)
    };
    
    return `db:query:${this.hashObject(keyData)}`;
  }

  normalizeQuery(query) {
    // Sort query fields for consistent cache keys
    const normalized = {};
    const sortedKeys = Object.keys(query).sort();
    
    for (const key of sortedKeys) {
      normalized[key] = query[key];
    }
    
    return normalized;
  }

  normalizeOptions(options) {
    // Extract only cache-relevant options
    const relevant = {};
    const relevantFields = ['limit', 'skip', 'sort', 'projection'];
    
    for (const field of relevantFields) {
      if (options[field] !== undefined) {
        relevant[field] = options[field];
      }
    }
    
    return relevant;
  }

  hashObject(obj) {
    const str = JSON.stringify(obj);
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  // Query execution wrapper
  async executeOptimizedQuery(collection, operation, query = {}, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateQueryCacheKey(collection, query, options);
    
    // Check cache for read operations
    if (['find', 'findOne', 'aggregate', 'count'].includes(operation)) {
      const cachedResult = await this.getCachedQuery(cacheKey);
      if (cachedResult) {
        this.recordQueryMetrics({
          collection,
          operation,
          responseTime: Date.now() - startTime,
          cached: true
        });
        return cachedResult;
      }
    }
    
    // Optimize query
    const { query: optimizedQuery, options: optimizedOptions } = this.optimizeQuery(collection, query, options);
    
    try {
      // Execute query (this would be the actual database call)
      const result = await this.simulateQueryExecution(collection, operation, optimizedQuery, optimizedOptions);
      
      const responseTime = Date.now() - startTime;
      
      // Cache result for read operations
      if (['find', 'findOne', 'aggregate', 'count'].includes(operation) && result) {
        const cacheTTL = this.getCacheTTL(collection, operation);
        await this.setCachedQuery(cacheKey, result, cacheTTL);
      }
      
      // Invalidate cache for write operations
      if (['insert', 'update', 'delete', 'replace'].includes(operation)) {
        await this.invalidateCollectionCache(collection);
      }
      
      this.recordQueryMetrics({
        collection,
        operation,
        responseTime,
        cached: false,
        optimized: true
      });
      
      return result;
      
    } catch (error) {
      this.recordQueryMetrics({
        collection,
        operation,
        responseTime: Date.now() - startTime,
        error: true
      });
      throw error;
    }
  }

  async simulateQueryExecution(collection, operation, query, options) {
    // Simulate database query execution
    // In a real implementation, this would call the actual MongoDB driver
    
    const delay = Math.random() * 100 + 50; // 50-150ms simulated delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Return mock data based on operation
    switch (operation) {
      case 'find':
        return this.generateMockResults(collection, query, options);
      case 'findOne':
        return this.generateMockResult(collection, query);
      case 'count':
        return Math.floor(Math.random() * 1000);
      case 'aggregate':
        return this.generateMockAggregationResults(collection, query);
      case 'insert':
        return { insertedId: this.generateObjectId(), acknowledged: true };
      case 'update':
        return { modifiedCount: 1, acknowledged: true };
      case 'delete':
        return { deletedCount: 1, acknowledged: true };
      default:
        return null;
    }
  }

  generateMockResults(collection, query, options) {
    const limit = options.limit || 20;
    const results = [];
    
    for (let i = 0; i < limit; i++) {
      results.push(this.generateMockResult(collection, query));
    }
    
    return results;
  }

  generateMockResult(collection, query) {
    const baseResult = {
      _id: this.generateObjectId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    switch (collection) {
      case 'contacts':
        return {
          ...baseResult,
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Sample contact message',
          status: 'new'
        };
      case 'demos':
        return {
          ...baseResult,
          email: 'demo@example.com',
          scheduledDate: new Date(),
          status: 'scheduled',
          type: 'product-demo'
        };
      case 'newsletters':
        return {
          ...baseResult,
          email: 'newsletter@example.com',
          subscribed: true,
          preferences: ['ai-updates', 'product-news']
        };
      case 'analytics':
        return {
          ...baseResult,
          event: 'page_view',
          userId: 'user123',
          metadata: { page: '/home' }
        };
      default:
        return baseResult;
    }
  }

  generateMockAggregationResults(collection, pipeline) {
    // Generate mock aggregation results
    return [
      { _id: 'group1', count: 25, total: 1250 },
      { _id: 'group2', count: 15, total: 750 },
      { _id: 'group3', count: 10, total: 500 }
    ];
  }

  generateObjectId() {
    return Math.random().toString(36).substr(2, 24);
  }

  getCacheTTL(collection, operation) {
    const ttlMap = {
      contacts: 300, // 5 minutes
      demos: 600, // 10 minutes
      newsletters: 1800, // 30 minutes
      analytics: 3600, // 1 hour
      files: 1800 // 30 minutes
    };
    
    return ttlMap[collection] || 300;
  }

  async invalidateCollectionCache(collection) {
    await this.cacheManager.invalidatePattern(`db:query:*${collection}*`);
    console.log(`Invalidated cache for collection: ${collection}`);
  }

  async invalidateQueryCache(details) {
    const { collection, operation, query } = details;
    
    if (operation && ['insert', 'update', 'delete'].includes(operation)) {
      await this.invalidateCollectionCache(collection);
    }
  }

  recordQueryMetrics(metrics) {
    this.queryMetrics.totalQueries++;
    
    if (metrics.responseTime > this.slowQueryThreshold) {
      this.queryMetrics.slowQueries++;
    }
    
    if (metrics.cached) {
      this.queryMetrics.cachedQueries++;
    }
    
    // Update average response time
    this.queryMetrics.averageResponseTime = 
      (this.queryMetrics.averageResponseTime * (this.queryMetrics.totalQueries - 1) + metrics.responseTime) / 
      this.queryMetrics.totalQueries;
    
    // Track query types
    const queryType = `${metrics.collection}:${metrics.operation}`;
    this.queryMetrics.queryTypes[queryType] = (this.queryMetrics.queryTypes[queryType] || 0) + 1;
    
    // Dispatch metrics event
    window.dispatchEvent(new CustomEvent('database-metrics-updated', {
      detail: { ...metrics, totalMetrics: this.queryMetrics }
    }));
  }

  analyzeQueryPerformance() {
    const analysis = {
      totalQueries: this.queryMetrics.totalQueries,
      slowQueryRate: this.queryMetrics.totalQueries > 0 ? 
        (this.queryMetrics.slowQueries / this.queryMetrics.totalQueries * 100).toFixed(2) : 0,
      cacheHitRate: this.queryMetrics.totalQueries > 0 ? 
        (this.queryMetrics.cachedQueries / this.queryMetrics.totalQueries * 100).toFixed(2) : 0,
      averageResponseTime: this.queryMetrics.averageResponseTime.toFixed(2),
      topQueryTypes: this.getTopQueryTypes(),
      recommendations: this.generateOptimizationRecommendations()
    };
    
    console.log('Database Performance Analysis:', analysis);
    
    // Dispatch analysis event
    window.dispatchEvent(new CustomEvent('database-analysis-complete', {
      detail: analysis
    }));
    
    return analysis;
  }

  getTopQueryTypes() {
    return Object.entries(this.queryMetrics.queryTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  generateOptimizationRecommendations() {
    const recommendations = [];
    
    if (this.queryMetrics.slowQueries / this.queryMetrics.totalQueries > 0.1) {
      recommendations.push('Consider adding more indexes for frequently queried fields');
    }
    
    if (this.queryMetrics.cachedQueries / this.queryMetrics.totalQueries < 0.3) {
      recommendations.push('Increase cache TTL for read-heavy operations');
    }
    
    if (this.queryMetrics.averageResponseTime > 500) {
      recommendations.push('Review query complexity and consider pagination');
    }
    
    return recommendations;
  }

  // Public API methods
  async findOptimized(collection, query = {}, options = {}) {
    return await this.executeOptimizedQuery(collection, 'find', query, options);
  }

  async findOneOptimized(collection, query = {}, options = {}) {
    return await this.executeOptimizedQuery(collection, 'findOne', query, options);
  }

  async countOptimized(collection, query = {}) {
    return await this.executeOptimizedQuery(collection, 'count', query);
  }

  async aggregateOptimized(collection, pipeline = [], options = {}) {
    return await this.executeOptimizedQuery(collection, 'aggregate', pipeline, options);
  }

  async insertOptimized(collection, document) {
    return await this.executeOptimizedQuery(collection, 'insert', document);
  }

  async updateOptimized(collection, query, update, options = {}) {
    return await this.executeOptimizedQuery(collection, 'update', { query, update }, options);
  }

  async deleteOptimized(collection, query) {
    return await this.executeOptimizedQuery(collection, 'delete', query);
  }

  getPerformanceMetrics() {
    return { ...this.queryMetrics };
  }

  getIndexingStrategies() {
    return { ...this.indexingStrategies };
  }

  updateIndexingStrategy(collection, indexes) {
    this.indexingStrategies[collection] = indexes;
  }

  setSlowQueryThreshold(threshold) {
    this.slowQueryThreshold = threshold;
  }

  clearQueryCache() {
    this.queryCache.clear();
  }
}

// Create global instance
let databaseOptimizationManager = null;

export function getDatabaseOptimizationManager() {
  if (!databaseOptimizationManager) {
    databaseOptimizationManager = new DatabaseOptimizationManager();
  }
  return databaseOptimizationManager;
}

export function initializeDatabaseOptimization() {
  return getDatabaseOptimizationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeDatabaseOptimization();
  });
}

export default DatabaseOptimizationManager;
