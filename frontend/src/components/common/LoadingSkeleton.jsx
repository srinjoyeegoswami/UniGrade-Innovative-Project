import React from 'react';

export const LoadingSkeleton = ({ width = '100%', height = '1.25rem', variant = 'rect', className = '', style = {} }) => {
  const borderRadius = variant === 'circle' ? '50%' : variant === 'text' ? '4px' : '6px';
  return (
    <div
      className={`skeleton ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#EAEAE7',
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <LoadingSkeleton key={c} height="2rem" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;

