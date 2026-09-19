import React from 'react';

export function SkipLink() {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        top: '-100px',
        left: '1rem',
        backgroundColor: 'var(--primary-color, #2b6cb0)',
        color: '#ffffff',
        padding: '0.8rem 1.4rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        zIndex: 10000,
        textDecoration: 'none',
        transition: 'top 0.2s ease'
      }}
      onFocus={(e) => { e.currentTarget.style.top = '1rem'; }}
      onBlur={(e) => { e.currentTarget.style.top = '-100px'; }}
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
