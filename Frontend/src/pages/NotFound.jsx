import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)' }}>
      <Compass size={64} color="var(--primary-color)" style={{ marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 0.8rem 0' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--nav-text)', lineHeight: 1.5, marginBottom: '2rem' }}>
        We couldn't find the page you were looking for. Let's guide you back to familiar grounds.
      </p>
      <Link
        to="/home"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.8rem 1.6rem',
          backgroundColor: 'var(--primary-color)',
          color: '#ffffff',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}
      >
        <Home size={20} />
        Back to Home
      </Link>
    </div>
  );
}
