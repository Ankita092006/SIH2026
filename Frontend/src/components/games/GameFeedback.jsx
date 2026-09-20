import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function GameFeedback({ message }) {
  const { t } = useLanguage();
  if (!message) return null;

  const isCorrect = message === 'correct';

  return (
    <div
      role="status"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: isCorrect ? '#c6f6d5' : '#fed7d7',
        color: isCorrect ? '#22543d' : '#822727',
        padding: '1rem 2rem',
        borderRadius: '50px',
        fontSize: '1.25rem',
        fontWeight: 'bold',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}
    >
      {isCorrect ? t('games.correctAns') : t('games.incorrectAns')}
    </div>
  );
}

export default GameFeedback;
