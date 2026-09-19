import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  title = 'No items found',
  message = 'There is currently nothing to display here.',
  action = null
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        gap: '1rem',
        backgroundColor: 'var(--card-bg, #ffffff)',
        border: '1px dashed var(--border-color, #cbd5e0)',
        borderRadius: '16px',
        margin: '1.5rem 0'
      }}
    >
      <Inbox size={48} color="var(--primary-color)" />
      <h3 style={{ fontSize: '1.3rem', color: 'var(--text-color)', margin: 0 }}>
        {title}
      </h3>
      <p style={{ fontSize: '1.05rem', color: 'var(--nav-text, #718096)', margin: 0, maxWidth: '400px' }}>
        {message}
      </p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
