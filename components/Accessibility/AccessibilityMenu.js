import React from 'react';
import { useState, useEffect } from 'react';
import { getAccessibilityManager } from '../../src/lib/accessibility-manager';
import CursorCustomizationPanel from './CursorCustomizationPanel';
import VisualEffectsPanel from './VisualEffectsPanel';
import styles from './AccessibilityMenu.module.css';

const AccessibilityMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCursorCustomizationOpen, setIsCursorCustomizationOpen] = useState(false);
  const [isVisualEffectsOpen, setIsVisualEffectsOpen] = useState(false);
  const [accessibilityManager, setAccessibilityManager] = useState(null);
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    focusHighlight: false,
    cursorAccessibilityMode: false,
    announcements: true
  });
  
  // Load settings from localStorage and accessibility manager on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('accessibilitySettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Initialize from accessibility manager
      const manager = getAccessibilityManager();
      setAccessibilityManager(manager);
      if (manager) {
        const status = manager.getAccessibilityStatus();
        setSettings(prev => ({
          ...prev,
          reducedMotion: status.reducedMotion,
          cursorAccessibilityMode: status.cursorAccessibilityMode,
          announcements: status.announcements,
          contrast: status.highContrast ? 'high' : 'normal'
        }));
      }
    }
  }, []);
  
  // Apply settings whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Apply font size
      document.documentElement.setAttribute('data-font-size', settings.fontSize);
      
      // Apply contrast
      document.documentElement.setAttribute('data-contrast', settings.contrast);
      
      // Apply reduced motion
      if (settings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      
      // Apply focus highlight
      if (settings.focusHighlight) {
        document.documentElement.classList.add('focus-highlight');
      } else {
        document.documentElement.classList.remove('focus-highlight');
      }
      
      // Save settings to localStorage
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }
  }, [settings]);
  
  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle font size change
  const handleFontSizeChange = (size) => {
    setSettings({ ...settings, fontSize: size });
  };
  
  // Handle contrast change
  const handleContrastChange = (contrast) => {
    setSettings({ ...settings, contrast });
  };
  
  // Handle toggle settings
  const handleToggleSetting = (setting) => {
    const newValue = !settings[setting];
    setSettings({ ...settings, [setting]: newValue });

    // Apply through accessibility manager
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      switch (setting) {
        case 'reducedMotion':
          if (newValue) {
            accessibilityManager.enableReducedMotion();
          } else {
            accessibilityManager.disableReducedMotion();
          }
          break;
        case 'cursorAccessibilityMode':
          accessibilityManager.toggleCursorAccessibilityMode();
          break;
        case 'announcements':
          accessibilityManager.config.announcements = newValue;
          accessibilityManager.saveSettings();
          break;
      }
    }
  };
  
  // Reset all settings to default
  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 'medium',
      contrast: 'normal',
      reducedMotion: false,
      focusHighlight: false
    };
    
    setSettings(defaultSettings);
  };
  
  return (
    <div className={styles.accessibilityContainer}>
      <button 
        className={styles.accessibilityButton}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-label="Accessibility options"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v8"></path>
          <path d="M8 12h8"></path>
        </svg>
        <span className={styles.accessibilityLabel}>Accessibility</span>
      </button>
      
      {isOpen && (
        <div 
          className={styles.accessibilityMenu}
          role="dialog"
          aria-label="Accessibility settings"
        >
          <div className={styles.menuHeader}>
            <h2>Accessibility Settings</h2>
            <button 
              className={styles.closeButton}
              onClick={toggleMenu}
              aria-label="Close accessibility settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className={styles.menuContent}>
            <div className={styles.settingSection}>
              <h3>Text Size</h3>
              <div className={styles.fontSizeOptions}>
                <button
                  className={`${styles.fontSizeButton} ${settings.fontSize === 'small' ? styles.active : ''}`}
                  onClick={() => handleFontSizeChange('small')}
                  aria-pressed={settings.fontSize === 'small'}
                >
                  A<span className="sr-only">Small text</span>
                </button>
                <button
                  className={`${styles.fontSizeButton} ${settings.fontSize === 'medium' ? styles.active : ''}`}
                  onClick={() => handleFontSizeChange('medium')}
                  aria-pressed={settings.fontSize === 'medium'}
                >
                  A<span className="sr-only">Medium text</span>
                </button>
                <button
                  className={`${styles.fontSizeButton} ${styles.large} ${settings.fontSize === 'large' ? styles.active : ''}`}
                  onClick={() => handleFontSizeChange('large')}
                  aria-pressed={settings.fontSize === 'large'}
                >
                  A<span className="sr-only">Large text</span>
                </button>
                <button
                  className={`${styles.fontSizeButton} ${styles.extraLarge} ${settings.fontSize === 'extra-large' ? styles.active : ''}`}
                  onClick={() => handleFontSizeChange('extra-large')}
                  aria-pressed={settings.fontSize === 'extra-large'}
                >
                  A<span className="sr-only">Extra large text</span>
                </button>
              </div>
            </div>
            
            <div className={styles.settingSection}>
              <h3>Contrast</h3>
              <div className={styles.contrastOptions}>
                <button
                  className={`${styles.contrastButton} ${settings.contrast === 'normal' ? styles.active : ''}`}
                  onClick={() => handleContrastChange('normal')}
                  aria-pressed={settings.contrast === 'normal'}
                >
                  Normal
                </button>
                <button
                  className={`${styles.contrastButton} ${settings.contrast === 'high' ? styles.active : ''}`}
                  onClick={() => handleContrastChange('high')}
                  aria-pressed={settings.contrast === 'high'}
                >
                  High Contrast
                </button>
              </div>
            </div>
            
            <div className={styles.settingSection}>
              <h3>Additional Settings</h3>
              <div className={styles.toggleOptions}>
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={() => handleToggleSetting('reducedMotion')}
                  />
                  <span>Reduce animations</span>
                </label>
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={settings.focusHighlight}
                    onChange={() => handleToggleSetting('focusHighlight')}
                  />
                  <span>Highlight focus</span>
                </label>
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={settings.cursorAccessibilityMode}
                    onChange={() => handleToggleSetting('cursorAccessibilityMode')}
                    aria-describedby="cursor-mode-help"
                  />
                  <span>Disable cursor effects</span>
                  <div id="cursor-mode-help" className={styles.settingHelp}>
                    Disables custom cursor animations for better accessibility
                  </div>
                </label>
                <label className={styles.toggleOption}>
                  <input
                    type="checkbox"
                    checked={settings.announcements}
                    onChange={() => handleToggleSetting('announcements')}
                    aria-describedby="announcements-help"
                  />
                  <span>Screen reader announcements</span>
                  <div id="announcements-help" className={styles.settingHelp}>
                    Enables helpful announcements for screen reader users
                  </div>
                </label>
              </div>
            </div>

            <div className={styles.settingSection}>
              <h3>Cursor Customization</h3>
              <button
                className={styles.cursorCustomizationButton}
                onClick={() => setIsCursorCustomizationOpen(true)}
                disabled={settings.cursorAccessibilityMode}
                aria-describedby="cursor-customization-help"
              >
                Customize Cursor
              </button>
              <div id="cursor-customization-help" className={styles.settingHelp}>
                {settings.cursorAccessibilityMode
                  ? 'Cursor customization is disabled when cursor effects are turned off'
                  : 'Customize cursor appearance, effects, and behavior'
                }
              </div>
            </div>

            <div className={styles.settingSection}>
              <h3>Visual Effects</h3>
              <button
                className={styles.visualEffectsButton}
                onClick={() => setIsVisualEffectsOpen(true)}
                aria-describedby="visual-effects-help"
              >
                Customize Visual Effects
              </button>
              <div id="visual-effects-help" className={styles.settingHelp}>
                Control glow animations, holographic text, background gradients, and loading effects
              </div>
            </div>

            <div className={styles.resetSection}>
              <button
                className={styles.resetButton}
                onClick={resetSettings}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      <CursorCustomizationPanel
        isOpen={isCursorCustomizationOpen}
        onClose={() => setIsCursorCustomizationOpen(false)}
        accessibilityManager={accessibilityManager}
      />

      <VisualEffectsPanel
        isOpen={isVisualEffectsOpen}
        onClose={() => setIsVisualEffectsOpen(false)}
        accessibilityManager={accessibilityManager}
      />
    </div>
  );
};

export default AccessibilityMenu;
