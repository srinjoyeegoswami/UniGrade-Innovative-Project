import React from 'react';

export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div
      className={`tabs-nav ${className}`.trim()}
      style={{
        display: 'flex',
        borderBottom: '1px solid #D8D8D4',
        gap: '1.5rem',
        marginBottom: '1.25rem',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              padding: '0.625rem 0.25rem',
              fontSize: '0.875rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#101010' : '#858580',
              background: 'none',
              border: 'none',
              borderBottom: isActive ? '2px solid #101010' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '-1px',
            }}
          >
            {tab.icon && React.createElement(tab.icon, { size: 16 })}
            {tab.label}
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: isActive ? '#171717' : '#EAEAE7',
                  color: isActive ? '#FFFFFF' : '#555550',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const StatusIndicator = ({ status = 'ACTIVE', label = null }) => {
  const isOk = ['ACTIVE', 'APPROVED', 'PUBLISHED', 'PRESENT'].includes(status.toUpperCase());
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isOk ? '#171717' : '#B8B8B3',
        }}
      />
      <span>{label || status}</span>
    </span>
  );
};

export default Tabs;

