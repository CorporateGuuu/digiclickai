/**
 * DigiClick AI File Upload Manager
 * Secure file upload with drag-and-drop, preview, and progress tracking
 * Integrates with existing loading animations and accessibility features
 */

import { getAccessibilityManager } from './accessibility-manager';
import { getTouchInteractionManager } from './touch-interaction-manager';
import { getLoadingStateManager } from './loading-state-manager';

class FileUploadManager {
  constructor() {
    this.uploadInstances = new Map();
    this.allowedTypes = {
      documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
      images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      archives: ['zip', 'rar', '7z']
    };
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 5;
    this.uploadEndpoint = '/api/upload';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupFileTypeIcons();
  }

  setupEventListeners() {
    // Listen for accessibility changes
    window.addEventListener('accessibility-settings-changed', (e) => {
      this.updateUploadBehavior(e.detail.settings);
    });

    // Listen for visual effects changes
    window.addEventListener('visual-effects-changed', (e) => {
      this.updateUploadVisuals(e.detail.settings);
    });
  }

  setupFileTypeIcons() {
    this.fileTypeIcons = {
      pdf: `<svg viewBox="0 0 24 24" fill="#ff6b6b"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
      doc: `<svg viewBox="0 0 24 24" fill="#4285f4"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
      docx: `<svg viewBox="0 0 24 24" fill="#4285f4"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
      txt: `<svg viewBox="0 0 24 24" fill="#666"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
      jpg: `<svg viewBox="0 0 24 24" fill="#00d4ff"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" /></svg>`,
      jpeg: `<svg viewBox="0 0 24 24" fill="#00d4ff"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" /></svg>`,
      png: `<svg viewBox="0 0 24 24" fill="#00d4ff"><path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" /></svg>`,
      zip: `<svg viewBox="0 0 24 24" fill="#7b2cbf"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`,
      default: `<svg viewBox="0 0 24 24" fill="#666"><path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>`
    };
  }

  initializeUpload(containerElement, options = {}) {
    const uploadId = containerElement.id || `upload-${Date.now()}`;
    
    const uploadConfig = {
      element: containerElement,
      allowedTypes: options.allowedTypes || Object.values(this.allowedTypes).flat(),
      maxFileSize: options.maxFileSize || this.maxFileSize,
      maxFiles: options.maxFiles || this.maxFiles,
      multiple: options.multiple !== false,
      dragAndDrop: options.dragAndDrop !== false,
      preview: options.preview !== false,
      autoUpload: options.autoUpload || false,
      endpoint: options.endpoint || this.uploadEndpoint,
      onProgress: options.onProgress || null,
      onComplete: options.onComplete || null,
      onError: options.onError || null
    };
    
    const uploadState = {
      config: uploadConfig,
      files: new Map(),
      isUploading: false,
      uploadProgress: 0,
      dragCounter: 0
    };
    
    this.uploadInstances.set(uploadId, uploadState);
    this.setupUploadUI(uploadId);
    this.setupUploadEvents(uploadId);
    
    return uploadId;
  }

  setupUploadUI(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    const containerElement = uploadState.config.element;
    
    containerElement.innerHTML = `
      <div class="file-upload-area" tabindex="0" role="button" aria-label="Upload files">
        <div class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>
        <div class="upload-text">
          <h3>Drop files here or click to upload</h3>
          <p>Supports: ${this.getFormattedAllowedTypes(uploadState.config.allowedTypes)}</p>
          <p>Max size: ${this.formatFileSize(uploadState.config.maxFileSize)} per file</p>
        </div>
        <input type="file" class="file-input" ${uploadState.config.multiple ? 'multiple' : ''} 
               accept="${this.getAcceptString(uploadState.config.allowedTypes)}" hidden>
      </div>
      <div class="file-list" role="list" aria-label="Selected files"></div>
      <div class="upload-progress" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <div class="progress-text">Uploading...</div>
      </div>
    `;
    
    this.styleUploadArea(containerElement);
  }

  styleUploadArea(containerElement) {
    const uploadArea = containerElement.querySelector('.file-upload-area');
    uploadArea.style.cssText = `
      border: 2px dashed rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(123, 44, 191, 0.02));
      cursor: pointer;
      transition: all 0.3s ease;
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      font-family: 'Poppins', sans-serif;
      color: #ffffff;
    `;
    
    const uploadIcon = containerElement.querySelector('.upload-icon');
    uploadIcon.style.cssText = `
      opacity: 0.7;
      transition: all 0.3s ease;
    `;
    
    const uploadText = containerElement.querySelector('.upload-text');
    uploadText.style.cssText = `
      text-align: center;
    `;
    
    const uploadTextH3 = uploadText.querySelector('h3');
    uploadTextH3.style.cssText = `
      font-family: 'Orbitron', monospace;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #00d4ff;
    `;
    
    const uploadTextP = uploadText.querySelectorAll('p');
    uploadTextP.forEach(p => {
      p.style.cssText = `
        margin: 4px 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.7);
      `;
    });
  }

