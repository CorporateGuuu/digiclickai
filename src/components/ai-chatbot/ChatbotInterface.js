/**
 * DigiClick AI Chatbot Interface
 * Enhanced user experience with futuristic theme integration
 * Maintains WCAG 2.1 AA compliance and 60fps performance
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import styles from './ChatbotInterface.module.css';
import { getOpenAIIntegrationManager } from '../../lib/openai-integration-manager';
import { getConversationManager } from '../../lib/conversation-manager';
import { getContextualIntelligenceManager } from '../../lib/contextual-intelligence-manager';
import { getAccessibilityManager } from '../../lib/accessibility-manager';

const ChatbotInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  const openaiManager = useRef(null);
  const conversationManager = useRef(null);
  const contextualManager = useRef(null);
  const accessibilityManager = useRef(null);

  useEffect(() => {
    // Initialize managers
    openaiManager.current = getOpenAIIntegrationManager();
    conversationManager.current = getConversationManager();
    contextualManager.current = getContextualIntelligenceManager();
    accessibilityManager.current = getAccessibilityManager();
    
    // Generate session ID
    setSessionId(openaiManager.current.generateSessionId());
    
    // Initialize voice recognition if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = handleVoiceResult;
      recognitionRef.current.onerror = handleVoiceError;
      recognitionRef.current.onend = () => setIsListening(false);
      
      setVoiceEnabled(true);
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Load conversation history
    loadConversationHistory();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      animateOpen();
      inputRef.current?.focus();
    } else {
      animateClose();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const setupEventListeners = () => {
    // Listen for chatbot responses
    window.addEventListener('chatbot-response-generated', handleChatbotResponse);
    
    // Listen for route suggestions
    window.addEventListener('chatbot-route-suggestion', handleRouteSuggestion);
    
    // Listen for accessibility changes
    window.addEventListener('accessibility-settings-changed', handleAccessibilityChange);
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('chatbot-response-generated', handleChatbotResponse);
    window.removeEventListener('chatbot-route-suggestion', handleRouteSuggestion);
    window.removeEventListener('accessibility-settings-changed', handleAccessibilityChange);
  };

  const loadConversationHistory = async () => {
    if (conversationManager.current && sessionId) {
      const history = await conversationManager.current.getConversationHistory(sessionId);
      if (history && history.messages) {
        const formattedMessages = history.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp,
          type: msg.metadata?.type || 'text'
        }));
        setMessages(formattedMessages);
      }
    }
  };

  const handleChatbotResponse = (event) => {
    const response = event.detail;
    
    if (response.sessionId === sessionId) {
      setIsTyping(true);
      
      // Simulate typing delay based on response length
      const typingDelay = Math.min(Math.max(response.message.length * 30, 1000), 3000);
      
      setTimeout(() => {
        const newMessage = {
          id: response.id,
          text: response.message,
          sender: 'assistant',
          timestamp: response.timestamp,
          type: response.type || 'text'
        };
        
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(false);
        setIsLoading(false);
        
        // Announce to screen readers
        if (accessibilityManager.current?.isScreenReaderEnabled()) {
          accessibilityManager.current.announce(`Assistant: ${response.message}`);
        }
      }, typingDelay);
    }
  };

  const handleRouteSuggestion = (event) => {
    const { suggestedRoute, intent, confidence } = event.detail;
    
    if (confidence > 0.7) {
      const suggestionMessage = {
        id: `suggestion_${Date.now()}`,
        text: `Based on your question, you might find more information on our ${suggestedRoute.replace('/', '')} page. Would you like me to take you there?`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'suggestion',
        action: {
          type: 'navigate',
          url: suggestedRoute,
          label: `Go to ${suggestedRoute.replace('/', '')} page`
        }
      };
      
      setMessages(prev => [...prev, suggestionMessage]);
    }
  };

  const handleAccessibilityChange = (event) => {
    const settings = event.detail;
    
    // Adjust chatbot behavior for accessibility
    if (settings.reducedMotion) {
      // Disable animations
      gsap.set(chatContainerRef.current, { clearProps: 'all' });
    }
    
    if (settings.highContrast) {
      // Apply high contrast styles
      chatContainerRef.current?.classList.add(styles.highContrast);
    } else {
      chatContainerRef.current?.classList.remove(styles.highContrast);
    }
  };

  const animateOpen = () => {
    if (chatContainerRef.current && !accessibilityManager.current?.getSettings()?.reducedMotion) {
      gsap.fromTo(chatContainerRef.current, 
        { 
          opacity: 0, 
          scale: 0.8, 
          y: 50 
        },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 0.3, 
          ease: 'power2.out' 
        }
      );
    }
  };

  const animateClose = () => {
    if (chatContainerRef.current && !accessibilityManager.current?.getSettings()?.reducedMotion) {
      gsap.to(chatContainerRef.current, {
        opacity: 0,
        scale: 0.8,
        y: 50,
        duration: 0.2,
        ease: 'power2.in'
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    // Send message to AI system
    try {
      await openaiManager.current.sendMessage(messageText.trim(), {
        sessionId,
        pageContext: window.location.pathname,
        userId: 'anonymous' // TODO: Get from auth system
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      // Show error message
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current || isListening) return;
    
    setIsListening(true);
    recognitionRef.current.start();
  };

  const handleVoiceResult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInputValue(transcript);
    setIsListening(false);
    
    // Auto-send voice input
    setTimeout(() => {
      handleSendMessage(transcript);
    }, 500);
  };

  const handleVoiceError = (event) => {
    console.error('Voice recognition error:', event.error);
    setIsListening(false);
  };

  const handleActionClick = (action) => {
    if (action.type === 'navigate') {
      window.location.href = action.url;
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    
    // Announce state change to screen readers
    if (accessibilityManager.current?.isScreenReaderEnabled()) {
      accessibilityManager.current.announce(
        isOpen ? 'Chatbot closed' : 'Chatbot opened'
      );
    }
  };

  const clearConversation = async () => {
    if (conversationManager.current && sessionId) {
      await conversationManager.current.clearConversationHistory(sessionId);
      setMessages([]);
      
      // Announce to screen readers
      if (accessibilityManager.current?.isScreenReaderEnabled()) {
        accessibilityManager.current.announce('Conversation cleared');
      }
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={toggleChatbot}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        data-testid="chatbot-toggle"
      >
        <div className={styles.toggleIcon}>
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          )}
        </div>
        {isLoading && <div className={styles.loadingIndicator} />}
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className={styles.chatContainer}
          role="dialog"
          aria-modal="true"
          aria-labelledby="chatbot-title"
          data-testid="chatbot-interface"
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.avatar}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className={styles.headerText}>
                <h3 id="chatbot-title">DigiClick AI Assistant</h3>
                <p className={styles.status}>
                  {isTyping ? 'Typing...' : 'Online'}
                </p>
              </div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.actionButton}
                onClick={clearConversation}
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesContainer}>
            <div className={styles.messages} role="log" aria-live="polite">
              {messages.length === 0 && (
                <div className={styles.welcomeMessage}>
                  <p>👋 Hello! I'm your DigiClick AI assistant. How can I help you today?</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.sender]}`}
                  data-testid={`message-${message.sender}`}
                >
                  <div className={styles.messageContent}>
                    <p>{message.text}</p>
                    {message.action && (
                      <button
                        className={styles.actionButton}
                        onClick={() => handleActionClick(message.action)}
                      >
                        {message.action.label}
                      </button>
                    )}
                  </div>
                  <div className={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className={`${styles.message} ${styles.assistant}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={styles.input}
                rows="1"
                disabled={isLoading}
                aria-label="Type your message"
                data-testid="chatbot-input"
              />
              
              {voiceEnabled && (
                <button
                  className={`${styles.voiceButton} ${isListening ? styles.listening : ''}`}
                  onClick={handleVoiceInput}
                  disabled={isLoading || isListening}
                  aria-label={isListening ? 'Listening...' : 'Voice input'}
                  title="Voice input"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                  </svg>
                </button>
              )}
              
              <button
                className={styles.sendButton}
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                data-testid="chatbot-send"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotInterface;
