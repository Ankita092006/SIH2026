import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--card-bg, #ffffff)', borderRadius: '16px', border: '1px solid #fed7d7' }}>
      <ShieldAlert size={56} color="#c53030" style={{ marginBottom: '1rem' }} />
      <h1 style={{ fontSize: '1.8rem', color: '#9b2c2c', margin: '0 0 0.8rem 0' }}>
        Access Restricted
      </h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--nav-text)', lineHeight: 1.5, marginBottom: '2rem' }}>
        You do not have the required role permissions to view this section.
      </p>
      <Link
        to="/home"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.8rem 1.6rem',
          backgroundColor: 'var(--primary-color)',
          color: '#ffffff',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}
      >
        <ArrowLeft size={18} />
        Return to Home
      </Link>
    </div>
  );
}
