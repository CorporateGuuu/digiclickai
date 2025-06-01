const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    return {
      success: response.ok,
      data: response.ok ? data : null,
      error: response.ok ? null : data.error || 'Request failed',
      status: response.status
    };
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: 'Network error. Please try again.',
      status: 0
    };
  }
};

// Contact form submission
export const submitContactForm = async (formData) => {
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

// Get services
export const getServices = async () => {
  return apiCall('/api/services');
};

// Get portfolio
export const getPortfolio = async () => {
  return apiCall('/api/portfolio');
};

// Get health status
export const getHealthStatus = async () => {
  return apiCall('/api/health');
};

// Authentication API calls
export const authAPI = {
  login: async (email, password) => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name, email, password) => {
    return apiCall('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
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

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateMessage = (message) => {
  return message && message.trim().length >= 10;
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
