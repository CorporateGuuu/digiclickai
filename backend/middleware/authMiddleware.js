const jwt = require('jsonwebtoken');
const { AppError, ErrorCode, ErrorCategory } = require('./enhancedErrorMiddleware');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT token and attach user to request
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from Authorization header
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        'Not authenticated. Please log in',
        401,
        ErrorCode.UNAUTHORIZED,
        ErrorCategory.AUTHENTICATION
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+active');

    if (!user || !user.active) {
      throw new AppError(
        'User no longer exists or is inactive',
        401,
        ErrorCode.USER_NOT_FOUND,
        ErrorCategory.AUTHENTICATION
      );
    }

    // 4) Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError(
        'Password recently changed. Please log in again',
        401,
        ErrorCode.PASSWORD_CHANGED,
        ErrorCategory.AUTHENTICATION
      );
    }

    // Grant access to protected route
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(
        'Invalid token. Please log in again',
        401,
        ErrorCode.INVALID_TOKEN,
        ErrorCategory.AUTHENTICATION
      ));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError(
        'Token expired. Please log in again',
        401,
        ErrorCode.TOKEN_EXPIRED,
        ErrorCategory.AUTHENTICATION
      ));
    } else {
      next(error);
    }
  }
};

/**
 * Authorize roles - Restrict access to specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        'Not authorized to access this route',
        403,
        ErrorCode.FORBIDDEN,
        ErrorCategory.AUTHORIZATION
      );
    }
    next();
  };
};

/**
 * Rate limiting for auth routes
 */
exports.authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes',
    error: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      category: ErrorCategory.SECURITY
    }
  }
};

// Log authentication events
const logAuthEvent = (type, userId, ip, userAgent) => {
  logger.info(`Authentication ${type}`, {
    userId,
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  });
};

exports.logAuthEvent = logAuthEvent;
