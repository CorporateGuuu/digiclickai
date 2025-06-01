const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  requests: new Map()
};

// Request cache
const REQUEST_CACHE = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting check
const checkRateLimit = (endpoint) => {
  const now = Date.now();
  const key = `${endpoint}_${Math.floor(now / RATE_LIMIT.windowMs)}`;

  if (!RATE_LIMIT.requests.has(key)) {
    RATE_LIMIT.requests.set(key, 0);
  }

  const count = RATE_LIMIT.requests.get(key);
  if (count >= RATE_LIMIT.maxRequests) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  RATE_LIMIT.requests.set(key, count + 1);

  // Clean up old entries
  for (const [cacheKey] of RATE_LIMIT.requests) {
    const keyTime = parseInt(cacheKey.split('_').pop());
    if (now - (keyTime * RATE_LIMIT.windowMs) > RATE_LIMIT.windowMs) {
      RATE_LIMIT.requests.delete(cacheKey);
    }
  }
};

// Cache management
const getCacheKey = (endpoint, options) => {
  const method = options.method || 'GET';
  const body = options.body || '';
  return `${method}_${endpoint}_${btoa(body)}`;
};

const getFromCache = (cacheKey) => {
  const cached = REQUEST_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCache = (cacheKey, data) => {
  REQUEST_CACHE.set(cacheKey, {
    data,
    timestamp: Date.now()
  });

  // Clean up old cache entries
  for (const [key, value] of REQUEST_CACHE) {
    if (Date.now() - value.timestamp > CACHE_DURATION) {
      REQUEST_CACHE.delete(key);
    }
  }
};

// Enhanced API call function with retry logic, caching, and rate limiting
export const apiCall = async (endpoint, options = {}) => {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    cache = false,
    skipRateLimit = false,
    ...fetchOptions
  } = options;

  // Rate limiting check
  if (!skipRateLimit) {
    try {
      checkRateLimit(endpoint);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 429
      };
    }
  }

  // Check cache for GET requests
  if (cache && (!fetchOptions.method || fetchOptions.method === 'GET')) {
    const cacheKey = getCacheKey(endpoint, fetchOptions);
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        signal: controller.signal,
        ...fetchOptions,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const result = {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || data.message || 'Request failed',
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      };

      // Cache successful GET requests
      if (cache && response.ok && (!fetchOptions.method || fetchOptions.method === 'GET')) {
        const cacheKey = getCacheKey(endpoint, fetchOptions);
        setCache(cacheKey, result);
      }

      return result;

    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. Please try again.',
          status: 408
        };
      }

      // Don't retry on certain errors
      if (attempt === retries || error.message.includes('Rate limit')) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  console.error('API call error after retries:', lastError);
  return {
    success: false,
    error: lastError?.message || 'Network error. Please try again.',
    status: 0
  };
};

// Enhanced Contact form submission with file upload
export const submitContactForm = async (formData, files = []) => {
  if (files.length > 0) {
    const uploadFormData = new FormData();

    // Add form fields
    Object.keys(formData).forEach(key => {
      uploadFormData.append(key, formData[key]);
    });

    // Add files
    files.forEach((file, index) => {
      uploadFormData.append(`file_${index}`, file);
    });

    return apiCall('/api/contact', {
      method: 'POST',
      body: uploadFormData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  return apiCall('/api/contact', {
    method: 'POST',
    body: JSON.stringify(formData),
  });
};

// Demo scheduling
export const scheduleDemo = async (demoData) => {
  return apiCall('/api/demo', {
    method: 'POST',
    body: JSON.stringify(demoData),
  });
};

// Get services with caching
export const getServices = async (useCache = true) => {
  return apiCall('/api/services', { cache: useCache });
};

// Get portfolio with pagination
export const getPortfolio = async (page = 1, limit = 6, useCache = true) => {
  return apiCall(`/api/portfolio?page=${page}&limit=${limit}`, { cache: useCache });
};

// Get team members
export const getTeamMembers = async (useCache = true) => {
  return apiCall('/api/team', { cache: useCache });
};

// Get blog posts
export const getBlogPosts = async (page = 1, limit = 5, useCache = true) => {
  return apiCall(`/api/blog?page=${page}&limit=${limit}`, { cache: useCache });
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: async (message, conversationId = null, context = {}) => {
    return apiCall('/api/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationId,
        context
      }),
    });
  },

  getHistory: async (conversationId = null) => {
    const endpoint = conversationId
      ? `/api/chatbot/history/${conversationId}`
      : '/api/chatbot/history';
    return apiCall(endpoint, { cache: true });
  },

  createConversation: async () => {
    return apiCall('/api/chatbot/conversation', {
      method: 'POST',
    });
  }
};

