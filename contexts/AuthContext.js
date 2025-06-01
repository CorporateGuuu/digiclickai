import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpiry, setSessionExpiry] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const TOKEN_KEY = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'digiclick_ai_token';
  const REFRESH_TOKEN_KEY = `${TOKEN_KEY}_refresh`;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(`${TOKEN_KEY}_user`);
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(`${TOKEN_KEY}_user`);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [TOKEN_KEY]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data;
        
        // Store in state
        setToken(newToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(`${TOKEN_KEY}_user`, JSON.stringify(userData));
        
        return { success: true, message: data.message };
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed',
          errors: data.errors 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData } = data;
        
        // Store in state
        setToken(newToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(`${TOKEN_KEY}_user`, JSON.stringify(userData));
        
        return { success: true, message: data.message };
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed',
          errors: data.errors 
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(`${TOKEN_KEY}_user`);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  // Password reset functions
  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Password reset email sent' : 'Failed to send reset email')
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Password reset successful' : 'Password reset failed')
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Email verification
  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Email verified successfully' : 'Email verification failed')
      };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Google OAuth login
  const googleLogin = async (googleToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData, refreshToken } = data;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(`${TOKEN_KEY}_user`, JSON.stringify(userData));
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }

        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Google login failed' };
      }
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Token refresh
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshTokenValue) return false;

      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { token: newToken, user: userData, refreshToken: newRefreshToken } = data;

        setToken(newToken);
        setUser(userData);

        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(`${TOKEN_KEY}_user`, JSON.stringify(userData));
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return false;
    }
  };

  // Make authenticated API call with auto-retry on token expiration
  const apiCall = async (endpoint, options = {}) => {
    try {
      let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      });

      // If unauthorized, try to refresh token and retry once
      if (response.status === 401 && token) {
        const refreshed = await refreshToken();
        if (refreshed) {
          response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
          });
        }
      }

      const data = await response.json();

      // Handle persistent unauthorized access
      if (response.status === 401 || response.status === 403) {
        logout();
        return {
          success: false,
          error: 'Session expired. Please login again.'
        };
      }

      return {
        success: response.ok,
        data: response.ok ? data : null,
        error: response.ok ? null : data.error || 'Request failed'
      };
    } catch (error) {
      console.error('API call error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    sessionExpiry,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    getAuthHeaders,
    apiCall,
    forgotPassword,
    resetPassword,
    verifyEmail,
    googleLogin,
    refreshToken,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
