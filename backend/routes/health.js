const express = require('express');
const mongoose = require('mongoose');
const { checkDatabaseHealth, getDatabaseStats } = require('../config/database');
const { verifyEmailConfig } = require('../utils/email');
const { createResponse } = require('../middleware/errorMiddleware');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Basic health check
// @route   GET /health
// @access  Public
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${Date.now() - startTime}ms`
    };

    res.status(200).json(createResponse(true, health, 'Service is healthy'));
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json(createResponse(false, null, 'Service is unhealthy'));
  }
});

// @desc    Detailed health check
// @route   GET /health/detailed
// @access  Public
router.get('/detailed', async (req, res) => {
  const startTime = Date.now();
  const checks = {};
  let overallStatus = 'healthy';

  try {
    // Database health check
    const dbHealth = await checkDatabaseHealth();
    checks.database = dbHealth;
    if (dbHealth.status !== 'healthy') {
      overallStatus = 'unhealthy';
    }

    // Memory usage check
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024)
    };
    
    checks.memory = {
      status: memUsageMB.heapUsed < 500 ? 'healthy' : 'warning', // Warning if heap usage > 500MB
      usage: memUsageMB,
      unit: 'MB'
    };

    // CPU usage check (simplified)
    const cpuUsage = process.cpuUsage();
    checks.cpu = {
      status: 'healthy',
      user: cpuUsage.user,
      system: cpuUsage.system
    };

    // Email service check
    try {
      const emailHealthy = await verifyEmailConfig();
      checks.email = {
        status: emailHealthy ? 'healthy' : 'unhealthy',
        configured: !!process.env.SMTP_HOST
      };
      if (!emailHealthy) {
        overallStatus = 'degraded';
      }
    } catch (error) {
      checks.email = {
        status: 'unhealthy',
        error: error.message
      };
      overallStatus = 'degraded';
    }

    // Environment variables check
    const requiredEnvVars = [
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'SMTP_HOST',
      'SMTP_USER',
      'SMTP_PASS'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
      missing: missingEnvVars,
      nodeVersion: process.version
    };
    
    if (missingEnvVars.length > 0) {
      overallStatus = 'unhealthy';
    }

    // API endpoints check
    checks.api = {
      status: 'healthy',
      endpoints: {
        auth: '/api/v1/auth',
        ai: '/api/v1/ai',
        contact: '/api/v1/contact',
        demo: '/api/v1/demo',
        newsletter: '/api/v1/newsletter'
      }
    };

    const health = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      responseTime: `${Date.now() - startTime}ms`,
      checks
    };

    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    res.status(statusCode).json(createResponse(
      overallStatus === 'healthy',
      health,
      `Service is ${overallStatus}`
    ));

  } catch (error) {
    logger.error('Detailed health check failed:', error);
    
    const health = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      responseTime: `${Date.now() - startTime}ms`,
      error: error.message,
      checks
    };

    res.status(503).json(createResponse(false, health, 'Service is unhealthy'));
  }
});

// @desc    Database health check
// @route   GET /health/database
// @access  Public
router.get('/database', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const dbStats = await getDatabaseStats();

    const health = {
      ...dbHealth,
      stats: dbStats,
      timestamp: new Date().toISOString()
    };

    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(createResponse(
      dbHealth.status === 'healthy',
      health,
      `Database is ${dbHealth.status}`
    ));

  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(503).json(createResponse(
      false,
      { status: 'unhealthy', error: error.message },
      'Database is unhealthy'
    ));
  }
});

// @desc    System metrics
// @route   GET /health/metrics
// @access  Public
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: {
        process: process.uptime(),
        system: require('os').uptime()
      },
      memory: {
        process: process.memoryUsage(),
        system: {
          total: require('os').totalmem(),
          free: require('os').freemem()
        }
      },
      cpu: {
        usage: process.cpuUsage(),
        load: require('os').loadavg(),
        cores: require('os').cpus().length
      },
      platform: {
        arch: process.arch,
        platform: process.platform,
        nodeVersion: process.version,
        hostname: require('os').hostname()
      },
      database: {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      }
    };

    res.status(200).json(createResponse(true, metrics, 'System metrics retrieved successfully'));

  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json(createResponse(false, null, 'Failed to retrieve metrics'));
  }
});

// @desc    Readiness probe (for Kubernetes/Docker)
// @route   GET /health/ready
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    // Check if required environment variables are set
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }

    res.status(200).json(createResponse(true, { ready: true }, 'Service is ready'));

  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json(createResponse(false, { ready: false, error: error.message }, 'Service is not ready'));
  }
});

// @desc    Liveness probe (for Kubernetes/Docker)
// @route   GET /health/live
// @access  Public
router.get('/live', (req, res) => {
  // Simple liveness check - if the process is running, it's alive
  res.status(200).json(createResponse(true, { alive: true }, 'Service is alive'));
});

// @desc    API status check
// @route   GET /health/api
// @access  Public
router.get('/api', async (req, res) => {
  try {
    const apiStatus = {
      timestamp: new Date().toISOString(),
      version: process.env.API_VERSION || 'v1',
      endpoints: {
        auth: {
          available: true,
          path: '/api/v1/auth'
        },
        ai: {
          available: true,
          path: '/api/v1/ai'
        },
        contact: {
          available: true,
          path: '/api/v1/contact'
        },
        demo: {
          available: true,
          path: '/api/v1/demo'
        },
        newsletter: {
          available: true,
          path: '/api/v1/newsletter'
        }
      },
      rateLimit: {
        enabled: true,
        window: process.env.RATE_LIMIT_WINDOW_MS || '900000',
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || '100'
      },
      cors: {
        enabled: true,
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
      }
    };

    res.status(200).json(createResponse(true, apiStatus, 'API status retrieved successfully'));

  } catch (error) {
    logger.error('API status check failed:', error);
    res.status(500).json(createResponse(false, null, 'Failed to retrieve API status'));
  }
});

module.exports = router;
