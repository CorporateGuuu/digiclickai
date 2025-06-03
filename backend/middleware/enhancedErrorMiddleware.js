const logger = require('../utils/logger');

/**
 * Enhanced custom error class with error codes and categories.
 * Extends the native Error class to include additional metadata.
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null, category = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errorCode = errorCode;
    this.category = category;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Enumeration of error categories for better error classification.
 */
const ErrorCategory = {
  DATABASE: 'DATABASE',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  RATE_LIMIT: 'RATE_LIMIT',
  NETWORK: 'NETWORK',
  SYSTEM: 'SYSTEM'
};

/**
 * Enumeration of error codes for consistent error identification.
 */
const ErrorCode = {
  // Database errors
  DB_CONNECTION_FAILED: 'DB_CONNECTION_FAILED',
  DB_QUERY_FAILED: 'DB_QUERY_FAILED',
  DB_VALIDATION_FAILED: 'DB_VALIDATION_FAILED',
  DB_DUPLICATE_KEY: 'DB_DUPLICATE_KEY',
  DB_DOCUMENT_NOT_FOUND: 'DB_DOCUMENT_NOT_FOUND',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Network errors
  CORS_VIOLATION: 'CORS_VIOLATION',
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

/**
 * Handles database-related errors and returns a formatted AppError.
 * @param {Error} err - The original error object.
 * @returns {AppError} - Formatted error with appropriate message and code.
 */
const handleDatabaseError = (err) => {
  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return new AppError(
      'Database connection failed. Please try again later.',
      503,
      ErrorCode.DB_CONNECTION_FAILED,
      ErrorCategory.DATABASE
    );
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
      value: val.value
    }));
    
    return new AppError(
      'Validation failed. Please check your input.',
      400,
      ErrorCode.DB_VALIDATION_FAILED,
      ErrorCategory.VALIDATION,
      { validationErrors: errors }
    );
  }

  // Duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`,
      400,
      ErrorCode.DB_DUPLICATE_KEY,
      ErrorCategory.DATABASE
    );
  }

  // Cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    return new AppError(
      `Invalid ${err.path}: ${err.value}`,
      400,
      ErrorCode.INVALID_FORMAT,
      ErrorCategory.VALIDATION
    );
  }

  return new AppError(
    'Database operation failed.',
    500,
    ErrorCode.DB_QUERY_FAILED,
    ErrorCategory.DATABASE
  );
};

/**
 * Handles authentication-related errors and returns a formatted AppError.
 * @param {Error} err - The original error object.
 * @returns {AppError} - Formatted error with appropriate message and code.
 */
const handleAuthError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AppError(
      'Invalid authentication token.',
      401,
      ErrorCode.TOKEN_INVALID,
      ErrorCategory.AUTHENTICATION
    );
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError(
      'Authentication token has expired.',
      401,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCategory.AUTHENTICATION
    );
  }

  return new AppError(
    'Authentication failed.',
    401,
    ErrorCode.UNAUTHORIZED,
    ErrorCategory.AUTHENTICATION
  );
};

/**
 * Handles validation errors and returns a formatted AppError.
 * @param {Array} errors - Array of validation error objects.
 * @returns {AppError} - Formatted error with validation details.
 */
const handleValidationError = (errors) => {
  const formattedErrors = errors.map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
    code: ErrorCode.INVALID_INPUT
  }));

  return new AppError(
    'Validation failed. Please check your input.',
    400,
    ErrorCode.INVALID_INPUT,
    ErrorCategory.VALIDATION,
    { validationErrors: formattedErrors }
  );
};

/**
 * Formats the error response sent to clients.
 * Includes stack trace in development mode for debugging.
 * @param {AppError} err - The error object.
 * @param {boolean} includeStack - Whether to include stack trace.
 * @returns {Object} - Formatted error response.
 */
const formatErrorResponse = (err, includeStack = false) => {
  const response = {
    success: false,
    error: {
      message: err.message,
      code: err.errorCode || ErrorCode.INTERNAL_ERROR,
      category: err.category || ErrorCategory.SYSTEM,
      statusCode: err.statusCode || 500
    }
  };

  // Include validation errors if present
  if (err.validationErrors) {
    response.error.details = err.validationErrors;
  }

  // Include stack trace in development
  if (includeStack && err.stack) {
    response.error.stack = err.stack;
  }

  return response;
};

/**
 * Main error handling middleware for Express.
 * Logs error details and sends formatted error response.
 * @param {Error} err - The error object.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error details with additional request context
  logger.error('Error details:', {
    message: err.message,
    stack: err.stack,
    errorCode: err.errorCode,
    category: err.category,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'MongoError' || err.name === 'ValidationError' || err.code === 11000) {
    error = handleDatabaseError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleAuthError(err);
  } else if (err.status === 429) {
    error = new AppError(
      'Too many requests. Please try again later.',
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCategory.RATE_LIMIT
    );
  } else if (!error.isOperational) {
    // For unknown or programming errors, log and send generic message
    logger.error('Unknown error occurred:', err);
    error = new AppError(
      'An unexpected error occurred. Please try again later.',
      500,
      ErrorCode.INTERNAL_ERROR,
      ErrorCategory.SYSTEM
    );
  }

  // Format and send error response
  const response = formatErrorResponse(
    error,
    process.env.NODE_ENV === 'development'
  );

  res.status(error.statusCode || 500).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers.
 * Adds request context to errors before passing to next middleware.
 * @param {Function} fn - Async route handler function.
 * @returns {Function} - Wrapped function with error catching.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Add request context to error
    error.path = req.path;
    error.method = req.method;
    next(error);
  });
};

module.exports = {
  AppError,
  ErrorCode,
  ErrorCategory,
  errorHandler,
  asyncHandler,
  handleValidationError,
  formatErrorResponse
};
