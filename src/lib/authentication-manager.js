/**
 * DigiClick AI Authentication Manager
 * JWT-based authentication with enhanced security, MFA, and OAuth integration
 * Maintains WCAG 2.1 AA compliance and integrates with existing infrastructure
 */

import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';
import { getAccessibilityManager } from './accessibility-manager';

class AuthenticationManager {
  constructor() {
    this.backendManager = null;
    this.cacheManager = null;
    this.accessibilityManager = null;
    
    this.currentUser = null;
    this.authState = 'unauthenticated'; // unauthenticated, authenticating, authenticated, expired
    this.tokens = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
    
    this.authConfig = {
      accessTokenExpiry: 15 * 60 * 1000, // 15 minutes
      refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      algorithm: 'RS256',
      issuer: 'digiclick-ai',
      audience: 'digiclick-ai-users'
    };
    
    this.securityConfig = {
      passwordRequirements: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        forbiddenPasswords: ['password', '12345678', 'qwerty123']
      },
      rateLimits: {
        login: { requests: 10, window: 60000 }, // 10 requests per minute
        registration: { requests: 3, window: 60000 }, // 3 requests per minute
        passwordReset: { requests: 5, window: 300000 }, // 5 requests per 5 minutes
        mfaVerification: { requests: 5, window: 60000 } // 5 requests per minute
      },
      accountLockout: {
        maxFailedAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        progressiveLockout: true
      },
      sessionSecurity: {
        csrfProtection: true,
        secureCookies: true,
        sameSiteStrict: true,
        httpOnly: true
      }
    };
    
    this.mfaConfig = {
      enabled: true,
      issuer: 'DigiClick AI',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      window: 1
    };
    
    this.oauthProviders = {
      google: {
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        responseType: 'code',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/google`
      },
      github: {
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        scope: 'user:email',
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback/github`
      }
    };
    
    this.userRoles = {
      'super_admin': {
        name: 'Super Administrator',
        permissions: ['*'], // All permissions
        level: 100
      },
      'project_manager': {
        name: 'Project Manager',
        permissions: [
          'projects.create', 'projects.read', 'projects.update', 'projects.delete',
          'users.read', 'users.invite', 'teams.manage', 'reports.view'
        ],
        level: 80
      },
      'developer': {
        name: 'Developer',
        permissions: [
          'projects.read', 'projects.update', 'tasks.create', 'tasks.update',
          'files.upload', 'comments.create', 'time.track'
        ],
        level: 60
      },
      'designer': {
        name: 'Designer',
        permissions: [
          'projects.read', 'projects.update', 'designs.create', 'designs.update',
          'files.upload', 'comments.create', 'reviews.create'
        ],
        level: 60
      },
      'client': {
        name: 'Client',
        permissions: [
          'projects.read', 'deliverables.approve', 'feedback.create',
          'invoices.view', 'reports.view'
        ],
        level: 40
      },
      'guest': {
        name: 'Guest',
        permissions: ['projects.read'],
        level: 20
      }
    };
    
