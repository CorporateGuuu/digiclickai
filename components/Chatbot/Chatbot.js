import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Chatbot = () => {
  const { user, isAuthenticated, apiCall } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeConversation();
    }
  }, [isOpen]);

  // Load conversation history for authenticated users
  useEffect(() => {
    if (isAuthenticated() && isOpen) {
      loadConversationHistory();
    }
  }, [isAuthenticated(), isOpen]);

  const initializeConversation = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      text: isAuthenticated()
        ? `Welcome back, ${user?.name}! How can I assist you today?`
        : 'Welcome to DigiClick AI! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date(),
      suggestions: [
        'Tell me about your services',
        'I need a quote',
        'How does AI web design work?',
        'Contact information'
      ]
    };
    setMessages([welcomeMessage]);
  };

  const loadConversationHistory = async () => {
    try {
      const response = await apiCall('/api/chatbot/history');
      if (response.success && response.data?.messages) {
        setMessages(response.data.messages);
        setConversationId(response.data.conversationId);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e, messageText = null) => {
    e?.preventDefault();
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Try to get AI response from backend first
      const response = await apiCall('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          conversationId,
          context: {
            isAuthenticated: isAuthenticated(),
            userId: user?.id,
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      let botResponse;
      if (response.success && response.data) {
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          text: response.data.message,
          timestamp: new Date(),
          suggestions: response.data.suggestions,
          actions: response.data.actions
        };

        if (response.data.conversationId) {
          setConversationId(response.data.conversationId);
        }
      } else {
        // Fallback to local AI response
        botResponse = generateAdvancedBotResponse(text);
      }

      // Simulate typing delay for better UX
      setTimeout(() => {
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);

        // Update unread count if minimized
        if (isMinimized) {
          setUnreadCount(prev => prev + 1);
        }
      }, Math.random() * 1000 + 500); // 500-1500ms delay

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I apologize, but I\'m experiencing some technical difficulties. Please try again or contact our support team directly.',
        timestamp: new Date(),
        isError: true
      };

      setTimeout(() => {
        setMessages(prev => [...prev, errorResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const generateAdvancedBotResponse = (userInput) => {
    const input = userInput.toLowerCase();
    const responses = {
      pricing: {
        keywords: ['price', 'cost', 'quote', 'budget', 'expensive', 'cheap', 'fee'],
        response: 'Our AI-powered solutions are customized for each client. Here\'s our pricing structure:',
        suggestions: ['Get a custom quote', 'View pricing tiers', 'Schedule consultation'],
        actions: [{ type: 'open_contact_form', label: 'Get Quote' }]
      },
      services: {
        keywords: ['service', 'what do you do', 'offer', 'provide', 'specialize'],
        response: 'We specialize in cutting-edge AI solutions including:\n• AI-crafted websites\n• Predictive marketing\n• Intelligent SEO\n• Automation ecosystems\n\nEach solution is designed to elevate your digital presence.',
        suggestions: ['Learn about AI websites', 'Explore automation', 'See our portfolio']
      },
      contact: {
        keywords: ['contact', 'reach', 'phone', 'email', 'address', 'location'],
        response: 'You can reach our AI specialists at:\n📧 info@digiclick.ai\n📞 (123) 456-7890\n\nWe\'re available 24/7 to discuss your project!',
        suggestions: ['Schedule a call', 'Send an email', 'Live chat support'],
        actions: [{ type: 'open_contact_form', label: 'Contact Us' }]
      },
      timeline: {
        keywords: ['time', 'how long', 'duration', 'timeline', 'when', 'delivery'],
        response: 'Project timelines depend on complexity:\n• AI websites: 2-4 weeks\n• Automation systems: 4-8 weeks\n• Enterprise solutions: 8-12 weeks\n\nWe provide detailed timelines during consultation.',
        suggestions: ['Get timeline estimate', 'Rush delivery options', 'Project phases']
      },
      technology: {
        keywords: ['ai', 'artificial intelligence', 'machine learning', 'technology', 'how it works'],
        response: 'Our AI technology leverages advanced machine learning algorithms to create intelligent, adaptive solutions that learn and improve over time. We use cutting-edge frameworks and neural networks.',
        suggestions: ['Technical details', 'AI capabilities', 'Case studies']
      },
      portfolio: {
        keywords: ['portfolio', 'examples', 'work', 'projects', 'showcase', 'previous'],
        response: 'We\'ve successfully delivered AI solutions for clients across various industries. Our portfolio showcases innovative websites, automation systems, and digital transformations.',
        suggestions: ['View portfolio', 'Case studies', 'Client testimonials'],
        actions: [{ type: 'navigate', url: '/portfolio', label: 'View Portfolio' }]
      }
    };

    // Find matching response category
    for (const [category, data] of Object.entries(responses)) {
      if (data.keywords.some(keyword => input.includes(keyword))) {
        return {
          id: Date.now() + 1,
          type: 'bot',
          text: data.response,
          timestamp: new Date(),
          suggestions: data.suggestions,
          actions: data.actions,
          category
        };
      }
    }

    // Default response with personalization
    const defaultResponses = [
      'That\'s an excellent question! Our AI specialists would love to provide you with detailed information.',
      'I\'d be happy to help you with that. Let me connect you with the right information.',
      'Great question! Our team has extensive experience in this area.',
      'That\'s something we can definitely help you with. Let me provide some insights.'
    ];

    return {
      id: Date.now() + 1,
      type: 'bot',
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)] +
            ' Feel free to contact us directly for a personalized consultation.',
      timestamp: new Date(),
      suggestions: ['Contact our team', 'Schedule consultation', 'Learn more'],
      actions: [{ type: 'open_contact_form', label: 'Get Help' }]
    };
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(null, suggestion);
  };

  const handleActionClick = (action) => {
    switch (action.type) {
      case 'open_contact_form':
        // Scroll to contact form or open modal
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          setIsOpen(false);
        }
        break;
      case 'navigate':
        window.location.href = action.url;
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={toggleChatbot}
        aria-label="Toggle chatbot"
      >
        💬
        {unreadCount > 0 && (
          <span className="chatbot-unread-badge">{unreadCount}</span>
        )}
      </button>

      {/* Chatbot Container */}
      {isOpen && (
        <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
          <div className="chatbot-header">
            <h3>DigiClick AI Assistant</h3>
            <div className="chatbot-header-controls">
              <button
                onClick={toggleMinimize}
                className="chatbot-control-btn"
                aria-label={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? '□' : '−'}
              </button>
              <button
                onClick={toggleChatbot}
                className="chatbot-control-btn"
                aria-label="Close chatbot"
              >
                ×
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="chatbot-body">
                {messages.map((message) => (
                  <div key={message.id} className="chatbot-message-wrapper">
                    <div className={`chatbot-message ${message.type} ${message.isError ? 'error' : ''}`}>
                      <div className="message-content">
                        {message.text.split('\n').map((line, i) => (
                          <div key={i}>{line}</div>
                        ))}
                      </div>
                      <div className="message-timestamp">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="chatbot-suggestions">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            className="suggestion-btn"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="chatbot-actions">
                        {message.actions.map((action, i) => (
                          <button
                            key={i}
                            className="action-btn"
                            onClick={() => handleActionClick(action)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="chatbot-message bot typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <em>AI is thinking...</em>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form className="chatbot-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={isTyping || !inputValue.trim()}
                  className="send-btn"
                >
                  {isTyping ? '⏳' : '➤'}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
