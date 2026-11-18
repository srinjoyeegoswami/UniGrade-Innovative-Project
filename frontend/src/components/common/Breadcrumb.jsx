import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
      <Link to="/" style={{ color: '#858580', display: 'flex', alignItems: 'center' }}>
        <Home size={14} />
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight size={12} color="#B8B8B3" />
            {isLast || !item.path ? (
              <span style={{ color: '#171717', fontWeight: 500 }}>{item.label}</span>
            ) : (
              <Link to={item.path} style={{ color: '#858580', textDecoration: 'none' }}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

