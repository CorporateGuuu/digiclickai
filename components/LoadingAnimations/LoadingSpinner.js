import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ 
  type = 'default', 
  size = 'medium', 
  color = 'primary',
  text = '',
  progress = null,
  className = '',
  ariaLabel = 'Loading...'
}) => {
  const getSpinnerContent = () => {
    switch (type) {
      case 'circuit':
        return (
          <svg className={styles.circuitSpinner} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="50%" stopColor="#7b2cbf" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
            
            {/* Circuit paths */}
            <path 
              d="M20,20 L80,20 L80,50 L50,50 L50,80 L80,80" 
              stroke="url(#circuitGradient)" 
              strokeWidth="2" 
              fill="none"
              className={styles.circuitPath}
            />
            <path 
              d="M20,80 L50,80 L50,50 L20,50 L20,20" 
              stroke="url(#circuitGradient)" 
              strokeWidth="2" 
              fill="none"
              className={styles.circuitPath}
              style={{ animationDelay: '0.5s' }}
            />
            
            {/* Circuit nodes */}
            <circle cx="20" cy="20" r="3" fill="#00d4ff" className={styles.circuitNode} />
            <circle cx="80" cy="20" r="3" fill="#7b2cbf" className={styles.circuitNode} style={{ animationDelay: '0.2s' }} />
            <circle cx="50" cy="50" r="3" fill="#a855f7" className={styles.circuitNode} style={{ animationDelay: '0.4s' }} />
            <circle cx="80" cy="80" r="3" fill="#00d4ff" className={styles.circuitNode} style={{ animationDelay: '0.6s' }} />
            <circle cx="20" cy="80" r="3" fill="#7b2cbf" className={styles.circuitNode} style={{ animationDelay: '0.8s' }} />
          </svg>
        );

      case 'geometric':
        return (
          <svg className={styles.geometricSpinner} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="geometricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7b2cbf" />
              </linearGradient>
            </defs>
            
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill="none" 
              stroke="url(#geometricGradient)" 
              strokeWidth="2"
              className={styles.geometricShape}
            />
            <polygon 
              points="50,25 75,50 50,75 25,50" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="2"
              className={styles.geometricShape}
              style={{ animationDelay: '0.3s' }}
            />
            <circle 
              cx="50" 
              cy="50" 
              r="8" 
              fill="#00d4ff"
              className={styles.geometricCore}
            />
          </svg>
        );

      case 'neural':
        return (
          <svg className={styles.neuralSpinner} viewBox="0 0 100 100">
            <defs>
              <radialGradient id="neuralGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00d4ff" />
                <stop offset="50%" stopColor="#7b2cbf" />
                <stop offset="100%" stopColor="#a855f7" />
              </radialGradient>
            </defs>
            
            {/* Neural network nodes */}
            <circle cx="30" cy="30" r="4" fill="#00d4ff" className={styles.neuralNode} />
            <circle cx="70" cy="30" r="4" fill="#7b2cbf" className={styles.neuralNode} style={{ animationDelay: '0.1s' }} />
            <circle cx="50" cy="50" r="6" fill="#a855f7" className={styles.neuralNode} style={{ animationDelay: '0.2s' }} />
            <circle cx="30" cy="70" r="4" fill="#00d4ff" className={styles.neuralNode} style={{ animationDelay: '0.3s' }} />
            <circle cx="70" cy="70" r="4" fill="#7b2cbf" className={styles.neuralNode} style={{ animationDelay: '0.4s' }} />
            
            {/* Neural connections */}
            <line x1="30" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="1" className={styles.neuralConnection} />
            <line x1="70" y1="30" x2="50" y2="50" stroke="url(#neuralGradient)" strokeWidth="1" className={styles.neuralConnection} style={{ animationDelay: '0.1s' }} />
            <line x1="50" y1="50" x2="30" y2="70" stroke="url(#neuralGradient)" strokeWidth="1" className={styles.neuralConnection} style={{ animationDelay: '0.2s' }} />
            <line x1="50" y1="50" x2="70" y2="70" stroke="url(#neuralGradient)" strokeWidth="1" className={styles.neuralConnection} style={{ animationDelay: '0.3s' }} />
          </svg>
        );

      case 'progress':
        return (
          <div className={styles.progressSpinner}>
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(0, 212, 255, 0.2)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#00d4ff"
                strokeWidth="8"
                strokeLinecap="round"
                className={styles.progressCircle}
                style={{
                  strokeDasharray: `${2 * Math.PI * 45}`,
                  strokeDashoffset: `${2 * Math.PI * 45 * (1 - (progress || 0) / 100)}`
                }}
              />
            </svg>
            {progress !== null && (
              <div className={styles.progressText}>
                {Math.round(progress)}%
              </div>
            )}
          </div>
        );

      default:
        return (
          <svg className={styles.defaultSpinner} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00d4ff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="60 40"
              className={styles.defaultCircle}
            />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`${styles.loadingContainer} ${styles[size]} ${styles[color]} ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <div className={styles.spinnerWrapper}>
        {getSpinnerContent()}
      </div>
      
      {text && (
        <div className={styles.loadingText} aria-live="polite">
          {text}
        </div>
      )}
      
      {/* Screen reader only text */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

// Loading Skeleton Component
export const LoadingSkeleton = ({ 
  type = 'text', 
  lines = 3, 
  width = '100%', 
  height = '1rem',
  className = '' 
}) => {
  const renderSkeletonContent = () => {
    switch (type) {
      case 'card':
        return (
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonText} style={{ width: '60%' }}></div>
            </div>
          </div>
        );
      
      case 'avatar':
        return (
          <div className={styles.skeletonAvatar}>
            <div className={styles.skeletonCircle}></div>
            <div className={styles.skeletonInfo}>
              <div className={styles.skeletonName}></div>
              <div className={styles.skeletonSubtext}></div>
            </div>
          </div>
        );
      
      case 'button':
        return <div className={styles.skeletonButton} style={{ width, height }}></div>;
      
      default: // text
        return (
          <div className={styles.skeletonText}>
            {Array.from({ length: lines }, (_, index) => (
              <div 
                key={index}
                className={styles.skeletonLine}
                style={{ 
                  width: index === lines - 1 ? '60%' : width,
                  height 
                }}
              ></div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`${styles.skeletonContainer} ${className}`} aria-hidden="true">
      {renderSkeletonContent()}
    </div>
  );
};

// Button Loading State Component
export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  loadingText = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <button 
      className={`${styles.loadingButton} ${className} ${loading ? styles.loading : ''}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className={styles.buttonSpinner}>
          <LoadingSpinner type="default" size="small" />
        </span>
      )}
      <span className={loading ? styles.buttonTextHidden : styles.buttonText}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

export default LoadingSpinner;
