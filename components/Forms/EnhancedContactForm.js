import React, { useEffect, useRef, useState } from 'react';
import { getFormValidationManager } from '../../src/lib/form-validation-manager';
import { getFileUploadManager } from '../../src/lib/file-upload-manager';
import { getBackendIntegrationManager } from '../../src/lib/backend-integration-manager';
import { getAccessibilityManager } from '../../src/lib/accessibility-manager';
import styles from './EnhancedContactForm.module.css';

const EnhancedContactForm = ({
  title = "Get In Touch",
  subtitle = "Let's discuss your AI automation needs",
  showFileUpload = true,
  autoSave = true,
  endpoint = "/api/contact",
  onSuccess = null,
  onError = null,
  className = ""
}) => {
  const formRef = useRef(null);
  const fileUploadRef = useRef(null);
  const [formId, setFormId] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formRef.current) {
      // Initialize form validation
      const formValidationManager = getFormValidationManager();
      const newFormId = formValidationManager.initializeForm(formRef.current, {
        autoSave,
        realTimeValidation: true,
        progressiveEnhancement: true,
        validationDelay: 300
      });
      setFormId(newFormId);

      // Initialize file upload if enabled
      if (showFileUpload && fileUploadRef.current) {
        const fileUploadManager = getFileUploadManager();
        const newUploadId = fileUploadManager.initializeUpload(fileUploadRef.current, {
          allowedTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 3,
          multiple: true,
          dragAndDrop: true,
          preview: true,
          autoUpload: false
        });
        setUploadId(newUploadId);
      }
    }

    return () => {
      // Cleanup on unmount
      if (formId) {
        const formValidationManager = getFormValidationManager();
        formValidationManager.clearAutoSavedData(formId);
      }
    };
  }, [autoSave, showFileUpload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const formValidationManager = getFormValidationManager();
      const backendIntegrationManager = getBackendIntegrationManager();

      // Validate form
      const isValid = formValidationManager.validateForm(formId);
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      // Get form data
      const formData = formValidationManager.getFormData(formId);

      // Get uploaded files if any
      let files = [];
      if (uploadId) {
        const fileUploadManager = getFileUploadManager();
        files = fileUploadManager.getFiles(uploadId);
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        hasAttachments: files.length > 0,
        attachmentCount: files.length,
        timestamp: new Date().toISOString(),
        source: 'enhanced-contact-form'
      };

      // Submit form
      const result = await backendIntegrationManager.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(submissionData),
        loadingTarget: formRef.current,
        onSuccess: (data) => {
          if (onSuccess) {
            onSuccess(data);
          }
          handleSubmissionSuccess(data);
        },
        onError: (error) => {
          if (onError) {
            onError(error);
          }
          handleSubmissionError(error);
        }
      });

      // Upload files if any
      if (files.length > 0) {
        await uploadFiles(files, result.submissionId);
      }

    } catch (error) {
      console.error('Form submission failed:', error);
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFiles = async (files, submissionId) => {
    const backendIntegrationManager = getBackendIntegrationManager();
    
    for (const file of files) {
      try {
        await backendIntegrationManager.uploadFile(file, (progress) => {
          // Update upload progress UI
          console.log(`Upload progress: ${progress}%`);
        });
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }
  };

  const handleSubmissionSuccess = (data) => {
    // Clear form
    if (formId) {
      const formValidationManager = getFormValidationManager();
      formValidationManager.resetForm(formId);
      formValidationManager.clearAutoSavedData(formId);
    }

    // Clear uploaded files
    if (uploadId) {
      const fileUploadManager = getFileUploadManager();
      fileUploadManager.clearFiles(uploadId);
    }

    // Announce success
    const accessibilityManager = getAccessibilityManager();
    accessibilityManager.announce('Form submitted successfully! We will get back to you soon.');
  };

  const handleSubmissionError = (error) => {
    // Announce error
    const accessibilityManager = getAccessibilityManager();
    accessibilityManager.announce(`Form submission failed: ${error.message}. Please try again.`);
  };

  return (
    <div className={`${styles.contactFormContainer} ${className}`}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>{title}</h2>
        <p className={styles.formSubtitle}>{subtitle}</p>
      </div>

      <form
        ref={formRef}
        className={`${styles.contactForm} api-form`}
        data-endpoint={endpoint}
        onSubmit={handleSubmit}
        noValidate
      >
        <div className={styles.formGrid}>
          {/* Name Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="name" className={styles.fieldLabel}>
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.fieldInput}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              aria-describedby="name-help"
            />
            <div id="name-help" className={styles.fieldHelp}>
              Enter your full name as you'd like us to address you
            </div>
          </div>

          {/* Email Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.fieldLabel}>
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.fieldInput}
              required
              autoComplete="email"
              aria-describedby="email-help"
            />
            <div id="email-help" className={styles.fieldHelp}>
              We'll use this to send you updates and responses
            </div>
          </div>

          {/* Phone Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="phone" className={styles.fieldLabel}>
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={styles.fieldInput}
              autoComplete="tel"
              aria-describedby="phone-help"
            />
            <div id="phone-help" className={styles.fieldHelp}>
              Optional - for urgent matters or preferred contact method
            </div>
          </div>

          {/* Company Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="company" className={styles.fieldLabel}>
              Company Name
            </label>
            <input
              type="text"
              id="company"
              name="company"
              className={styles.fieldInput}
              maxLength={100}
              autoComplete="organization"
              aria-describedby="company-help"
            />
            <div id="company-help" className={styles.fieldHelp}>
              Help us understand your business context
            </div>
          </div>

          {/* Subject Field */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label htmlFor="subject" className={styles.fieldLabel}>
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              className={styles.fieldInput}
              required
              minLength={5}
              maxLength={200}
              aria-describedby="subject-help"
            />
            <div id="subject-help" className={styles.fieldHelp}>
              Brief description of your inquiry or project
            </div>
          </div>

          {/* Message Field */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <label htmlFor="message" className={styles.fieldLabel}>
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              className={styles.fieldTextarea}
              required
              minLength={20}
              maxLength={2000}
              rows={6}
              aria-describedby="message-help"
            />
            <div id="message-help" className={styles.fieldHelp}>
              Tell us about your project, goals, and how we can help (20-2000 characters)
            </div>
          </div>

          {/* Budget Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="budget" className={styles.fieldLabel}>
              Project Budget
            </label>
            <select
              id="budget"
              name="budget"
              className={styles.fieldSelect}
              aria-describedby="budget-help"
            >
              <option value="">Select budget range</option>
              <option value="under-5k">Under $5,000</option>
              <option value="5k-15k">$5,000 - $15,000</option>
              <option value="15k-50k">$15,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="over-100k">Over $100,000</option>
              <option value="discuss">Prefer to discuss</option>
            </select>
            <div id="budget-help" className={styles.fieldHelp}>
              Helps us provide appropriate solutions and timeline
            </div>
          </div>

          {/* Timeline Field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="timeline" className={styles.fieldLabel}>
              Project Timeline
            </label>
            <select
              id="timeline"
              name="timeline"
              className={styles.fieldSelect}
              aria-describedby="timeline-help"
            >
              <option value="">Select timeline</option>
              <option value="asap">ASAP</option>
              <option value="1-month">Within 1 month</option>
              <option value="3-months">Within 3 months</option>
              <option value="6-months">Within 6 months</option>
              <option value="flexible">Flexible</option>
            </select>
            <div id="timeline-help" className={styles.fieldHelp}>
              When would you like to start or complete the project?
            </div>
          </div>

          {/* File Upload */}
          {showFileUpload && (
            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
              <label className={styles.fieldLabel}>
                Project Documents
              </label>
              <div ref={fileUploadRef} className={styles.fileUploadContainer}></div>
              <div className={styles.fieldHelp}>
                Upload project briefs, requirements, or reference materials (PDF, DOC, images up to 10MB each)
              </div>
            </div>
          )}

          {/* Newsletter Subscription */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                className={styles.fieldCheckbox}
                defaultChecked
              />
              <label htmlFor="newsletter" className={styles.checkboxLabel}>
                Subscribe to our newsletter for AI automation insights and updates
              </label>
            </div>
          </div>

          {/* Privacy Policy */}
          <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="privacy"
                name="privacy"
                className={styles.fieldCheckbox}
                required
              />
              <label htmlFor="privacy" className={styles.checkboxLabel}>
                I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and 
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> *
              </label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button
            type="submit"
            className={`${styles.submitButton} cta-button`}
            disabled={isSubmitting}
            aria-describedby="submit-help"
          >
            {isSubmitting ? (
              <>
                <span className={styles.submitSpinner}></span>
                Sending Message...
              </>
            ) : (
              <>
                Send Message
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                </svg>
              </>
            )}
          </button>
          <div id="submit-help" className={styles.submitHelp}>
            We typically respond within 24 hours during business days
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnhancedContactForm;
