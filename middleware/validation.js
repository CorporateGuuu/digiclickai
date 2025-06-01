/**
 * Input validation middleware to prevent SQL injection and other attacks
 */

const { body, param, query, validationResult } = require('express-validator');

// Sanitize and validate product ID
const validateProductId = [
  param('id').isInt().withMessage('Product ID must be an integer'),
  handleValidationErrors
];

// Sanitize and validate product slug
const validateProductSlug = [
  param('slug').isSlug().withMessage('Invalid product slug format'),
  handleValidationErrors
];

// Sanitize and validate category slug
const validateCategorySlug = [
  param('slug').isSlug().withMessage('Invalid category slug format'),
  handleValidationErrors
];

// Sanitize and validate user input for login
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  handleValidationErrors
];

// Sanitize and validate user input for registration
const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('firstName').isLength({ min: 2 }).trim().escape().withMessage('First name must be at least 2 characters long'),
  body('lastName').isLength({ min: 2 }).trim().escape().withMessage('Last name must be at least 2 characters long'),
  handleValidationErrors
];

// Sanitize and validate user input for adding to cart
const validateAddToCart = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

// Sanitize and validate user input for updating cart
const validateUpdateCart = [
  body('cartItemId').isInt().withMessage('Cart item ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

// Sanitize and validate user input for removing from cart
const validateRemoveFromCart = [
  body('cartItemId').isInt().withMessage('Cart item ID must be an integer'),
  handleValidationErrors
];

// Sanitize and validate user input for search
const validateSearch = [
  query('q').isLength({ min: 2 }).trim().escape().withMessage('Search query must be at least 2 characters long'),
  handleValidationErrors
];

// Sanitize and validate user input for pagination
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Sanitize and validate user input for product review
const validateProductReview = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').isLength({ min: 3, max: 100 }).trim().escape().withMessage('Title must be between 3 and 100 characters'),
  body('comment').isLength({ min: 10, max: 1000 }).trim().escape().withMessage('Comment must be between 10 and 1000 characters'),
  handleValidationErrors
];

// Sanitize and validate user input for LCD buyback request
const validateLcdBuybackRequest = [
  body('firstName').isLength({ min: 2 }).trim().escape().withMessage('First name must be at least 2 characters long'),
  body('lastName').isLength({ min: 2 }).trim().escape().withMessage('Last name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('phone').isMobilePhone().withMessage('Please enter a valid phone number'),
  body('deviceType').isLength({ min: 2 }).trim().escape().withMessage('Device type must be at least 2 characters long'),
  body('deviceModel').isLength({ min: 2 }).trim().escape().withMessage('Device model must be at least 2 characters long'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('condition').isIn(['New', 'Like New', 'Good', 'Fair', 'Poor']).withMessage('Please select a valid condition'),
  body('additionalNotes').optional().trim().escape(),
  handleValidationErrors
];

// Handle validation errors
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For API requests
    if (req.path.startsWith('/api/')) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // For regular requests
    return res.status(400).render('error', {
      title: 'Validation Error',
      message: 'There was a problem with your input.',
      errors: errors.array()
    });
  }
  next();
}

module.exports = {
  validateProductId,
  validateProductSlug,
  validateCategorySlug,
  validateLogin,
  validateRegistration,
  validateAddToCart,
  validateUpdateCart,
  validateRemoveFromCart,
  validateSearch,
  validatePagination,
  validateProductReview,
  validateLcdBuybackRequest,
  handleValidationErrors
};
