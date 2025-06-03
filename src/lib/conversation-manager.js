/**
 * DigiClick AI Conversation Manager
 * Handles conversation history, user sessions, and data persistence
 * Integrates with MongoDB and localStorage for comprehensive data management
 */

import { getBackendIntegrationManager } from './backend-integration-manager';
import { getRedisCacheManager } from './redis-cache-manager';

class ConversationManager {
  constructor() {
    this.backendManager = null;
    this.cacheManager = null;
    this.currentSession = null;
    this.conversations = new Map();
    
    this.sessionConfig = {
      maxConversations: 100,
      maxMessagesPerConversation: 200,
      sessionTimeout: 86400000, // 24 hours
      autoSaveInterval: 30000, // 30 seconds
      syncInterval: 300000 // 5 minutes
    };
    
    this.storageKeys = {
      currentSession: 'digiclick_chat_session',
      conversations: 'digiclick_chat_conversations',
      userPreferences: 'digiclick_chat_preferences',
      exportData: 'digiclick_chat_export'
    };
    
    this.encryptionEnabled = true;
    this.gdprCompliant = true;
    
    this.init();
  }

  async init() {
    this.backendManager = getBackendIntegrationManager();
    this.cacheManager = getRedisCacheManager();
    
    this.setupEventListeners();
    this.initializeSession();
    this.startAutoSave();
    this.startCloudSync();
  }

