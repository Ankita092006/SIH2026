import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load content. Please check your connection and try again.',
  onRetry
}) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        gap: '1rem',
        backgroundColor: '#fff5f5',
        border: '2px solid #feb2b2',
        borderRadius: '16px',
        margin: '1rem auto',
        maxWidth: '550px'
      }}
    >
      <AlertCircle size={48} color="#c53030" />
      <h3 style={{ fontSize: '1.4rem', color: '#9b2c2c', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: '1.1rem', color: '#4a5568', margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.8rem 1.8rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          <RefreshCw size={20} />
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
