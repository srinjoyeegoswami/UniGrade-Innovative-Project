import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search records...', className = '' }) => {
  return (
    <div
      className={`search-bar ${className}`.trim()}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <Search
        size={16}
        color="#858580"
        style={{
          position: 'absolute',
          left: '10px',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.45rem 0.75rem 0.45rem 2rem',
          fontSize: '0.8125rem',
          borderRadius: '6px',
          border: '1px solid #D8D8D4',
          backgroundColor: '#FFFFFF',
          color: '#171717',
          outline: 'none',
        }}
      />
    </div>
  );
};

export default SearchBar;

