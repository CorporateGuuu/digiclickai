import React from 'react';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import styles from './LazyImage.module.css';

const LazyImage = ({
  src,
  alt,
  width,
  height,
  className,
  placeholderSrc = '/images/placeholder.svg',
  threshold = 0.1,
  rootMargin = '50px',
  onLoad = null,
  onError = null,
  enableBlur = true,
  quality = 75,
  priority = false,
  objectFit = 'cover',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Convert width and height to numbers for next/image
  const widthNum = typeof width === 'string' && width.includes('%')
    ? 500 // Default width if percentage is used
    : parseInt(width, 10) || 500;

  const heightNum = typeof height === 'string' && height.includes('%')
    ? 500 // Default height if percentage is used
    : parseInt(height, 10) || 500;

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setIsInView(false);
  }, [src]);

  useEffect(() => {
    const currentImgRef = imgRef.current;

    if (!currentImgRef || isInView) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Simulate loading progress for better UX
          const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return 90;
              }
              return prev + Math.random() * 20;
            });
          }, 100);

          observerRef.current?.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(currentImgRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, isInView]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setLoadingProgress(100);
    setHasError(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(false);
    setLoadingProgress(0);
    onError?.();
  };

  // Generate blur data URL for placeholder
  const generateBlurDataURL = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(123, 44, 191, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL();
  };

  return (
    <div
      ref={imgRef}
      className={`${styles.lazyImageContainer} ${className || ''} ${hasError ? styles.error : ''}`}
      style={{ width, height }}
      {...props}
    >
      {/* Loading progress bar */}
      {isInView && !isLoaded && !hasError && (
        <div className={styles.loadingProgress}>
          <div
            className={styles.progressBar}
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Placeholder image */}
      <div className={`${styles.placeholder} ${isLoaded ? styles.hidden : ''}`}>
        {enableBlur && !hasError ? (
          <Image
            src={generateBlurDataURL(widthNum, heightNum)}
            alt={alt}
            width={widthNum}
            height={heightNum}
            layout="responsive"
            objectFit={objectFit}
            priority={false}
            placeholder="blur"
            blurDataURL={generateBlurDataURL(20, 20)}
          />
        ) : (
          <Image
            src={placeholderSrc}
            alt={alt}
            width={widthNum}
            height={heightNum}
            layout="responsive"
            objectFit="contain"
            priority={false}
          />
        )}
      </div>

      {/* Actual image (only loads when in view) */}
      {isInView && !hasError && (
        <div className={`${styles.actualImage} ${isLoaded ? styles.visible : ''}`}>
          <Image
            src={src}
            alt={alt}
            width={widthNum}
            height={heightNum}
            layout="responsive"
            objectFit={objectFit}
            quality={quality}
            onLoadingComplete={handleImageLoad}
            onError={handleImageError}
            priority={priority}
            placeholder={enableBlur ? "blur" : "empty"}
            blurDataURL={enableBlur ? generateBlurDataURL(20, 20) : undefined}
          />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorText}>Failed to load image</div>
          <button
            className={styles.retryButton}
            onClick={() => {
              setHasError(false);
              setIsLoaded(false);
              setLoadingProgress(0);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

// Progressive Image Component
export const ProgressiveImage = ({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className = '',
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    if (highQualitySrc) {
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(highQualitySrc);
        setIsHighQualityLoaded(true);
      };
      img.src = highQualitySrc;
    }
  }, [highQualitySrc]);

  return (
    <LazyImage
      src={currentSrc}
      alt={alt}
      className={`${styles.progressiveImage} ${isHighQualityLoaded ? styles.highQuality : styles.lowQuality} ${className}`}
      enableBlur={!isHighQualityLoaded}
      {...props}
    />
  );
};

export default LazyImage;
