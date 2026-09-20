import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmModal from '../ConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useGameTimer } from '../../hooks/useGameTimer';

export function NumberRecall({ onComplete, triggerFeedback }) {
  const { t } = useLanguage();
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [phase, setPhase] = useState('memorize');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

  const { elapsedSeconds, markActionTime } = useGameTimer(true);
  const maxRounds = 3;
  const timeoutRef = useRef(null);

  const startRound = useCallback((currentRound) => {
    const length = currentRound + 2;
    const newSeq = Array.from({ length }, () => Math.floor(Math.random() * 10));
    setSequence(newSeq);
    setUserInput('');
    setPhase('memorize');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPhase('recall');
      markActionTime();
    }, 3000);
  }, [markActionTime]);

  useEffect(() => {
    startRound(round);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [round, startRound]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (phase !== 'recall') return;

    const rt = markActionTime();
    const isCorrect = userInput === sequence.join('');
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
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: 0 }}>{t('games.numberRecall')}</h2>
        <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          {t('games.round')} {round} {t('games.of')} {maxRounds}
        </span>
      </div>

      <div style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '2rem 0' }}>
        {phase === 'memorize' ? (
          <div>
            <p style={{ fontSize: '1.2rem', color: 'var(--nav-text)', marginBottom: '1rem' }}>{t('games.rememberSequence')}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {sequence.map((num, i) => (
                <span key={i} style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary-color)', backgroundColor: '#ffffff', border: '2px solid var(--primary-color)', borderRadius: '12px', width: '60px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  {num}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-color)', marginBottom: '1rem' }}>{t('games.enterNumbers')}</p>
            <input
              type="text"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="123..."
              autoFocus
              style={{ fontSize: '2rem', textAlign: 'center', letterSpacing: '0.5rem', padding: '0.5rem', width: '80%', maxWidth: '250px', borderRadius: '8px', border: '2px solid var(--primary-color)', marginBottom: '1.5rem' }}
            />
            <div>
              <button type="submit" style={{ fontSize: '1.2rem', padding: '0.8rem 2rem' }}>
                {t('common.confirm')}
              </button>
            </div>
          </form>
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

export default NumberRecall;
