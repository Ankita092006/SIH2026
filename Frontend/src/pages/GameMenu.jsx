import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cognitiveGames } from '../data/mockData';
import { NERMemoryIcon, NERPatternIcon, NERAttentionIcon, NERRecallIcon, NERGameIcon } from '../components/NERIcons';
import { useLanguage } from '../context/LanguageContext';

const getGameIcon = (id) => {
  switch(id) {
    case 'memory-match': return NERMemoryIcon;
    case 'pattern-recall': return NERPatternIcon;
    case 'attention-test': return NERAttentionIcon;
    case 'number-recall': 
    case 'word-recall': return NERRecallIcon;
    default: return NERGameIcon;
  }
};

export default function GameMenu() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>{t('games.title')}</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{t('games.selectGame', 'Select a game to exercise your memory, focus, and attention.')}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {cognitiveGames.map(game => {
          const Icon = getGameIcon(game.id);
          
          return (
            <div key={game.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: 0, borderLeft: '6px solid var(--nav-active)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--border-radius)' }}>
                  <Icon size={40} color="var(--primary-color)" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{t(`games.${game.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}`)}</h2>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{t(`games.difficulty${game.difficulty}`)}</span>
                    <span style={{ fontSize: '1rem', color: 'var(--nav-text)' }}>⏱ {game.duration}</span>
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '1.2rem', margin: 0 }}>{t(`games.${game.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}Desc`)}</p>
              
              <button 
                onClick={() => navigate(`/games/${game.id}/instructions`)} 
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', fontSize: '1.2rem' }}
              >
                {t('home.startGame')}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
