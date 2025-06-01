import React from 'react';

const SkeletonLoader = ({ 
  type = 'card', 
  count = 1, 
  className = '',
  animated = true 
}) => {
  const renderSkeleton = (index) => {
    switch (type) {
      case 'card':
        return (
          <div key={index} className={`skeleton-card ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-text short"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        );
      
      case 'service':
        return (
          <div key={index} className={`skeleton-service ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-icon"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-price"></div>
          </div>
        );
      
      case 'portfolio':
        return (
          <div key={index} className={`skeleton-portfolio ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-image large"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-tags">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>
              <div className="skeleton-text"></div>
            </div>
          </div>
        );
      
      case 'team':
        return (
          <div key={index} className={`skeleton-team ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-avatar"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text short"></div>
            <div className="skeleton-text"></div>
          </div>
        );
      
      case 'text':
        return (
          <div key={index} className={`skeleton-text-block ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-text"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text short"></div>
          </div>
        );
      
      case 'list':
        return (
          <div key={index} className={`skeleton-list-item ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-icon small"></div>
            <div className="skeleton-text"></div>
          </div>
        );
      
      default:
        return (
          <div key={index} className={`skeleton-default ${animated ? 'animated' : ''} ${className}`}>
            <div className="skeleton-text"></div>
          </div>
        );
    }
  };

  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;
