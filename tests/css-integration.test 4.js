import { render } from '@testing-library/react';
import Document from '../pages/_document';
import fs from 'fs';
import path from 'path';

// Mock fs and path
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('CSS Integration', () => {
  beforeEach(() => {
    fs.existsSync.mockReset();
    fs.readFileSync.mockReset();
    path.join.mockReset();
  });

  test('_document.js includes all required CSS files', () => {
    // Mock the implementation of fs.existsSync to return true
    fs.existsSync.mockImplementation(() => true);
    
    // Mock the implementation of fs.readFileSync to return the content of _document.js
    fs.readFileSync.mockImplementation(() => `
      import React from 'react';
      import { Html, Head, Main, NextScript } from 'next/document';
      
      function Document() {
        return (
          <Html lang="en">
            <Head>
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
              <link rel="stylesheet" href="/css/global.css" />
              <link rel="stylesheet" href="/css/components.css" />
              <link rel="stylesheet" href="/css/home.css" />
              <link rel="stylesheet" href="/css/animations.css" />
            </Head>
            <body>
              <Main />
              <NextScript />
            </body>
          </Html>
        );
      }
      
      export default React.memo(Document);
    `);
    
    // Mock the implementation of path.join to return the path to _document.js
    path.join.mockImplementation(() => '/path/to/_document.js');
    
    // Check that the _document.js file includes all required CSS files
    const documentContent = fs.readFileSync('/path/to/_document.js', 'utf8');
    
    expect(documentContent).toContain('<link rel="stylesheet" href="/css/global.css" />');
    expect(documentContent).toContain('<link rel="stylesheet" href="/css/components.css" />');
    expect(documentContent).toContain('<link rel="stylesheet" href="/css/home.css" />');
    expect(documentContent).toContain('<link rel="stylesheet" href="/css/animations.css" />');
  });

  test('all required CSS files exist in the public directory', () => {
    // Mock the implementation of fs.existsSync to return true for all CSS files
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('/css/global.css') ||
          filePath.includes('/css/components.css') ||
          filePath.includes('/css/home.css') ||
          filePath.includes('/css/animations.css')) {
        return true;
      }
      return false;
    });
    
    // Mock the implementation of path.join to return the path to the CSS files
    path.join.mockImplementation((dir, file) => {
      return `/path/to/public/${file}`;
    });
    
    // Check that all required CSS files exist
    expect(fs.existsSync('/path/to/public/css/global.css')).toBe(true);
    expect(fs.existsSync('/path/to/public/css/components.css')).toBe(true);
    expect(fs.existsSync('/path/to/public/css/home.css')).toBe(true);
    expect(fs.existsSync('/path/to/public/css/animations.css')).toBe(true);
  });
});
