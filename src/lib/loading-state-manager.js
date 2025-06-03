/**
 * DigiClick AI Loading State Manager
 * Enhanced loading states and route change feedback with AI-themed animations
 * Integrates with existing z-index management and touch interaction systems
 */

import { getAccessibilityManager } from './accessibility-manager';
import { getTouchInteractionManager } from './touch-interaction-manager';

class LoadingStateManager {
  constructor() {
    this.activeLoadingStates = new Map();
    this.loadingOverlays = new Map();
    this.progressIndicators = new Map();
    this.skeletonScreens = new Map();
    this.retryAttempts = new Map();
    this.maxRetryAttempts = 3;
    
    this.loadingTypes = {
      route: 'route-change',
      page: 'page-load',
      content: 'content-load',
      form: 'form-submit',
      api: 'api-request'
    };
    
    this.animationTypes = {
      circuit: 'circuit',
      geometric: 'geometric',
      neural: 'neural',
      progress: 'progress'
    };
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createLoadingTemplates();
    this.setupProgressTracking();
  }

  setupEventListeners() {
    // Listen for route changes
    window.addEventListener('page-transition-start', (e) => {
      this.showRouteLoading(e.detail.url);
    });

    window.addEventListener('page-transition-complete', (e) => {
      this.hideRouteLoading();
    });

    window.addEventListener('page-transition-error', (e) => {
      this.showErrorState(e.detail.error, e.detail.url);
    });

    // Listen for accessibility changes
    window.addEventListener('visual-effects-changed', (e) => {
      this.updateLoadingAnimations(e.detail.settings);
    });

    // Listen for touch interactions
    window.addEventListener('single-tap', (e) => {
      this.handleTouchFeedback(e.detail.target);
    });
  }

  createLoadingTemplates() {
    // Create reusable loading templates
    this.templates = {
      routeLoading: this.createRouteLoadingTemplate(),
      pageLoading: this.createPageLoadingTemplate(),
      contentLoading: this.createContentLoadingTemplate(),
      formLoading: this.createFormLoadingTemplate(),
      errorState: this.createErrorStateTemplate()
    };
  }

