/**
 * Optimized Image Component for DigiClick AI
 * WebP support with JPEG fallbacks and lazy loading
 */

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { capturePerformanceIssue } from '../lib/sentry-config';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  loading = 'lazy',
  onLoad,
  onError,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [loadTime, setLoadTime] = useState(null);
  const loadStartTime = useRef(null);
  const imageRef = useRef(null);
  
  // Generate WebP and fallback URLs
  const getOptimizedSrc = (originalSrc, format = 'webp') => {
    if (!originalSrc) return '';
    
    // If it's already a data URL or external URL, return as-is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // Remove leading slash if present
    const cleanSrc = originalSrc.startsWith('/') ? originalSrc.slice(1) : originalSrc;
    
    // Get file extension and name
    const lastDotIndex = cleanSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return originalSrc;
    
    const baseName = cleanSrc.substring(0, lastDotIndex);
    const extension = cleanSrc.substring(lastDotIndex + 1);
    
    // Return WebP version if supported, otherwise original
    if (format === 'webp') {
      return `/${baseName}.webp`;
    }
    
    return originalSrc;
  };
  
  // Check WebP support
  const [supportsWebP, setSupportsWebP] = useState(false);
  
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    };
    
    setSupportsWebP(checkWebPSupport());
  }, []);
  
  // Generate blur placeholder
  const generateBlurDataURL = (width, height) => {
    if (blurDataURL) return blurDataURL;
    
    // Generate a simple blur placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    
    // Create a simple gradient
    const gradient = ctx.createLinearGradient(0, 0, 8, 8);
    gradient.addColorStop(0, '#121212');
    gradient.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 8, 8);
    
    return canvas.toDataURL();
  };
  
  // Handle image load start
  const handleLoadStart = () => {
    loadStartTime.current = performance.now();
  };
  
  // Handle successful image load
  const handleLoad = (event) => {
    if (loadStartTime.current) {
      const currentLoadTime = performance.now() - loadStartTime.current;
      setLoadTime(currentLoadTime);
      
      // Track slow loading images
      if (currentLoadTime > 2000) {
        capturePerformanceIssue(
          'image_slow_loading',
          currentLoadTime,
          2000,
          {
            tags: { 
              component: 'optimized_image',
              image_src: src
            },
            extra: {
              image_dimensions: `${width}x${height}`,
              webp_support: supportsWebP,
              priority: priority
            }
          }
        );
      }
    }
    
    if (onLoad) {
      onLoad(event);
    }
  };
  
  // Handle image load error
  const handleError = (event) => {
    console.warn('Image failed to load:', src);
    setImageError(true);
    
    capturePerformanceIssue(
      'image_load_failed',
      0,
      1,
      {
        tags: { 
          component: 'optimized_image',
          image_src: src
        },
        extra: {
          webp_support: supportsWebP,
          error_event: event.type
        }
      }
    );
    
    if (onError) {
      onError(event);
    }
  };
  
  // Determine the best image source
  const optimizedSrc = !imageError && supportsWebP 
    ? getOptimizedSrc(src, 'webp')
    : src;
  
  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (
    fill 
      ? '100vw'
      : `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`
  );
  
  // Common props for Next.js Image
  const imageProps = {
    src: optimizedSrc,
    alt: alt || '',
    className: `optimized-image ${className}`,
    style: {
      ...style,
      transition: 'opacity 0.3s ease-in-out'
    },
    quality: quality,
    priority: priority,
    loading: priority ? 'eager' : loading,
    placeholder: placeholder,
    blurDataURL: placeholder === 'blur' ? generateBlurDataURL(width, height) : undefined,
    sizes: responsiveSizes,
    onLoad: handleLoad,
    onError: handleError,
    onLoadStart: handleLoadStart,
    ...props
  };
  
  // Add dimensions if not using fill
  if (!fill && width && height) {
    imageProps.width = width;
    imageProps.height = height;
  } else if (fill) {
    imageProps.fill = true;
  }
  
  return (
    <div 
      ref={imageRef}
      className={`optimized-image-container ${fill ? 'relative' : ''}`}
      style={fill ? { position: 'relative' } : {}}
    >
      {/* Main optimized image */}
      <Image {...imageProps} />
      
      {/* Fallback for WebP errors */}
      {imageError && supportsWebP && (
        <Image
          {...imageProps}
          src={src} // Use original source as fallback
          onError={() => {
            console.error('Fallback image also failed to load:', src);
          }}
        />
      )}
      
      {/* Loading performance indicator (development only) */}
      {process.env.NODE_ENV === 'development' && loadTime && (
        <div
          className="image-perf-indicator"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: loadTime > 1000 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(0, 255, 0, 0.8)',
            color: 'white',
            padding: '2px 4px',
            fontSize: '10px',
            borderRadius: '0 0 0 4px',
            pointerEvents: 'none',
            zIndex: 10
          }}
        >
          {Math.round(loadTime)}ms
        </div>
      )}
      
      <style jsx>{`
        .optimized-image-container {
          display: inline-block;
        }
        
        .optimized-image {
          transition: opacity 0.3s ease-in-out;
        }
        
        .optimized-image[data-loaded="false"] {
          opacity: 0;
        }
        
        .optimized-image[data-loaded="true"] {
          opacity: 1;
        }
        
        /* Responsive image styles */
        @media (max-width: 768px) {
          .optimized-image {
            max-width: 100%;
            height: auto;
          }
        }
        
        /* Prevent layout shift */
        .optimized-image-container img {
          display: block;
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
};

// Higher-order component for lazy loading images
export const LazyOptimizedImage = (props) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (props.priority || hasIntersected) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasIntersected(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image is visible
        threshold: 0.1
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [props.priority, hasIntersected]);
  
  return (
    <div ref={containerRef} style={{ minHeight: props.height || 'auto' }}>
      {isVisible ? (
        <OptimizedImage {...props} />
      ) : (
        <div
          style={{
            width: props.width || '100%',
            height: props.height || 'auto',
            backgroundColor: '#121212',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '12px'
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

// Utility function to preload critical images
export const preloadImage = (src, priority = false) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = priority ? 'preload' : 'prefetch';
  link.as = 'image';
  link.href = src;
  
  document.head.appendChild(link);
};

// Utility function to convert images to WebP (for build process)
export const generateWebPVersions = async (imagePaths) => {
  // This would be used in a build script to generate WebP versions
  console.log('Generating WebP versions for:', imagePaths);
  
  // Implementation would use sharp or similar library
  // This is a placeholder for the build process
  return imagePaths.map(path => ({
    original: path,
    webp: path.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  }));
};

export default OptimizedImage;
