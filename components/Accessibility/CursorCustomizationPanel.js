import React, { useState, useEffect, useCallback } from 'react';
import styles from './CursorCustomizationPanel.module.css';

const CursorCustomizationPanel = ({ isOpen, onClose, accessibilityManager }) => {
  const [settings, setSettings] = useState({
    particleTrails: true,
    clickRipples: true,
    glowEffects: true,
    hoverAnimations: true,
    size: 100,
    opacity: 100,
    colorTheme: 'default',
    shape: 'circle',
    reducedMotionOverride: false,
    customColor: '#00d4ff'
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Debounced settings update
  const debouncedUpdate = useCallback(
    debounce((newSettings) => {
      if (accessibilityManager) {
        accessibilityManager.updateCursorCustomization(newSettings);
      }
    }, 300),
    [accessibilityManager]
  );

  useEffect(() => {
    if (accessibilityManager) {
      const status = accessibilityManager.getAccessibilityStatus();
      if (status.cursorCustomization) {
        setSettings(status.cursorCustomization);
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
      accessibilityManager.resetCursorCustomization();
      const status = accessibilityManager.getAccessibilityStatus();
      setSettings(status.cursorCustomization);
    }
  };

  const handleExport = () => {
    if (accessibilityManager) {
      accessibilityManager.exportCursorSettings();
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file || !accessibilityManager) return;

    setIsImporting(true);
    try {
      await accessibilityManager.importCursorSettings(file);
      const status = accessibilityManager.getAccessibilityStatus();
      setSettings(status.cursorCustomization);
    } catch (error) {
      console.error('Failed to import settings:', error);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const colorThemes = [
    { value: 'default', label: 'Default Blue', color: '#00d4ff' },
    { value: 'accent', label: 'Accent Blue', color: '#00d4ff' },
    { value: 'secondary', label: 'Purple', color: '#a855f7' },
    { value: 'custom', label: 'Custom', color: settings.customColor }
  ];

  const shapes = [
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
    { value: 'custom', label: 'Rounded' }
  ];

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Cursor Customization</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close cursor customization panel"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {/* Effect Toggles */}
          <section className={styles.section}>
            <h3>Cursor Effects</h3>
            <div className={styles.toggleGrid}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.particleTrails}
                  onChange={(e) => handleSettingChange('particleTrails', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>Particle Trails</span>
              </label>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.clickRipples}
                  onChange={(e) => handleSettingChange('clickRipples', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>Click Ripples</span>
              </label>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.glowEffects}
                  onChange={(e) => handleSettingChange('glowEffects', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>Glow Effects</span>
              </label>

              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={settings.hoverAnimations}
                  onChange={(e) => handleSettingChange('hoverAnimations', e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
                <span className={styles.toggleLabel}>Hover Animations</span>
              </label>
            </div>
          </section>

          {/* Size and Opacity Controls */}
          <section className={styles.section}>
            <h3>Appearance</h3>
            <div className={styles.sliderGroup}>
              <label className={styles.sliderLabel}>
                Size: {settings.size}%
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={settings.size}
                  onChange={(e) => handleSettingChange('size', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </label>

              <label className={styles.sliderLabel}>
                Opacity: {settings.opacity}%
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={settings.opacity}
                  onChange={(e) => handleSettingChange('opacity', parseInt(e.target.value))}
                  className={styles.slider}
                />
              </label>
            </div>
          </section>

          {/* Color Theme Selector */}
          <section className={styles.section}>
            <h3>Color Theme</h3>
            <div className={styles.colorGrid}>
              {colorThemes.map((theme) => (
                <label key={theme.value} className={styles.colorOption}>
                  <input
                    type="radio"
                    name="colorTheme"
                    value={theme.value}
                    checked={settings.colorTheme === theme.value}
                    onChange={(e) => handleSettingChange('colorTheme', e.target.value)}
                  />
                  <span 
                    className={styles.colorSwatch}
                    style={{ backgroundColor: theme.color }}
                  ></span>
                  <span className={styles.colorLabel}>{theme.label}</span>
                </label>
              ))}
            </div>

            {settings.colorTheme === 'custom' && (
              <div className={styles.customColorInput}>
                <label>
                  Custom Color:
                  <input
                    type="color"
                    value={settings.customColor}
                    onChange={(e) => handleSettingChange('customColor', e.target.value)}
                    className={styles.colorPicker}
                  />
                </label>
              </div>
            )}
          </section>

          {/* Shape Selector */}
          <section className={styles.section}>
            <h3>Cursor Shape</h3>
            <div className={styles.shapeGrid}>
              {shapes.map((shape) => (
                <label key={shape.value} className={styles.shapeOption}>
                  <input
                    type="radio"
                    name="shape"
                    value={shape.value}
                    checked={settings.shape === shape.value}
                    onChange={(e) => handleSettingChange('shape', e.target.value)}
                  />
                  <span className={`${styles.shapePreview} ${styles[shape.value]}`}></span>
                  <span className={styles.shapeLabel}>{shape.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Motion Override */}
          <section className={styles.section}>
            <h3>Motion Settings</h3>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.reducedMotionOverride}
                onChange={(e) => handleSettingChange('reducedMotionOverride', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
              <span className={styles.toggleLabel}>
                Override Reduced Motion Preference
                <small>Enable animations even when system prefers reduced motion</small>
              </span>
            </label>
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

          {/* Action Buttons */}
          <section className={styles.actions}>
            <button 
              className={styles.resetButton}
              onClick={handleReset}
              aria-label="Reset cursor customization to defaults"
            >
              Reset to Defaults
            </button>

            <button 
              className={styles.exportButton}
              onClick={handleExport}
              aria-label="Export cursor settings"
            >
              Export Settings
            </button>

            <label className={styles.importButton}>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                style={{ display: 'none' }}
              />
              {isImporting ? 'Importing...' : 'Import Settings'}
            </label>
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

export default CursorCustomizationPanel;
