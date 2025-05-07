import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import styles from './Chatbot.module.css';

const ChatbotUI = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize chatbot with welcome message
  useEffect(() => {
    // Check if there's a stored conversation
    const storedConversationId = localStorage.getItem('chatbotConversationId');
    const storedMessages = localStorage.getItem('chatbotMessages');

    if (storedConversationId && storedMessages) {
      setConversationId(storedConversationId);
      setMessages(JSON.parse(storedMessages));
    } else {
      // Start a new conversation
      initializeConversation();
    }
  }, [session]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize a new conversation
  const initializeConversation = async () => {
    try {
      const response = await fetch('/api/chatbot/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session?.user?.id || 'anonymous',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConversationId(data.conversationId);
        localStorage.setItem('chatbotConversationId', data.conversationId);

        // Add welcome message
        const welcomeMessage = {
          id: Date.now(),
          role: 'assistant',
          content: "Hello! I'm your MDTS virtual assistant. How can I help you today? I can assist with product information, order tracking, returns, and more.",
          timestamp: new Date().toISOString(),
        };

        setMessages([welcomeMessage]);
        localStorage.setItem('chatbotMessages', JSON.stringify([welcomeMessage]));
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);

      // Fallback welcome message if API fails
      const fallbackMessage = {
        id: Date.now(),
        role: 'assistant',
        content: "Hello! I'm your MDTS virtual assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      };

      setMessages([fallbackMessage]);
      localStorage.setItem('chatbotMessages', JSON.stringify([fallbackMessage]));
    }
  };

  // Send message to chatbot API
  const sendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatbotMessages', JSON.stringify(updatedMessages));

    // Clear input
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: inputValue,
          userId: session?.user?.id || 'anonymous',
        }),
      });

      const data = await response.json();

      // Hide typing indicator
      setIsTyping(false);

      if (data.success) {
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        const newMessages = [...updatedMessages, botMessage];
        setMessages(newMessages);
        localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
      } else {
        // Add error message
        const errorMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team at support@mdtstech.store.",
          timestamp: new Date().toISOString(),
        };

        const newMessages = [...updatedMessages, errorMessage];
        setMessages(newMessages);
        localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Hide typing indicator
      setIsTyping(false);

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to our servers. Please check your internet connection and try again.",
        timestamp: new Date().toISOString(),
      };

      const newMessages = [...updatedMessages, errorMessage];
      setMessages(newMessages);
      localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
    }
  };

  // Clear conversation history
  const clearConversation = () => {
    localStorage.removeItem('chatbotConversationId');
    localStorage.removeItem('chatbotMessages');
    initializeConversation();
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format message timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format message content with proper spacing and formatting
  const formatMessageContent = (content) => {
    if (!content) return '';

    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = content.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="${styles.messageLink}">${url}</Link>`;
    });

    // Format lists
    const withLists = withLinks.replace(/(\d+\.\s.*?)(?=\n\d+\.|\n\n|$)/gs, '<li>$1</li>')
                              .replace(/(^|\n)- (.*?)(?=\n-|\n\n|$)/gm, '$1<li>$2</li>');

    // Format sections with headers
    const withHeaders = withLists.replace(/\n(#{1,3})\s(.*?)\n/g, '\n<h4>$2</h4>\n');

    // Add paragraph breaks
    const withParagraphs = withHeaders.replace(/\n\n/g, '</p><p>');

    // Wrap in paragraphs if not already done
    let formatted = withParagraphs;
    if (!formatted.startsWith('<p>')) {
      formatted = `<p>${formatted}</p>`;
    }

    // Replace newlines with <br> within paragraphs
    formatted = formatted.replace(/\n(?![<])/g, '<br>');

    // Wrap lists in <ul> tags
    formatted = formatted.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chatbot toggle button */}
      <button
        className={`${styles.chatbotToggle} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
        {!isOpen && <span className={styles.chatbotLabel}>Chat with us</span>}
      </button>

      {/* Chatbot dialog */}
      <div className={`${styles.chatbotDialog} ${isOpen ? styles.open : ''}`}>
        {/* Chatbot header */}
        <div className={styles.chatbotHeader}>
          <div className={styles.chatbotInfo}>
            <div className={styles.chatbotAvatar}>
              <img src="/images/chatbot-avatar.svg" alt="MDTS Assistant" />
            </div>
            <div className={styles.chatbotDetails}>
              <h3>MDTS Assistant</h3>
              <span className={styles.chatbotStatus}>Online</span>
            </div>
          </div>
          <div className={styles.chatbotActions}>
            <button
              className={styles.clearButton}
              onClick={clearConversation}
              aria-label="Clear conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Chatbot messages */}
        <div className={styles.chatbotMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.message} ${message.role === 'user' ? styles.userMessage : styles.botMessage}`}
            >
              <div className={styles.messageContent}>
                {formatMessageContent(message.content)}
              </div>
              <div className={styles.messageTimestamp}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className={`${styles.message} ${styles.botMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chatbot input */}
        <form className={styles.chatbotInput} onSubmit={sendMessage}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message here..."
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>

        {/* Chatbot footer */}
        <div className={styles.chatbotFooter}>
          <p>Powered by MDTS AI Assistant</p>
          <p className={styles.disclaimer}>This is an AI assistant. For urgent matters, please contact our support team directly.</p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotUI;
