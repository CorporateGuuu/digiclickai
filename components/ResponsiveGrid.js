import React from 'react';

function ResponsiveGrid({ 
  children, 
  columns = { 
    xs: 1,      // 0-639px
    sm: 2,      // 640px-767px
    md: 3,      // 768px-1023px
    lg: 4,      // 1024px-1279px
    xl: 4       // 1280px+
  },
  gap = 'md',
  className = ''
}) {
  // Map gap sizes to CSS variables
  const gapSizes = {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)'
  };
  
  // Generate responsive grid styles
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns.xs}, minmax(0, 1fr))`,
    gap: gapSizes[gap] || gapSizes.md,
  };
  
  // Generate responsive class names
  const gridClasses = [
    'responsive-grid',
    className,
    `grid-cols-${columns.xs}`,
    `sm:grid-cols-${columns.sm || columns.xs}`,
    `md:grid-cols-${columns.md || columns.sm || columns.xs}`,
    `lg:grid-cols-${columns.lg || columns.md || columns.sm || columns.xs}`,
    `xl:grid-cols-${columns.xl || columns.lg || columns.md || columns.sm || columns.xs}`
  ].filter(Boolean).join(' ');
  
  return (
    <div className={gridClasses} style={gridStyle}>
      {children}
    </div>
  );
}

export default React.memo(ResponsiveGrid);
