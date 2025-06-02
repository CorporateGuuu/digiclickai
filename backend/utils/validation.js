const { body, param, query, validationResult } = require('express-validator');
const { formatValidationErrors } = require('../middleware/errorMiddleware');

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
    
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    
  phone: body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
    
  company: body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
    
  website: body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
    
  message: body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
    
  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
};

// Authentication validations
const authValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password,
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    commonValidations.phone,
    commonValidations.company,
    body('gdprConsent')
      .isBoolean()
      .withMessage('GDPR consent must be a boolean')
      .custom((value) => {
        if (!value) {
          throw new Error('GDPR consent is required');
        }
        return true;
      })
  ],
  
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  
  forgotPassword: [
    commonValidations.email
  ],
  
  resetPassword: [
    commonValidations.password,
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    param('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid reset token')
  ],
  
  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password,
    body('passwordConfirm')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      })
  ]
};

// Contact form validations
const contactValidations = {
  create: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.phone,
    commonValidations.company,
    commonValidations.website,
    body('service')
      .isIn(['AI Web Design', 'Automation Solutions', 'AI Consulting', 'Custom Development', 'Integration Services', 'Other'])
      .withMessage('Please select a valid service'),
    body('budget')
      .optional()
      .isIn(['Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000 - $100,000', 'Over $100,000', 'Let\'s discuss'])
      .withMessage('Please select a valid budget range'),
    commonValidations.message,
    body('projectTimeline')
      .optional()
      .isIn(['ASAP', '1-3 months', '3-6 months', '6+ months', 'Just exploring'])
      .withMessage('Please select a valid project timeline'),
    body('hearAboutUs')
      .optional()
      .isIn(['Google Search', 'Social Media', 'Referral', 'Advertisement', 'Event/Conference', 'Other'])
      .withMessage('Please select a valid option'),
    body('gdprConsent')
      .isBoolean()
      .withMessage('GDPR consent must be a boolean')
      .custom((value) => {
        if (!value) {
          throw new Error('GDPR consent is required');
        }
        return true;
      }),
    body('marketingConsent')
      .optional()
      .isBoolean()
      .withMessage('Marketing consent must be a boolean')
  ],
  
  update: [
    commonValidations.mongoId,
    body('status')
      .optional()
      .isIn(['new', 'contacted', 'in-progress', 'qualified', 'converted', 'closed'])
      .withMessage('Please select a valid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Please select a valid priority'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('followUpDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid follow-up date'),
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Note cannot exceed 1000 characters')
  ]
};

// Demo validations
const demoValidations = {
  create: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.phone,
    commonValidations.company,
    body('jobTitle')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Job title cannot exceed 100 characters'),
    body('companySize')
      .optional()
      .isIn(['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ employees'])
      .withMessage('Please select a valid company size'),
    body('preferredDate')
      .isISO8601()
      .withMessage('Please provide a valid preferred date')
      .custom((value) => {
        const date = new Date(value);
        const now = new Date();
        if (date <= now) {
          throw new Error('Preferred date must be in the future');
        }
        return true;
      }),
    body('preferredTime')
      .isIn(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'])
      .withMessage('Please select a valid time slot'),
    body('timezone')
      .notEmpty()
      .withMessage('Timezone is required'),
    body('duration')
      .optional()
      .isIn([30, 45, 60])
      .withMessage('Duration must be 30, 45, or 60 minutes'),
    body('meetingType')
      .optional()
      .isIn(['video-call', 'phone-call', 'in-person'])
      .withMessage('Please select a valid meeting type'),
    body('serviceInterest')
      .isArray({ min: 1 })
      .withMessage('Please select at least one service')
      .custom((value) => {
        const validServices = ['AI Web Design', 'Automation Solutions', 'AI Consulting', 'Custom Development', 'Integration Services', 'Other'];
        const isValid = value.every(service => validServices.includes(service));
        if (!isValid) {
          throw new Error('Please select valid services');
        }
        return true;
      }),
    body('currentChallenges')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Current challenges description must be between 10 and 1000 characters'),
    body('goals')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Goals description cannot exceed 1000 characters'),
    body('budget')
      .optional()
      .isIn(['Under $5,000', '$5,000 - $15,000', '$15,000 - $50,000', '$50,000 - $100,000', 'Over $100,000', 'Let\'s discuss'])
      .withMessage('Please select a valid budget range'),
    body('timeline')
      .optional()
      .isIn(['ASAP', '1-3 months', '3-6 months', '6+ months', 'Just exploring'])
      .withMessage('Please select a valid timeline'),
    body('decisionMaker')
      .isIn(['yes', 'no', 'partial'])
      .withMessage('Please specify if you are the decision maker')
  ],
  
  update: [
    commonValidations.mongoId,
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'])
      .withMessage('Please select a valid status'),
    body('assignedTo')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID'),
    body('demoRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Demo rating must be between 1 and 5'),
    body('clientFeedback')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Client feedback cannot exceed 2000 characters'),
    body('nextSteps')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Next steps cannot exceed 1000 characters'),
    body('followUpDate')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid follow-up date'),
    body('conversionProbability')
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage('Conversion probability must be between 0 and 100')
  ]
};