  createRouteLoadingTemplate() {
    return `
      <div class="route-loading-overlay" role="status" aria-live="polite">
        <div class="route-loading-content">
          <div class="route-loading-spinner" data-animation="circuit">
            <svg viewBox="0 0 100 100" class="circuit-spinner">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#00d4ff" />
                  <stop offset="50%" stop-color="#7b2cbf" />
                  <stop offset="100%" stop-color="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M20,20 L80,20 L80,50 L50,50 L50,80 L80,80" 
                    stroke="url(#routeGradient)" 
                    stroke-width="2" 
                    fill="none"
                    class="circuit-path" />
              <circle cx="50" cy="50" r="3" fill="#00d4ff" class="circuit-node" />
            </svg>
          </div>
          <div class="route-loading-text">Loading page...</div>
          <div class="route-loading-progress">
            <div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createPageLoadingTemplate() {
    return `
      <div class="page-loading-container" role="status" aria-live="polite">
        <div class="page-loading-header">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
        <div class="page-loading-content">
          <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-image"></div>
            <div class="skeleton-text">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  createContentLoadingTemplate() {
    return `
      <div class="content-loading-container" role="status" aria-live="polite">
        <div class="content-loading-spinner" data-animation="neural">
          <svg viewBox="0 0 100 100" class="neural-spinner">
            <circle cx="30" cy="30" r="4" fill="#00d4ff" class="neural-node" />
            <circle cx="70" cy="30" r="4" fill="#7b2cbf" class="neural-node" />
            <circle cx="50" cy="50" r="6" fill="#a855f7" class="neural-node" />
            <circle cx="30" cy="70" r="4" fill="#00d4ff" class="neural-node" />
            <circle cx="70" cy="70" r="4" fill="#7b2cbf" class="neural-node" />
            <line x1="30" y1="30" x2="50" y2="50" stroke="#00d4ff" stroke-width="1" class="neural-connection" />
            <line x1="70" y1="30" x2="50" y2="50" stroke="#7b2cbf" stroke-width="1" class="neural-connection" />
          </svg>
        </div>
        <div class="content-loading-text">Loading content...</div>
      </div>
    `;
  }

  createFormLoadingTemplate() {
    return `
      <div class="form-loading-overlay" role="status" aria-live="polite">
        <div class="form-loading-content">
          <div class="form-loading-spinner" data-animation="geometric">
            <svg viewBox="0 0 100 100" class="geometric-spinner">
              <polygon points="50,10 90,50 50,90 10,50" 
                       fill="none" 
                       stroke="#00d4ff" 
                       stroke-width="2"
                       class="geometric-shape" />
              <circle cx="50" cy="50" r="8" fill="#00d4ff" class="geometric-core" />
            </svg>
          </div>
          <div class="form-loading-text">Processing...</div>
        </div>
      </div>
    `;
  }

  createErrorStateTemplate() {
    return `
      <div class="error-state-container" role="alert" aria-live="assertive">
        <div class="error-state-content">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <div class="error-message">
            <h3>Something went wrong</h3>
            <p>We couldn't load the page. Please try again.</p>
          </div>
          <div class="error-actions">
            <button class="retry-button" type="button">
              <span>Try Again</span>
            </button>
            <button class="home-button" type="button">
              <span>Go Home</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupProgressTracking() {
    // Track loading progress for different types
    this.progressTrackers = {
      route: { current: 0, total: 100, steps: ['start', 'fetch', 'render', 'complete'] },
      api: { current: 0, total: 100, steps: ['request', 'response', 'parse', 'complete'] },
      form: { current: 0, total: 100, steps: ['validate', 'submit', 'process', 'complete'] }
    };
  }

  showLoading(type, target = document.body, options = {}) {
    const loadingId = this.generateLoadingId(type, target);
    
    if (this.activeLoadingStates.has(loadingId)) {
      return loadingId; // Already showing
    }

    const loadingConfig = {
      type,
      target,
      animation: options.animation || this.getDefaultAnimation(type),
      message: options.message || this.getDefaultMessage(type),
      showProgress: options.showProgress || false,
      timeout: options.timeout || 30000,
      zIndex: options.zIndex || this.getDefaultZIndex(type)
    };

    const loadingElement = this.createLoadingElement(loadingConfig);
    this.insertLoadingElement(loadingElement, target, loadingConfig.zIndex);
    
    this.activeLoadingStates.set(loadingId, {
      element: loadingElement,
      config: loadingConfig,
      startTime: Date.now()
    });

    // Set timeout for automatic removal
    if (loadingConfig.timeout > 0) {
      setTimeout(() => {
        this.hideLoading(loadingId);
      }, loadingConfig.timeout);
    }

    // Announce to screen readers
    this.announceLoadingState(loadingConfig.message);

    // Trigger haptic feedback for touch devices
    this.triggerLoadingHaptics();

    return loadingId;
  }

  hideLoading(loadingId) {
    const loadingState = this.activeLoadingStates.get(loadingId);
    if (!loadingState) return;

    const { element, config } = loadingState;
    
    // Animate out
    this.animateLoadingOut(element, () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeLoadingStates.delete(loadingId);
    });

    // Clear progress tracking
    if (this.progressIndicators.has(loadingId)) {
      this.progressIndicators.delete(loadingId);
    }
  }

  showRouteLoading(url) {
    const loadingId = this.showLoading('route', document.body, {
      message: `Loading ${this.getPageName(url)}...`,
      showProgress: true,
      animation: 'circuit'
    });

    // Simulate progress for route loading
    this.simulateRouteProgress(loadingId);
    
    return loadingId;
  }

  hideRouteLoading() {
    // Find and hide route loading
    for (const [loadingId, loadingState] of this.activeLoadingStates) {
      if (loadingState.config.type === 'route') {
        this.hideLoading(loadingId);
      }
    }
  }

  showErrorState(error, url) {
    const errorId = this.generateLoadingId('error', document.body);
    const errorElement = this.createErrorElement(error, url);
    
    this.insertLoadingElement(errorElement, document.body, 9500);
    
    this.activeLoadingStates.set(errorId, {
      element: errorElement,
      config: { type: 'error' },
      startTime: Date.now()
    });

    // Setup retry functionality
    this.setupErrorRetry(errorElement, url, errorId);

    return errorId;
  }

  createLoadingElement(config) {
    const template = this.getTemplate(config.type);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;
    wrapper.className = `loading-wrapper loading-${config.type}`;
    wrapper.style.cssText = `
      position: ${config.type === 'route' ? 'fixed' : 'absolute'};
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${config.zIndex};
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${config.type === 'route' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(18, 18, 18, 0.8)'};
      backdrop-filter: blur(4px);
    `;

    // Update message if provided
    const messageElement = wrapper.querySelector('.route-loading-text, .content-loading-text, .form-loading-text');
    if (messageElement && config.message) {
      messageElement.textContent = config.message;
    }

    return wrapper;
  }

  createErrorElement(error, url) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.templates.errorState;
    wrapper.className = 'error-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9500;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(18, 18, 18, 0.95);
      backdrop-filter: blur(8px);
    `;

    return wrapper;
  }

  setupErrorRetry(errorElement, url, errorId) {
    const retryButton = errorElement.querySelector('.retry-button');
    const homeButton = errorElement.querySelector('.home-button');

    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.retryRoute(url, errorId);
      });
    }

