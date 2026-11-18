import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variantClass = variant === 'default' ? '' : `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  return <Badge variant={`status-${s}`}>{status}</Badge>;
};

export const GradeBadge = ({ grade }) => {
  const cls = `badge-grade-${grade}`;
  return <span className={`badge ${cls}`}>{grade}</span>;
};

export default Badge;
