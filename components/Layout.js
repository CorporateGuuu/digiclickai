import React from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';

// Dynamic import for client-side only cursor
const EnhancedCustomCursor = dynamic(
  () => import('./CustomCursor/EnhancedCustomCursor'),
  { ssr: false }
);

/**
 * Simple Layout Component with CustomCursor
 * Enhanced version of your original layout with error boundaries and performance optimizations
 */
export default function Layout({ 
  children, 
  showCursor = true,
  cursorTheme = 'default',
  className = ''
}) {
  return (
    <div className={`layout-container ${className}`}>
      {/* Enhanced Custom Cursor with Error Boundary */}
      {showCursor && (
        <ErrorBoundary fallback={null}>
          <EnhancedCustomCursor theme={cursorTheme} />
        </ErrorBoundary>
      )}
      
      {/* Main Content */}
      <main className="layout-main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* Layout Styles */}
      <style jsx>{`
        .layout-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
        }

        .layout-main {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        /* Ensure cursor works properly */
        .layout-container * {
          position: relative;
        }

        /* Performance optimizations */
        .layout-container {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Accessibility */
        .layout-main:focus {
          outline: none;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .layout-container {
            overflow-x: hidden;
          }
        }

        /* Touch device optimizations */
        @media (hover: none) and (pointer: coarse) {
          .layout-container {
            -webkit-overflow-scrolling: touch;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .layout-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Layout with DigiClick AI Theme
 * Use this for pages that need the full DigiClick AI styling
 */
export function DigiClickLayout({ 
  children, 
  showCursor = true,
  showParticles = false,
  cursorTheme = 'default',
  className = ''
}) {
  return (
    <div className={`digiclick-layout ${className}`}>
      {/* Enhanced Custom Cursor */}
      {showCursor && (
        <ErrorBoundary fallback={null}>
          <EnhancedCustomCursor theme={cursorTheme} />
        </ErrorBoundary>
      )}
      
      {/* Particles Background (optional) */}
      {showParticles && (
        <ErrorBoundary fallback={null}>
          <div className="particles-container">
            {/* Particles.js would go here */}
          </div>
        </ErrorBoundary>
      )}
      
      {/* Main Content */}
      <main className="digiclick-main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      {/* DigiClick AI Theme Styles */}
      <style jsx>{`
        .digiclick-layout {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #2c2c2c 100%);
          color: #e0e0e0;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
        }

        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .digiclick-main {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        /* DigiClick AI Typography */
        .digiclick-layout h1,
        .digiclick-layout h2,
        .digiclick-layout h3 {
          font-family: 'Orbitron', sans-serif;
        }

        /* DigiClick AI Button Styles */
        .digiclick-layout .cta-button {
          background: linear-gradient(45deg, #00d4ff, #7b2cbf);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-family: 'Orbitron', sans-serif;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .digiclick-layout .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.3);
        }

        /* DigiClick AI Glow Text */
        .digiclick-layout .glow-text {
          background: linear-gradient(45deg, #00d4ff, #7b2cbf);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }

        /* DigiClick AI Pulse Box */
        .digiclick-layout .pulse-box {
          animation: pulse 2s ease-in-out infinite;
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 10px;
          padding: 1rem;
          background: rgba(0, 212, 255, 0.05);
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
          }
        }

        /* Performance optimizations */
        .digiclick-layout {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .digiclick-layout {
            background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .digiclick-layout .pulse-box {
            animation: none;
          }
          
          .digiclick-layout * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .digiclick-layout {
            background: #000000;
            color: #ffffff;
          }
          
          .digiclick-layout .glow-text {
            color: #ffffff;
            text-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Minimal Layout
 * Use this for simple pages that just need the cursor
 */
export function MinimalLayout({ children, showCursor = true }) {
  return (
    <div className="minimal-layout">
      {showCursor && (
        <ErrorBoundary fallback={null}>
          <EnhancedCustomCursor />
        </ErrorBoundary>
      )}
      
      <main>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>

      <style jsx>{`
        .minimal-layout {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        main {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
}
