/**
 * DigiClick AI Project Management Dashboard
 * Advanced project management with real-time collaboration and comprehensive analytics
 * Integrates with existing authentication and maintains WCAG 2.1 AA compliance
 */

import { getAuthenticationManager } from './authentication-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getAccessibilityManager } from './accessibility-manager';

class ProjectManagementDashboard {
  constructor() {
    this.authManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    this.accessibilityManager = null;
    
    this.currentProject = null;
    this.projects = new Map();
    this.realTimeConnections = new Map();
    this.collaborators = new Map();
    
    this.dashboardConfig = {
      views: {
        kanban: {
          name: 'Kanban Board',
          columns: ['backlog', 'todo', 'in_progress', 'review', 'done'],
          maxCardsPerColumn: 50,
          dragAndDrop: true
        },
        gantt: {
          name: 'Gantt Chart',
          timeScale: 'days',
          showDependencies: true,
          showCriticalPath: true
        },
        calendar: {
          name: 'Calendar View',
          showMilestones: true,
          showDeadlines: true,
          showTeamSchedule: true
        },
        analytics: {
          name: 'Analytics Dashboard',
          metrics: ['progress', 'velocity', 'burndown', 'team_productivity'],
          refreshInterval: 300000 // 5 minutes
        }
      },
      realTime: {
        enabled: true,
        reconnectAttempts: 5,
        reconnectDelay: 1000,
        heartbeatInterval: 30000,
        maxConnections: 100
      },
      collaboration: {
        maxFileSize: 25 * 1024 * 1024, // 25MB
        allowedFileTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/zip', 'application/x-zip-compressed'
        ],
        maxCommentsPerTask: 100,
        mentionNotifications: true
      }
    };
    
    this.projectTemplates = {
      'ai_automation': {
        name: 'AI Automation Project',
        phases: [
          { name: 'Discovery & Analysis', duration: 7, tasks: ['requirements_gathering', 'feasibility_study', 'data_analysis'] },
          { name: 'Design & Architecture', duration: 10, tasks: ['system_design', 'ai_model_selection', 'integration_planning'] },
          { name: 'Development', duration: 21, tasks: ['model_training', 'api_development', 'integration_development'] },
          { name: 'Testing & Optimization', duration: 7, tasks: ['model_testing', 'performance_optimization', 'user_testing'] },
          { name: 'Deployment & Training', duration: 5, tasks: ['production_deployment', 'user_training', 'documentation'] }
        ],
        defaultTeam: ['project_manager', 'ai_engineer', 'backend_developer', 'qa_engineer']
      },
      'web_application': {
        name: 'Web Application Project',
        phases: [
          { name: 'Planning & Design', duration: 10, tasks: ['requirements_analysis', 'ui_ux_design', 'technical_planning'] },
          { name: 'Frontend Development', duration: 15, tasks: ['component_development', 'responsive_design', 'accessibility_implementation'] },
          { name: 'Backend Development', duration: 12, tasks: ['api_development', 'database_design', 'authentication_system'] },
          { name: 'Integration & Testing', duration: 8, tasks: ['frontend_backend_integration', 'testing', 'performance_optimization'] },
          { name: 'Deployment & Launch', duration: 5, tasks: ['production_deployment', 'monitoring_setup', 'launch_support'] }
        ],
        defaultTeam: ['project_manager', 'frontend_developer', 'backend_developer', 'designer', 'qa_engineer']
      },
      'mobile_app': {
        name: 'Mobile Application Project',
        phases: [
          { name: 'Strategy & Planning', duration: 8, tasks: ['market_research', 'feature_planning', 'platform_selection'] },
          { name: 'Design & Prototyping', duration: 12, tasks: ['ui_design', 'ux_design', 'prototype_development'] },
          { name: 'Development', duration: 20, tasks: ['native_development', 'api_integration', 'offline_functionality'] },
          { name: 'Testing & Optimization', duration: 8, tasks: ['device_testing', 'performance_testing', 'app_store_optimization'] },
          { name: 'Launch & Support', duration: 4, tasks: ['app_store_submission', 'launch_marketing', 'post_launch_support'] }
        ],
        defaultTeam: ['project_manager', 'mobile_developer', 'designer', 'qa_engineer', 'devops_engineer']
      }
    };
    
