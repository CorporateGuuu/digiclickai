/**
 * Z-Index Management System for DigiClick AI
 * Prevents conflicts between cursor system and modals/overlays
 */

// Z-Index hierarchy for DigiClick AI
export const Z_INDEX_LAYERS = {
  // Base layers
  BASE: 1,
  CONTENT: 10,
  NAVIGATION: 100,
  DROPDOWNS: 1000,
  
  // Interactive elements
  TOOLTIPS: 5000,
  NOTIFICATIONS: 6000,
  
  // Overlays and modals
  MODAL_BACKDROP: 9000,
  MODAL_CONTENT: 9100,
  ACCESSIBILITY_MENU: 9200,
  CONTACT_FORM_MODAL: 9300,
  AB_TEST_DASHBOARD: 9400,
  
  // Cursor system (highest priority but modal-aware)
  CURSOR_SYSTEM: 10000,
  CURSOR_EFFECTS: 10001,
  CURSOR_TEXT: 10002,
  
  // Emergency overlays (above everything)
  EMERGENCY_MODAL: 15000,
  SYSTEM_ALERTS: 16000
};

// Modal detection and cursor management
class ZIndexManager {
  constructor() {
    this.activeModals = new Set();
    this.cursorHidden = false;
    this.originalCursorZIndex = Z_INDEX_LAYERS.CURSOR_SYSTEM;
    this.modalObserver = null;
    
    this.init();
  }
  
  init() {
    // Set up modal detection
    this.setupModalDetection();
    
    // Listen for modal events
    this.setupEventListeners();
    
    // Monitor DOM changes for new modals
    this.setupMutationObserver();
  }
  
  setupModalDetection() {
    // Common modal selectors
    this.modalSelectors = [
      '.modal',
      '.modal-overlay',
      '.accessibility-menu',
      '.contact-form-modal',
      '.ab-test-dashboard',
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.popup',
      '.overlay',
      '[data-modal]'
    ];
  }
  
