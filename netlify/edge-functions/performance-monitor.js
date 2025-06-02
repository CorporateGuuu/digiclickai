// DigiClick AI - Performance Monitoring Edge Function
// Monitors and optimizes performance for the enhanced cursor system

export default async (request, context) => {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  try {
    // Get device and connection information
    const userAgent = request.headers.get('user-agent') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';
    const connectionType = request.headers.get('connection') || '';
    
    // Device detection
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isLowEnd = /Android.*4\.|iPhone.*OS [5-9]_/i.test(userAgent);
    const supportsWebP = acceptEncoding.includes('webp');
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsBrotli = acceptEncoding.includes('br');

    // Performance optimization based on device capabilities
    const performanceConfig = {
      cursorPerformanceMode: isLowEnd ? 'low' : isMobile ? 'medium' : 'high',
      particleCount: isLowEnd ? 5 : isMobile ? 10 : 20,
      animationQuality: isLowEnd ? 'low' : 'high',
      enableGPUAcceleration: !isLowEnd,
      preloadAssets: !isMobile,
      compressionPreference: supportsBrotli ? 'br' : supportsGzip ? 'gzip' : 'none'
    };

    // Get the response
    const response = await context.next();
    
    if (response) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Add performance headers
      response.headers.set('X-Processing-Time', processingTime.toString());
      response.headers.set('X-Performance-Mode', performanceConfig.cursorPerformanceMode);
      response.headers.set('X-Device-Capability', isLowEnd ? 'low' : isMobile ? 'medium' : 'high');
      
      // Add cursor-specific performance headers
      if (url.pathname.includes('/cursor-demo') || url.pathname === '/') {
        response.headers.set('X-Cursor-Particle-Count', performanceConfig.particleCount.toString());
        response.headers.set('X-Cursor-Animation-Quality', performanceConfig.animationQuality);
        response.headers.set('X-GPU-Acceleration', performanceConfig.enableGPUAcceleration.toString());
      }
      
      // Optimize caching based on content type
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('text/html')) {
        // HTML pages - short cache for dynamic content
        response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
      } else if (contentType.includes('application/javascript') || contentType.includes('text/css')) {
        // JS/CSS assets - long cache with versioning
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (contentType.includes('image/')) {
        // Images - medium cache
        response.headers.set('Cache-Control', 'public, max-age=86400');
      }
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add performance monitoring headers
      response.headers.set('Server-Timing', `processing;dur=${processingTime}`);
      
      // Log performance metrics
      if (processingTime > 1000) {
        console.warn('Slow response detected:', {
          url: url.pathname,
          processingTime: processingTime,
          userAgent: userAgent,
          timestamp: new Date().toISOString()
        });
      }
      
      // Performance analytics
      console.log('Performance Monitor:', {
        timestamp: new Date().toISOString(),
        path: url.pathname,
        processingTime: processingTime,
        deviceType: isMobile ? 'mobile' : 'desktop',
        performanceMode: performanceConfig.cursorPerformanceMode,
        country: context.geo?.country?.name || 'unknown'
      });
    }

    return response;
    
  } catch (error) {
    console.error('Performance monitor error:', error);
    
    // Return response with error headers
    const response = await context.next();
    if (response) {
      response.headers.set('X-Performance-Error', 'true');
      response.headers.set('X-Error-Message', error.message);
    }
    return response;
  }
};

export const config = {
  path: "/*"
};
