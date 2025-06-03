const { AppError, ErrorCode, ErrorCategory } = require('./enhancedErrorMiddleware');
const { sanitizeInput, isValidEmail, isValidURL, isValidPhone } = require('../utils/security');

/**
 * Simple validation helper
 */
const validateField = (value, rules, fieldName) => {
  const errors = [];

  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  if (!rules.required && (!value || value.toString().trim() === '')) {
    return errors;
  }

  if (rules.type === 'string') {
    if (typeof value !== 'string') {
      errors.push(`${fieldName} must be a string`);
    } else {
      if (rules.min && value.length < rules.min) {
        errors.push(`${fieldName} must be at least ${rules.min} characters`);
      }
      if (rules.max && value.length > rules.max) {
        errors.push(`${fieldName} must be no more than ${rules.max} characters`);
      }
      if (rules.email && !isValidEmail(value)) {
        errors.push(`${fieldName} must be a valid email address`);
      }
      if (rules.uri && !isValidURL(value)) {
        errors.push(`${fieldName} must be a valid URL`);
      }
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(`${fieldName} format is invalid`);
      }
    }
  }

  if (rules.type === 'boolean') {
    if (typeof value !== 'boolean') {
      errors.push(`${fieldName} must be a boolean`);
    }
  }

  if (rules.type === 'array') {
    if (!Array.isArray(value)) {
      errors.push(`${fieldName} must be an array`);
    }
  }

  if (rules.valid && !rules.valid.includes(value)) {
    errors.push(`${fieldName} must be one of: ${rules.valid.join(', ')}`);
  }

  return errors;
};

/**
 * Base validation middleware factory
 */
const createValidator = (schema, location = 'body') => {
  return (req, res, next) => {
    try {
      const data = req[location];
      const errors = [];

      for (const [fieldName, rules] of Object.entries(schema)) {
        const fieldErrors = validateField(data[fieldName], rules, fieldName);
        errors.push(...fieldErrors);
      }

      if (errors.length > 0) {
        throw new AppError(
          'Validation failed',
          400,
          ErrorCode.VALIDATION_ERROR,
          ErrorCategory.VALIDATION,
          errors.map(error => ({ message: error }))
        );
      }

      // Sanitize validated input
      req[location] = sanitizeInput(data);
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Auth validation rules
 */
exports.validateAuth = {
  register: createValidator({
    name: { type: 'string', required: true, min: 2, max: 50 },
    email: { type: 'string', required: true, email: true },
    password: { type: 'string', required: true, min: 8 },
    role: { type: 'string', valid: ['user', 'admin'] }
  }),

  login: createValidator({
    email: { type: 'string', required: true, email: true },
    password: { type: 'string', required: true }
  }),

  updateProfile: createValidator({
    name: { type: 'string', min: 2, max: 50 },
    email: { type: 'string', email: true },
    currentPassword: { type: 'string' },
    newPassword: { type: 'string', min: 8 }
  }),

  updateRole: createValidator({
    role: { type: 'string', required: true, valid: ['user', 'admin', 'moderator'] }
  })
};

/**
 * Contact validation rules
 */
exports.validateContact = createValidator({
  name: { type: 'string', required: true, min: 2, max: 100 },
  email: { type: 'string', required: true, email: true },
  phone: { type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
  company: { type: 'string', max: 100 },
  website: { type: 'string', uri: true },
  service: {
    type: 'string',
    required: true,
    valid: [
      'AI Web Design',
      'Automation Solutions',
      'AI Consulting',
      'Custom Development',
      'Integration Services',
      'Other'
    ]
  },
  budget: {
    type: 'string',
    valid: [
      'Under $5,000',
      '$5,000 - $15,000',
      '$15,000 - $50,000',
      '$50,000 - $100,000',
      'Over $100,000',
      'Let\'s discuss'
    ]
  },
  message: { type: 'string', required: true, max: 2000 },
  gdprConsent: { type: 'boolean', required: true }
});

/**
 * Demo validation rules
 */
exports.validateDemo = {
  request: createValidator({
    name: { type: 'string', required: true, min: 2, max: 100 },
    email: { type: 'string', required: true, email: true },
    company: { type: 'string', required: true, max: 100 },
    phone: { type: 'string', pattern: /^\+?[\d\s\-\(\)]+$/ },
    jobTitle: { type: 'string', max: 100 },
    companySize: {
      type: 'string',
      valid: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    industry: { type: 'string', required: true },
    interests: { type: 'array', items: { type: 'string' } },
    preferredDate: { type: 'date' },
    preferredTime: { type: 'string' },
    timezone: { type: 'string' },
    message: { type: 'string', max: 2000 },
    gdprConsent: { type: 'boolean', required: true }
  }),

  update: createValidator({
    status: {
      type: 'string',
      valid: ['new', 'contacted', 'scheduled', 'completed', 'cancelled']
    },
    scheduledDate: { type: 'date' },
    scheduledTime: { type: 'string' },
    notes: { type: 'string', max: 1000 }
  })
};

/**
 * Newsletter validation rules
 */
exports.validateNewsletter = {
  subscribe: createValidator({
    email: { type: 'string', required: true, email: true },
    name: { type: 'string', max: 100 },
    interests: { type: 'array', items: { type: 'string' } },
    gdprConsent: { type: 'boolean', required: true }
  }),

  unsubscribe: createValidator({
    email: { type: 'string', email: true },
    token: { type: 'string' }
  }, 'query')
};

/**
 * AI validation rules
 */
exports.validateAI = {
  chat: createValidator({
    message: { type: 'string', required: true, max: 1000 },
    context: { type: 'object' },
    model: { type: 'string', valid: ['gpt-3.5-turbo', 'gpt-4'] }
  }),

  automation: createValidator({
    task: { type: 'string', required: true },
    parameters: { type: 'object' },
    priority: { type: 'string', valid: ['low', 'normal', 'high'] }
  }),

  analysis: createValidator({
    data: { type: 'any', required: true },
    analysisType: {
      type: 'string',
      required: true,
      valid: ['sentiment', 'classification', 'prediction', 'optimization']
    },
    options: { type: 'object' }
  })
};
