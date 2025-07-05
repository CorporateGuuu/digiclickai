const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// CSRF protection middleware
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Rate limiting middleware for general API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Rate limiting middleware for login attempts
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.'
  }
});

// Rate limiting middleware for registration attempts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many registration attempts, please try again later.'
  }
});

// Helmet middleware for setting security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://cdnjs.cloudflare.com", "https://kit.fontawesome.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});

// CSRF error handler
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  // Handle CSRF token errors
  res.status(403).render('403', {
    title: 'Invalid CSRF Token',
    message: 'Form has been tampered with or session expired. Please try again.'
  });
};

module.exports = {
  csrfProtection,
  apiLimiter,
  loginLimiter,
  registerLimiter,
  securityHeaders,
  handleCsrfError
};
