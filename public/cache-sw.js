/**
 * DigiClick AI Advanced Caching Service Worker
 * Complements the existing Workbox service worker with advanced caching strategies
 * Integrates with the caching infrastructure for optimal performance
 */

const ADVANCED_CACHE_NAME = 'digiclick-advanced-cache-v1.0.0';
const API_CACHE_NAME = 'digiclick-api-cache-v1.0.0';
const PERFORMANCE_CACHE_NAME = 'digiclick-performance-cache-v1.0.0';

// Advanced caching strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Resource patterns and their caching strategies
const ADVANCED_CACHING_RULES = [
  {
    pattern: /\/api\/(services|pricing|team|testimonials|faq)/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: API_CACHE_NAME,
    maxAge: 3600 // 1 hour
  },
  {
    pattern: /\/api\/analytics/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: API_CACHE_NAME,
    maxAge: 1800 // 30 minutes
  },
  {
    pattern: /\.(woff2?|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: ADVANCED_CACHE_NAME,
    maxAge: 86400 * 365 // 1 year
  }
];

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  totalRequests: 0
};

// Install event
self.addEventListener('install', (event) => {
  console.log('Advanced Cache Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Advanced Cache Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch event - handle advanced caching
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Find matching advanced caching rule
  const rule = findAdvancedCachingRule(request.url);
  
  if (rule) {
    event.respondWith(handleAdvancedRequest(request, rule));
  }
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'GET_PERFORMANCE_METRICS':
      event.ports[0].postMessage({
        type: 'PERFORMANCE_METRICS',
        payload: performanceMetrics
      });
      break;
      
    case 'CLEAR_ADVANCED_CACHE':
      clearAdvancedCache(payload.cacheName);
      break;
      
    case 'WARM_CACHE':
      warmCache(payload.urls);
      break;
      
    case 'INVALIDATE_PATTERN':
      invalidatePattern(payload.pattern);
      break;
  }
});

// Find the appropriate advanced caching rule for a URL
function findAdvancedCachingRule(url) {
  return ADVANCED_CACHING_RULES.find(rule => rule.pattern.test(url));
}

// Handle request with advanced caching strategy
async function handleAdvancedRequest(request, rule) {
  performanceMetrics.totalRequests++;
  
  const { strategy, cache: cacheName, maxAge } = rule;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return advancedCacheFirst(request, cacheName, maxAge);
      
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return advancedNetworkFirst(request, cacheName, maxAge);
      
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return advancedStaleWhileRevalidate(request, cacheName, maxAge);
      
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return advancedNetworkOnly(request);
      
    default:
      return fetch(request);
  }
}

// Advanced Cache First strategy
async function advancedCacheFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isAdvancedExpired(cachedResponse, maxAge)) {
    performanceMetrics.cacheHits++;
    notifyMainThread('ADVANCED_CACHE_HIT', { url: request.url, cache: cacheName });
    return cachedResponse;
  }
  
  try {
    performanceMetrics.networkRequests++;
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    performanceMetrics.cacheMisses++;
    
    // Network failed, return stale cache if available
    if (cachedResponse) {
      console.warn('Network failed, returning stale cache for:', request.url);
      notifyMainThread('ADVANCED_CACHE_FALLBACK', { url: request.url, cache: cacheName });
      return cachedResponse;
    }
    throw error;
  }
}

// Advanced Network First strategy
async function advancedNetworkFirst(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  
  try {
    performanceMetrics.networkRequests++;
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
    }
    
    return networkResponse;
  } catch (error) {
    performanceMetrics.cacheMisses++;
    
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.warn('Network failed, returning cached response for:', request.url);
      notifyMainThread('ADVANCED_CACHE_FALLBACK', { url: request.url, cache: cacheName });
      return cachedResponse;
    }
    
    throw error;
  }
}

// Advanced Stale While Revalidate strategy
async function advancedStaleWhileRevalidate(request, cacheName, maxAge) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Start network request (don't await)
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, responseToCache);
      notifyMainThread('ADVANCED_CACHE_UPDATED', { url: request.url, cache: cacheName });
    }
    return networkResponse;
  }).catch(error => {
    console.warn('Background fetch failed for:', request.url, error);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    performanceMetrics.cacheHits++;
    notifyMainThread('ADVANCED_CACHE_HIT', { url: request.url, cache: cacheName });
    
    // If cache is fresh, return it and update in background
    if (!isAdvancedExpired(cachedResponse, maxAge)) {
      return cachedResponse;
    }
  }
  
  // Wait for network response if no cache or cache is expired
  performanceMetrics.networkRequests++;
  return networkPromise;
}

// Advanced Network Only strategy
async function advancedNetworkOnly(request) {
  performanceMetrics.networkRequests++;
  return fetch(request);
}

// Check if cached response is expired
function isAdvancedExpired(response, maxAge) {
  if (!maxAge) return false;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  const age = (now.getTime() - responseDate.getTime()) / 1000;
  
  return age > maxAge;
}

// Cache specific URLs
async function warmCache(urls) {
  const cache = await caches.open(PERFORMANCE_CACHE_NAME);
  
  try {
    const requests = urls.map(url => new Request(url));
    await Promise.all(requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.warn('Failed to warm cache for:', request.url, error);
      }
    }));
    
    console.log('Successfully warmed cache for URLs:', urls);
    notifyMainThread('CACHE_WARMED', { urls, count: urls.length });
  } catch (error) {
    console.error('Failed to warm cache:', error);
  }
}

// Clear specific cache
async function clearAdvancedCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
    console.log('Cleared advanced cache:', cacheName);
  } else {
    // Clear all advanced caches
    const cacheNames = await caches.keys();
    const advancedCaches = cacheNames.filter(name => 
      name.includes('digiclick-advanced') || 
      name.includes('digiclick-api') || 
      name.includes('digiclick-performance')
    );
    
    await Promise.all(advancedCaches.map(name => caches.delete(name)));
    console.log('Cleared all advanced caches');
  }
  
  notifyMainThread('ADVANCED_CACHE_CLEARED', { cacheName });
}

// Invalidate cache entries matching a pattern
async function invalidatePattern(pattern) {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.includes('digiclick')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        if (request.url.includes(pattern)) {
          await cache.delete(request);
          console.log('Invalidated cache entry:', request.url);
        }
      }
    }
  }
  
  notifyMainThread('CACHE_PATTERN_INVALIDATED', { pattern });
}

// Notify main thread
function notifyMainThread(type, payload) {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type, payload });
    });
  });
}

// Background sync for performance metrics
self.addEventListener('sync', (event) => {
  if (event.tag === 'performance-sync') {
    event.waitUntil(syncPerformanceMetrics());
  }
});

async function syncPerformanceMetrics() {
  // Send performance metrics to analytics
  notifyMainThread('PERFORMANCE_METRICS_SYNC', {
    metrics: performanceMetrics,
    timestamp: Date.now()
  });
  
  console.log('Performance metrics synced:', performanceMetrics);
}

// Periodic cleanup of old cache entries
setInterval(async () => {
  await cleanupOldCacheEntries();
}, 60000 * 60); // Every hour

async function cleanupOldCacheEntries() {
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.includes('digiclick')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response && isAdvancedExpired(response, 86400 * 7)) { // 7 days
          await cache.delete(request);
        }
      }
    }
  }
  
  console.log('Completed cache cleanup');
}

console.log('DigiClick AI Advanced Cache Service Worker loaded successfully');
