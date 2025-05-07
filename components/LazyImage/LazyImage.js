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
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    const currentImgRef = imgRef.current;

    if (currentImgRef) {
      observer.observe(currentImgRef);
    }

    return () => {
      if (currentImgRef) {
        observer.disconnect();
      }
    };
  }, [threshold]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      ref={imgRef}
      className={`${styles.lazyImageContainer} ${className || ''}`}
      style={{ width, height }}
      {...props}
    >
      {/* Placeholder image */}
      <div className={`${styles.placeholder} ${isLoaded ? styles.hidden : ''}`}>
        <Image
          src={placeholderSrc}
          alt={alt}
          width={widthNum}
          height={heightNum}
          layout="responsive"
          objectFit="contain"
          priority={false}
        />
      </div>

      {/* Actual image (only loads when in view) */}
      {isInView && (
        <div className={`${styles.actualImage} ${isLoaded ? styles.visible : ''}`}>
          <Image
            src={src}
            alt={alt}
            width={widthNum}
            height={heightNum}
            layout="responsive"
            objectFit="contain"
            onLoadingComplete={handleImageLoad}
            priority={false}
          />
        </div>
      )}
    </div>
  );
};

export default LazyImage;