    this.taskStatuses = {
      'backlog': { name: 'Backlog', color: '#6b7280', order: 1 },
      'todo': { name: 'To Do', color: '#3b82f6', order: 2 },
      'in_progress': { name: 'In Progress', color: '#f59e0b', order: 3 },
      'review': { name: 'Review', color: '#8b5cf6', order: 4 },
      'done': { name: 'Done', color: '#10b981', order: 5 },
      'blocked': { name: 'Blocked', color: '#ef4444', order: 6 }
    };
    
    this.priorityLevels = {
      'low': { name: 'Low', color: '#6b7280', value: 1 },
      'medium': { name: 'Medium', color: '#3b82f6', value: 2 },
      'high': { name: 'High', color: '#f59e0b', value: 3 },
      'urgent': { name: 'Urgent', color: '#ef4444', value: 4 }
    };
    
    this.analyticsMetrics = {
      progress: {
        name: 'Project Progress',
        calculation: 'completed_tasks / total_tasks * 100',
        format: 'percentage',
        target: 100
      },
      velocity: {
        name: 'Team Velocity',
        calculation: 'completed_story_points / sprint_duration',
        format: 'number',
        unit: 'points/day'
      },
      burndown: {
        name: 'Burndown Rate',
        calculation: 'remaining_work / remaining_time',
        format: 'number',
        unit: 'hours/day'
      },
      team_productivity: {
        name: 'Team Productivity',
        calculation: 'completed_tasks / team_size / time_period',
        format: 'number',
        unit: 'tasks/person/day'
      }
    };
    