  setupEventListeners() {
    // Listen for new messages
    window.addEventListener('chatbot-message-sent', (e) => {
      this.addMessageToConversation(e.detail, 'user');
    });

    window.addEventListener('chatbot-response-generated', (e) => {
      this.addMessageToConversation(e.detail, 'assistant');
    });

    // Listen for session events
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
    });

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.saveToLocalStorage();
      }
    });

    // Listen for user authentication events
    window.addEventListener('user-authenticated', (e) => {
      this.linkSessionToUser(e.detail.userId);
    });

    window.addEventListener('user-logout', () => {
      this.handleUserLogout();
    });
  }

  initializeSession() {
    // Try to restore existing session
    const savedSession = this.loadFromLocalStorage();
    
    if (savedSession && this.isSessionValid(savedSession)) {
      this.currentSession = savedSession;
      this.conversations = new Map(savedSession.conversations || []);
    } else {
      this.createNewSession();
    }
    
    console.log('Conversation session initialized:', this.currentSession.id);
  }

  createNewSession() {
    this.currentSession = {
      id: this.generateSessionId(),
      userId: null, // Anonymous by default
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      conversations: [],
      preferences: this.getDefaultPreferences(),
      metadata: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    this.conversations.clear();
    this.saveToLocalStorage();
  }

  getDefaultPreferences() {
    return {
      theme: 'dark',
      notifications: true,
      soundEnabled: false,
      typingIndicators: true,
      messageTimestamps: true,
      exportFormat: 'pdf',
      dataRetention: 30, // days
      privacyMode: false
    };
  }

  async addMessageToConversation(messageData, sender) {
    const conversationId = messageData.sessionId || this.currentSession.id;
    
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = this.createNewConversation(conversationId);
      this.conversations.set(conversationId, conversation);
    }
    
    const message = {
      id: this.generateMessageId(),
      sender,
      content: messageData.message || messageData.content,
      timestamp: new Date().toISOString(),
      metadata: {
        type: messageData.type || 'text',
        pageContext: messageData.pageContext,
        cached: messageData.cached || false,
        responseTime: messageData.responseTime,
        tokens: messageData.tokens
      }
    };
    
    conversation.messages.push(message);
    conversation.lastActivity = message.timestamp;
    conversation.messageCount++;
    
    // Limit conversation length
    if (conversation.messages.length > this.sessionConfig.maxMessagesPerConversation) {
      conversation.messages.splice(0, conversation.messages.length - this.sessionConfig.maxMessagesPerConversation);
    }
    
    // Update session activity
    this.currentSession.lastActivity = message.timestamp;
    
    // Dispatch conversation updated event
    window.dispatchEvent(new CustomEvent('conversation-updated', {
      detail: { conversationId, message, conversation }
    }));
    
    return message;
  }

  createNewConversation(conversationId) {
    return {
      id: conversationId,
      title: this.generateConversationTitle(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messages: [],
      messageCount: 0,
      tags: [],
      archived: false,
      metadata: {
        startPage: window.location.pathname,
        userAgent: navigator.userAgent
      }
    };
  }

  generateConversationTitle() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateString = now.toLocaleDateString();
    return `Chat ${dateString} ${timeString}`;
  }

  async getConversationHistory(conversationId, options = {}) {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      return null;
    }
    
    let messages = [...conversation.messages];
    
    // Apply filters
    if (options.limit) {
      messages = messages.slice(-options.limit);
    }
    
    if (options.since) {
      const sinceDate = new Date(options.since);
      messages = messages.filter(msg => new Date(msg.timestamp) > sinceDate);
    }
    
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      messages = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm)
      );
    }
    
    return {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        messageCount: conversation.messageCount
      },
      messages,
      totalMessages: conversation.messages.length
    };
  }

  async searchConversations(query, options = {}) {
    const results = [];
    const searchTerm = query.toLowerCase();
    
    for (const [id, conversation] of this.conversations) {
      // Search in conversation title
      if (conversation.title.toLowerCase().includes(searchTerm)) {
        results.push({
          conversationId: id,
          title: conversation.title,
          matchType: 'title',
          createdAt: conversation.createdAt
        });
        continue;
      }
      
      // Search in messages
      const matchingMessages = conversation.messages.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm)
      );
      
      if (matchingMessages.length > 0) {
        results.push({
          conversationId: id,
          title: conversation.title,
          matchType: 'content',
          matchCount: matchingMessages.length,
          createdAt: conversation.createdAt,
          preview: matchingMessages[0].content.substring(0, 100) + '...'
        });
      }
    }
    
    // Sort by relevance and date
    results.sort((a, b) => {
      if (a.matchType === 'title' && b.matchType !== 'title') return -1;
      if (b.matchType === 'title' && a.matchType !== 'title') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return results.slice(0, options.limit || 20);
  }

  async exportConversation(conversationId, format = 'pdf') {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const exportData = {
      conversation: {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt,
        messageCount: conversation.messageCount
      },
      messages: conversation.messages,
      exportedAt: new Date().toISOString(),
      exportedBy: this.currentSession.userId || 'Anonymous',
      format
    };
    
    if (format === 'pdf') {
      return await this.generatePDFExport(exportData);
    } else if (format === 'json') {
      return this.generateJSONExport(exportData);
    } else if (format === 'txt') {
      return this.generateTextExport(exportData);
    }
    
    throw new Error('Unsupported export format');
  }

  async generatePDFExport(exportData) {
    try {
      const response = await this.backendManager.makeRequest('/api/chat/export/pdf', {
        method: 'POST',
        body: JSON.stringify(exportData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('PDF export failed');
      }
      
      const blob = await response.blob();
      return {
        type: 'pdf',
        blob,
        filename: `digiclick-chat-${exportData.conversation.id}.pdf`
      };
    } catch (error) {
      console.error('PDF export error:', error);
      // Fallback to text export
      return this.generateTextExport(exportData);
    }
  }

  generateJSONExport(exportData) {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    return {
      type: 'json',
      blob,
      filename: `digiclick-chat-${exportData.conversation.id}.json`
    };
  }

  generateTextExport(exportData) {
    let textContent = `DigiClick AI Chat Export\n`;
    textContent += `Conversation: ${exportData.conversation.title}\n`;
    textContent += `Created: ${new Date(exportData.conversation.createdAt).toLocaleString()}\n`;
    textContent += `Exported: ${new Date(exportData.exportedAt).toLocaleString()}\n`;
    textContent += `Messages: ${exportData.conversation.messageCount}\n`;
    textContent += `\n${'='.repeat(50)}\n\n`;
    
    exportData.messages.forEach(message => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const sender = message.sender === 'user' ? 'You' : 'DigiClick AI Assistant';
      textContent += `[${timestamp}] ${sender}:\n${message.content}\n\n`;
    });
    
    textContent += `\n${'='.repeat(50)}\n`;
    textContent += `Generated by DigiClick AI Chatbot System\n`;
    textContent += `Visit us at: https://digiclickai.netlify.app\n`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    
    return {
      type: 'txt',
      blob,
      filename: `digiclick-chat-${exportData.conversation.id}.txt`
    };
  }

  async deleteConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      return false;
    }
    
    // GDPR compliance - secure deletion
    this.conversations.delete(conversationId);
    
    // Remove from current session
    this.currentSession.conversations = this.currentSession.conversations.filter(
      id => id !== conversationId
    );
    
    // Clear from cache
    if (this.cacheManager) {
      await this.cacheManager.del(`chat:history:${conversationId}`);
    }
    
    // Clear from cloud storage
    if (this.currentSession.userId) {
      try {
        await this.backendManager.makeRequest(`/api/chat/conversations/${conversationId}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to delete conversation from cloud:', error);
      }
    }
    
    this.saveToLocalStorage();
    
    // Dispatch deletion event
    window.dispatchEvent(new CustomEvent('conversation-deleted', {
      detail: { conversationId }
    }));
    
    return true;
  }

  async clearAllConversations() {
    // GDPR compliance - user-initiated data deletion
    this.conversations.clear();
    this.currentSession.conversations = [];
    
    // Clear local storage
    localStorage.removeItem(this.storageKeys.conversations);
    
    // Clear cache
    if (this.cacheManager) {
      await this.cacheManager.invalidatePattern('chat:history:*');
    }
    
    // Clear cloud storage
    if (this.currentSession.userId) {
      try {
        await this.backendManager.makeRequest('/api/chat/conversations', {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to clear conversations from cloud:', error);
      }
    }
    
    this.saveToLocalStorage();
    
    // Dispatch clear event
    window.dispatchEvent(new CustomEvent('conversations-cleared'));
    
    return true;
  }

  async linkSessionToUser(userId) {
    this.currentSession.userId = userId;
    
    // Sync local conversations to cloud
    await this.syncToCloud();
    
    // Load user's cloud conversations
    await this.loadFromCloud();
    
    this.saveToLocalStorage();
  }

  handleUserLogout() {
    // Keep conversations locally but remove user association
    this.currentSession.userId = null;
    this.saveToLocalStorage();
  }

  async syncToCloud() {
    if (!this.currentSession.userId || !this.backendManager) {
      return;
    }
    
    try {
      const syncData = {
        sessionId: this.currentSession.id,
        conversations: Array.from(this.conversations.entries()),
        preferences: this.currentSession.preferences,
        lastSync: new Date().toISOString()
      };
      
      await this.backendManager.makeRequest('/api/chat/sync', {
        method: 'POST',
        body: JSON.stringify(syncData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Conversations synced to cloud');
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    }
  }

  async loadFromCloud() {
    if (!this.currentSession.userId || !this.backendManager) {
      return;
    }
    
    try {
      const response = await this.backendManager.makeRequest('/api/chat/sync');
      
      if (response.ok) {
        const cloudData = await response.json();
        
        // Merge cloud conversations with local ones
        if (cloudData.conversations) {
          cloudData.conversations.forEach(([id, conversation]) => {
            this.conversations.set(id, conversation);
          });
        }
        
        // Update preferences
        if (cloudData.preferences) {
          this.currentSession.preferences = {
            ...this.currentSession.preferences,
            ...cloudData.preferences
          };
        }
        
        console.log('Conversations loaded from cloud');
      }
    } catch (error) {
      console.error('Failed to load from cloud:', error);
    }
  }

  startAutoSave() {
    setInterval(() => {
      this.saveToLocalStorage();
    }, this.sessionConfig.autoSaveInterval);
  }

  startCloudSync() {
    setInterval(() => {
      if (this.currentSession.userId) {
        this.syncToCloud();
      }
    }, this.sessionConfig.syncInterval);
  }

  saveToLocalStorage() {
    try {
      const sessionData = {
        ...this.currentSession,
        conversations: Array.from(this.conversations.entries())
      };
      
      if (this.encryptionEnabled) {
        // Simple encryption for sensitive data
        const encrypted = this.encryptData(JSON.stringify(sessionData));
        localStorage.setItem(this.storageKeys.currentSession, encrypted);
      } else {
        localStorage.setItem(this.storageKeys.currentSession, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(this.storageKeys.currentSession);
      if (!saved) return null;
      
      let sessionData;
      if (this.encryptionEnabled) {
        const decrypted = this.decryptData(saved);
        sessionData = JSON.parse(decrypted);
      } else {
        sessionData = JSON.parse(saved);
      }
      
      return sessionData;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  isSessionValid(session) {
    if (!session || !session.id || !session.createdAt) {
      return false;
    }
    
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    return sessionAge < this.sessionConfig.sessionTimeout;
  }

  encryptData(data) {
    // Simple base64 encoding (in production, use proper encryption)
    return btoa(data);
  }

  decryptData(encryptedData) {
    // Simple base64 decoding (in production, use proper decryption)
    return atob(encryptedData);
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getCurrentSession() {
    return this.currentSession;
  }

  getConversationList() {
    return Array.from(this.conversations.entries()).map(([id, conversation]) => ({
      id,
      title: conversation.title,
      createdAt: conversation.createdAt,
      lastActivity: conversation.lastActivity,
      messageCount: conversation.messageCount,
      archived: conversation.archived
    }));
  }

  updateConversationTitle(conversationId, newTitle) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.title = newTitle;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  archiveConversation(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.archived = true;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  getStorageUsage() {
    const sessionData = localStorage.getItem(this.storageKeys.currentSession);
    return {
      conversations: this.conversations.size,
      totalMessages: Array.from(this.conversations.values()).reduce(
        (total, conv) => total + conv.messageCount, 0
      ),
      storageSize: sessionData ? sessionData.length : 0,
      lastSaved: this.currentSession.lastActivity
    };
  }
}

// Create global instance
let conversationManager = null;

export function getConversationManager() {
  if (!conversationManager) {
    conversationManager = new ConversationManager();
  }
  return conversationManager;
}

export function initializeConversationManager() {
  return getConversationManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeConversationManager();
  });
}

export default ConversationManager;