    if (homeButton) {
      homeButton.addEventListener('click', () => {
        this.hideLoading(errorId);
        window.location.href = '/';
      });
    }
  }

  retryRoute(url, errorId) {
    const attempts = this.retryAttempts.get(url) || 0;
    
    if (attempts >= this.maxRetryAttempts) {
      this.announceLoadingState('Maximum retry attempts reached. Please refresh the page.');
      return;
    }

    this.retryAttempts.set(url, attempts + 1);
    this.hideLoading(errorId);
    
    // Attempt to navigate again
    if (typeof window !== 'undefined' && window.next && window.next.router) {
      window.next.router.push(url);
    }
  }

  simulateRouteProgress(loadingId) {
    const progressSteps = [25, 50, 75, 90];
    let currentStep = 0;

    const updateProgress = () => {
      if (currentStep < progressSteps.length && this.activeLoadingStates.has(loadingId)) {
        this.updateProgress(loadingId, progressSteps[currentStep]);
        currentStep++;
        setTimeout(updateProgress, 200 + Math.random() * 300);
      }
    };

    setTimeout(updateProgress, 100);
  }

  updateProgress(loadingId, percentage) {
    const loadingState = this.activeLoadingStates.get(loadingId);
    if (!loadingState) return;

    const progressBar = loadingState.element.querySelector('.progress-fill');
    const progressElement = loadingState.element.querySelector('[role="progressbar"]');
    
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    
    if (progressElement) {
      progressElement.setAttribute('aria-valuenow', percentage);
    }
  }

  // Utility methods
  generateLoadingId(type, target) {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getTemplate(type) {
    switch (type) {
      case 'route': return this.templates.routeLoading;
      case 'page': return this.templates.pageLoading;
      case 'content': return this.templates.contentLoading;
      case 'form': return this.templates.formLoading;
      case 'error': return this.templates.errorState;
      default: return this.templates.contentLoading;
    }
  }

  getDefaultAnimation(type) {
    const animations = {
      route: 'circuit',
      page: 'neural',
      content: 'geometric',
      form: 'progress'
    };
    return animations[type] || 'circuit';
  }

  getDefaultMessage(type) {
    const messages = {
      route: 'Loading page...',
      page: 'Loading content...',
      content: 'Loading...',
      form: 'Processing...'
    };
    return messages[type] || 'Loading...';
  }

  getDefaultZIndex(type) {
    const zIndexes = {
      route: 9999,
      page: 9800,
      content: 9700,
      form: 9600
    };
    return zIndexes[type] || 9700;
  }

  getPageName(url) {
    const path = url.split('/').filter(Boolean).pop() || 'home';
    return path.charAt(0).toUpperCase() + path.slice(1);
  }

  insertLoadingElement(element, target, zIndex) {
    // Ensure proper z-index management
    element.style.zIndex = zIndex;
    target.appendChild(element);
  }

  animateLoadingOut(element, callback) {
    element.style.transition = 'opacity 0.3s ease-out';
    element.style.opacity = '0';
    setTimeout(callback, 300);
  }

  announceLoadingState(message) {
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

  triggerLoadingHaptics() {
    const touchManager = getTouchInteractionManager();
    if (touchManager && touchManager.supportsHaptics) {
      touchManager.triggerHapticFeedback('light');
    }
  }

  handleTouchFeedback(target) {
    // Add visual feedback for touch interactions during loading
    if (target.closest('.loading-wrapper')) {
      this.triggerLoadingHaptics();
    }
  }

  updateLoadingAnimations(visualEffectsSettings) {
    // Update loading animations based on performance mode
    const performanceMode = visualEffectsSettings.performanceMode;
    
    for (const [loadingId, loadingState] of this.activeLoadingStates) {
      const spinner = loadingState.element.querySelector('[data-animation]');
      if (spinner) {
        if (performanceMode === 'minimal') {
          spinner.style.animation = 'none';
        } else {
          // Re-enable animations
          spinner.style.animation = '';
        }
      }
    }
  }

  // Public API
  showPageLoading(target, options = {}) {
    return this.showLoading('page', target, options);
  }

  showContentLoading(target, options = {}) {
    return this.showLoading('content', target, options);
  }

  showFormLoading(target, options = {}) {
    return this.showLoading('form', target, options);
  }

  hideAllLoading() {
    for (const loadingId of this.activeLoadingStates.keys()) {
      this.hideLoading(loadingId);
    }
  }

  getActiveLoadingStates() {
    return Array.from(this.activeLoadingStates.keys());
  }
}

// Create global instance
let loadingStateManager = null;

export function getLoadingStateManager() {
  if (!loadingStateManager) {
    loadingStateManager = new LoadingStateManager();
  }
  return loadingStateManager;
}

export function initializeLoadingStates() {
  return getLoadingStateManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeLoadingStates();
  });
}

export default LoadingStateManager;
