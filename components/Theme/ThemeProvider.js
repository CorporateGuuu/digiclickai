import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for theme
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState('light');
  
  // Load theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If no saved theme but system prefers dark mode
      setTheme('system');
    }
    
    // Apply theme to document
    applyTheme(savedTheme || theme);
  }, []);
  
  // Function to change theme
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };
  
  // Function to apply theme to document
  const applyTheme = (currentTheme) => {
    const root = document.documentElement;
    
    if (currentTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else if (currentTheme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else if (currentTheme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.classList.remove('light-theme');
      } else {
        root.classList.add('light-theme');
        root.classList.remove('dark-theme');
      }
      
      // Listen for changes in system theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => {
        if (e.matches) {
          root.classList.add('dark-theme');
          root.classList.remove('light-theme');
        } else {
          root.classList.add('light-theme');
          root.classList.remove('dark-theme');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
