const logger = require('../utils/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Handle 404 errors
const notFound = (req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  logger.logSecurity('404_NOT_FOUND', req.ip, {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent')
  });
  next(error);
};

// Handle Mongoose validation errors
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(val => val.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle Mongoose duplicate key errors
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return new AppError(message, 400);
};

// Handle Mongoose cast errors
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again', 401);
};

// Handle JWT expired errors
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again', 401);
};

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // Log error details in development
  logger.logError(err, req);

  return res.status(err.statusCode).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: {
      name: err.name,
      statusCode: err.statusCode,
      isOperational: err.isOperational
    }
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    logger.logError(err, req);
    
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Programming or other unknown error: don't leak error details
  logger.error('ERROR:', err);
  
  return res.status(500).json({
    success: false,
    error: 'Something went wrong on our end. Please try again later.'
  });
};

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Set default status code if not set
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error = handleValidationError(error);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error = handleDuplicateKeyError(error);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = handleCastError(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Rate limiting error
  if (err.status === 429) {
    error = new AppError('Too many requests, please try again later', 429);
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    error = new AppError('CORS policy violation', 403);
    logger.logSecurity('CORS_VIOLATION', req.ip, {
      origin: req.get('Origin'),
      userAgent: req.get('User-Agent')
    });
  }

  // Send appropriate error response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation error formatter
const formatValidationErrors = (errors) => {
  return errors.array().map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value
  }));
};

// Create standardized API response
const createResponse = (success, data = null, message = null, errors = null) => {
  const response = { success };
  
  if (message) response.message = message;
  if (data) response.data = data;
  if (errors) response.errors = errors;
  
  return response;
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  formatValidationErrors,
  createResponse
};
