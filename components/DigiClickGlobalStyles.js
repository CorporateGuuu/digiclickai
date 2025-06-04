import React from 'react';

export default function DigiClickGlobalStyles() {
  return (
    <style jsx global>{`
      /* DigiClick AI Global Styles */
      
      /* CSS Custom Properties */
      :root {
        --primary-color: #00d4ff;
        --secondary-color: #7b2cbf;
        --accent-color: #a855f7;
        --background-dark: #121212;
        --background-light: #1a1a1a;
        --text-light: #ffffff;
        --text-muted: #b0b0b0;
        --border-color: rgba(0, 212, 255, 0.2);
        --shadow-glow: 0 0 20px rgba(0, 212, 255, 0.3);
        --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --font-primary: 'Orbitron', monospace;
        --font-secondary: 'Poppins', sans-serif;
      }

      /* Base Styles */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      html {
        scroll-behavior: smooth;
        font-size: 16px;
      }

      body {
        font-family: var(--font-secondary);
        background: var(--background-dark);
        color: var(--text-light);
        line-height: 1.6;
        overflow-x: hidden;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      /* DigiClick Theme */
      .digiclick-theme {
        background: linear-gradient(135deg, #121212 0%, #1a1a1a 100%);
        min-height: 100vh;
      }

      .digiclick-layout {
        position: relative;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
        position: relative;
        z-index: 1;
      }

      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-primary);
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1rem;
      }

      h1 {
        font-size: clamp(2rem, 5vw, 3.5rem);
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 0 30px rgba(0, 212, 255, 0.5);
      }

      h2 {
        font-size: clamp(1.5rem, 4vw, 2.5rem);
        color: var(--primary-color);
      }

      h3 {
        font-size: clamp(1.25rem, 3vw, 2rem);
        color: var(--text-light);
      }

      p {
        margin-bottom: 1rem;
        color: var(--text-muted);
      }

      /* Links */
      a {
        color: var(--primary-color);
        text-decoration: none;
        transition: var(--transition-smooth);
      }

      a:hover {
        color: var(--accent-color);
        text-shadow: var(--shadow-glow);
      }

      /* Buttons */
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.75rem 1.5rem;
        font-family: var(--font-primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        border: none;
        border-radius: 50px;
        cursor: pointer;
        transition: var(--transition-smooth);
        text-decoration: none;
        position: relative;
        overflow: hidden;
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        color: var(--background-dark);
        box-shadow: var(--shadow-glow);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(0, 212, 255, 0.4);
      }

      .btn-secondary {
        background: transparent;
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
      }

      .btn-secondary:hover {
        background: var(--primary-color);
        color: var(--background-dark);
        box-shadow: var(--shadow-glow);
      }

      /* Form Elements */
      input, textarea, select {
        width: 100%;
        padding: 0.75rem 1rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-light);
        font-family: var(--font-secondary);
        transition: var(--transition-smooth);
      }

      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
      }

      /* Utility Classes */
      .text-center { text-align: center; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }

      .mb-1 { margin-bottom: 0.5rem; }
      .mb-2 { margin-bottom: 1rem; }
      .mb-3 { margin-bottom: 1.5rem; }
      .mb-4 { margin-bottom: 2rem; }

      .mt-1 { margin-top: 0.5rem; }
      .mt-2 { margin-top: 1rem; }
      .mt-3 { margin-top: 1.5rem; }
      .mt-4 { margin-top: 2rem; }

      .p-1 { padding: 0.5rem; }
      .p-2 { padding: 1rem; }
      .p-3 { padding: 1.5rem; }
      .p-4 { padding: 2rem; }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 1rem;
      }

      .row {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -0.5rem;
      }

      .col {
        flex: 1;
        padding: 0 0.5rem;
      }

      /* Accessibility */
      .skip-nav {
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: var(--background-dark);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
      }

      .skip-nav:focus {
        top: 6px;
      }

      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Scrollbar Styling */
      ::-webkit-scrollbar {
        width: 8px;
      }

      ::-webkit-scrollbar-track {
        background: var(--background-dark);
      }

      ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, var(--secondary-color) 0%, var(--accent-color) 100%);
      }

      /* Selection */
      ::selection {
        background: rgba(0, 212, 255, 0.3);
        color: var(--text-light);
      }

      ::-moz-selection {
        background: rgba(0, 212, 255, 0.3);
        color: var(--text-light);
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .container {
          padding: 0 0.5rem;
        }
        
        .row {
          flex-direction: column;
        }
        
        .btn {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
      }

      /* Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        html {
          scroll-behavior: auto;
        }
      }

      /* High Contrast */
      @media (prefers-contrast: high) {
        :root {
          --primary-color: #ffffff;
          --secondary-color: #ffffff;
          --accent-color: #ffffff;
          --background-dark: #000000;
          --background-light: #000000;
          --text-light: #ffffff;
          --text-muted: #ffffff;
          --border-color: #ffffff;
        }
      }

      /* Dark Mode Support */
      @media (prefers-color-scheme: dark) {
        :root {
          --background-dark: #000000;
          --background-light: #111111;
        }
      }

      /* Print Styles */
      @media print {
        * {
          background: white !important;
          color: black !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        
        .skip-nav,
        .btn,
        nav {
          display: none !important;
        }
      }
    `}</style>
  );
}
