
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const demoRoutes = require('./routes/demo');
const newsletterRoutes = require('./routes/newsletter');
const aiRoutes = require('./routes/ai');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler } = require('./middleware/enhancedErrorMiddleware');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digiclick-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: process.env.NODE_ENV === 'development' // Only create indexes in development
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const demoRoutes = require('./routes/demo');
const newsletterRoutes = require('./routes/newsletter');
const aiRoutes = require('./routes/ai');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler } = require('./middleware/enhancedErrorMiddleware');
const logger = require('./utils/logger');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digiclick-test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: process.env.NODE_ENV === 'development' // Only create indexes in development
})
.then(() => logger.info('MongoDB Connected'))
.catch(err => {
  logger.error('MongoDB connection error:', err);
  process.exit(1);
});

// Performance monitoring middleware
app.use((req, res, next) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    logger.info(`Request ${req.method} ${req.originalUrl} took ${elapsedTimeInMs.toFixed(3)} ms`);
  });

  next();
});

// Mongoose query performance logging middleware
mongoose.set('debug', function (collectionName, method, query, doc, options) {
  const start = process.hrtime();
  const logQuery = () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] / 1e6;
    logger.info(`Mongoose: ${collectionName}.${method} executed in ${time.toFixed(3)} ms`);
  };
  // Use next tick to log after query execution
  process.nextTick(logQuery);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted.cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://trusted.cdn.com"],
      connectSrc: ["'self'", "https://api.trusted.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
app.use(mongoSanitize()); // Sanitize data
app.use(xss()); // Clean user input
app.use(compression()); // Compress responses
app.use(cookieParser());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CSRF protection
const csrfProtection = csurf({
  cookie: true,
});
app.use(csrfProtection);

// Middleware to set CSRF token cookie for frontend consumption
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken());
  next();
});

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/demo', demoRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/health', healthRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    data: null
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = app;
