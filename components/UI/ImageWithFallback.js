import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './ImageWithFallback.module.css';

const ImageWithFallback = ({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  width,
  height,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  return (
    <div className={`${styles.imageContainer} ${className || ''}`} style={{ width, height }}>
      {loading && <div className={styles.imagePlaceholder} />}
      
      <img
        src={imgSrc}
        alt={alt}
        className={styles.image}
        style={{ 
          opacity: loading ? 0 : 1,
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setImgSrc(fallbackSrc);
          setLoading(false);
        }}
        {...props}
      />
      
      {error && (
        <div className={styles.errorOverlay}>
          <span>{alt || 'Image'}</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
