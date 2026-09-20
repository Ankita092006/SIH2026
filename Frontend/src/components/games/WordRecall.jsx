import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../ConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useGameTimer } from '../../hooks/useGameTimer';

const WORD_SETS = [
  { words: ['Apple', 'Chair', 'River', 'Clock'], distractors: ['Table', 'Banana', 'Ocean'], target: 'Chair' },
  { words: ['Bread', 'Window', 'Mountain', 'Shoe'], distractors: ['Door', 'Butter', 'Hill'], target: 'Mountain' },
  { words: ['Book', 'Flower', 'Bridge', 'Spoon'], distractors: ['Fork', 'Page', 'Tree'], target: 'Flower' }
];

export function WordRecall({ onComplete, triggerFeedback }) {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState('memorize');
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  const { elapsedSeconds, markActionTime } = useGameTimer(true);
  const maxRounds = WORD_SETS.length;
  const timeoutRef = useRef(null);

  const startRound = useCallback((currentRound) => {
    const set = WORD_SETS[currentRound - 1];
    const opts = [set.target, ...set.distractors]
      .map(v => ({ v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(item => item.v);
    setOptions(opts);
    setPhase('memorize');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase('recall');
      markActionTime();
    }, 4000);
  }, [markActionTime]);

  useEffect(() => {
    startRound(round);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [round, startRound]);

  const handleSelect = (selectedWord) => {
    if (phase !== 'recall') return;

    markActionTime();
    const currentSet = WORD_SETS[round - 1];
    const isCorrect = selectedWord === currentSet.target;
    triggerFeedback(isCorrect);

    const newScore = score + (isCorrect ? 100 / maxRounds : 0);
    setScore(newScore);

    if (round < maxRounds) {
      setRound(r => r + 1);
    } else {
      const finalAccuracy = Math.round((newScore / 100) * 100);
      const avgRt = `${(elapsedSeconds / maxRounds).toFixed(1)}s`;
      setTimeout(() => {
        onComplete(
          Math.round(newScore),
          finalAccuracy,
          `${elapsedSeconds}s`,
          Math.round((newScore / 100) * maxRounds),
          maxRounds - Math.round((newScore / 100) * maxRounds),
          avgRt
        );
      }, 1000);
    }
  };

  const handleRestart = () => {
    setRound(1);
    setScore(0);
    startRound(1);
    setIsRestartModalOpen(false);
  };

  const currentSet = WORD_SETS[round - 1];

  return (
    <div
      className="card"
      style={{
        maxWidth: '550px',
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
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>{t('games.wordRecall')}</h2>
        <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {t('games.round')} {round} {t('games.of')} {maxRounds}
        </span>
      </div>

      <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '1.5rem 0' }}>
        {phase === 'memorize' ? (
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', marginBottom: '1.5rem' }}>{t('games.rememberWords')}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              {currentSet.words.map((w, i) => (
                <span key={i} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)', backgroundColor: '#ffffff', border: '2px solid var(--primary-color)', borderRadius: '12px', padding: '0.8rem 1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1.5rem' }}>{t('games.whichWordPresent')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
              {options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  style={{ fontSize: '1.2rem', padding: '1rem', backgroundColor: '#ffffff', color: 'var(--text-color)', border: '2px solid var(--secondary-color)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--secondary-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
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

export default WordRecall;
