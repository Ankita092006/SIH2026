import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { playCorrectSound, playIncorrectSound } from '../../utils/audioUtils';
import ConfirmModal from '../ConfirmModal';
import { RefreshCw } from 'lucide-react';
import { useGameTimer } from '../../hooks/useGameTimer';

const SYMBOLS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🥑'];

function generateDeck() {
  const deck = [...SYMBOLS, ...SYMBOLS];
  return deck
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item, id) => ({ id, symbol: item.value, isFlipped: false, isMatched: false }));
}

export function MemoryMatch({ onComplete, soundEnabled }) {
  const { t } = useLanguage();
  const [cards, setCards] = useState(() => generateDeck());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [turns, setTurns] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
  
  const { elapsedSeconds, markActionTime } = useGameTimer(true);

  useEffect(() => {
    if (cards.length > 0 && cards.every(c => c.isMatched)) {
      const accuracy = turns > 0 ? Math.round((matches / turns) * 100) : 100;
      const avgResponseTime = turns > 0 ? (elapsedSeconds / turns).toFixed(1) + 's' : '—';
      const score = Math.max(10, 100 - (turns * 2));
      const timer = setTimeout(() => {
        onComplete(score, accuracy, `${elapsedSeconds}s`, matches, turns - matches, avgResponseTime);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cards, turns, matches, elapsedSeconds, onComplete]);

  const handleCardClick = (index) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    markActionTime();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setTurns(prev => prev + 1);
      const [i1, i2] = newFlipped;
      if (newCards[i1].symbol === newCards[i2].symbol) {
        setMatches(m => m + 1);
        playCorrectSound(soundEnabled);
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[i1].isMatched = true;
            next[i2].isMatched = true;
            return next;
          });
          setFlippedIndices([]);
        }, 800);
      } else {
        playIncorrectSound(soundEnabled);
        setTimeout(() => {
          setCards(prev => {
            const next = [...prev];
            next[i1].isFlipped = false;
            next[i2].isFlipped = false;
            return next;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  const handleRestart = () => {
    setCards(generateDeck());
    setFlippedIndices([]);
    setTurns(0);
    setMatches(0);
    setIsRestartModalOpen(false);
  };

  return (
    <div
      className="card"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-color)',
        border: '1px solid var(--secondary-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', margin: '0 0 0.3rem 0' }}>{t('games.memoryMatch')}</h2>
          <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: 0 }}>{t('games.matchPairs')}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '1rem' }}>
            {t('games.attempts')} {turns}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            {t('games.pairsFound')} {matches} {t('games.of')} 6
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.5rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => handleCardClick(i)}
            style={{
              height: '110px',
              fontSize: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: c.isFlipped || c.isMatched ? '#ffffff' : 'var(--primary-color)',
              color: c.isFlipped || c.isMatched ? 'var(--text-color)' : '#ffffff',
              border: '2px solid var(--primary-color)',
              borderRadius: '12px',
              cursor: c.isMatched || c.isFlipped ? 'default' : 'pointer',
              transform: c.isFlipped || c.isMatched ? 'rotateY(180deg)' : 'none',
              transition: 'transform 0.3s, background-color 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            aria-label={c.isFlipped || c.isMatched ? c.symbol : t('games.hiddenCard')}
            disabled={c.isMatched || c.isFlipped}
          >
            {c.isFlipped || c.isMatched ? c.symbol : '?'}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center', borderTop: '1px solid var(--secondary-color)', paddingTop: '1.5rem' }}>
        <button
          onClick={() => setIsRestartModalOpen(true)}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--primary-color)',
            border: '2px solid var(--primary-color)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
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

export default MemoryMatch;
