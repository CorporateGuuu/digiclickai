const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const hpp = require('hpp');
require('express-async-errors');
require('dotenv').config();

// Import utilities
const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const contactRoutes = require('./routes/contact');
const demoRoutes = require('./routes/demo');
const newsletterRoutes = require('./routes/newsletter');
const healthRoutes = require('./routes/health');

// Initialize Express app
const app = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3002',
      'https://digiclick.ai',
      'https://www.digiclick.ai'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
    });
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization middleware
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Connect to MongoDB
connectDB();

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
app.use(`/api/${API_VERSION}/contact`, contactRoutes);
app.use(`/api/${API_VERSION}/demo`, demoRoutes);
app.use(`/api/${API_VERSION}/newsletter`, newsletterRoutes);
app.use('/health', healthRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to DigiClick AI Backend API',
    version: API_VERSION,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    documentation: '/api/docs'
  });
});

// API documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'DigiClick AI API Documentation',
    version: API_VERSION,
    endpoints: {
      authentication: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        profile: 'GET /api/v1/auth/profile',
        refresh: 'POST /api/v1/auth/refresh'
      },
      ai_services: {
        chat: 'POST /api/v1/ai/chat',
        automation: 'POST /api/v1/ai/automation',
        analysis: 'POST /api/v1/ai/analysis'
      },
      communication: {
        contact: 'POST /api/v1/contact',
        demo: 'POST /api/v1/demo',
        newsletter: 'POST /api/v1/newsletter'
      },
      system: {
        health: 'GET /health',
        docs: 'GET /api/docs'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 DigiClick AI Backend Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close();
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
