import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cognitiveGames } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

export default function GameInstructions() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const game = cognitiveGames.find(g => g.id === gameId);

  const renderInstructions = () => {
    switch (gameId) {
      case 'memory-match':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>{t('games.instMemoryMatch1')}</li>
            <li>{t('games.instMemoryMatch2')}</li>
            <li>{t('games.instMemoryMatch3')}</li>
          </ul>
        );
      case 'pattern-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>{t('games.instPatternRecall1')}</li>
            <li>{t('games.instPatternRecall2')}</li>
          </ul>
        );
      case 'number-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>{t('games.instNumberRecall1')}</li>
            <li>{t('games.instNumberRecall2')}</li>
          </ul>
        );
      case 'word-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>{t('games.instWordRecall1')}</li>
            <li>{t('games.instWordRecall2')}</li>
          </ul>
        );
      case 'attention-test':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>{t('games.instAttentionTest1')}</li>
            <li>{t('games.instAttentionTest2')}</li>
          </ul>
        );
      default:
        return <p>{t('games.instructionDefaults')}</p>;
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
        {game ? t(`games.${game.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}`) : t('games.unknownGame')} {t('games.instructions')}
      </h1>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {renderInstructions()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={() => navigate(`/games/${gameId}/play`)} style={{ fontSize: '1.5rem', padding: '1.2rem' }}>
          {t('games.start')}
        </button>
        <button onClick={() => navigate('/games')} style={{ fontSize: '1.5rem', padding: '1.2rem', backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}>
          {t('games.backToGames')}
        </button>
      </div>
    </div>
  );
}
