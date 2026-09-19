import React from 'react';
import { RefreshCw } from 'lucide-react';

export function RetryButton({ onRetry, label = 'Try Again', disabled = false }) {
  return (
    <button
      onClick={onRetry}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.8rem 1.6rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        minHeight: '48px'
      }}
    >
      <RefreshCw size={20} />
      {label}
    </button>
  );
}

export default RetryButton;
