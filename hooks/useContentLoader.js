import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useContentLoader = (endpoint, options = {}) => {
  const { apiCall } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const cacheRef = useRef(new Map());
  
  const {
    enablePagination = false,
    pageSize = 10,
    enableCache = true,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
    dependencies = [],
    immediate = true,
    transform = null
  } = options;

  // Generate cache key
  const getCacheKey = useCallback((endpoint, page, pageSize) => {
    return `${endpoint}_${page}_${pageSize}`;
  }, []);

  // Check if cached data is still valid
  const isCacheValid = useCallback((cacheEntry) => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < cacheTimeout;
  }, [cacheTimeout]);

  // Load data from API
  const loadData = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey(endpoint, pageNum, pageSize);
      
      // Check cache first
      if (enableCache && cacheRef.current.has(cacheKey)) {
        const cachedData = cacheRef.current.get(cacheKey);
        if (isCacheValid(cachedData)) {
          const transformedData = transform ? transform(cachedData.data) : cachedData.data;
          
          if (append && data) {
            setData(prev => ({
              ...transformedData,
              items: [...(prev.items || []), ...(transformedData.items || [])]
            }));
          } else {
            setData(transformedData);
          }
          
          setHasMore(cachedData.data.hasMore !== false);
          setLoading(false);
          return;
        }
      }

      // Build API endpoint with pagination
      let apiEndpoint = endpoint;
      if (enablePagination) {
        const separator = endpoint.includes('?') ? '&' : '?';
        apiEndpoint = `${endpoint}${separator}page=${pageNum}&limit=${pageSize}`;
      }

      const response = await apiCall(apiEndpoint);

      if (response.success) {
        const responseData = response.data;
        const transformedData = transform ? transform(responseData) : responseData;

        // Cache the response
        if (enableCache) {
          cacheRef.current.set(cacheKey, {
            data: responseData,
            timestamp: Date.now()
          });
        }

        if (append && data) {
          setData(prev => ({
            ...transformedData,
            items: [...(prev.items || []), ...(transformedData.items || [])]
          }));
        } else {
          setData(transformedData);
        }

        // Update pagination state
        if (enablePagination) {
          setHasMore(responseData.hasMore !== false && (responseData.items?.length || 0) === pageSize);
        }
      } else {
        setError(response.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Content loading error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, pageSize, enableCache, enablePagination, getCacheKey, isCacheValid, transform, data, apiCall]);

  // Load more data (for pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    await loadData(nextPage, true);
  }, [hasMore, loading, page, loadData]);

  // Refresh data
  const refresh = useCallback(async () => {
    // Clear cache for this endpoint
    if (enableCache) {
      const keysToDelete = [];
      for (const key of cacheRef.current.keys()) {
        if (key.startsWith(endpoint)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => cacheRef.current.delete(key));
    }
    
    setPage(1);
    setHasMore(true);
    await loadData(1, false);
  }, [endpoint, enableCache, loadData]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Initial load
  useEffect(() => {
    if (immediate && endpoint) {
      loadData(1, false);
    }
  }, [endpoint, immediate, ...dependencies]);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      if (enableCache) {
        // Clean up old cache entries
        const now = Date.now();
        for (const [key, value] of cacheRef.current.entries()) {
          if (now - value.timestamp > cacheTimeout) {
            cacheRef.current.delete(key);
          }
        }
      }
    };
  }, [enableCache, cacheTimeout]);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    clearCache,
    page,
    // Manual load function
    load: loadData
  };
};

// Specialized hooks for common use cases
export const useServices = (options = {}) => {
  return useContentLoader('/api/services', {
    enableCache: true,
    transform: (data) => ({
      ...data,
      items: data.services || data.items || []
    }),
    ...options
  });
};

export const usePortfolio = (options = {}) => {
  return useContentLoader('/api/portfolio', {
    enablePagination: true,
    pageSize: 6,
    enableCache: true,
    transform: (data) => ({
      ...data,
      items: data.projects || data.items || []
    }),
    ...options
  });
};

export const useTeamMembers = (options = {}) => {
  return useContentLoader('/api/team', {
    enableCache: true,
    transform: (data) => ({
      ...data,
      items: data.members || data.items || []
    }),
    ...options
  });
};

export const useBlogPosts = (options = {}) => {
  return useContentLoader('/api/blog', {
    enablePagination: true,
    pageSize: 5,
    enableCache: true,
    transform: (data) => ({
      ...data,
      items: data.posts || data.items || []
    }),
    ...options
  });
};

export const usePricingPlans = (options = {}) => {
  return useContentLoader('/api/pricing', {
    enableCache: true,
    transform: (data) => ({
      ...data,
      items: data.plans || data.items || []
    }),
    ...options
  });
};

export default useContentLoader;
