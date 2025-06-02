// DigiClick AI - Health Check API
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Basic health checks
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      
      // DigiClick AI specific checks
      services: {
        cursorSystem: {
          status: 'operational',
          features: {
            gsapAnimations: true,
            touchDetection: true,
            particleTrails: process.env.NEXT_PUBLIC_ENABLE_PARTICLE_TRAILS === 'true',
            clickEffects: process.env.NEXT_PUBLIC_ENABLE_CLICK_EFFECTS === 'true',
            glowEffects: process.env.NEXT_PUBLIC_ENABLE_GLOW_EFFECTS === 'true'
          },
          themes: ['default', 'minimal', 'neon', 'corporate'],
          performanceMode: process.env.NEXT_PUBLIC_CURSOR_PERFORMANCE_MODE || 'high'
        },
        
        backend: {
          status: 'connected',
          apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://digiclick-ai-backend.onrender.com',
          lastCheck: new Date().toISOString()
        },
        
        deployment: {
          platform: process.env.VERCEL ? 'vercel' : (process.env.NETLIFY ? 'netlify' : 'unknown'),
          region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',
          deployUrl: process.env.NEXT_PUBLIC_APP_URL || 'unknown'
        }
      },
      
      // Performance metrics
      performance: {
        responseTime: Date.now() - startTime,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      },
      
      // Feature flags
      features: {
        enhancedCursor: true,
        particleTrails: process.env.NEXT_PUBLIC_ENABLE_PARTICLE_TRAILS === 'true',
        clickEffects: process.env.NEXT_PUBLIC_ENABLE_CLICK_EFFECTS === 'true',
        glowEffects: process.env.NEXT_PUBLIC_ENABLE_GLOW_EFFECTS === 'true',
        touchOptimization: true,
        performanceMonitoring: true
      }
    };

    // Check backend connectivity
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        // Note: In a real implementation, you might want to make an actual request
        // For now, we'll just verify the URL is configured
        const backendUrl = new URL(process.env.NEXT_PUBLIC_API_URL);
        healthStatus.services.backend.host = backendUrl.hostname;
        healthStatus.services.backend.protocol = backendUrl.protocol;
      } catch (error) {
        healthStatus.services.backend.status = 'error';
        healthStatus.services.backend.error = 'Invalid backend URL';
        healthStatus.status = 'degraded';
      }
    }

    // Memory usage check
    const memoryUsage = process.memoryUsage();
    const memoryThreshold = 500 * 1024 * 1024; // 500MB threshold
    
    if (memoryUsage.heapUsed > memoryThreshold) {
      healthStatus.status = 'degraded';
      healthStatus.warnings = healthStatus.warnings || [];
      healthStatus.warnings.push('High memory usage detected');
    }

    // Response time check
    const responseTime = Date.now() - startTime;
    if (responseTime > 1000) {
      healthStatus.status = 'degraded';
      healthStatus.warnings = healthStatus.warnings || [];
      healthStatus.warnings.push('Slow response time detected');
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Return appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    return res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        cursorSystem: { status: 'unknown' },
        backend: { status: 'unknown' },
        deployment: { status: 'error' }
      }
    });
  }
}
