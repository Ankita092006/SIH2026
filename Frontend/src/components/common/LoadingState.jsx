import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading, please wait...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        gap: '1rem',
        minHeight: '200px'
      }}
    >
      <Loader2
        size={44}
        className="animate-spin"
        style={{
          color: 'var(--primary-color)',
          animation: 'spin 1s linear infinite'
        }}
      />
      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-color)', margin: 0 }}>
        {message}
      </p>
    </div>
  );
}

export default LoadingState;