    this.init();
  }

  async init() {
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    this.accessibilityManager = getAccessibilityManager();
    
    this.setupEventListeners();
    this.initializeAuthState();
    this.setupTokenRefresh();
    this.setupSecurityMonitoring();
  }

  setupEventListeners() {
    // Listen for authentication requests
    window.addEventListener('auth-login-requested', (e) => {
      this.handleLogin(e.detail);
    });

    window.addEventListener('auth-register-requested', (e) => {
      this.handleRegistration(e.detail);
    });

    window.addEventListener('auth-logout-requested', () => {
      this.handleLogout();
    });

    window.addEventListener('auth-password-reset-requested', (e) => {
      this.handlePasswordReset(e.detail);
    });

    window.addEventListener('auth-mfa-setup-requested', () => {
      this.setupMFA();
    });

    window.addEventListener('auth-oauth-requested', (e) => {
      this.handleOAuthLogin(e.detail);
    });

    // Listen for token expiration
    window.addEventListener('beforeunload', () => {
      this.saveAuthState();
    });

    // Listen for visibility changes to refresh tokens
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.authState === 'authenticated') {
        this.validateTokens();
      }
    });
  }

  async handleLogin(credentials) {
    try {
      this.authState = 'authenticating';
      this.dispatchAuthStateChange();
      
      // Validate credentials
      const validation = this.validateCredentials(credentials);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit('login', credentials.email);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many login attempts. Try again in ${rateLimitCheck.retryAfter} seconds.`);
      }
      
      // Attempt login
      const loginResponse = await this.backendManager.makeRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          rememberMe: credentials.rememberMe || false,
          deviceInfo: this.getDeviceInfo()
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await this.getCSRFToken()
        }
      });
      
      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const authData = await loginResponse.json();
      
      // Handle MFA if required
      if (authData.requiresMFA) {
        return await this.handleMFAChallenge(authData);
      }
      
      // Set authentication data
      await this.setAuthenticationData(authData);
      
      // Announce successful login to screen readers
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce('Successfully logged in to DigiClick AI dashboard');
      }
      
      return {
        success: true,
        user: this.currentUser,
        redirectUrl: authData.redirectUrl || '/dashboard'
      };
      
    } catch (error) {
      this.authState = 'unauthenticated';
      this.dispatchAuthStateChange();
      
      console.error('Login error:', error);
      
      // Announce error to screen readers
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce(`Login failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  async handleRegistration(userData) {
    try {
      // Validate registration data
      const validation = this.validateRegistrationData(userData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit('registration', userData.email);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many registration attempts. Try again in ${rateLimitCheck.retryAfter} seconds.`);
      }
      
      // Register user
      const registrationResponse = await this.backendManager.makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...userData,
          deviceInfo: this.getDeviceInfo()
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await this.getCSRFToken()
        }
      });
      
      if (!registrationResponse.ok) {
        const error = await registrationResponse.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const result = await registrationResponse.json();
      
      // Announce successful registration
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce('Registration successful. Please check your email for verification.');
      }
      
      return {
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        userId: result.userId
      };
      
    } catch (error) {
      console.error('Registration error:', error);
      
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce(`Registration failed: ${error.message}`);
      }
      
      throw error;
    }
  }

  async handleLogout() {
    try {
      // Notify backend of logout
      if (this.tokens.accessToken) {
        await this.backendManager.makeRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.tokens.accessToken}`,
            'X-CSRF-Token': await this.getCSRFToken()
          }
        });
      }
      
      // Clear authentication data
      this.clearAuthenticationData();
      
      // Announce logout
      if (this.accessibilityManager?.isScreenReaderEnabled()) {
        this.accessibilityManager.announce('Successfully logged out');
      }
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('user-logout'));
      
      return { success: true };
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if backend call fails
      this.clearAuthenticationData();
      throw error;
    }
  }

  async handlePasswordReset(resetData) {
    try {
      // Validate email
      if (!this.isValidEmail(resetData.email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Check rate limiting
      const rateLimitCheck = await this.checkRateLimit('passwordReset', resetData.email);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many password reset attempts. Try again in ${rateLimitCheck.retryAfter} seconds.`);
      }
      
      // Request password reset
      const response = await this.backendManager.makeRequest('/api/auth/password-reset', {
        method: 'POST',
        body: JSON.stringify({
          email: resetData.email,
          resetUrl: `${window.location.origin}/auth/reset-password`
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await this.getCSRFToken()
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset request failed');
      }
      
      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };
      
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async setupMFA() {
    try {
      if (!this.currentUser) {
        throw new Error('User must be authenticated to setup MFA');
      }
      
      const response = await this.backendManager.makeRequest('/api/auth/mfa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.tokens.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to setup MFA');
      }
      
      const mfaData = await response.json();
      
      return {
        success: true,
        secret: mfaData.secret,
        qrCode: mfaData.qrCode,
        backupCodes: mfaData.backupCodes
      };
      
    } catch (error) {
      console.error('MFA setup error:', error);
      throw error;
    }
  }

  async handleOAuthLogin(provider) {
    try {
      const providerConfig = this.oauthProviders[provider];
      if (!providerConfig) {
        throw new Error(`Unsupported OAuth provider: ${provider}`);
      }
      
      // Generate state parameter for CSRF protection
      const state = this.generateSecureToken();
      sessionStorage.setItem('oauth_state', state);
      
      // Build OAuth URL
      const oauthUrl = this.buildOAuthURL(provider, providerConfig, state);
      
      // Redirect to OAuth provider
      window.location.href = oauthUrl;
      
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
    }
  }

  async handleMFAChallenge(authData) {
    return new Promise((resolve, reject) => {
      // Dispatch MFA challenge event
      window.dispatchEvent(new CustomEvent('auth-mfa-challenge', {
        detail: {
          sessionId: authData.sessionId,
          resolve,
          reject
        }
      }));
    });
  }

  async verifyMFA(sessionId, code) {
    try {
      const response = await this.backendManager.makeRequest('/api/auth/mfa/verify', {
        method: 'POST',
        body: JSON.stringify({
          sessionId,
          code
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': await this.getCSRFToken()
        }
      });
      
      if (!response.ok) {
        throw new Error('Invalid MFA code');
      }
      
      const authData = await response.json();
      await this.setAuthenticationData(authData);
      
      return {
        success: true,
        user: this.currentUser
      };
      
    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }

  async setAuthenticationData(authData) {
    this.tokens = {
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      expiresAt: Date.now() + this.authConfig.accessTokenExpiry
    };
    
    this.currentUser = authData.user;
    this.authState = 'authenticated';
    
    // Cache user data
    await this.cacheManager.set(
      `auth:user:${this.currentUser.id}`,
      this.currentUser,
      this.authConfig.accessTokenExpiry / 1000
    );
    
    // Save to localStorage for persistence
    this.saveAuthState();
    
    // Dispatch authentication event
    this.dispatchAuthStateChange();
    window.dispatchEvent(new CustomEvent('user-authenticated', {
      detail: { user: this.currentUser }
    }));
  }

  clearAuthenticationData() {
    this.tokens = {
      accessToken: null,
      refreshToken: null,
      expiresAt: null
    };
    
    this.currentUser = null;
    this.authState = 'unauthenticated';
    
    // Clear localStorage
    localStorage.removeItem('digiclick_auth_state');
    
    // Clear session storage
    sessionStorage.removeItem('oauth_state');
    
    // Dispatch state change
    this.dispatchAuthStateChange();
  }

  async refreshTokens() {
    try {
      if (!this.tokens.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await this.backendManager.makeRequest('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refreshToken: this.tokens.refreshToken
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const authData = await response.json();
      await this.setAuthenticationData(authData);
      
      return true;
      
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuthenticationData();
      return false;
    }
  }

  async validateTokens() {
    if (!this.tokens.accessToken) {
      return false;
    }
    
    // Check if token is expired or will expire soon (5 minutes buffer)
    const expirationBuffer = 5 * 60 * 1000; // 5 minutes
    if (Date.now() >= (this.tokens.expiresAt - expirationBuffer)) {
      return await this.refreshTokens();
    }
    
    return true;
  }

  validateCredentials(credentials) {
    if (!credentials.email || !credentials.password) {
      return { valid: false, message: 'Email and password are required' };
    }
    
    if (!this.isValidEmail(credentials.email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    return { valid: true };
  }

  validateRegistrationData(userData) {
    const { email, password, confirmPassword, firstName, lastName, acceptTerms } = userData;
    
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      return { valid: false, message: 'All fields are required' };
    }
    
    if (!this.isValidEmail(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    
    if (password !== confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }
    
    if (!acceptTerms) {
      return { valid: false, message: 'You must accept the terms and conditions' };
    }
    
    return { valid: true };
  }

  validatePassword(password) {
    const requirements = this.securityConfig.passwordRequirements;
    
    if (password.length < requirements.minLength) {
      return { valid: false, message: `Password must be at least ${requirements.minLength} characters long` };
    }
    
    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    
    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    
    if (requirements.requireNumbers && !/\d/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    
    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    
    if (requirements.forbiddenPasswords.includes(password.toLowerCase())) {
      return { valid: false, message: 'This password is too common. Please choose a different one.' };
    }
    
    return { valid: true };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async checkRateLimit(action, identifier) {
    try {
      const limit = this.securityConfig.rateLimits[action];
      if (!limit) return { allowed: true };
      
      const key = `rate_limit:${action}:${identifier}`;
      const current = await this.cacheManager.get(key) || 0;
      
      if (current >= limit.requests) {
        const ttl = await this.cacheManager.ttl(key);
        return {
          allowed: false,
          retryAfter: Math.ceil(ttl)
        };
      }
      
      await this.cacheManager.set(key, current + 1, limit.window / 1000);
      return { allowed: true };
      
    } catch (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true }; // Fail open for availability
    }
  }

  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timestamp: new Date().toISOString()
    };
  }

  generateSecureToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  buildOAuthURL(provider, config, state) {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state,
      response_type: config.responseType || 'code'
    });
    
    const baseUrls = {
      google: 'https://accounts.google.com/oauth/authorize',
      github: 'https://github.com/login/oauth/authorize'
    };
    
    return `${baseUrls[provider]}?${params.toString()}`;
  }

  async getCSRFToken() {
    try {
      const response = await this.backendManager.makeRequest('/api/auth/csrf-token');
      if (response.ok) {
        const data = await response.json();
        return data.csrfToken;
      }
    } catch (error) {
      console.error('CSRF token error:', error);
    }
    return null;
  }

  saveAuthState() {
    if (this.authState === 'authenticated' && this.tokens.accessToken) {
      const authState = {
        tokens: this.tokens,
        user: this.currentUser,
        timestamp: Date.now()
      };
      
      localStorage.setItem('digiclick_auth_state', JSON.stringify(authState));
    }
  }

  initializeAuthState() {
    try {
      const savedState = localStorage.getItem('digiclick_auth_state');
      if (savedState) {
        const authState = JSON.parse(savedState);
        
        // Check if tokens are still valid
        if (authState.tokens.expiresAt > Date.now()) {
          this.tokens = authState.tokens;
          this.currentUser = authState.user;
          this.authState = 'authenticated';
          this.dispatchAuthStateChange();
        } else {
          // Try to refresh tokens
          this.refreshTokens();
        }
      }
    } catch (error) {
      console.error('Auth state initialization error:', error);
      this.clearAuthenticationData();
    }
  }

  setupTokenRefresh() {
    // Set up automatic token refresh
    setInterval(() => {
      if (this.authState === 'authenticated') {
        this.validateTokens();
      }
    }, 60000); // Check every minute
  }

  setupSecurityMonitoring() {
    // Monitor for suspicious activity
    window.addEventListener('focus', () => {
      if (this.authState === 'authenticated') {
        this.validateTokens();
      }
    });
  }

  dispatchAuthStateChange() {
    window.dispatchEvent(new CustomEvent('auth-state-changed', {
      detail: {
        authState: this.authState,
        user: this.currentUser,
        isAuthenticated: this.authState === 'authenticated'
      }
    }));
  }

  // Public API methods
  getCurrentUser() {
    return this.currentUser;
  }

  getAuthState() {
    return this.authState;
  }

  isAuthenticated() {
    return this.authState === 'authenticated' && this.tokens.accessToken;
  }

  hasPermission(permission) {
    if (!this.currentUser || !this.currentUser.role) {
      return false;
    }
    
    const userRole = this.userRoles[this.currentUser.role];
    if (!userRole) {
      return false;
    }
    
    // Super admin has all permissions
    if (userRole.permissions.includes('*')) {
      return true;
    }
    
    return userRole.permissions.includes(permission);
  }

  hasRole(role) {
    return this.currentUser?.role === role;
  }

  getAccessToken() {
    return this.tokens.accessToken;
  }

  getUserRoles() {
    return this.userRoles;
  }

  getSecurityConfig() {
    return this.securityConfig;
  }
}

// Create global instance
let authenticationManager = null;

export function getAuthenticationManager() {
  if (!authenticationManager) {
    authenticationManager = new AuthenticationManager();
  }
  return authenticationManager;
}

export function initializeAuthenticationManager() {
  return getAuthenticationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeAuthenticationManager();
  });
}

export default AuthenticationManager;
