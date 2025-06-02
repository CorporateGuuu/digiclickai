const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError, asyncHandler } = require('./errorMiddleware');
const logger = require('../utils/logger');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Create and send JWT token
const createSendToken = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    }
  });
};

// Protect routes - require authentication
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    logger.logSecurity('UNAUTHORIZED_ACCESS_ATTEMPT', req.ip, {
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
    return next(new AppError('You are not logged in. Please log in to access this resource', 401));
  }

  try {
    // Verify token
    const decoded = verifyToken(token);

    // Check if user still exists
    const currentUser = await User.findById(decoded.userId).select('+active');
    if (!currentUser) {
      logger.logSecurity('TOKEN_USER_NOT_FOUND', req.ip, {
        userId: decoded.userId,
        url: req.originalUrl
      });
      return next(new AppError('The user belonging to this token no longer exists', 401));
    }

    // Check if user account is active
    if (!currentUser.active) {
      logger.logSecurity('INACTIVE_USER_ACCESS', req.ip, {
        userId: currentUser._id,
        url: req.originalUrl
      });
      return next(new AppError('Your account has been deactivated. Please contact support', 401));
    }

    // Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      logger.logSecurity('PASSWORD_CHANGED_AFTER_TOKEN', req.ip, {
        userId: currentUser._id,
        url: req.originalUrl
      });
      return next(new AppError('User recently changed password. Please log in again', 401));
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    logger.logSecurity('INVALID_TOKEN', req.ip, {
      error: error.message,
      url: req.originalUrl
    });
    return next(new AppError('Invalid token. Please log in again', 401));
  }
});

// Restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.logSecurity('INSUFFICIENT_PERMISSIONS', req.ip, {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl
      });
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      const decoded = verifyToken(token);
      const currentUser = await User.findById(decoded.userId).select('+active');
      
      if (currentUser && currentUser.active && !currentUser.changedPasswordAfter(decoded.iat)) {
        req.user = currentUser;
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed:', error.message);
    }
  }

  next();
});

// Check if user is logged in (for rendered pages)
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = verifyToken(req.cookies.jwt);
      const currentUser = await User.findById(decoded.userId).select('+active');
      
      if (!currentUser || !currentUser.active) {
        return next();
      }

      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      req.user = currentUser;
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};

// Logout user
const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  if (req.user) {
    logger.logAuth('LOGOUT', req.user._id, req.ip, true);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Rate limiting for auth endpoints
const authLimiter = require('express-rate-limit')({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  generateToken,
  verifyToken,
  createSendToken,
  protect,
  restrictTo,
  optionalAuth,
  isLoggedIn,
  logout,
  authLimiter
};