    this.init();
  }

  async init() {
    this.authManager = getAuthenticationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.accessibilityManager = getAccessibilityManager();
    
    this.setupEventListeners();
    this.initializeRealTimeConnection();
    this.loadUserProjects();
  }

  setupEventListeners() {
    // Project management events
    window.addEventListener('project-create-requested', (e) => {
      this.createProject(e.detail);
    });

    window.addEventListener('project-update-requested', (e) => {
      this.updateProject(e.detail);
    });

    window.addEventListener('task-create-requested', (e) => {
      this.createTask(e.detail);
    });

    window.addEventListener('task-update-requested', (e) => {
      this.updateTask(e.detail);
    });

    window.addEventListener('file-upload-requested', (e) => {
      this.uploadFile(e.detail);
    });

    window.addEventListener('comment-create-requested', (e) => {
      this.createComment(e.detail);
    });

    // Real-time collaboration events
    window.addEventListener('collaboration-join-requested', (e) => {
      this.joinCollaboration(e.detail);
    });

    window.addEventListener('collaboration-leave-requested', (e) => {
      this.leaveCollaboration(e.detail);
    });

    // Dashboard view events
    window.addEventListener('dashboard-view-changed', (e) => {
      this.changeDashboardView(e.detail);
    });

    window.addEventListener('analytics-refresh-requested', () => {
      this.refreshAnalytics();
    });

    // Authentication events
    window.addEventListener('user-authenticated', () => {
      this.loadUserProjects();
      this.initializeRealTimeConnection();
    });

    window.addEventListener('user-logout', () => {
      this.disconnectRealTime();
      this.clearProjectData();
    });
  }

  async createProject(projectData) {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) {
        throw new Error('User must be authenticated to create projects');
      }
      
      // Check permissions
      if (!this.authManager.hasPermission('projects.create')) {
        throw new Error('Insufficient permissions to create projects');
      }
      
      // Validate project data
      const validation = this.validateProjectData(projectData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Apply project template if specified
      if (projectData.template) {
        projectData = this.applyProjectTemplate(projectData, projectData.template);
      }
      
      // Create project on backend
      const response = await this.backendManager.makeRequest('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...projectData,
          createdBy: currentUser.id,
          createdAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create project');
      }
      
      const newProject = await response.json();
      
      // Cache project locally
      this.projects.set(newProject.id, newProject);
      
      // Cache in Redis
      await this.cacheManager.set(
        `project:${newProject.id}`,
        newProject,
        3600 // 1 hour TTL
      );
      
      // Announce to screen readers
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce(`Project "${newProject.name}" created successfully`);
      }
      
      // Dispatch project created event
      window.dispatchEvent(new CustomEvent('project-created', {
        detail: { project: newProject }
      }));
      
      return newProject;
      
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  async updateProject(updateData) {
    try {
      const { projectId, ...updates } = updateData;
      
      // Check permissions
      if (!this.authManager.hasPermission('projects.update')) {
        throw new Error('Insufficient permissions to update projects');
      }
      
      // Update project on backend
      const response = await this.backendManager.makeRequest(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      const updatedProject = await response.json();
      
      // Update local cache
      this.projects.set(projectId, updatedProject);
      
      // Update Redis cache
      await this.cacheManager.set(
        `project:${projectId}`,
        updatedProject,
        3600
      );
      
      // Broadcast real-time update
      this.broadcastRealTimeUpdate('project_updated', {
        projectId,
        updates: updatedProject
      });
      
      return updatedProject;
      
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const { projectId, ...task } = taskData;
      
      // Check permissions
      if (!this.authManager.hasPermission('tasks.create')) {
        throw new Error('Insufficient permissions to create tasks');
      }
      
      // Validate task data
      const validation = this.validateTaskData(task);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Create task on backend
      const response = await this.backendManager.makeRequest(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          ...task,
          createdBy: this.authManager.getCurrentUser().id,
          createdAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      
      const newTask = await response.json();
      
      // Broadcast real-time update
      this.broadcastRealTimeUpdate('task_created', {
        projectId,
        task: newTask
      });
      
      // Announce to screen readers
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce(`Task "${newTask.title}" created`);
      }
      
      return newTask;
      
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  async updateTask(updateData) {
    try {
      const { projectId, taskId, ...updates } = updateData;
      
      // Check permissions
      if (!this.authManager.hasPermission('tasks.update')) {
        throw new Error('Insufficient permissions to update tasks');
      }
      
      // Update task on backend
      const response = await this.backendManager.makeRequest(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      
      // Broadcast real-time update
      this.broadcastRealTimeUpdate('task_updated', {
        projectId,
        taskId,
        updates: updatedTask
      });
      
      return updatedTask;
      
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  async uploadFile(fileData) {
    try {
      const { projectId, taskId, file, description } = fileData;
      
      // Check permissions
      if (!this.authManager.hasPermission('files.upload')) {
        throw new Error('Insufficient permissions to upload files');
      }
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description || '');
      formData.append('uploadedBy', this.authManager.getCurrentUser().id);
      
      // Upload file
      const endpoint = taskId 
        ? `/api/projects/${projectId}/tasks/${taskId}/files`
        : `/api/projects/${projectId}/files`;
      
      const response = await this.backendManager.makeRequest(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      const uploadedFile = await response.json();
      
      // Broadcast real-time update
      this.broadcastRealTimeUpdate('file_uploaded', {
        projectId,
        taskId,
        file: uploadedFile
      });
      
      return uploadedFile;
      
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async createComment(commentData) {
    try {
      const { projectId, taskId, content, mentions } = commentData;
      
      // Check permissions
      if (!this.authManager.hasPermission('comments.create')) {
        throw new Error('Insufficient permissions to create comments');
      }
      
      // Create comment on backend
      const response = await this.backendManager.makeRequest(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content,
          mentions: mentions || [],
          createdBy: this.authManager.getCurrentUser().id,
          createdAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create comment');
      }
      
      const newComment = await response.json();
      
      // Broadcast real-time update
      this.broadcastRealTimeUpdate('comment_created', {
        projectId,
        taskId,
        comment: newComment
      });
      
      // Send mention notifications
      if (mentions && mentions.length > 0) {
        this.sendMentionNotifications(mentions, newComment);
      }
      
      return newComment;
      
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async initializeRealTimeConnection() {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser || !this.dashboardConfig.realTime.enabled) {
        return;
      }
      
      // Initialize WebSocket connection
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/projects?token=${this.authManager.getAccessToken()}`;
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('Real-time connection established');
        this.setupHeartbeat();
      };
      
      this.websocket.onmessage = (event) => {
        this.handleRealTimeMessage(JSON.parse(event.data));
      };
      
      this.websocket.onclose = () => {
        console.log('Real-time connection closed');
        this.attemptReconnection();
      };
      
      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Error initializing real-time connection:', error);
    }
  }

  handleRealTimeMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'project_updated':
        this.handleProjectUpdate(data);
        break;
      case 'task_created':
        this.handleTaskCreated(data);
        break;
      case 'task_updated':
        this.handleTaskUpdated(data);
        break;
      case 'comment_created':
        this.handleCommentCreated(data);
        break;
      case 'file_uploaded':
        this.handleFileUploaded(data);
        break;
      case 'user_joined':
        this.handleUserJoined(data);
        break;
      case 'user_left':
        this.handleUserLeft(data);
        break;
      default:
        console.log('Unknown real-time message type:', type);
    }
  }

  broadcastRealTimeUpdate(type, data) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type, data }));
    }
  }

  validateProjectData(projectData) {
    const required = ['name', 'description', 'type'];
    
    for (const field of required) {
      if (!projectData[field]) {
        return { valid: false, message: `${field} is required` };
      }
    }
    
    if (projectData.name.length > 100) {
      return { valid: false, message: 'Project name must be 100 characters or less' };
    }
    
    if (projectData.description.length > 1000) {
      return { valid: false, message: 'Project description must be 1000 characters or less' };
    }
    
    return { valid: true };
  }

  validateTaskData(taskData) {
    if (!taskData.title || taskData.title.length === 0) {
      return { valid: false, message: 'Task title is required' };
    }
    
    if (taskData.title.length > 200) {
      return { valid: false, message: 'Task title must be 200 characters or less' };
    }
    
    if (taskData.status && !this.taskStatuses[taskData.status]) {
      return { valid: false, message: 'Invalid task status' };
    }
    
    if (taskData.priority && !this.priorityLevels[taskData.priority]) {
      return { valid: false, message: 'Invalid task priority' };
    }
    
    return { valid: true };
  }

  validateFile(file) {
    if (!file) {
      return { valid: false, message: 'No file provided' };
    }
    
    if (file.size > this.dashboardConfig.collaboration.maxFileSize) {
      return { valid: false, message: 'File size exceeds 25MB limit' };
    }
    
    if (!this.dashboardConfig.collaboration.allowedFileTypes.includes(file.type)) {
      return { valid: false, message: 'File type not allowed' };
    }
    
    return { valid: true };
  }

  applyProjectTemplate(projectData, templateName) {
    const template = this.projectTemplates[templateName];
    if (!template) {
      return projectData;
    }
    
    return {
      ...projectData,
      template: templateName,
      phases: template.phases,
      defaultTeam: template.defaultTeam,
      estimatedDuration: template.phases.reduce((total, phase) => total + phase.duration, 0)
    };
  }

  // Public API methods
  getCurrentProject() {
    return this.currentProject;
  }

  getProjects() {
    return Array.from(this.projects.values());
  }

  getProjectTemplates() {
    return this.projectTemplates;
  }

  getTaskStatuses() {
    return this.taskStatuses;
  }

  getPriorityLevels() {
    return this.priorityLevels;
  }

  getDashboardConfig() {
    return this.dashboardConfig;
  }

  async loadUserProjects() {
    try {
      const currentUser = this.authManager.getCurrentUser();
      if (!currentUser) return;
      
      const response = await this.backendManager.makeRequest('/api/projects', {
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (response.ok) {
        const projects = await response.json();
        projects.forEach(project => {
          this.projects.set(project.id, project);
        });
      }
    } catch (error) {
      console.error('Error loading user projects:', error);
    }
  }

  clearProjectData() {
    this.currentProject = null;
    this.projects.clear();
    this.collaborators.clear();
  }

  disconnectRealTime() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Create global instance
let projectManagementDashboard = null;

export function getProjectManagementDashboard() {
  if (!projectManagementDashboard) {
    projectManagementDashboard = new ProjectManagementDashboard();
  }
  return projectManagementDashboard;
}

export function initializeProjectManagementDashboard() {
  return getProjectManagementDashboard();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeProjectManagementDashboard();
  });
}

export default ProjectManagementDashboard;
