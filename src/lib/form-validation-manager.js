/**
 * DigiClick AI Form Validation Manager
 * Real-time form validation with accessibility and visual feedback
 * Integrates with existing glow animation system and haptic feedback
 */

import { getAccessibilityManager } from './accessibility-manager';
import { getTouchInteractionManager } from './touch-interaction-manager';
import { getLoadingStateManager } from './loading-state-manager';

class FormValidationManager {
  constructor() {
    this.validationRules = new Map();
    this.validationMessages = new Map();
    this.fieldStates = new Map();
    this.formStates = new Map();
    this.debounceTimers = new Map();
    this.autoSaveTimers = new Map();
    
    this.validationTypes = {
      required: 'required',
      email: 'email',
      phone: 'phone',
      url: 'url',
      minLength: 'minLength',
      maxLength: 'maxLength',
      pattern: 'pattern',
      custom: 'custom'
    };
    
    this.fieldTypes = {
      text: 'text',
      email: 'email',
      phone: 'phone',
      textarea: 'textarea',
      select: 'select',
      checkbox: 'checkbox',
      radio: 'radio',
      file: 'file'
    };
    
    this.init();
  }

  init() {
    this.setupDefaultValidationRules();
    this.setupDefaultMessages();
    this.setupEventListeners();
    this.setupAutoComplete();
  }

  setupDefaultValidationRules() {
    this.validationRules.set('email', {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    });
    
    this.validationRules.set('phone', {
      pattern: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    });
    
    this.validationRules.set('url', {
      pattern: /^https?:\/\/.+\..+/,
      message: 'Please enter a valid URL'
    });
    
    this.validationRules.set('required', {
      validate: (value) => value && value.trim().length > 0,
      message: 'This field is required'
    });
  }

  setupDefaultMessages() {
    this.validationMessages.set('required', 'This field is required');
    this.validationMessages.set('email', 'Please enter a valid email address');
    this.validationMessages.set('phone', 'Please enter a valid phone number');
    this.validationMessages.set('minLength', 'This field is too short');
    this.validationMessages.set('maxLength', 'This field is too long');
    this.validationMessages.set('pattern', 'Please enter a valid value');
  }

  setupEventListeners() {
    // Listen for accessibility changes
    window.addEventListener('accessibility-settings-changed', (e) => {
      this.updateValidationBehavior(e.detail.settings);
    });

    // Listen for visual effects changes
    window.addEventListener('visual-effects-changed', (e) => {
      this.updateValidationVisuals(e.detail.settings);
    });
  }

  setupAutoComplete() {
    this.autoCompleteData = {
      emailDomains: [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'company.com', 'business.com', 'enterprise.com'
      ],
      companyNames: [
        'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta',
        'Tesla', 'Netflix', 'Adobe', 'Salesforce', 'Oracle'
      ]
    };
  }

  initializeForm(formElement, options = {}) {
    const formId = formElement.id || `form-${Date.now()}`;
    
    const formConfig = {
      element: formElement,
      autoSave: options.autoSave !== false,
      autoSaveInterval: options.autoSaveInterval || 30000,
      realTimeValidation: options.realTimeValidation !== false,
      progressiveEnhancement: options.progressiveEnhancement !== false,
      accessibilityMode: options.accessibilityMode || 'enhanced',
      validationDelay: options.validationDelay || 300
    };
    
    this.formStates.set(formId, {
      config: formConfig,
      isValid: false,
      isDirty: false,
      lastSaved: null,
      saveStatus: 'idle', // idle, saving, saved, error
      fields: new Map()
    });
    
    this.setupFormValidation(formId);
    this.setupAutoSave(formId);
    this.setupProgressiveEnhancement(formId);
    
    return formId;
  }

  setupFormValidation(formId) {
    const formState = this.formStates.get(formId);
    const formElement = formState.config.element;
    
    // Find all form fields
    const fields = formElement.querySelectorAll('input, textarea, select');
    
    fields.forEach(field => {
      this.initializeField(formId, field);
    });
    
    // Setup form submission
    formElement.addEventListener('submit', (e) => {
      this.handleFormSubmit(e, formId);
    });
  }

