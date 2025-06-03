/**
 * DigiClick AI Backend Integration Manager
 * Handles API communication, error handling, and retry mechanisms
 * Integrates with existing loading states and accessibility features
 */

import { getAccessibilityManager } from './accessibility-manager';
import { getLoadingStateManager } from './loading-state-manager';
import { getFormValidationManager } from './form-validation-manager';

class BackendIntegrationManager {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://digiclick-ai-backend.onrender.com';
    this.apiEndpoints = {
      contact: '/api/contact',
      demo: '/api/demo',
      newsletter: '/api/newsletter',
      upload: '/api/upload',
      analytics: '/api/analytics'
    };
    
    this.requestQueue = new Map();
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second base delay
    this.requestTimeout = 30000; // 30 seconds
    
    this.init();
  }

  init() {
    this.setupInterceptors();
    this.setupEventListeners();
    this.setupOfflineHandling();
  }

  setupInterceptors() {
    // Setup default headers
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    };
    
    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      this.defaultHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  setupEventListeners() {
    // Listen for form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.classList.contains('api-form')) {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });

    // Listen for network status changes
    window.addEventListener('online', () => {
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.handleOnlineStatus(false);
    });
  }

  setupOfflineHandling() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
  }

  async makeRequest(endpoint, options = {}) {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const requestConfig = {
      method: options.method || 'GET',
      headers: { ...this.defaultHeaders, ...options.headers },
      body: options.body,
      timeout: options.timeout || this.requestTimeout,
      retries: 0,
      maxRetries: options.maxRetries || this.maxRetries,
      showLoading: options.showLoading !== false,
      loadingTarget: options.loadingTarget || document.body,
      onProgress: options.onProgress,
      onSuccess: options.onSuccess,
      onError: options.onError
    };
    
    // Check if online
    if (!this.isOnline) {
      return this.handleOfflineRequest(requestId, endpoint, requestConfig);
    }
    
    // Show loading state
    let loadingId = null;
    if (requestConfig.showLoading) {
      const loadingManager = getLoadingStateManager();
      loadingId = loadingManager.showLoading('api', requestConfig.loadingTarget, {
        message: 'Processing request...',
        animation: 'neural'
      });
    }
    
    try {
      this.requestQueue.set(requestId, { endpoint, config: requestConfig, loadingId });
      
      const response = await this.executeRequest(endpoint, requestConfig);
      const result = await this.processResponse(response, requestConfig);
      
      // Handle success
      if (requestConfig.onSuccess) {
        requestConfig.onSuccess(result);
      }
      
      // Hide loading state
      if (loadingId) {
        const loadingManager = getLoadingStateManager();
        loadingManager.hideLoading(loadingId);
      }
      
      this.requestQueue.delete(requestId);
      this.retryAttempts.delete(requestId);
      
      return result;
      
    } catch (error) {
      // Handle retry logic
      if (this.shouldRetry(error, requestConfig)) {
        return this.retryRequest(requestId, endpoint, requestConfig, error);
      }
      
      // Handle error
      if (requestConfig.onError) {
        requestConfig.onError(error);
      }
      
      // Hide loading state
      if (loadingId) {
        const loadingManager = getLoadingStateManager();
        loadingManager.hideLoading(loadingId);
      }
      
      this.requestQueue.delete(requestId);
      this.retryAttempts.delete(requestId);
      
      throw error;
    }
  }

  async executeRequest(endpoint, config) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    try {
      const response = await fetch(url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  async processResponse(response, config) {
    if (!response.ok) {
      const errorData = await this.extractErrorData(response);
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text();
    } else {
      return await response.blob();
    }
  }

  async extractErrorData(response) {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return { message: await response.text() };
      }
    } catch (error) {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  shouldRetry(error, config) {
    if (config.retries >= config.maxRetries) {
      return false;
    }
    
    // Retry on network errors, timeouts, and 5xx server errors
    const retryableErrors = [
      'Failed to fetch',
      'Request timeout',
      'Network request failed'
    ];
    
    const isRetryableError = retryableErrors.some(retryableError => 
      error.message.includes(retryableError)
    );
    
    const isServerError = error.message.includes('HTTP 5');
    
    return isRetryableError || isServerError;
  }

  async retryRequest(requestId, endpoint, config, lastError) {
    config.retries++;
    
    const retryDelay = this.calculateRetryDelay(config.retries);
    
    // Announce retry to screen readers
    this.announceRetry(config.retries, config.maxRetries);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
      return await this.makeRequest(endpoint, config);
    } catch (error) {
      if (config.retries >= config.maxRetries) {
        // Final retry failed, show error with retry option
        this.showRetryDialog(requestId, endpoint, config, error);
        throw error;
      }
      
      return this.retryRequest(requestId, endpoint, config, error);
    }
  }

  calculateRetryDelay(retryCount) {
    // Exponential backoff with jitter
    const baseDelay = this.retryDelay * Math.pow(2, retryCount - 1);
    const jitter = Math.random() * 1000;
    return Math.min(baseDelay + jitter, 10000); // Max 10 seconds
  }

  showRetryDialog(requestId, endpoint, config, error) {
    const dialog = document.createElement('div');
    dialog.className = 'retry-dialog';
    dialog.innerHTML = `
      <div class="retry-dialog-overlay">
        <div class="retry-dialog-content">
          <div class="retry-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Request Failed</h3>
          <p>${error.message}</p>
          <p>The request failed after ${config.maxRetries} attempts. Would you like to try again?</p>
          <div class="retry-dialog-actions">
            <button type="button" class="retry-again-button">Try Again</button>
            <button type="button" class="cancel-retry-button">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(18, 18, 18, 0.95);
      backdrop-filter: blur(8px);
    `;
    
    document.body.appendChild(dialog);
    
    // Setup event handlers
    dialog.querySelector('.retry-again-button').addEventListener('click', () => {
      document.body.removeChild(dialog);
      config.retries = 0; // Reset retry count
      this.makeRequest(endpoint, config);
    });
    
    dialog.querySelector('.cancel-retry-button').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
  }

  handleOfflineRequest(requestId, endpoint, config) {
    // Queue request for when online
    this.offlineQueue.push({ requestId, endpoint, config });
    
    // Show offline message
    this.showOfflineMessage();
    
    return Promise.reject(new Error('No internet connection. Request queued for when online.'));
  }

  handleOnlineStatus(isOnline) {
    this.isOnline = isOnline;
    
    if (isOnline && this.offlineQueue.length > 0) {
      // Process queued requests
      this.processOfflineQueue();
    }
    
    // Announce status change
    this.announceConnectionStatus(isOnline);
  }

  async processOfflineQueue() {
    const queuedRequests = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const { requestId, endpoint, config } of queuedRequests) {
      try {
        await this.makeRequest(endpoint, config);
      } catch (error) {
        console.error('Failed to process queued request:', error);
      }
    }
  }

  // Form submission handling
  async handleFormSubmission(formElement) {
    const formValidationManager = getFormValidationManager();
    const formId = formElement.id;
    
    // Validate form
    const isValid = formValidationManager.validateForm(formId);
    if (!isValid) {
      this.announceFormError('Please correct the errors in the form before submitting.');
      return;
    }
    
    // Get form data
    const formData = formValidationManager.getFormData(formId);
    const endpoint = formElement.getAttribute('data-endpoint') || this.apiEndpoints.contact;
    
    try {
      const result = await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData),
        loadingTarget: formElement,
        onSuccess: (data) => {
          this.handleFormSuccess(formElement, data);
        },
        onError: (error) => {
          this.handleFormError(formElement, error);
        }
      });
      
      return result;
      
    } catch (error) {
      console.error('Form submission failed:', error);
      throw error;
    }
  }

  handleFormSuccess(formElement, data) {
    // Show success message
    this.showFormSuccessMessage(formElement, data.message || 'Form submitted successfully!');
    
    // Reset form
    const formValidationManager = getFormValidationManager();
    formValidationManager.resetForm(formElement.id);
    
    // Clear auto-saved data
    formValidationManager.clearAutoSavedData(formElement.id);
    
    // Announce success
    this.announceFormSuccess('Form submitted successfully!');
  }

  handleFormError(formElement, error) {
    // Show error message
    this.showFormErrorMessage(formElement, error.message || 'Form submission failed. Please try again.');
    
    // Announce error
    this.announceFormError(error.message || 'Form submission failed. Please try again.');
  }

  showFormSuccessMessage(formElement, message) {
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-message';
    successMessage.innerHTML = `
      <div class="success-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
          <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
      </div>
      <div class="success-text">${message}</div>
    `;
    
    successMessage.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 8px;
      color: #00d4ff;
      font-family: 'Poppins', sans-serif;
      margin-top: 16px;
      animation: slideIn 0.3s ease-out;
    `;
    
    formElement.appendChild(successMessage);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (successMessage.parentNode) {
        successMessage.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (successMessage.parentNode) {
            formElement.removeChild(successMessage);
          }
        }, 300);
      }
    }, 5000);
  }

  showFormErrorMessage(formElement, message) {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-error-message';
    errorMessage.innerHTML = `
      <div class="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      </div>
      <div class="error-text">${message}</div>
    `;
    
    errorMessage.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: rgba(255, 107, 107, 0.1);
      border: 1px solid rgba(255, 107, 107, 0.3);
      border-radius: 8px;
      color: #ff6b6b;
      font-family: 'Poppins', sans-serif;
      margin-top: 16px;
      animation: slideIn 0.3s ease-out;
    `;
    
    formElement.appendChild(errorMessage);
    
    // Remove after 7 seconds
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          if (errorMessage.parentNode) {
            formElement.removeChild(errorMessage);
          }
        }, 300);
      }
    }, 7000);
  }

  // Announcement methods for screen readers
  announceRetry(currentAttempt, maxAttempts) {
    this.announce(`Retrying request. Attempt ${currentAttempt} of ${maxAttempts}.`);
  }

  announceConnectionStatus(isOnline) {
    this.announce(isOnline ? 'Connection restored.' : 'Connection lost. Requests will be queued.');
  }

  announceFormSuccess(message) {
    this.announce(message);
  }

  announceFormError(message) {
    this.announce(message);
  }

  announce(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  showOfflineMessage() {
    // Implementation for offline message
    console.log('Offline mode: Request queued for when connection is restored.');
  }

  // Public API methods
  async submitContactForm(formData) {
    return this.makeRequest(this.apiEndpoints.contact, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
  }

  async requestDemo(demoData) {
    return this.makeRequest(this.apiEndpoints.demo, {
      method: 'POST',
      body: JSON.stringify(demoData)
    });
  }

  async subscribeNewsletter(email) {
    return this.makeRequest(this.apiEndpoints.newsletter, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.makeRequest(this.apiEndpoints.upload, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
      onProgress
    });
  }

  async trackAnalytics(eventData) {
    return this.makeRequest(this.apiEndpoints.analytics, {
      method: 'POST',
      body: JSON.stringify(eventData),
      showLoading: false // Don't show loading for analytics
    });
  }

  getRequestStatus(requestId) {
    return this.requestQueue.get(requestId);
  }

  cancelRequest(requestId) {
    const request = this.requestQueue.get(requestId);
    if (request && request.controller) {
      request.controller.abort();
      this.requestQueue.delete(requestId);
    }
  }
}

// Create global instance
let backendIntegrationManager = null;

export function getBackendIntegrationManager() {
  if (!backendIntegrationManager) {
    backendIntegrationManager = new BackendIntegrationManager();
  }
  return backendIntegrationManager;
}

export function initializeBackendIntegration() {
  return getBackendIntegrationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeBackendIntegration();
  });
}

export default BackendIntegrationManager;
