import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is currently no data available to display.',
  action = null,
}) => {
  return (
    <div
      className="empty-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px dashed #D8D8D4',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#F4F4F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: '#555550',
        }}
      >
        <Icon size={24} />
      </div>
      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
        {title}
      </h4>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#858580', maxWidth: '360px', lineHeight: 1.4 }}>
        {description}
      </p>
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

