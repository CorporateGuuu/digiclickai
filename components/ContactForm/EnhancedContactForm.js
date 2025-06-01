import React, { useState, useRef } from 'react';
import { submitContactForm, validateContactForm, validateFile } from '../../utils/api';

const EnhancedContactForm = ({ onSuccess, onError, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    website: '',
    service: '',
    budget: '',
    timeline: '',
    message: '',
    source: ''
  });
  
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const fileInputRef = useRef(null);

  const serviceOptions = [
    { value: '', label: 'Select a service' },
    { value: 'ai-website', label: 'AI-Crafted Website' },
    { value: 'automation', label: 'Automation Systems' },
    { value: 'seo', label: 'Intelligent SEO' },
    { value: 'marketing', label: 'Predictive Marketing' },
    { value: 'consulting', label: 'AI Consulting' },
    { value: 'custom', label: 'Custom Solution' }
  ];

  const budgetOptions = [
    { value: '', label: 'Select budget range' },
    { value: 'under-5k', label: 'Under $5,000' },
    { value: '5k-10k', label: '$5,000 - $10,000' },
    { value: '10k-25k', label: '$10,000 - $25,000' },
    { value: '25k-50k', label: '$25,000 - $50,000' },
    { value: 'over-50k', label: 'Over $50,000' },
    { value: 'discuss', label: 'Let\'s discuss' }
  ];

  const timelineOptions = [
    { value: '', label: 'Select timeline' },
    { value: 'asap', label: 'ASAP' },
    { value: '1-month', label: 'Within 1 month' },
    { value: '2-3-months', label: '2-3 months' },
    { value: '3-6-months', label: '3-6 months' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const sourceOptions = [
    { value: '', label: 'How did you hear about us?' },
    { value: 'google', label: 'Google Search' },
    { value: 'social-media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const fileErrors = [];

    selectedFiles.forEach((file, index) => {
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

      if (validation.isValid) {
        validFiles.push(file);
      } else {
        fileErrors.push(`${file.name}: ${validation.message}`);
      }
    });

    if (fileErrors.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: fileErrors.join(', ')
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        files: ''
      }));
    }

    setFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Validate form
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Add timestamp and user agent for analytics
      const enhancedFormData = {
        ...formData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        filesCount: files.length
      };

      const response = await submitContactForm(enhancedFormData, files);

      if (response.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.'
        });
        
        // Reset form
        setFormData({
          name: '', email: '', phone: '', company: '', website: '',
          service: '', budget: '', timeline: '', message: '', source: ''
        });
        setFiles([]);
        setErrors({});
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onSuccess?.(response);
      } else {
        setSubmitStatus({
          type: 'error',
          message: response.error || 'Failed to send message. Please try again.'
        });
        onError?.(response.error);
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
      onError?.(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`enhanced-contact-form ${className}`}>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-grid">
          {/* Personal Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Your full name"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="your.email@example.com"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
          </div>

          {/* Company Information */}
          <div className="form-section">
            <h3>Company Information</h3>
            
            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={errors.company ? 'error' : ''}
                placeholder="Your company name"
              />
              {errors.company && <span className="error-message">{errors.company}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className={errors.website ? 'error' : ''}
                placeholder="https://yourwebsite.com"
              />
              {errors.website && <span className="error-message">{errors.website}</span>}
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="form-section">
          <h3>Project Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="service">Service Needed</label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleInputChange}
              >
                {serviceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget Range</label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
              >
                {budgetOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="timeline">Timeline</label>
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
              >
                {timelineOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="message">Project Description *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={errors.message ? 'error' : ''}
              placeholder="Tell us about your project, goals, and any specific requirements..."
              rows="6"
              required
            />
            {errors.message && <span className="error-message">{errors.message}</span>}
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="files">Project Files (Optional)</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="files"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.doc,.docx"
                className="file-input"
              />
              <div className="file-upload-text">
                <span>📎 Drag files here or click to browse</span>
                <small>Max 5 files, 10MB each. Supported: Images, PDF, Documents</small>
              </div>
            </div>
            {errors.files && <span className="error-message">{errors.files}</span>}
            
            {files.length > 0 && (
              <div className="uploaded-files">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-file"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Source */}
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="source">How did you hear about us?</label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
            >
              {sourceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Status */}
        {submitStatus && (
          <div className={`form-message ${submitStatus.type} show`}>
            {submitStatus.message}
          </div>
        )}

        {/* Submit Button */}
        <div className="form-submit">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cta-button"
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedContactForm;