  initializeField(formId, fieldElement) {
    const fieldId = fieldElement.id || `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fieldType = this.getFieldType(fieldElement);
    
    const fieldConfig = {
      element: fieldElement,
      type: fieldType,
      validationRules: this.extractValidationRules(fieldElement),
      isValid: true,
      isDirty: false,
      value: fieldElement.value,
      errorMessage: null
    };
    
    const formState = this.formStates.get(formId);
    formState.fields.set(fieldId, fieldConfig);
    
    // Setup field event listeners
    this.setupFieldEventListeners(formId, fieldId);
    
    // Setup auto-complete if applicable
    this.setupFieldAutoComplete(fieldId, fieldElement);
    
    // Create validation UI elements
    this.createValidationUI(fieldId, fieldElement);
    
    return fieldId;
  }

  setupFieldEventListeners(formId, fieldId) {
    const formState = this.formStates.get(formId);
    const fieldConfig = formState.fields.get(fieldId);
    const fieldElement = fieldConfig.element;
    
    // Real-time validation on input
    fieldElement.addEventListener('input', (e) => {
      this.handleFieldInput(formId, fieldId, e);
    });
    
    // Validation on blur
    fieldElement.addEventListener('blur', (e) => {
      this.handleFieldBlur(formId, fieldId, e);
    });
    
    // Focus handling
    fieldElement.addEventListener('focus', (e) => {
      this.handleFieldFocus(formId, fieldId, e);
    });
    
    // Keyboard navigation for validation errors
    fieldElement.addEventListener('keydown', (e) => {
      this.handleFieldKeydown(formId, fieldId, e);
    });
  }

  handleFieldInput(formId, fieldId, event) {
    const formState = this.formStates.get(formId);
    const fieldConfig = formState.fields.get(fieldId);
    const value = event.target.value;
    
    // Update field state
    fieldConfig.value = value;
    fieldConfig.isDirty = true;
    formState.isDirty = true;
    
    // Debounced validation
    if (formState.config.realTimeValidation) {
      this.debounceValidation(formId, fieldId, formState.config.validationDelay);
    }
    
    // Trigger auto-save
    this.triggerAutoSave(formId);
    
    // Update auto-complete suggestions
    this.updateAutoComplete(fieldId, value);
  }

  handleFieldBlur(formId, fieldId, event) {
    // Always validate on blur
    this.validateField(formId, fieldId);
    
    // Announce validation result to screen readers
    this.announceValidationResult(formId, fieldId);
  }

  handleFieldFocus(formId, fieldId, event) {
    const fieldConfig = this.formStates.get(formId).fields.get(fieldId);
    
    // Add focus styling
    this.addFieldFocusState(fieldConfig.element);
    
    // Trigger haptic feedback on touch devices
    const touchManager = getTouchInteractionManager();
    if (touchManager && touchManager.supportsHaptics) {
      touchManager.triggerHapticFeedback('light');
    }
  }

  handleFieldKeydown(formId, fieldId, event) {
    // Navigate to next validation error with Ctrl+E
    if (event.ctrlKey && event.key === 'e') {
      event.preventDefault();
      this.navigateToNextError(formId, fieldId);
    }
    
    // Clear field error with Escape
    if (event.key === 'Escape') {
      this.clearFieldError(formId, fieldId);
    }
  }

  debounceValidation(formId, fieldId, delay) {
    const timerId = `${formId}-${fieldId}`;
    
    // Clear existing timer
    if (this.debounceTimers.has(timerId)) {
      clearTimeout(this.debounceTimers.get(timerId));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.validateField(formId, fieldId);
      this.debounceTimers.delete(timerId);
    }, delay);
    
    this.debounceTimers.set(timerId, timer);
  }

  validateField(formId, fieldId) {
    const formState = this.formStates.get(formId);
    const fieldConfig = formState.fields.get(fieldId);
    const value = fieldConfig.value;
    
    let isValid = true;
    let errorMessage = null;
    
    // Run validation rules
    for (const rule of fieldConfig.validationRules) {
      const result = this.runValidationRule(rule, value, fieldConfig.element);
      if (!result.isValid) {
        isValid = false;
        errorMessage = result.message;
        break;
      }
    }
    
    // Update field state
    fieldConfig.isValid = isValid;
    fieldConfig.errorMessage = errorMessage;
    
    // Update UI
    this.updateFieldValidationUI(fieldId, isValid, errorMessage);
    
    // Update form validity
    this.updateFormValidity(formId);
    
    return { isValid, errorMessage };
  }

  runValidationRule(rule, value, element) {
    switch (rule.type) {
      case 'required':
        return {
          isValid: value && value.trim().length > 0,
          message: rule.message || this.validationMessages.get('required')
        };
        
      case 'email':
        return {
          isValid: !value || this.validationRules.get('email').pattern.test(value),
          message: rule.message || this.validationMessages.get('email')
        };
        
      case 'phone':
        return {
          isValid: !value || this.validationRules.get('phone').pattern.test(value),
          message: rule.message || this.validationMessages.get('phone')
        };
        
      case 'minLength':
        return {
          isValid: !value || value.length >= rule.value,
          message: rule.message || `Minimum ${rule.value} characters required`
        };
        
      case 'maxLength':
        return {
          isValid: !value || value.length <= rule.value,
          message: rule.message || `Maximum ${rule.value} characters allowed`
        };
        
      case 'pattern':
        return {
          isValid: !value || rule.pattern.test(value),
          message: rule.message || this.validationMessages.get('pattern')
        };
        
      case 'custom':
        return rule.validate(value, element);
        
      default:
        return { isValid: true, message: null };
    }
  }

  updateFieldValidationUI(fieldId, isValid, errorMessage) {
    const fieldConfig = this.getFieldConfig(fieldId);
    const fieldElement = fieldConfig.element;
    const errorContainer = fieldElement.parentNode.querySelector('.field-error');
    const successIndicator = fieldElement.parentNode.querySelector('.field-success');
    
    // Update field classes
    fieldElement.classList.toggle('field-valid', isValid && fieldConfig.isDirty);
    fieldElement.classList.toggle('field-invalid', !isValid && fieldConfig.isDirty);
    
    // Update ARIA attributes
    fieldElement.setAttribute('aria-invalid', !isValid);
    
    if (!isValid && errorMessage) {
      // Show error
      if (errorContainer) {
        errorContainer.textContent = errorMessage;
        errorContainer.style.display = 'block';
        errorContainer.setAttribute('aria-live', 'polite');
      }
      
      // Hide success indicator
      if (successIndicator) {
        successIndicator.style.display = 'none';
      }
      
      // Add error glow effect
      this.addFieldErrorGlow(fieldElement);
      
    } else if (isValid && fieldConfig.isDirty) {
      // Hide error
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
      
      // Show success indicator
      if (successIndicator) {
        successIndicator.style.display = 'block';
      }
      
      // Add success glow effect
      this.addFieldSuccessGlow(fieldElement);
    }
  }

  createValidationUI(fieldId, fieldElement) {
    const fieldContainer = fieldElement.parentNode;
    
    // Create error message container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'field-error';
    errorContainer.style.cssText = `
      display: none;
      color: #ff6b6b;
      font-size: 14px;
      margin-top: 4px;
      font-family: 'Poppins', sans-serif;
    `;
    errorContainer.setAttribute('role', 'alert');
    errorContainer.setAttribute('aria-live', 'polite');
    
    // Create success indicator
    const successIndicator = document.createElement('div');
    successIndicator.className = 'field-success';
    successIndicator.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
        <polyline points="20,6 9,17 4,12"></polyline>
      </svg>
    `;
    successIndicator.style.cssText = `
      display: none;
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    `;
    
    // Make field container relative for positioning
    if (getComputedStyle(fieldContainer).position === 'static') {
      fieldContainer.style.position = 'relative';
    }
    
    fieldContainer.appendChild(errorContainer);
    fieldContainer.appendChild(successIndicator);
  }

