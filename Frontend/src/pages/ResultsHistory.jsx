import React, { useEffect, useState } from 'react';
import { getGameResults } from '../services/gameService';
import { cognitiveGames } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';
import { formatResultDateTime } from '../utils/timeUtils';

export default function ResultsHistory() {
  const [results, setResults] = useState([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    setResults(getGameResults());
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{t('history.activityResults')}</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>{t('history.reviewPast')} <strong>{t('history.notMedical')}</strong> {t('history.diagnosis')}</p>

      {results.length === 0 ? (
        <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>{t('history.noResults')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map(result => {
            const game = cognitiveGames.find(g => g.id === result.gameId);
            return (
              <div key={result.id} className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{game ? t(`games.${game.id.replace(/-([a-z])/g, g => g[1].toUpperCase())}`) : t('games.unknownGame')}</h2>
                  <span style={{ fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: 'bold' }}>
                    {result.completedAt ? formatResultDateTime(result.completedAt, language) : (result.date ? `${result.date === 'Today' ? t('common.today') : (result.date === 'Yesterday' ? t('common.yesterday') : result.date)} • ${t('games.timeNotRecorded')}` : t('games.timeNotRecorded'))}
                  </span>
                </div>
                
                <div className="results-grid" style={{ marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>{t('games.score')}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{result.score}</p>
                  </div>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>{t('games.accuracy')}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{result.accuracy}%</p>
                  </div>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>{t('games.timeTaken')}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{result.timeTaken}</p>
                  </div>
                  <div 
                    title={!result.averageResponseTime || result.averageResponseTime === '—' ? 'Not recorded for this activity.' : ''}
                    style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}
                  >
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap' }}>{t('games.reactionTime')}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{result.averageResponseTime || '—'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
