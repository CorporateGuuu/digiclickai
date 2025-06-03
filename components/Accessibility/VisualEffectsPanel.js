import React, { useState, useEffect, useCallback } from 'react';
import styles from './VisualEffectsPanel.module.css';

const VisualEffectsPanel = ({ isOpen, onClose, accessibilityManager }) => {
  const [settings, setSettings] = useState({
    glowAnimations: true,
    glowIntensity: 100,
    holographicText: true,
    holographicIntensity: 100,
    backgroundGradients: true,
    gradientIntensity: 80,
    loadingAnimations: true,
    performanceMode: 'normal'
  });

  const [previewMode, setPreviewMode] = useState(false);

  // Debounced settings update
  const debouncedUpdate = useCallback(
    debounce((newSettings) => {
      if (accessibilityManager) {
        accessibilityManager.updateVisualEffects(newSettings);
      }
    }, 300),
    [accessibilityManager]
  );

  useEffect(() => {
    if (accessibilityManager) {
      const status = accessibilityManager.getAccessibilityStatus();
      if (status.visualEffects) {
        setSettings(status.visualEffects);
      }
    }
  }, [accessibilityManager]);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (!previewMode) {
      debouncedUpdate({ [key]: value });
    }
  };

  const handlePreviewToggle = () => {
    setPreviewMode(!previewMode);
    if (previewMode) {
      // Apply all current settings when exiting preview mode
      debouncedUpdate(settings);
    }
  };

  const handleReset = () => {
    if (accessibilityManager) {
      accessibilityManager.resetVisualEffects();
      const status = accessibilityManager.getAccessibilityStatus();
      setSettings(status.visualEffects);
    }
  };

  const performanceModes = [
    { value: 'normal', label: 'Normal', description: 'Full visual effects with optimal performance' },
    { value: 'reduced', label: 'Reduced', description: 'Simplified effects for better performance' },
    { value: 'minimal', label: 'Minimal', description: 'Essential effects only for maximum performance' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Visual Effects Settings</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close visual effects panel"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Glow Effects Section */}
          <section className={styles.section}>
            <h3>Glow Effects</h3>
            <div className={styles.settingGroup}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.glowAnimations}
                  onChange={(e) => handleSettingChange('glowAnimations', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Enable Glow Animations
                  <small>Interactive elements glow on hover and focus</small>
                </span>
              </label>

              {settings.glowAnimations && (
                <label className={styles.sliderLabel}>
                  Glow Intensity: {settings.glowIntensity}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.glowIntensity}
                    onChange={(e) => handleSettingChange('glowIntensity', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Holographic Text Section */}
          <section className={styles.section}>
            <h3>Holographic Text</h3>
            <div className={styles.settingGroup}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.holographicText}
                  onChange={(e) => handleSettingChange('holographicText', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Enable Holographic Text
                  <small>Animated rainbow gradient effects on headings</small>
                </span>
              </label>

              {settings.holographicText && (
                <label className={styles.sliderLabel}>
                  Holographic Intensity: {settings.holographicIntensity}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.holographicIntensity}
                    onChange={(e) => handleSettingChange('holographicIntensity', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Background Gradients Section */}
          <section className={styles.section}>
            <h3>Background Effects</h3>
            <div className={styles.settingGroup}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.backgroundGradients}
                  onChange={(e) => handleSettingChange('backgroundGradients', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Enable Background Gradients
                  <small>Subtle animated gradients in hero sections</small>
                </span>
              </label>

              {settings.backgroundGradients && (
                <label className={styles.sliderLabel}>
                  Gradient Intensity: {settings.gradientIntensity}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.gradientIntensity}
                    onChange={(e) => handleSettingChange('gradientIntensity', parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </label>
              )}
            </div>
          </section>

          {/* Loading Animations Section */}
          <section className={styles.section}>
            <h3>Loading Animations</h3>
            <div className={styles.settingGroup}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.loadingAnimations}
                  onChange={(e) => handleSettingChange('loadingAnimations', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Enable Loading Animations
                  <small>AI-themed loading spinners and skeleton states</small>
                </span>
              </label>
            </div>
          </section>

          {/* Performance Mode Section */}
          <section className={styles.section}>
            <h3>Performance Mode</h3>
            <div className={styles.performanceGrid}>
              {performanceModes.map((mode) => (
                <label key={mode.value} className={styles.performanceOption}>
                  <input
                    type="radio"
                    name="performanceMode"
                    value={mode.value}
                    checked={settings.performanceMode === mode.value}
                    onChange={(e) => handleSettingChange('performanceMode', e.target.value)}
                  />
                  <div className={styles.performanceCard}>
                    <div className={styles.performanceHeader}>
                      <span className={styles.performanceIcon}>
                        {mode.value === 'normal' && '🚀'}
                        {mode.value === 'reduced' && '⚡'}
                        {mode.value === 'minimal' && '🔋'}
                      </span>
                      <span className={styles.performanceLabel}>{mode.label}</span>
                    </div>
                    <p className={styles.performanceDescription}>{mode.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Preview Mode */}
          <section className={styles.section}>
            <div className={styles.previewControls}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={previewMode}
                  onChange={handlePreviewToggle}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>
                  Preview Mode
                  <small>Test settings without applying them</small>
                </span>
              </label>
            </div>
          </section>

          {/* Demo Section */}
          <section className={styles.section}>
            <h3>Effect Preview</h3>
            <div className={styles.demoArea}>
              <div className={`${styles.demoButton} glow-button`}>
                Glow Button Demo
              </div>
              <h4 className={`${styles.demoHeading} holographic-text`} data-text="Holographic Text">
                Holographic Text
              </h4>
              <div className={`${styles.demoCard} glow-card`}>
                <p>This card demonstrates glow effects</p>
              </div>
            </div>
          </section>

          {/* Action Buttons */}
          <section className={styles.actions}>
            <button 
              className={styles.resetButton}
              onClick={handleReset}
              aria-label="Reset visual effects to defaults"
            >
              Reset to Defaults
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default VisualEffectsPanel;
