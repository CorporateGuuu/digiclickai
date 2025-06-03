/**
 * DigiClick AI User Profile Manager
 * Comprehensive user profiles with project history and portfolio integration
 * GDPR compliant with data export and privacy controls
 */

import { getAuthenticationManager } from './authentication-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getDynamicPortfolioManager } from './dynamic-portfolio-manager';

class UserProfileManager {
  constructor() {
    this.authManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    this.portfolioManager = null;
    
    this.currentProfile = null;
    this.profileCache = new Map();
    
    this.profileSchema = {
      personalInfo: {
        firstName: { required: true, maxLength: 50 },
        lastName: { required: true, maxLength: 50 },
        email: { required: true, type: 'email' },
        phone: { required: false, type: 'phone' },
        title: { required: false, maxLength: 100 },
        bio: { required: false, maxLength: 500 },
        location: { required: false, maxLength: 100 },
        timezone: { required: false, type: 'timezone' }
      },
      companyInfo: {
        companyName: { required: false, maxLength: 100 },
        industry: { required: false, maxLength: 50 },
        companySize: { required: false, type: 'select', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'] },
        website: { required: false, type: 'url' },
        description: { required: false, maxLength: 1000 }
      },
      preferences: {
        theme: { required: true, type: 'select', options: ['light', 'dark', 'auto'], default: 'dark' },
        language: { required: true, type: 'select', options: ['en', 'es'], default: 'en' },
        timezone: { required: true, type: 'timezone', default: 'UTC' },
        notifications: {
          email: { required: true, type: 'boolean', default: true },
          push: { required: true, type: 'boolean', default: true },
          sms: { required: true, type: 'boolean', default: false },
          marketing: { required: true, type: 'boolean', default: false }
        },
        dashboard: {
          layout: { required: true, type: 'select', options: ['grid', 'list', 'kanban'], default: 'grid' },
          density: { required: true, type: 'select', options: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
          defaultView: { required: true, type: 'select', options: ['overview', 'projects', 'analytics'], default: 'overview' }
        },
        accessibility: {
          reducedMotion: { required: true, type: 'boolean', default: false },
          highContrast: { required: true, type: 'boolean', default: false },
          screenReader: { required: true, type: 'boolean', default: false },
          fontSize: { required: true, type: 'select', options: ['small', 'medium', 'large'], default: 'medium' }
        }
      },
      privacy: {
        profileVisibility: { required: true, type: 'select', options: ['public', 'team', 'private'], default: 'team' },
        showEmail: { required: true, type: 'boolean', default: false },
        showPhone: { required: true, type: 'boolean', default: false },
        allowDataExport: { required: true, type: 'boolean', default: true },
        allowDataDeletion: { required: true, type: 'boolean', default: true }
      }
    };
    
    this.projectHistorySchema = {
      project: {
        id: { required: true, type: 'string' },
        name: { required: true, maxLength: 100 },
        description: { required: false, maxLength: 1000 },
        type: { required: true, type: 'select', options: ['ai_automation', 'web_application', 'mobile_app', 'e_commerce', 'digital_transformation'] },
        status: { required: true, type: 'select', options: ['planning', 'in_progress', 'completed', 'on_hold', 'cancelled'] },
        priority: { required: true, type: 'select', options: ['low', 'medium', 'high', 'urgent'] },
        startDate: { required: true, type: 'date' },
        endDate: { required: false, type: 'date' },
        estimatedHours: { required: false, type: 'number' },
        actualHours: { required: false, type: 'number' },
        budget: { required: false, type: 'number' },
        spent: { required: false, type: 'number' }
      },
      milestones: {
        id: { required: true, type: 'string' },
        name: { required: true, maxLength: 100 },
        description: { required: false, maxLength: 500 },
        dueDate: { required: true, type: 'date' },
        completedDate: { required: false, type: 'date' },
        status: { required: true, type: 'select', options: ['pending', 'in_progress', 'completed', 'overdue'] },
        deliverables: { required: false, type: 'array' }
      },
      team: {
        userId: { required: true, type: 'string' },
        role: { required: true, type: 'string' },
        permissions: { required: true, type: 'array' },
        joinDate: { required: true, type: 'date' },
        leaveDate: { required: false, type: 'date' }
      }
    };
    
    this.portfolioIntegration = {
      showcaseProjects: {
        maxProjects: 12,
        requiredFields: ['name', 'description', 'technologies', 'outcomes'],
        mediaTypes: ['image', 'video', 'demo_link'],
        maxMediaSize: 10 * 1024 * 1024 // 10MB
      },
      testimonials: {
        maxTestimonials: 20,
        requiredFields: ['content', 'author', 'company'],
        moderationRequired: true
      },
      achievements: {
        categories: ['certifications', 'awards', 'publications', 'speaking'],
        verificationRequired: true
      }
    };
    
    this.dataExportFormats = {
      pdf: {
        name: 'PDF Report',
        description: 'Comprehensive profile and project history in PDF format',
        includes: ['profile', 'projects', 'portfolio', 'analytics']
      },
      csv: {
        name: 'CSV Data',
        description: 'Raw data in CSV format for analysis',
        includes: ['projects', 'time_tracking', 'communications']
      },
      json: {
        name: 'JSON Export',
        description: 'Complete data export in JSON format',
        includes: ['profile', 'projects', 'portfolio', 'preferences', 'history']
      }
    };
    
    this.init();
  }

  async init() {
    this.authManager = getAuthenticationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.portfolioManager = getDynamicPortfolioManager();
    
    this.setupEventListeners();
    this.loadCurrentUserProfile();
  }

  setupEventListeners() {
    // Listen for authentication events
    window.addEventListener('user-authenticated', (e) => {
      this.loadUserProfile(e.detail.user.id);
    });

    window.addEventListener('user-logout', () => {
      this.clearProfileData();
    });

    // Listen for profile update requests
    window.addEventListener('profile-update-requested', (e) => {
      this.updateProfile(e.detail);
    });

    window.addEventListener('profile-picture-upload-requested', (e) => {
      this.uploadProfilePicture(e.detail);
    });

    window.addEventListener('project-history-requested', (e) => {
      this.getProjectHistory(e.detail);
    });

    window.addEventListener('data-export-requested', (e) => {
      this.exportUserData(e.detail);
    });

    window.addEventListener('data-deletion-requested', (e) => {
      this.requestDataDeletion(e.detail);
    });
  }

  async loadUserProfile(userId) {
    try {
      // Check cache first
      if (this.profileCache.has(userId)) {
        this.currentProfile = this.profileCache.get(userId);
        this.dispatchProfileUpdate();
        return this.currentProfile;
      }
      
      // Load from backend
      const response = await this.backendManager.makeRequest(`/api/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load user profile');
      }
      
      const profileData = await response.json();
      
      // Validate and normalize profile data
      const normalizedProfile = this.normalizeProfileData(profileData);
      
      // Cache profile
      this.profileCache.set(userId, normalizedProfile);
      this.currentProfile = normalizedProfile;
      
      // Cache in Redis
      await this.cacheManager.set(
        `profile:${userId}`,
        normalizedProfile,
        3600 // 1 hour TTL
      );
      
      this.dispatchProfileUpdate();
      return normalizedProfile;
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  }

  async updateProfile(updateData) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to update profile');
      }
      
      // Validate update data
      const validation = this.validateProfileData(updateData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Update profile on backend
      const response = await this.backendManager.makeRequest(`/api/users/${currentUser.id}/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      
      // Update local cache
      this.profileCache.set(currentUser.id, updatedProfile);
      this.currentProfile = updatedProfile;
      
      // Update Redis cache
      await this.cacheManager.set(
        `profile:${currentUser.id}`,
        updatedProfile,
        3600
      );
      
      this.dispatchProfileUpdate();
      
      return {
        success: true,
        profile: updatedProfile
      };
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async uploadProfilePicture(fileData) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to upload profile picture');
      }
      
      // Validate file
      const validation = this.validateProfilePicture(fileData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('profilePicture', fileData.file);
      formData.append('userId', currentUser.id);
      
      // Upload to backend
      const response = await this.backendManager.makeRequest(`/api/users/${currentUser.id}/profile-picture`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
      
      const result = await response.json();
      
      // Update profile with new picture URL
      if (this.currentProfile) {
        this.currentProfile.profilePicture = result.profilePictureUrl;
        this.profileCache.set(currentUser.id, this.currentProfile);
        this.dispatchProfileUpdate();
      }
      
      return {
        success: true,
        profilePictureUrl: result.profilePictureUrl
      };
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async getProjectHistory(options = {}) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to view project history');
      }
      
      const { page = 1, limit = 20, status, type, sortBy = 'startDate', sortOrder = 'desc' } = options;
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      });
      
      if (status) queryParams.append('status', status);
      if (type) queryParams.append('type', type);
      
      // Fetch project history
      const response = await this.backendManager.makeRequest(`/api/users/${currentUser.id}/projects?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load project history');
      }
      
      const projectHistory = await response.json();
      
      // Enhance with portfolio data
      const enhancedProjects = await this.enhanceProjectsWithPortfolioData(projectHistory.projects);
      
      return {
        ...projectHistory,
        projects: enhancedProjects
      };
      
    } catch (error) {
      console.error('Error getting project history:', error);
      throw error;
    }
  }

  async enhanceProjectsWithPortfolioData(projects) {
    const enhancedProjects = [];
    
    for (const project of projects) {
      try {
        // Generate portfolio description if not exists
        if (!project.portfolioDescription) {
          const portfolioData = await this.portfolioManager.createProjectDescription({
            projectType: project.type,
            clientIndustry: project.clientIndustry || 'technology',
            technologies: project.technologies || [],
            outcomes: project.outcomes || []
          });
          
          project.portfolioDescription = portfolioData.overview;
        }
        
        // Add technology stack visualization
        if (project.technologies && project.technologies.length > 0) {
          const techStackViz = await this.portfolioManager.createTechStackVisualization({
            projectId: project.id,
            includeExpertise: true,
            includeProjectCount: true
          });
          
          project.technologyStackVisualization = techStackViz;
        }
        
        enhancedProjects.push(project);
      } catch (error) {
        console.error(`Error enhancing project ${project.id}:`, error);
        enhancedProjects.push(project); // Add without enhancement
      }
    }
    
    return enhancedProjects;
  }

  async exportUserData(exportOptions) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to export data');
      }
      
      const { format = 'pdf', includeProjects = true, includePortfolio = true, includeAnalytics = false } = exportOptions;
      
      // Validate export format
      if (!this.dataExportFormats[format]) {
        throw new Error(`Unsupported export format: ${format}`);
      }
      
      // Request data export
      const response = await this.backendManager.makeRequest(`/api/users/${currentUser.id}/export`, {
        method: 'POST',
        body: JSON.stringify({
          format,
          includeProjects,
          includePortfolio,
          includeAnalytics
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to export user data');
      }
      
      if (format === 'pdf') {
        // Handle PDF download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digiclick-ai-profile-${currentUser.id}-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Handle JSON/CSV download
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digiclick-ai-data-${currentUser.id}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      return {
        success: true,
        message: 'Data export completed successfully'
      };
      
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async requestDataDeletion(deletionOptions) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to request data deletion');
      }
      
      const { deleteProfile = false, deleteProjects = false, deletePortfolio = false, reason } = deletionOptions;
      
      // Request data deletion
      const response = await this.backendManager.makeRequest(`/api/users/${currentUser.id}/delete-data`, {
        method: 'POST',
        body: JSON.stringify({
          deleteProfile,
          deleteProjects,
          deletePortfolio,
          reason,
          requestedAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to request data deletion');
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: 'Data deletion request submitted successfully',
        requestId: result.requestId,
        estimatedCompletionDate: result.estimatedCompletionDate
      };
      
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }

  normalizeProfileData(profileData) {
    const normalized = {
      id: profileData.id,
      personalInfo: {},
      companyInfo: {},
      preferences: {},
      privacy: {},
      profilePicture: profileData.profilePicture,
      createdAt: profileData.createdAt,
      updatedAt: profileData.updatedAt
    };
    
    // Normalize each section according to schema
    Object.keys(this.profileSchema).forEach(section => {
      if (profileData[section]) {
        normalized[section] = { ...profileData[section] };
      } else {
        normalized[section] = this.getDefaultValues(this.profileSchema[section]);
      }
    });
    
    return normalized;
  }

  validateProfileData(data) {
    for (const [section, fields] of Object.entries(this.profileSchema)) {
      if (data[section]) {
        for (const [field, rules] of Object.entries(fields)) {
          if (data[section][field] !== undefined) {
            const validation = this.validateField(data[section][field], rules, `${section}.${field}`);
            if (!validation.valid) {
              return validation;
            }
          }
        }
      }
    }
    
    return { valid: true };
  }

  validateField(value, rules, fieldName) {
    if (rules.required && (value === null || value === undefined || value === '')) {
      return { valid: false, message: `${fieldName} is required` };
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      return { valid: false, message: `${fieldName} must be ${rules.maxLength} characters or less` };
    }
    
    if (value && rules.type === 'email' && !this.isValidEmail(value)) {
      return { valid: false, message: `${fieldName} must be a valid email address` };
    }
    
    if (value && rules.type === 'url' && !this.isValidURL(value)) {
      return { valid: false, message: `${fieldName} must be a valid URL` };
    }
    
    if (value && rules.type === 'select' && !rules.options.includes(value)) {
      return { valid: false, message: `${fieldName} must be one of: ${rules.options.join(', ')}` };
    }
    
    return { valid: true };
  }

  validateProfilePicture(fileData) {
    if (!fileData.file) {
      return { valid: false, message: 'No file provided' };
    }
    
    const file = fileData.file;
    const maxSize = 2 * 1024 * 1024; // 2MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      return { valid: false, message: 'File size must be less than 2MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'File must be JPEG, PNG, or WebP format' };
    }
    
    return { valid: true };
  }

  getDefaultValues(schema) {
    const defaults = {};
    
    Object.entries(schema).forEach(([field, rules]) => {
      if (rules.default !== undefined) {
        defaults[field] = rules.default;
      } else if (rules.type === 'boolean') {
        defaults[field] = false;
      } else if (rules.type === 'array') {
        defaults[field] = [];
      } else if (typeof rules === 'object' && !rules.type) {
        defaults[field] = this.getDefaultValues(rules);
      }
    });
    
    return defaults;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  loadCurrentUserProfile() {
    const currentUser = this.authManager.getCurrentUser();
    if (currentUser) {
      this.loadUserProfile(currentUser.id);
    }
  }

  clearProfileData() {
    this.currentProfile = null;
    this.profileCache.clear();
  }

  dispatchProfileUpdate() {
    window.dispatchEvent(new CustomEvent('user-profile-updated', {
      detail: { profile: this.currentProfile }
    }));
  }

  // Public API methods
  getCurrentProfile() {
    return this.currentProfile;
  }

  async updateUserPreferences(preferences) {
    return await this.updateProfile({ preferences });
  }

  async updatePersonalInfo(personalInfo) {
    return await this.updateProfile({ personalInfo });
  }

  async updateCompanyInfo(companyInfo) {
    return await this.updateProfile({ companyInfo });
  }

  async updatePrivacySettings(privacy) {
    return await this.updateProfile({ privacy });
  }

  getProfileSchema() {
    return this.profileSchema;
  }

  getDataExportFormats() {
    return this.dataExportFormats;
  }

  getPortfolioIntegration() {
    return this.portfolioIntegration;
  }
}

// Create global instance
let userProfileManager = null;

export function getUserProfileManager() {
  if (!userProfileManager) {
    userProfileManager = new UserProfileManager();
  }
  return userProfileManager;
}

export function initializeUserProfileManager() {
  return getUserProfileManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeUserProfileManager();
  });
}

export default UserProfileManager;
