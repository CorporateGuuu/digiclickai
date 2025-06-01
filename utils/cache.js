const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error
      console.error('Redis server refused connection');
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout
      console.error('Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      console.error('Redis max retries reached');
      return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

// Handle Redis client errors
client.on('error', (err) => {
  console.error('Redis error:', err);
});

// Promisify Redis commands
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);
const flushAsync = promisify(client.flushall).bind(client);

// Cache middleware
const cache = (key, expiryInSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      // Check if data exists in cache
      const cachedData = await getAsync(key);
      
      if (cachedData) {
        // Return cached data
        return res.json(JSON.parse(cachedData));
      }
      
      // Store original res.json method
      const originalJson = res.json;
      
      // Override res.json method
      res.json = function(data) {
        // Store data in cache
        setAsync(key, JSON.stringify(data), 'EX', expiryInSeconds)
          .catch(err => console.error('Redis cache error:', err));
        
        // Call original res.json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache function for direct use
const cacheData = async (key, data, expiryInSeconds = 3600) => {
  try {
    await setAsync(key, JSON.stringify(data), 'EX', expiryInSeconds);
    return true;
  } catch (error) {
    console.error('Cache data error:', error);
    return false;
  }
};

// Get cached data
const getCachedData = async (key) => {
  try {
    const data = await getAsync(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Get cached data error:', error);
    return null;
  }
};

// Clear cache for a specific key
const clearCache = async (key) => {
  try {
    await delAsync(key);
    return true;
  } catch (error) {
    console.error('Clear cache error:', error);
    return false;
  }
};

// Clear all cache
const clearAllCache = async () => {
  try {
    await flushAsync();
    return true;
  } catch (error) {
    console.error('Clear all cache error:', error);
    return false;
  }
};

module.exports = {
  client,
  cache,
  cacheData,
  getCachedData,
  clearCache,
  clearAllCache
};
