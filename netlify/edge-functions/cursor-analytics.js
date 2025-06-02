// DigiClick AI - Cursor Analytics Edge Function
// Tracks cursor system performance and usage analytics

export default async (request, context) => {
  const url = new URL(request.url);
  
  // Only process requests to cursor demo page
  if (!url.pathname.includes('/cursor-demo')) {
    return;
  }

  try {
    // Get user agent and device information
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isTablet = /iPad|Android.*Tablet/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    // Determine cursor system behavior
    const cursorConfig = {
      enabled: isDesktop, // Only enable cursor on desktop
      theme: url.searchParams.get('theme') || 'default',
      performance: url.searchParams.get('performance') || 'high',
      features: {
        particleTrails: !isMobile, // Disable on mobile for performance
        clickEffects: true,
        glowEffects: !isMobile,
        touchOptimization: isMobile || isTablet
      }
    };

    // Add analytics headers
    const response = await context.next();
    
    if (response) {
      // Add cursor configuration headers
      response.headers.set('X-Cursor-Enabled', cursorConfig.enabled.toString());
      response.headers.set('X-Cursor-Theme', cursorConfig.theme);
      response.headers.set('X-Cursor-Performance', cursorConfig.performance);
      response.headers.set('X-Device-Type', isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');
      
      // Add performance hints
      if (isDesktop) {
        response.headers.set('X-Cursor-Features', JSON.stringify(cursorConfig.features));
      }
      
      // Add cache headers for cursor assets
      if (url.pathname.includes('cursor') || url.pathname.includes('gsap')) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      
      // Log analytics (in production, this would go to your analytics service)
      console.log('Cursor Analytics:', {
        timestamp: new Date().toISOString(),
        path: url.pathname,
        userAgent: userAgent,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
        cursorEnabled: cursorConfig.enabled,
        theme: cursorConfig.theme,
        country: context.geo?.country?.name || 'unknown',
        city: context.geo?.city || 'unknown'
      });
    }

    return response;
    
  } catch (error) {
    console.error('Cursor analytics error:', error);
    return context.next();
  }
};

export const config = {
  path: "/cursor-demo"
};