// Newsletter validations
const newsletterValidations = {
  subscribe: [
    commonValidations.email,
    body('name')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('preferences.frequency')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Please select a valid frequency'),
    body('preferences.topics')
      .optional()
      .isArray()
      .withMessage('Topics must be an array')
      .custom((value) => {
        const validTopics = ['ai-news', 'automation-tips', 'case-studies', 'product-updates', 'industry-insights', 'tutorials', 'events'];
        const isValid = value.every(topic => validTopics.includes(topic));
        if (!isValid) {
          throw new Error('Please select valid topics');
        }
        return true;
      }),
    body('gdprConsent')
      .isBoolean()
      .withMessage('GDPR consent must be a boolean')
      .custom((value) => {
        if (!value) {
          throw new Error('GDPR consent is required');
        }
        return true;
      }),
    body('marketingConsent')
      .optional()
      .isBoolean()
      .withMessage('Marketing consent must be a boolean')
  ],
  
  unsubscribe: [
    query('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid unsubscribe token'),
    body('reason')
      .optional()
      .isIn(['too-frequent', 'not-relevant', 'never-signed-up', 'technical-issues', 'other'])
      .withMessage('Please select a valid reason')
  ],
  
  verify: [
    query('token')
      .isLength({ min: 64, max: 64 })
      .withMessage('Invalid verification token')
  ]
};

// AI service validations
const aiValidations = {
  chat: [
    body('message')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Message must be between 1 and 1000 characters'),
    body('context')
      .optional()
      .isArray()
      .withMessage('Context must be an array'),
    body('model')
      .optional()
      .isIn(['gpt-3.5-turbo', 'gpt-4', 'claude-2'])
      .withMessage('Please select a valid AI model')
  ],
  
  automation: [
    body('type')
      .isIn(['workflow', 'data-processing', 'integration', 'custom'])
      .withMessage('Please select a valid automation type'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('requirements')
      .optional()
      .isArray()
      .withMessage('Requirements must be an array'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Please select a valid priority')
  ],
  
  analysis: [
    body('data')
      .notEmpty()
      .withMessage('Data is required for analysis'),
    body('analysisType')
      .isIn(['business', 'technical', 'market', 'competitive'])
      .withMessage('Please select a valid analysis type'),
    body('format')
      .optional()
      .isIn(['json', 'csv', 'pdf', 'html'])
      .withMessage('Please select a valid output format')
  ]
};

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = formatValidationErrors(errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }
    
    next();
  };
};

module.exports = {
  authValidations,
  contactValidations,
  demoValidations,
  newsletterValidations,
  aiValidations,
  validate,
  commonValidations
};
