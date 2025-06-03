import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAccessibilityManager } from '../../src/lib/accessibility-manager';
import styles from './BreadcrumbNavigation.module.css';

const BreadcrumbNavigation = ({ 
  customPaths = {},
  showHome = true,
  maxItems = 5,
  className = '',
  compact = false
}) => {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [viewMode, setViewMode] = useState('full'); // full, compact, minimal

  useEffect(() => {
    generateBreadcrumbs();
  }, [router.asPath]);

  useEffect(() => {
    // Listen for accessibility settings changes
    const handleAccessibilityChange = (e) => {
      const settings = e.detail.settings;
      if (settings.breadcrumbDisplay !== undefined) {
        setIsVisible(settings.breadcrumbDisplay);
      }
      if (settings.breadcrumbViewMode !== undefined) {
        setViewMode(settings.breadcrumbViewMode);
      }
    };

    window.addEventListener('accessibility-settings-changed', handleAccessibilityChange);
    
    // Get initial settings
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      const status = accessibilityManager.getAccessibilityStatus();
      if (status.navigationSettings) {
        setIsVisible(status.navigationSettings.breadcrumbDisplay !== false);
        setViewMode(status.navigationSettings.breadcrumbViewMode || 'full');
      }
    }

    return () => {
      window.removeEventListener('accessibility-settings-changed', handleAccessibilityChange);
    };
  }, []);

  const generateBreadcrumbs = () => {
    const pathSegments = router.asPath.split('/').filter(Boolean);
    const breadcrumbItems = [];

    // Add home if enabled
    if (showHome) {
      breadcrumbItems.push({
        label: 'Home',
        href: '/',
        isHome: true,
        icon: 'home'
      });
    }

    // Generate breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Remove query parameters and hash
      const cleanSegment = segment.split('?')[0].split('#')[0];
      
      // Get custom label or format segment
      const label = customPaths[currentPath] || formatSegmentLabel(cleanSegment);
      
      breadcrumbItems.push({
        label,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
        segment: cleanSegment
      });
    });

    // Limit items if needed
    if (breadcrumbItems.length > maxItems) {
      const firstItem = breadcrumbItems[0];
      const lastItems = breadcrumbItems.slice(-maxItems + 2);
      setBreadcrumbs([
        firstItem,
        { label: '...', href: null, isEllipsis: true },
        ...lastItems
      ]);
    } else {
      setBreadcrumbs(breadcrumbItems);
    }
  };

  const formatSegmentLabel = (segment) => {
    // Convert kebab-case and snake_case to Title Case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\b(Api|Ai|Ui|Ux|Seo|Css|Html|Js)\b/gi, match => match.toUpperCase());
  };

  const handleBreadcrumbClick = (href, label) => {
    // Track breadcrumb navigation
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'breadcrumb_click', {
        event_category: 'navigation',
        event_label: label,
        value: href
      });
    }

    // Dispatch custom event for analytics
    window.dispatchEvent(new CustomEvent('breadcrumb-navigation', {
      detail: { href, label, timestamp: Date.now() }
    }));
  };

  const handleKeyDown = (e, href, label) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (href) {
        router.push(href);
        handleBreadcrumbClick(href, label);
      }
    }
  };

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'home':
        return (
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        );
      case 'chevron':
        return (
          <svg className={styles.separator} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const renderBreadcrumbItem = (item, index) => {
    const isLast = item.isLast;
    const isEllipsis = item.isEllipsis;
    
    if (isEllipsis) {
      return (
        <li key="ellipsis" className={styles.ellipsis} aria-hidden="true">
          <span className={styles.ellipsisText}>...</span>
        </li>
      );
    }

    const content = (
      <>
        {item.icon && getIcon(item.icon)}
        <span className={styles.label}>
          {viewMode === 'minimal' && !item.isHome ? 
            item.label.substring(0, 1).toUpperCase() : 
            item.label
          }
        </span>
      </>
    );

    return (
      <li key={item.href || index} className={styles.item}>
        {isLast ? (
          <span 
            className={`${styles.current} glow-text`}
            aria-current="page"
          >
            {content}
          </span>
        ) : (
          <Link 
            href={item.href}
            className={`${styles.link} glow-link`}
            onClick={() => handleBreadcrumbClick(item.href, item.label)}
            onKeyDown={(e) => handleKeyDown(e, item.href, item.label)}
          >
            {content}
          </Link>
        )}
        
        {!isLast && (
          <span className={styles.separatorWrapper} aria-hidden="true">
            {getIcon('chevron')}
          </span>
        )}
      </li>
    );
  };

  const getStructuredData = () => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs
        .filter(item => !item.isEllipsis && item.href)
        .map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          "item": `${typeof window !== 'undefined' ? window.location.origin : ''}${item.href}`
        }))
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  };

  if (!isVisible || breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <>
      {getStructuredData()}
      <nav 
        className={`${styles.breadcrumb} ${styles[viewMode]} ${compact ? styles.compact : ''} ${className}`}
        aria-label="Breadcrumb navigation"
        role="navigation"
      >
        <ol className={styles.list} itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={item.href || index}>
              {renderBreadcrumbItem(item, index)}
            </React.Fragment>
          ))}
        </ol>
      </nav>
    </>
  );
};

// Higher-order component for automatic breadcrumb generation
export const withBreadcrumbs = (WrappedComponent, breadcrumbConfig = {}) => {
  return function BreadcrumbWrapper(props) {
    return (
      <>
        <BreadcrumbNavigation {...breadcrumbConfig} />
        <WrappedComponent {...props} />
      </>
    );
  };
};

// Hook for programmatic breadcrumb control
export const useBreadcrumbs = () => {
  const router = useRouter();
  
  const updateBreadcrumb = (path, label) => {
    // Dispatch event to update breadcrumb labels
    window.dispatchEvent(new CustomEvent('breadcrumb-update', {
      detail: { path, label }
    }));
  };

  const hideBreadcrumbs = () => {
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      accessibilityManager.updateNavigationSettings({ breadcrumbDisplay: false });
    }
  };

  const showBreadcrumbs = () => {
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      accessibilityManager.updateNavigationSettings({ breadcrumbDisplay: true });
    }
  };

  const setBreadcrumbViewMode = (mode) => {
    const accessibilityManager = getAccessibilityManager();
    if (accessibilityManager) {
      accessibilityManager.updateNavigationSettings({ breadcrumbViewMode: mode });
    }
  };

  return {
    updateBreadcrumb,
    hideBreadcrumbs,
    showBreadcrumbs,
    setBreadcrumbViewMode,
    currentPath: router.asPath
  };
};

export default BreadcrumbNavigation;