  setupEventListeners() {
    // Listen for modal open/close events
    document.addEventListener('modal-opened', (e) => {
      this.handleModalOpen(e.detail.modalId, e.detail.zIndex);
    });
    
    document.addEventListener('modal-closed', (e) => {
      this.handleModalClose(e.detail.modalId);
    });
    
    // Listen for accessibility menu events
    document.addEventListener('accessibility-menu-opened', () => {
      this.handleModalOpen('accessibility-menu', Z_INDEX_LAYERS.ACCESSIBILITY_MENU);
    });
    
    document.addEventListener('accessibility-menu-closed', () => {
      this.handleModalClose('accessibility-menu');
    });
    
    // Listen for escape key to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModals.size > 0) {
        this.closeTopModal();
      }
    });
  }
  
  setupMutationObserver() {
    // Watch for dynamically added modals
    this.modalObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForNewModals(node);
          }
        });
        
        mutation.removedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkForRemovedModals(node);
          }
        });
      });
    });
    
    this.modalObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  checkForNewModals(element) {
    // Check if the element or its children are modals
    const modals = [element, ...element.querySelectorAll(this.modalSelectors.join(','))];
    
    modals.forEach((modal) => {
      if (this.isModal(modal) && this.isVisible(modal)) {
        const modalId = this.getModalId(modal);
        const zIndex = this.getModalZIndex(modal);
        this.handleModalOpen(modalId, zIndex);
      }
    });
  }
  
  checkForRemovedModals(element) {
    // Check if removed element was a modal
    if (this.isModal(element)) {
      const modalId = this.getModalId(element);
      this.handleModalClose(modalId);
    }
  }
  
  isModal(element) {
    return this.modalSelectors.some(selector => {
      try {
        return element.matches && element.matches(selector);
      } catch (e) {
        return false;
      }
    });
  }
  
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }
  
  getModalId(element) {
    return element.id || 
           element.dataset.modalId || 
           element.className.split(' ')[0] || 
           `modal-${Date.now()}`;
  }
  
  getModalZIndex(element) {
    const style = window.getComputedStyle(element);
    const zIndex = parseInt(style.zIndex);
    
    if (!isNaN(zIndex)) {
      return zIndex;
    }
    
    // Assign default z-index based on modal type
    if (element.classList.contains('accessibility-menu')) {
      return Z_INDEX_LAYERS.ACCESSIBILITY_MENU;
    } else if (element.classList.contains('contact-form-modal')) {
      return Z_INDEX_LAYERS.CONTACT_FORM_MODAL;
    } else if (element.classList.contains('ab-test-dashboard')) {
      return Z_INDEX_LAYERS.AB_TEST_DASHBOARD;
    } else {
      return Z_INDEX_LAYERS.MODAL_CONTENT;
    }
  }
  
  handleModalOpen(modalId, modalZIndex) {
    this.activeModals.add({ id: modalId, zIndex: modalZIndex });
    
    // Check if cursor should be hidden or repositioned
    if (modalZIndex >= Z_INDEX_LAYERS.MODAL_BACKDROP) {
      this.adjustCursorForModal(modalZIndex);
    }
    
    // Dispatch event for cursor system
    window.dispatchEvent(new CustomEvent('modal-state-changed', {
      detail: {
        action: 'opened',
        modalId,
        modalZIndex,
        activeModals: Array.from(this.activeModals),
        cursorAdjustment: this.getCursorAdjustment(modalZIndex)
      }
    }));
  }
  
  handleModalClose(modalId) {
    this.activeModals = new Set(
      Array.from(this.activeModals).filter(modal => modal.id !== modalId)
    );
    
    // Restore cursor if no modals are active
    if (this.activeModals.size === 0) {
      this.restoreCursor();
    } else {
      // Adjust cursor for remaining highest modal
      const highestModal = this.getHighestModal();
      this.adjustCursorForModal(highestModal.zIndex);
    }
    
    // Dispatch event for cursor system
    window.dispatchEvent(new CustomEvent('modal-state-changed', {
      detail: {
        action: 'closed',
        modalId,
        activeModals: Array.from(this.activeModals),
        cursorAdjustment: this.getCursorAdjustment()
      }
    }));
  }
  
  adjustCursorForModal(modalZIndex) {
    const cursorElements = document.querySelectorAll('[class*="cursor"]');
    
    if (modalZIndex >= Z_INDEX_LAYERS.CURSOR_SYSTEM) {
      // Hide cursor if modal is above cursor layer
      this.hideCursor();
    } else {
      // Ensure cursor stays above modal
      this.setCursorZIndex(modalZIndex + 1000);
    }
  }
  
  hideCursor() {
    if (!this.cursorHidden) {
      const cursorElements = document.querySelectorAll('[class*="cursor"]');
      cursorElements.forEach(element => {
        element.style.display = 'none';
      });
      this.cursorHidden = true;
    }
  }
  
  showCursor() {
    if (this.cursorHidden) {
      const cursorElements = document.querySelectorAll('[class*="cursor"]');
      cursorElements.forEach(element => {
        element.style.display = '';
      });
      this.cursorHidden = false;
    }
  }
  
  setCursorZIndex(zIndex) {
    const cursorElements = document.querySelectorAll('[class*="cursor"]');
    cursorElements.forEach(element => {
      element.style.zIndex = zIndex;
    });
  }
  
  restoreCursor() {
    this.showCursor();
    this.setCursorZIndex(this.originalCursorZIndex);
  }
  
  getHighestModal() {
    return Array.from(this.activeModals).reduce((highest, current) => {
      return current.zIndex > highest.zIndex ? current : highest;
    }, { zIndex: 0 });
  }
  
  getCursorAdjustment(modalZIndex = 0) {
    if (this.activeModals.size === 0) {
      return { action: 'restore', zIndex: this.originalCursorZIndex };
    }
    
    const highestModal = this.getHighestModal();
    const targetZIndex = Math.max(modalZIndex, highestModal.zIndex);
    
    if (targetZIndex >= Z_INDEX_LAYERS.CURSOR_SYSTEM) {
      return { action: 'hide' };
    } else {
      return { action: 'adjust', zIndex: targetZIndex + 1000 };
    }
  }
  
  closeTopModal() {
    if (this.activeModals.size > 0) {
      const highestModal = this.getHighestModal();
      
      // Try to close the modal using common methods
      const modalElement = document.getElementById(highestModal.id) || 
                          document.querySelector(`[data-modal-id="${highestModal.id}"]`);
      
      if (modalElement) {
        // Trigger close event
        modalElement.dispatchEvent(new CustomEvent('close'));
        
        // Try common close methods
        const closeButton = modalElement.querySelector('.close, .modal-close, [data-close]');
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  }
  
  destroy() {
    if (this.modalObserver) {
      this.modalObserver.disconnect();
    }
    
    // Remove event listeners
    document.removeEventListener('modal-opened', this.handleModalOpen);
    document.removeEventListener('modal-closed', this.handleModalClose);
    document.removeEventListener('accessibility-menu-opened', this.handleModalOpen);
    document.removeEventListener('accessibility-menu-closed', this.handleModalClose);
    
    // Restore cursor
    this.restoreCursor();
  }
}

// Singleton instance
let zIndexManager = null;

export function getZIndexManager() {
  if (!zIndexManager) {
    zIndexManager = new ZIndexManager();
  }
  return zIndexManager;
}

export function initializeZIndexManager() {
  return getZIndexManager();
}

export default ZIndexManager;
