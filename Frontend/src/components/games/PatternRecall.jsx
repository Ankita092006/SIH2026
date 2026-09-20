import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../ConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useGameTimer } from '../../hooks/useGameTimer';

export function PatternRecall({ onComplete, triggerFeedback }) {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [phase, setPhase] = useState('memorize');
  const [correct, setCorrect] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  const { elapsedSeconds, markActionTime } = useGameTimer(true);
  const maxRounds = 4;
  const gridSize = 9;
  const timeoutRef = useRef(null);

  const generatePattern = useCallback((currentRound) => {
    const count = currentRound + 2;
    const indices = [];
    while (indices.length < count) {
      const idx = Math.floor(Math.random() * gridSize);
      if (!indices.includes(idx)) indices.push(idx);
    }
    setPattern(indices);
    setUserPattern([]);
    setPhase('memorize');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase('recall');
      markActionTime();
    }, 2500);
  }, [gridSize, markActionTime]);

  useEffect(() => {
    generatePattern(round);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [round, generatePattern]);

  const handleCellClick = (index) => {
    if (phase !== 'recall') return;
    if (userPattern.includes(index)) return;

    markActionTime();
    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    if (newUserPattern.length === pattern.length) {
      const isCorrect = pattern.every(idx => newUserPattern.includes(idx));
      triggerFeedback(isCorrect);
      const finalCorrect = correct + (isCorrect ? 1 : 0);
      setCorrect(finalCorrect);

      if (round < maxRounds) {
        setRound(r => r + 1);
      } else {
        const accuracy = Math.round((finalCorrect / maxRounds) * 100);
        const score = accuracy;
        const avgRt = `${(elapsedSeconds / maxRounds).toFixed(1)}s`;
        setTimeout(() => {
          onComplete(score, accuracy, `${elapsedSeconds}s`, finalCorrect, maxRounds - finalCorrect, avgRt);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    setRound(1);
    setCorrect(0);
    generatePattern(1);
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
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>{t('games.patternRecall')}</h2>
        <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {t('games.round')} {round} {t('games.of')} {maxRounds}
        </span>
      </div>

      <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
        {phase === 'memorize' ? t('games.rememberTiles') : t('games.tapTiles')}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '300px', margin: '0 auto 2rem auto' }}>
        {Array.from({ length: gridSize }).map((_, i) => {
          const isHighlighted = phase === 'memorize' ? pattern.includes(i) : userPattern.includes(i);
          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              disabled={phase === 'memorize'}
              style={{
                height: '80px',
                backgroundColor: isHighlighted ? 'var(--primary-color)' : '#ffffff',
                border: '2px solid var(--primary-color)',
                borderRadius: '12px',
                cursor: phase === 'recall' ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              aria-label={`Tile ${i + 1}`}
            />
          );
        })}
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

export default PatternRecall;