  addFieldErrorGlow(fieldElement) {
    fieldElement.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.3), 0 0 8px rgba(255, 107, 107, 0.2)';
    fieldElement.style.borderColor = '#ff6b6b';
  }

  addFieldSuccessGlow(fieldElement) {
    fieldElement.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.3), 0 0 8px rgba(0, 212, 255, 0.2)';
    fieldElement.style.borderColor = '#00d4ff';
  }

  addFieldFocusState(fieldElement) {
    fieldElement.style.boxShadow = '0 0 0 2px rgba(0, 212, 255, 0.5), 0 0 12px rgba(0, 212, 255, 0.3)';
  }

  // Utility methods
  getFieldType(fieldElement) {
    const tagName = fieldElement.tagName.toLowerCase();
    const type = fieldElement.type;
    
    if (tagName === 'textarea') return 'textarea';
    if (tagName === 'select') return 'select';
    if (type === 'email') return 'email';
    if (type === 'tel') return 'phone';
    if (type === 'file') return 'file';
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio';
    
    return 'text';
  }

  extractValidationRules(fieldElement) {
    const rules = [];
    
    // Required
    if (fieldElement.required) {
      rules.push({ type: 'required' });
    }
    
    // Min/Max length
    if (fieldElement.minLength) {
      rules.push({ type: 'minLength', value: fieldElement.minLength });
    }
    if (fieldElement.maxLength) {
      rules.push({ type: 'maxLength', value: fieldElement.maxLength });
    }
    
    // Pattern
    if (fieldElement.pattern) {
      rules.push({ type: 'pattern', pattern: new RegExp(fieldElement.pattern) });
    }
    
    // Type-specific rules
    const fieldType = this.getFieldType(fieldElement);
    if (fieldType === 'email') {
      rules.push({ type: 'email' });
    } else if (fieldType === 'phone') {
      rules.push({ type: 'phone' });
    }
    
    return rules;
  }

  getFieldConfig(fieldId) {
    for (const [formId, formState] of this.formStates) {
      if (formState.fields.has(fieldId)) {
        return formState.fields.get(fieldId);
      }
    }
    return null;
  }

  // Auto-save functionality
  setupAutoSave(formId) {
    const formState = this.formStates.get(formId);
    if (!formState.config.autoSave) return;

    const autoSaveKey = `digiclick-autosave-${formId}`;

    // Load saved data
    this.loadAutoSavedData(formId, autoSaveKey);

    // Setup auto-save timer
    const timer = setInterval(() => {
      this.performAutoSave(formId, autoSaveKey);
    }, formState.config.autoSaveInterval);

    this.autoSaveTimers.set(formId, timer);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.performAutoSave(formId, autoSaveKey);
    });
  }

  triggerAutoSave(formId) {
    const formState = this.formStates.get(formId);
    if (!formState || !formState.config.autoSave || !formState.isDirty) return;

    // Debounce auto-save
    const autoSaveKey = `digiclick-autosave-${formId}`;
    const timerId = `autosave-${formId}`;

    if (this.debounceTimers.has(timerId)) {
      clearTimeout(this.debounceTimers.get(timerId));
    }

    const timer = setTimeout(() => {
      this.performAutoSave(formId, autoSaveKey);
      this.debounceTimers.delete(timerId);
    }, 2000); // 2 second delay

    this.debounceTimers.set(timerId, timer);
  }

  performAutoSave(formId, autoSaveKey) {
    const formState = this.formStates.get(formId);
    if (!formState || !formState.isDirty) return;

    try {
      formState.saveStatus = 'saving';
      this.updateSaveStatusUI(formId, 'saving');

      const formData = this.getFormData(formId);
      const saveData = {
        data: formData,
        timestamp: Date.now(),
        formId: formId
      };

      localStorage.setItem(autoSaveKey, JSON.stringify(saveData));

      formState.saveStatus = 'saved';
      formState.lastSaved = Date.now();
      this.updateSaveStatusUI(formId, 'saved');

      // Announce save to screen readers
      this.announceSaveStatus('Form data saved automatically');

    } catch (error) {
      formState.saveStatus = 'error';
      this.updateSaveStatusUI(formId, 'error');
      console.error('Auto-save failed:', error);
    }
  }

  loadAutoSavedData(formId, autoSaveKey) {
    try {
      const savedData = localStorage.getItem(autoSaveKey);
      if (!savedData) return;

      const { data, timestamp } = JSON.parse(savedData);
      const formState = this.formStates.get(formId);

      // Check if data is recent (within 24 hours)
      const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
      if (!isRecent) return;

      // Show recovery dialog
      this.showDataRecoveryDialog(formId, data, timestamp);

    } catch (error) {
      console.error('Failed to load auto-saved data:', error);
    }
  }

  showDataRecoveryDialog(formId, data, timestamp) {
    const dialog = document.createElement('div');
    dialog.className = 'data-recovery-dialog';
    dialog.innerHTML = `
      <div class="recovery-dialog-overlay">
        <div class="recovery-dialog-content">
          <h3>Recover Unsaved Data</h3>
          <p>We found unsaved form data from ${new Date(timestamp).toLocaleString()}. Would you like to restore it?</p>
          <div class="recovery-dialog-actions">
            <button type="button" class="recover-button">Restore Data</button>
            <button type="button" class="discard-button">Start Fresh</button>
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
    `;

    document.body.appendChild(dialog);

    // Setup event handlers
    dialog.querySelector('.recover-button').addEventListener('click', () => {
      this.restoreFormData(formId, data);
      document.body.removeChild(dialog);
    });

    dialog.querySelector('.discard-button').addEventListener('click', () => {
      this.clearAutoSavedData(formId);
      document.body.removeChild(dialog);
    });
  }

  restoreFormData(formId, data) {
    const formState = this.formStates.get(formId);

    for (const [fieldId, fieldConfig] of formState.fields) {
      const fieldName = fieldConfig.element.name || fieldConfig.element.id;
      if (data[fieldName]) {
        fieldConfig.element.value = data[fieldName];
        fieldConfig.value = data[fieldName];
        fieldConfig.isDirty = true;

        // Trigger validation
        this.validateField(formId, fieldId);
      }
    }

    formState.isDirty = true;
    this.announceSaveStatus('Form data restored successfully');
  }

  clearAutoSavedData(formId) {
    const autoSaveKey = `digiclick-autosave-${formId}`;
    localStorage.removeItem(autoSaveKey);
  }

  updateSaveStatusUI(formId, status) {
    const formState = this.formStates.get(formId);
    const formElement = formState.config.element;

    let statusIndicator = formElement.querySelector('.save-status-indicator');
    if (!statusIndicator) {
      statusIndicator = this.createSaveStatusIndicator();
      formElement.appendChild(statusIndicator);
    }

    const statusText = statusIndicator.querySelector('.save-status-text');
    const statusIcon = statusIndicator.querySelector('.save-status-icon');

    switch (status) {
      case 'saving':
        statusText.textContent = 'Saving...';
        statusIcon.innerHTML = `
          <svg class="saving-spinner" width="16" height="16" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#00d4ff" stroke-width="2" stroke-dasharray="60 40" />
          </svg>
        `;
        statusIndicator.className = 'save-status-indicator saving';
        break;

      case 'saved':
        statusText.textContent = 'Saved';
        statusIcon.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
        `;
        statusIndicator.className = 'save-status-indicator saved';

        // Hide after 3 seconds
        setTimeout(() => {
          statusIndicator.style.opacity = '0';
        }, 3000);
        break;

      case 'error':
        statusText.textContent = 'Save failed';
        statusIcon.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        `;
        statusIndicator.className = 'save-status-indicator error';
        break;
    }
  }

  createSaveStatusIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-status-indicator';
    indicator.innerHTML = `
      <div class="save-status-icon"></div>
      <div class="save-status-text" aria-live="polite"></div>
    `;

    indicator.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(0, 212, 255, 0.1);
      border: 1px solid rgba(0, 212, 255, 0.2);
      border-radius: 6px;
      font-size: 12px;
      color: #00d4ff;
      font-family: 'Poppins', sans-serif;
      position: absolute;
      top: -40px;
      right: 0;
      opacity: 1;
      transition: opacity 0.3s ease;
    `;

    return indicator;
  }

  announceSaveStatus(message) {
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

  // Auto-complete functionality
  setupFieldAutoComplete(fieldId, fieldElement) {
    const fieldType = this.getFieldType(fieldElement);

    if (fieldType === 'email') {
      this.setupEmailAutoComplete(fieldElement);
    } else if (fieldElement.name === 'company' || fieldElement.id === 'company') {
      this.setupCompanyAutoComplete(fieldElement);
    }
  }

  setupEmailAutoComplete(fieldElement) {
    fieldElement.addEventListener('input', (e) => {
      const value = e.target.value;
      const atIndex = value.indexOf('@');

      if (atIndex > 0 && atIndex === value.length - 1) {
        // User just typed @, show domain suggestions
        this.showEmailDomainSuggestions(fieldElement, value);
      }
    });
  }

  showEmailDomainSuggestions(fieldElement, currentValue) {
    const suggestions = this.autoCompleteData.emailDomains.map(domain =>
      currentValue + domain
    );

    this.showAutoCompleteSuggestions(fieldElement, suggestions);
  }

  setupCompanyAutoComplete(fieldElement) {
    fieldElement.addEventListener('input', (e) => {
      const value = e.target.value.toLowerCase();

      if (value.length >= 2) {
        const suggestions = this.autoCompleteData.companyNames
          .filter(company => company.toLowerCase().includes(value))
          .slice(0, 5);

        if (suggestions.length > 0) {
          this.showAutoCompleteSuggestions(fieldElement, suggestions);
        }
      }
    });
  }

  showAutoCompleteSuggestions(fieldElement, suggestions) {
    // Remove existing suggestions
    const existingSuggestions = fieldElement.parentNode.querySelector('.autocomplete-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    if (suggestions.length === 0) return;

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'autocomplete-suggestions';
    suggestionsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #1a1a1a;
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    suggestions.forEach((suggestion, index) => {
      const suggestionItem = document.createElement('div');
      suggestionItem.className = 'autocomplete-item';
      suggestionItem.textContent = suggestion;
      suggestionItem.style.cssText = `
        padding: 12px 16px;
        cursor: pointer;
        color: #ffffff;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        transition: background-color 0.2s ease;
      `;

      suggestionItem.addEventListener('mouseenter', () => {
        suggestionItem.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
      });

      suggestionItem.addEventListener('mouseleave', () => {
        suggestionItem.style.backgroundColor = 'transparent';
      });

      suggestionItem.addEventListener('click', () => {
        fieldElement.value = suggestion;
        fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
        suggestionsContainer.remove();
      });

      suggestionsContainer.appendChild(suggestionItem);
    });

    // Position relative to field
    const fieldContainer = fieldElement.parentNode;
    if (getComputedStyle(fieldContainer).position === 'static') {
      fieldContainer.style.position = 'relative';
    }

    fieldContainer.appendChild(suggestionsContainer);

    // Remove suggestions when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function removeSuggestions(e) {
        if (!suggestionsContainer.contains(e.target) && e.target !== fieldElement) {
          suggestionsContainer.remove();
          document.removeEventListener('click', removeSuggestions);
        }
      });
    }, 100);
  }

  // Public API methods
  validateForm(formId) {
    const formState = this.formStates.get(formId);
    if (!formState) return false;

    let isFormValid = true;

    for (const [fieldId] of formState.fields) {
      const result = this.validateField(formId, fieldId);
      if (!result.isValid) {
        isFormValid = false;
      }
    }

    formState.isValid = isFormValid;
    return isFormValid;
  }

  getFormData(formId) {
    const formState = this.formStates.get(formId);
    if (!formState) return null;
    
    const formData = {};
    
    for (const [fieldId, fieldConfig] of formState.fields) {
      const fieldName = fieldConfig.element.name || fieldConfig.element.id;
      formData[fieldName] = fieldConfig.value;
    }
    
    return formData;
  }

  resetForm(formId) {
    const formState = this.formStates.get(formId);
    if (!formState) return;
    
    formState.config.element.reset();
    
    for (const [fieldId, fieldConfig] of formState.fields) {
      fieldConfig.value = '';
      fieldConfig.isDirty = false;
      fieldConfig.isValid = true;
      fieldConfig.errorMessage = null;
      
      this.updateFieldValidationUI(fieldId, true, null);
    }
    
    formState.isDirty = false;
    formState.isValid = false;
  }
}

// Create global instance
let formValidationManager = null;

export function getFormValidationManager() {
  if (!formValidationManager) {
    formValidationManager = new FormValidationManager();
  }
  return formValidationManager;
}

export function initializeFormValidation() {
  return getFormValidationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeFormValidation();
  });
}

export default FormValidationManager;
