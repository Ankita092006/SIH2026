import React from 'react';

export function GameHeader({ title, subtitle, stats = [] }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        gap: '1rem'
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: '0 0 0.3rem 0' }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: '1.05rem', color: 'var(--nav-text)', margin: 0 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
        {stats.map((stat, idx) => (
          <span
            key={idx}
            style={{
              backgroundColor: stat.highlight ? 'var(--primary-color)' : 'var(--secondary-color)',
              color: stat.highlight ? '#ffffff' : 'var(--text-color)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {stat.label}: {stat.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export default GameHeader;