  setupUploadEvents(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    const containerElement = uploadState.config.element;
    const uploadArea = containerElement.querySelector('.file-upload-area');
    const fileInput = containerElement.querySelector('.file-input');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    // Keyboard accessibility
    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });
    
    // File selection
    fileInput.addEventListener('change', (e) => {
      this.handleFileSelection(uploadId, e.target.files);
    });
    
    // Drag and drop events
    if (uploadState.config.dragAndDrop) {
      this.setupDragAndDrop(uploadId);
    }
    
    // Focus events
    uploadArea.addEventListener('focus', () => {
      this.addUploadFocusState(uploadArea);
    });
    
    uploadArea.addEventListener('blur', () => {
      this.removeUploadFocusState(uploadArea);
    });
  }

  setupDragAndDrop(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    const containerElement = uploadState.config.element;
    const uploadArea = containerElement.querySelector('.file-upload-area');
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadArea.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
    
    // Drag enter
    uploadArea.addEventListener('dragenter', (e) => {
      uploadState.dragCounter++;
      this.addDragOverState(uploadArea);
    });
    
    // Drag over
    uploadArea.addEventListener('dragover', (e) => {
      this.addDragOverState(uploadArea);
    });
    
    // Drag leave
    uploadArea.addEventListener('dragleave', (e) => {
      uploadState.dragCounter--;
      if (uploadState.dragCounter === 0) {
        this.removeDragOverState(uploadArea);
      }
    });
    
    // Drop
    uploadArea.addEventListener('drop', (e) => {
      uploadState.dragCounter = 0;
      this.removeDragOverState(uploadArea);
      
      const files = e.dataTransfer.files;
      this.handleFileSelection(uploadId, files);
      
      // Trigger haptic feedback
      const touchManager = getTouchInteractionManager();
      if (touchManager && touchManager.supportsHaptics) {
        touchManager.triggerHapticFeedback('medium');
      }
    });
  }

  handleFileSelection(uploadId, files) {
    const uploadState = this.uploadInstances.get(uploadId);
    const fileArray = Array.from(files);
    
    // Validate files
    const validFiles = [];
    const errors = [];
    
    for (const file of fileArray) {
      const validation = this.validateFile(file, uploadState.config);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push({ file: file.name, error: validation.error });
      }
    }
    
    // Check file count limit
    const currentFileCount = uploadState.files.size;
    const newFileCount = currentFileCount + validFiles.length;
    
    if (newFileCount > uploadState.config.maxFiles) {
      const allowedCount = uploadState.config.maxFiles - currentFileCount;
      validFiles.splice(allowedCount);
      errors.push({
        file: 'File limit',
        error: `Maximum ${uploadState.config.maxFiles} files allowed`
      });
    }
    
    // Add valid files
    validFiles.forEach(file => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      uploadState.files.set(fileId, {
        file,
        id: fileId,
        status: 'pending', // pending, uploading, completed, error
        progress: 0,
        preview: null
      });
    });
    
    // Update UI
    this.updateFileList(uploadId);
    
    // Show errors if any
    if (errors.length > 0) {
      this.showUploadErrors(uploadId, errors);
    }
    
    // Auto-upload if enabled
    if (uploadState.config.autoUpload && validFiles.length > 0) {
      this.startUpload(uploadId);
    }
    
    // Announce to screen readers
    this.announceFileSelection(validFiles.length, errors.length);
  }

  validateFile(file, config) {
    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!config.allowedTypes.includes(fileExtension)) {
      return {
        isValid: false,
        error: `File type .${fileExtension} is not allowed`
      };
    }
    
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds ${this.formatFileSize(config.maxFileSize)} limit`
      };
    }
    
    // Check for empty files
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Empty files are not allowed'
      };
    }
    
    return { isValid: true };
  }

  updateFileList(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    const containerElement = uploadState.config.element;
    const fileList = containerElement.querySelector('.file-list');
    
    fileList.innerHTML = '';
    
    for (const [fileId, fileData] of uploadState.files) {
      const fileItem = this.createFileItem(uploadId, fileId, fileData);
      fileList.appendChild(fileItem);
    }
    
    // Generate previews for images
    if (uploadState.config.preview) {
      this.generatePreviews(uploadId);
    }
  }

  createFileItem(uploadId, fileId, fileData) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.setAttribute('role', 'listitem');
    
    const fileExtension = fileData.file.name.split('.').pop().toLowerCase();
    const fileIcon = this.fileTypeIcons[fileExtension] || this.fileTypeIcons.default;
    
    fileItem.innerHTML = `
      <div class="file-icon">${fileIcon}</div>
      <div class="file-info">
        <div class="file-name">${fileData.file.name}</div>
        <div class="file-size">${this.formatFileSize(fileData.file.size)}</div>
        <div class="file-progress" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-percentage">0%</div>
        </div>
      </div>
      <div class="file-preview" style="display: none;"></div>
      <div class="file-actions">
        <button type="button" class="remove-file" aria-label="Remove ${fileData.file.name}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
            <polyline points="3,6 5,6 21,6"></polyline>
            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
          </svg>
        </button>
      </div>
    `;
    
    this.styleFileItem(fileItem);
    
    // Setup remove button
    const removeButton = fileItem.querySelector('.remove-file');
    removeButton.addEventListener('click', () => {
      this.removeFile(uploadId, fileId);
    });
    
    return fileItem;
  }

  styleFileItem(fileItem) {
    fileItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      margin-bottom: 8px;
      font-family: 'Poppins', sans-serif;
      color: #ffffff;
    `;
    
    const fileIcon = fileItem.querySelector('.file-icon');
    fileIcon.style.cssText = `
      width: 32px;
      height: 32px;
      flex-shrink: 0;
    `;
    
    const fileInfo = fileItem.querySelector('.file-info');
    fileInfo.style.cssText = `
      flex: 1;
      min-width: 0;
    `;
    
    const fileName = fileItem.querySelector('.file-name');
    fileName.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `;
    
    const fileSize = fileItem.querySelector('.file-size');
    fileSize.style.cssText = `
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    `;
    
    const removeButton = fileItem.querySelector('.remove-file');
    removeButton.style.cssText = `
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
  }

  // Utility methods
  getFormattedAllowedTypes(allowedTypes) {
    return allowedTypes.map(type => `.${type}`).join(', ');
  }

  getAcceptString(allowedTypes) {
    return allowedTypes.map(type => `.${type}`).join(',');
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  addDragOverState(uploadArea) {
    uploadArea.style.borderColor = '#00d4ff';
    uploadArea.style.backgroundColor = 'rgba(0, 212, 255, 0.1)';
    uploadArea.style.transform = 'scale(1.02)';
  }

  removeDragOverState(uploadArea) {
    uploadArea.style.borderColor = 'rgba(0, 212, 255, 0.3)';
    uploadArea.style.backgroundColor = 'linear-gradient(135deg, rgba(0, 212, 255, 0.05), rgba(123, 44, 191, 0.02))';
    uploadArea.style.transform = 'scale(1)';
  }

  addUploadFocusState(uploadArea) {
    uploadArea.style.outline = '2px solid #00d4ff';
    uploadArea.style.outlineOffset = '2px';
  }

  removeUploadFocusState(uploadArea) {
    uploadArea.style.outline = 'none';
  }

  announceFileSelection(validCount, errorCount) {
    let message = '';
    if (validCount > 0) {
      message += `${validCount} file${validCount > 1 ? 's' : ''} selected. `;
    }
    if (errorCount > 0) {
      message += `${errorCount} file${errorCount > 1 ? 's' : ''} rejected due to validation errors.`;
    }
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }

  // Public API methods
  removeFile(uploadId, fileId) {
    const uploadState = this.uploadInstances.get(uploadId);
    if (!uploadState) return;
    
    uploadState.files.delete(fileId);
    this.updateFileList(uploadId);
    
    this.announceFileSelection(0, 0); // Announce file removal
  }

  getFiles(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    if (!uploadState) return [];
    
    return Array.from(uploadState.files.values()).map(fileData => fileData.file);
  }

  clearFiles(uploadId) {
    const uploadState = this.uploadInstances.get(uploadId);
    if (!uploadState) return;
    
    uploadState.files.clear();
    this.updateFileList(uploadId);
  }
}

// Create global instance
let fileUploadManager = null;

export function getFileUploadManager() {
  if (!fileUploadManager) {
    fileUploadManager = new FileUploadManager();
  }
  return fileUploadManager;
}

export function initializeFileUpload() {
  return getFileUploadManager();
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeFileUpload();
  });
}

export default FileUploadManager;
