/**
 * DigiClick AI Role-Based Access Control (RBAC) Manager
 * Comprehensive RBAC system with granular permissions and audit logging
 * SOC 2 Type II compliant with enterprise security features
 */

import { getAuthenticationManager } from './authentication-manager';
import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class RBACManager {
  constructor() {
    this.authManager = null;
    this.backendManager = null;
    this.cacheManager = null;
    
    this.permissions = new Map();
    this.roles = new Map();
    this.userRoles = new Map();
    this.auditLog = [];
    
    this.permissionCategories = {
      'projects': {
        name: 'Project Management',
        permissions: {
          'projects.create': 'Create new projects',
          'projects.read': 'View project details',
          'projects.update': 'Edit project information',
          'projects.delete': 'Delete projects',
          'projects.archive': 'Archive/unarchive projects',
          'projects.export': 'Export project data'
        }
      },
      'tasks': {
        name: 'Task Management',
        permissions: {
          'tasks.create': 'Create new tasks',
          'tasks.read': 'View task details',
          'tasks.update': 'Edit task information',
          'tasks.delete': 'Delete tasks',
          'tasks.assign': 'Assign tasks to team members',
          'tasks.track_time': 'Track time on tasks'
        }
      },
      'users': {
        name: 'User Management',
        permissions: {
          'users.create': 'Create new user accounts',
          'users.read': 'View user profiles',
          'users.update': 'Edit user information',
          'users.delete': 'Delete user accounts',
          'users.invite': 'Invite new users',
          'users.manage_roles': 'Assign and modify user roles'
        }
      },
      'teams': {
        name: 'Team Management',
        permissions: {
          'teams.create': 'Create new teams',
          'teams.read': 'View team information',
          'teams.update': 'Edit team details',
          'teams.delete': 'Delete teams',
          'teams.manage': 'Manage team membership',
          'teams.assign_projects': 'Assign projects to teams'
        }
      },
      'files': {
        name: 'File Management',
        permissions: {
          'files.upload': 'Upload files',
          'files.download': 'Download files',
          'files.delete': 'Delete files',
          'files.share': 'Share files with others',
          'files.manage_versions': 'Manage file versions'
        }
      },
      'comments': {
        name: 'Communication',
        permissions: {
          'comments.create': 'Create comments',
          'comments.read': 'View comments',
          'comments.update': 'Edit own comments',
          'comments.delete': 'Delete comments',
          'comments.moderate': 'Moderate all comments'
        }
      },
      'reports': {
        name: 'Reports & Analytics',
        permissions: {
          'reports.view': 'View reports and analytics',
          'reports.create': 'Create custom reports',
          'reports.export': 'Export report data',
          'reports.schedule': 'Schedule automated reports'
        }
      },
      'billing': {
        name: 'Billing & Invoicing',
        permissions: {
          'billing.view': 'View billing information',
          'billing.manage': 'Manage billing and payments',
          'billing.export': 'Export billing data',
          'billing.create_invoices': 'Create and send invoices'
        }
      },
      'admin': {
        name: 'System Administration',
        permissions: {
          'admin.system_settings': 'Manage system settings',
          'admin.security_settings': 'Manage security configurations',
          'admin.audit_logs': 'View audit logs',
          'admin.backup_restore': 'Perform backup and restore operations',
          'admin.integrations': 'Manage third-party integrations'
        }
      }
    };
    
    this.predefinedRoles = {
      'super_admin': {
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        level: 100,
        permissions: ['*'], // Wildcard for all permissions
        inherits: [],
        restrictions: [],
        isSystemRole: true
      },
      'project_manager': {
        name: 'Project Manager',
        description: 'Manages projects, teams, and client relationships',
        level: 80,
        permissions: [
          'projects.*', 'tasks.*', 'teams.*', 'users.read', 'users.invite',
          'files.*', 'comments.*', 'reports.view', 'reports.create',
          'billing.view', 'billing.create_invoices'
        ],
        inherits: [],
        restrictions: ['admin.*'],
        isSystemRole: true
      },
      'team_lead': {
        name: 'Team Lead',
        description: 'Leads development teams and manages technical tasks',
        level: 70,
        permissions: [
          'projects.read', 'projects.update', 'tasks.*', 'teams.read', 'teams.manage',
          'users.read', 'files.*', 'comments.*', 'reports.view'
        ],
        inherits: ['developer'],
        restrictions: ['users.delete', 'projects.delete', 'billing.*', 'admin.*'],
        isSystemRole: true
      },
      'developer': {
        name: 'Developer',
        description: 'Develops and maintains project deliverables',
        level: 60,
        permissions: [
          'projects.read', 'tasks.read', 'tasks.update', 'tasks.track_time',
          'files.upload', 'files.download', 'comments.create', 'comments.read'
        ],
        inherits: [],
        restrictions: ['users.*', 'teams.delete', 'projects.delete', 'billing.*', 'admin.*'],
        isSystemRole: true
      },
      'designer': {
        name: 'Designer',
        description: 'Creates and manages design assets and user experience',
        level: 60,
        permissions: [
          'projects.read', 'tasks.read', 'tasks.update', 'files.*',
          'comments.create', 'comments.read', 'reports.view'
        ],
        inherits: [],
        restrictions: ['users.*', 'teams.delete', 'projects.delete', 'billing.*', 'admin.*'],
        isSystemRole: true
      },
      'client': {
        name: 'Client',
        description: 'Client access to view project progress and provide feedback',
        level: 40,
        permissions: [
          'projects.read', 'tasks.read', 'files.download', 'comments.create',
          'comments.read', 'reports.view', 'billing.view'
        ],
        inherits: [],
        restrictions: ['users.*', 'teams.*', 'projects.update', 'projects.delete', 'admin.*'],
        isSystemRole: true
      },
      'guest': {
        name: 'Guest',
        description: 'Limited read-only access to specific projects',
        level: 20,
        permissions: ['projects.read', 'tasks.read', 'comments.read'],
        inherits: [],
        restrictions: ['*'], // Restricted from everything except explicitly allowed
        isSystemRole: true
      }
    };
    
    this.auditConfig = {
      enabled: true,
      retentionDays: 365,
      logActions: [
        'permission_granted', 'permission_revoked', 'role_assigned', 'role_removed',
        'user_created', 'user_deleted', 'project_accessed', 'data_exported',
        'settings_changed', 'login_attempt', 'logout', 'password_changed'
      ],
      sensitiveActions: [
        'admin.system_settings', 'admin.security_settings', 'users.delete',
        'projects.delete', 'billing.manage', 'admin.backup_restore'
      ],
      complianceMode: true
    };
    
    this.securityPolicies = {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
        preventReuse: 5 // last 5 passwords
      },
      sessionPolicy: {
        maxDuration: 8 * 60 * 60 * 1000, // 8 hours
        idleTimeout: 30 * 60 * 1000, // 30 minutes
        maxConcurrentSessions: 3,
        requireReauth: ['admin.*', 'billing.manage', 'users.delete']
      },
      accessPolicy: {
        maxFailedAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        ipWhitelist: [],
        timeBasedAccess: {},
        geolocationRestrictions: false
      }
    };
    
    this.init();
  }

  async init() {
    this.authManager = getAuthenticationManager();
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.initializeRoles();
    this.loadUserPermissions();
    this.startAuditLogging();
  }

  setupEventListeners() {
    // Permission check events
    window.addEventListener('permission-check-requested', (e) => {
      this.checkPermission(e.detail);
    });

    // Role management events
    window.addEventListener('role-assign-requested', (e) => {
      this.assignRole(e.detail);
    });

    window.addEventListener('role-revoke-requested', (e) => {
      this.revokeRole(e.detail);
    });

    // Permission management events
    window.addEventListener('permission-grant-requested', (e) => {
      this.grantPermission(e.detail);
    });

    window.addEventListener('permission-revoke-requested', (e) => {
      this.revokePermission(e.detail);
    });

    // Audit events
    window.addEventListener('audit-log-requested', (e) => {
      this.getAuditLog(e.detail);
    });

    // Authentication events
    window.addEventListener('user-authenticated', (e) => {
      this.loadUserPermissions(e.detail.user.id);
    });

    window.addEventListener('user-logout', () => {
      this.clearPermissionCache();
    });
  }

  async checkPermission(permissionData) {
    try {
      const { permission, userId, resourceId, context } = permissionData;
      
      const currentUser = userId || this.authManager.getCurrentUser()?.id;
      if (!currentUser) {
        return { allowed: false, reason: 'User not authenticated' };
      }
      
      // Check cache first
      const cacheKey = `permission:${currentUser}:${permission}:${resourceId || 'global'}`;
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }
      
      // Get user roles and permissions
      const userPermissions = await this.getUserPermissions(currentUser);
      
      // Check if user has the specific permission
      const hasPermission = this.evaluatePermission(permission, userPermissions, context);
      
      const result = {
        allowed: hasPermission,
        reason: hasPermission ? 'Permission granted' : 'Insufficient permissions',
        checkedAt: new Date().toISOString()
      };
      
      // Cache result for 5 minutes
      await this.cacheManager.set(cacheKey, result, 300);
      
      // Log permission check
      this.logAuditEvent('permission_checked', {
        userId: currentUser,
        permission,
        resourceId,
        result: hasPermission,
        context
      });
      
      return result;
      
    } catch (error) {
      console.error('Error checking permission:', error);
      return { allowed: false, reason: 'Permission check failed' };
    }
  }

  async assignRole(roleData) {
    try {
      const { userId, roleId, assignedBy, expiresAt } = roleData;
      
      // Check if current user can assign roles
      const canAssignRoles = await this.checkPermission({
        permission: 'users.manage_roles',
        userId: this.authManager.getCurrentUser()?.id
      });
      
      if (!canAssignRoles.allowed) {
        throw new Error('Insufficient permissions to assign roles');
      }
      
      // Validate role exists
      const role = this.roles.get(roleId);
      if (!role) {
        throw new Error(`Role ${roleId} not found`);
      }
      
      // Assign role on backend
      const response = await this.backendManager.makeRequest('/api/rbac/assign-role', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          roleId,
          assignedBy: assignedBy || this.authManager.getCurrentUser()?.id,
          expiresAt,
          assignedAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign role');
      }
      
      const result = await response.json();
      
      // Update local cache
      this.userRoles.set(userId, [...(this.userRoles.get(userId) || []), roleId]);
      
      // Clear permission cache for user
      await this.clearUserPermissionCache(userId);
      
      // Log audit event
      this.logAuditEvent('role_assigned', {
        userId,
        roleId,
        assignedBy: assignedBy || this.authManager.getCurrentUser()?.id,
        expiresAt
      });
      
      return result;
      
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  async revokeRole(roleData) {
    try {
      const { userId, roleId, revokedBy, reason } = roleData;
      
      // Check if current user can revoke roles
      const canRevokeRoles = await this.checkPermission({
        permission: 'users.manage_roles',
        userId: this.authManager.getCurrentUser()?.id
      });
      
      if (!canRevokeRoles.allowed) {
        throw new Error('Insufficient permissions to revoke roles');
      }
      
      // Revoke role on backend
      const response = await this.backendManager.makeRequest('/api/rbac/revoke-role', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          roleId,
          revokedBy: revokedBy || this.authManager.getCurrentUser()?.id,
          reason,
          revokedAt: new Date().toISOString()
        }),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke role');
      }
      
      const result = await response.json();
      
      // Update local cache
      const userRoles = this.userRoles.get(userId) || [];
      this.userRoles.set(userId, userRoles.filter(role => role !== roleId));
      
      // Clear permission cache for user
      await this.clearUserPermissionCache(userId);
      
      // Log audit event
      this.logAuditEvent('role_revoked', {
        userId,
        roleId,
        revokedBy: revokedBy || this.authManager.getCurrentUser()?.id,
        reason
      });
      
      return result;
      
    } catch (error) {
      console.error('Error revoking role:', error);
      throw error;
    }
  }

  async getUserPermissions(userId) {
    try {
      // Check cache first
      const cacheKey = `user_permissions:${userId}`;
      const cachedPermissions = await this.cacheManager.get(cacheKey);
      if (cachedPermissions) {
        return cachedPermissions;
      }
      
      // Get user roles
      const userRoles = this.userRoles.get(userId) || [];
      const permissions = new Set();
      
      // Collect permissions from all roles
      for (const roleId of userRoles) {
        const role = this.roles.get(roleId);
        if (role) {
          // Add direct permissions
          role.permissions.forEach(permission => {
            permissions.add(permission);
          });
          
          // Add inherited permissions
          if (role.inherits) {
            for (const inheritedRoleId of role.inherits) {
              const inheritedRole = this.roles.get(inheritedRoleId);
              if (inheritedRole) {
                inheritedRole.permissions.forEach(permission => {
                  permissions.add(permission);
                });
              }
            }
          }
        }
      }
      
      const userPermissions = Array.from(permissions);
      
      // Cache permissions for 10 minutes
      await this.cacheManager.set(cacheKey, userPermissions, 600);
      
      return userPermissions;
      
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  evaluatePermission(requiredPermission, userPermissions, context = {}) {
    // Check for wildcard permission (super admin)
    if (userPermissions.includes('*')) {
      return true;
    }
    
    // Check for exact permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }
    
    // Check for wildcard category permissions (e.g., 'projects.*')
    const category = requiredPermission.split('.')[0];
    if (userPermissions.includes(`${category}.*`)) {
      return true;
    }
    
    // Check context-based permissions
    if (context.resourceOwner && context.resourceOwner === this.authManager.getCurrentUser()?.id) {
      // Users can typically modify their own resources
      const ownResourcePermissions = ['read', 'update'];
      const action = requiredPermission.split('.')[1];
      if (ownResourcePermissions.includes(action)) {
        return true;
      }
    }
    
    return false;
  }

  async getAuditLog(options = {}) {
    try {
      const { startDate, endDate, userId, action, limit = 100, offset = 0 } = options;
      
      // Check if user can view audit logs
      const canViewAudit = await this.checkPermission({
        permission: 'admin.audit_logs',
        userId: this.authManager.getCurrentUser()?.id
      });
      
      if (!canViewAudit.allowed) {
        throw new Error('Insufficient permissions to view audit logs');
      }
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (userId) queryParams.append('userId', userId);
      if (action) queryParams.append('action', action);
      
      // Fetch audit log from backend
      const response = await this.backendManager.makeRequest(`/api/rbac/audit-log?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch audit log');
      }
      
      return await response.json();
      
    } catch (error) {
      console.error('Error getting audit log:', error);
      throw error;
    }
  }

  logAuditEvent(action, details) {
    if (!this.auditConfig.enabled) {
      return;
    }
    
    const auditEntry = {
      id: this.generateAuditId(),
      action,
      userId: this.authManager.getCurrentUser()?.id,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.authManager.getSessionId?.() || 'unknown'
    };
    
    // Add to local audit log
    this.auditLog.push(auditEntry);
    
    // Send to backend for persistent storage
    this.sendAuditToBackend(auditEntry);
    
    // Dispatch audit event
    window.dispatchEvent(new CustomEvent('audit-event-logged', {
      detail: auditEntry
    }));
  }

  async sendAuditToBackend(auditEntry) {
    try {
      await this.backendManager.makeRequest('/api/rbac/audit-log', {
        method: 'POST',
        body: JSON.stringify(auditEntry),
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error sending audit log to backend:', error);
    }
  }

  initializeRoles() {
    // Load predefined roles
    Object.entries(this.predefinedRoles).forEach(([roleId, role]) => {
      this.roles.set(roleId, role);
    });
    
    // Load permissions
    Object.values(this.permissionCategories).forEach(category => {
      Object.entries(category.permissions).forEach(([permissionId, description]) => {
        this.permissions.set(permissionId, {
          id: permissionId,
          description,
          category: category.name
        });
      });
    });
  }

  async loadUserPermissions(userId) {
    try {
      if (!userId) return;
      
      const response = await this.backendManager.makeRequest(`/api/rbac/users/${userId}/roles`, {
        headers: {
          'Authorization': `Bearer ${this.authManager.getAccessToken()}`
        }
      });
      
      if (response.ok) {
        const userRoles = await response.json();
        this.userRoles.set(userId, userRoles.map(role => role.id));
      }
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  }

  async clearUserPermissionCache(userId) {
    const cacheKey = `user_permissions:${userId}`;
    await this.cacheManager.del(cacheKey);
    
    // Clear all permission check caches for this user
    const permissionKeys = await this.cacheManager.keys(`permission:${userId}:*`);
    if (permissionKeys.length > 0) {
      await this.cacheManager.del(...permissionKeys);
    }
  }

  clearPermissionCache() {
    this.userRoles.clear();
  }

  startAuditLogging() {
    // Clean up old audit logs periodically
    setInterval(() => {
      this.cleanupAuditLog();
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  cleanupAuditLog() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.auditConfig.retentionDays);
    
    this.auditLog = this.auditLog.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
  }

  generateAuditId() {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getClientIP() {
    // In a real implementation, this would get the actual client IP
    return 'unknown';
  }

  // Public API methods
  async hasPermission(permission, context = {}) {
    const result = await this.checkPermission({ permission, context });
    return result.allowed;
  }

  async hasRole(roleId, userId = null) {
    const targetUserId = userId || this.authManager.getCurrentUser()?.id;
    if (!targetUserId) return false;
    
    const userRoles = this.userRoles.get(targetUserId) || [];
    return userRoles.includes(roleId);
  }

  getRoles() {
    return Array.from(this.roles.values());
  }

  getPermissions() {
    return Array.from(this.permissions.values());
  }

  getPermissionCategories() {
    return this.permissionCategories;
  }

  getSecurityPolicies() {
    return this.securityPolicies;
  }

  getAuditConfig() {
    return this.auditConfig;
  }
}

// Create global instance
let rbacManager = null;

export function getRBACManager() {
  if (!rbacManager) {
    rbacManager = new RBACManager();
  }
  return rbacManager;
}

export function initializeRBACManager() {
  return getRBACManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeRBACManager();
  });
}

export default RBACManager;
