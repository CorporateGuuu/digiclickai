import React from 'react';
import Head from 'next/head';

/**
 * CriticalCss component for optimizing CSS delivery
 * 
 * This component:
 * 1. Inlines critical CSS for above-the-fold content
 * 2. Preloads important CSS files
 * 3. Defers non-critical CSS loading
 * 
 * @param {Object} props Component props
 * @param {string} props.id Unique identifier for the critical CSS
 * @param {string} props.criticalStyles Critical CSS styles to be inlined
 * @param {Array} props.preloadStyles Array of CSS files to preload
 * @param {Array} props.deferredStyles Array of CSS files to load with low priority
 */
const CriticalCss = ({ 
  id = 'critical-css',
  criticalStyles = '',
  preloadStyles = [],
  deferredStyles = []
}) => {
  return (
    <Head>
      {/* Inline critical CSS */}
      {criticalStyles && (
        <style 
          id={id} 
          dangerouslySetInnerHTML={{ __html: criticalStyles }} 
          data-critical="true"
        />
      )}
      
      {/* Preload important CSS files */}
      {preloadStyles.map((href, index) => (
        <link 
          key={`preload-${index}`}
          rel="preload" 
          href={href} 
          as="style" 
          crossOrigin="anonymous"
        />
      ))}
      
      {/* Load preloaded CSS files */}
      {preloadStyles.map((href, index) => (
        <link 
          key={`style-${index}`}
          rel="stylesheet" 
          href={href} 
          crossOrigin="anonymous"
        />
      ))}
      
      {/* Defer non-critical CSS loading */}
      {deferredStyles.map((href, index) => (
        <link 
          key={`deferred-${index}`}
          rel="stylesheet" 
          href={href} 
          media="print" 
          onLoad="this.media='all'" 
          crossOrigin="anonymous"
        />
      ))}
    </Head>
  );
};

export default CriticalCss;