// File upload utilities
export const uploadFile = async (file, endpoint = '/api/upload') => {
  const formData = new FormData();
  formData.append('file', file);

  return apiCall(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type
    timeout: 60000, // 1 minute for file uploads
  });
};

// Bulk file upload
export const uploadFiles = async (files, endpoint = '/api/upload/bulk') => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append(`files`, file);
  });

  return apiCall(endpoint, {
    method: 'POST',
    body: formData,
    headers: {},
    timeout: 120000, // 2 minutes for bulk uploads
  });
};

// Get health status
export const getHealthStatus = async () => {
  return apiCall('/api/health', { cache: true });
};

// Enhanced Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  forgotPassword: async (email) => {
    return apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiCall('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  verifyEmail: async (token) => {
    return apiCall('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  refreshToken: async (refreshToken) => {
    return apiCall('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  googleLogin: async (googleToken) => {
    return apiCall('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  },

  verifyToken: async (token) => {
    return apiCall('/api/auth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  logout: async (token) => {
    return apiCall('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
};

// Authenticated API calls (require token)
export const authenticatedAPI = {
  getUserDemos: async (token) => {
    return apiCall('/api/user/demos', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getAdminContacts: async (token) => {
    return apiCall('/api/admin/contacts', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  getAdminDemos: async (token) => {
    return apiCall('/api/admin/demos', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
};

// Enhanced Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};

export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password &&
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers;

  let message = '';
  if (!password) {
    message = 'Password is required';
  } else if (password.length < minLength) {
    message = `Password must be at least ${minLength} characters long`;
  } else if (!hasUpperCase) {
    message = 'Password must contain at least one uppercase letter';
  } else if (!hasLowerCase) {
    message = 'Password must contain at least one lowercase letter';
  } else if (!hasNumbers) {
    message = 'Password must contain at least one number';
  }

  return {
    isValid,
    message,
    strength: calculatePasswordStrength(password)
  };
};

const calculatePasswordStrength = (password) => {
  if (!password) return 0;

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  return Math.min(score, 5);
};

export const validateName = (name) => {
  const isValid = name && name.trim().length >= 2 && name.trim().length <= 50;
  return {
    isValid,
    message: isValid ? '' : 'Name must be between 2 and 50 characters'
  };
};

export const validateMessage = (message) => {
  const isValid = message && message.trim().length >= 10 && message.trim().length <= 1000;
  return {
    isValid,
    message: isValid ? '' : 'Message must be between 10 and 1000 characters'
  };
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const isValid = !phone || phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid phone number'
  };
};

export const validateCompany = (company) => {
  const isValid = !company || (company.trim().length >= 2 && company.trim().length <= 100);
  return {
    isValid,
    message: isValid ? '' : 'Company name must be between 2 and 100 characters'
  };
};

export const validateWebsite = (website) => {
  if (!website) return { isValid: true, message: '' };

  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  const isValid = urlRegex.test(website);
  return {
    isValid,
    message: isValid ? '' : 'Please enter a valid website URL'
  };
};

export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
    maxFiles = 5
  } = options;

  if (!file) {
    return { isValid: false, message: 'File is required' };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true, message: '' };
};

// Comprehensive form validation
export const validateContactForm = (formData) => {
  const errors = {};

  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) errors.name = nameValidation.message;

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.email = emailValidation.message;

  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.message;

  const companyValidation = validateCompany(formData.company);
  if (!companyValidation.isValid) errors.company = companyValidation.message;

  const websiteValidation = validateWebsite(formData.website);
  if (!websiteValidation.isValid) errors.website = websiteValidation.message;

  const messageValidation = validateMessage(formData.message);
  if (!messageValidation.isValid) errors.message = messageValidation.message;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (Array.isArray(error)) {
    return error.map(err => err.msg || err.message || err).join(', ');
  }
  
  return 'An unexpected error occurred';
};

// Success message utilities
export const getSuccessMessage = (response) => {
  if (response?.data?.message) {
    return response.data.message;
  }
  
  if (response?.message) {
    return response.message;
  }
  
  return 'Operation completed successfully';
};

// Local storage utilities
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// Date formatting utilities
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};

export default {
  apiCall,
  submitContactForm,
  scheduleDemo,
  getServices,
  getPortfolio,
  getHealthStatus,
  authAPI,
  authenticatedAPI,
  validateEmail,
  validatePassword,
  validateName,
  validateMessage,
  getErrorMessage,
  getSuccessMessage,
  storage,
  formatDate
};
