import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../ConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useGameTimer } from '../../hooks/useGameTimer';

const OBJECTS = ['🔴', '🔷', '⭐', '🔺'];
const TARGET = '⭐';

export function AttentionTest({ onComplete, triggerFeedback }) {
  const { t } = useLanguage();
  const [currentObject, setCurrentObject] = useState(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  const { elapsedSeconds, markActionTime } = useGameTimer(true);
  const maxObjects = 10;
  const timeoutRef = useRef(null);

  const nextObject = useCallback(() => {
    const randomObj = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
    setCurrentObject(randomObj);
    setRound(r => r + 1);
    markActionTime();
  }, [markActionTime]);

  useEffect(() => {
    if (round < maxObjects) {
      timeoutRef.current = setTimeout(nextObject, 1500);
      return () => clearTimeout(timeoutRef.current);
    } else {
      const accuracy = Math.round((score / maxObjects) * 100);
      const avgRt = `${(elapsedSeconds / maxObjects).toFixed(1)}s`;
      setTimeout(() => {
        onComplete(accuracy, accuracy, `${elapsedSeconds}s`, score, maxObjects - score, avgRt);
      }, 500);
    }
  }, [round, score, nextObject, onComplete, elapsedSeconds]);

  const handleTap = () => {
    markActionTime();
    if (currentObject === TARGET) {
      triggerFeedback(true);
      setScore(s => s + 1);
    } else {
      triggerFeedback(false);
    }
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    nextObject();
    setIsRestartModalOpen(false);
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--secondary-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>{t('games.attentionTest')}</h2>
        <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {round} / {maxObjects}
        </span>
      </div>

      <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1rem' }}>
        {t('games.tapWhenSee')} <span style={{ fontSize: '1.5rem' }}>{TARGET}</span>
      </p>

      <div style={{ minHeight: '150px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
        <div style={{ fontSize: '5rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentObject || '...'}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={handleTap}
          style={{
            fontSize: '1.5rem',
            padding: '1.2rem 3rem',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {t('games.tapTarget')}
        </button>
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--secondary-color)', paddingTop: '1.5rem' }}>
        <button
          onClick={() => setIsRestartModalOpen(true)}
          style={{ backgroundColor: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={18} />
          {t('games.restartGame')}
        </button>
      </div>

      <ConfirmModal
        isOpen={isRestartModalOpen}
        title={t('games.restartTitle')}
        message={t('games.restartMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        onConfirm={handleRestart}
        onCancel={() => setIsRestartModalOpen(false)}
      />
    </div>
  );
}

export default AttentionTest;
