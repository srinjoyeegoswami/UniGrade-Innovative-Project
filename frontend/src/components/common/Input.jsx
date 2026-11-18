import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`.trim()} style={{ marginBottom: '1rem' }}>
      {label && (
        <label htmlFor={name} className="form-label" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', fontWeight: 500, color: '#171717' }}>
          {label} {required && <span style={{ color: '#101010' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${error ? 'input-error' : ''}`}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          borderRadius: '6px',
          border: error ? '2px solid #101010' : '1px solid #D8D8D4',
          backgroundColor: disabled ? '#EAEAE7' : '#FFFFFF',
          color: '#171717',
          outline: 'none',
          boxSizing: 'border-box'
        }}
        {...props}
      />
      {error && <p className="form-error" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#171717', fontWeight: 500 }}>{error}</p>}
      {helperText && !error && <p className="form-helper" style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#858580' }}>{helperText}</p>}
    </div>
  );
};

export default Input;

