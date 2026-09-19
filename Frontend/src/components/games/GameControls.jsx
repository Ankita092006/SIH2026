import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export function GameControls({ onQuit, onRestart, quitLabel = 'Quit Game', restartLabel = 'Restart' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}
    >
      {onQuit && (
        <button
          onClick={onQuit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--secondary-color)',
            color: 'var(--text-color)',
            border: '2px solid var(--text-color)',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={18} />
          {quitLabel}
        </button>
      )}

      {onRestart && (
        <button
          onClick={onRestart}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'transparent',
            color: 'var(--primary-color)',
            border: '2px solid var(--primary-color)',
            padding: '0.6rem 1.2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={18} />
          {restartLabel}
        </button>
      )}
    </div>
  );
}

export default GameControls;
