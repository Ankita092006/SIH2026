import React, { useEffect, useState } from 'react';
import { getGameResults } from '../services/gameService';
import { cognitiveGames } from '../data/mockData';

export default function ResultsHistory() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    setResults(getGameResults());
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Activity Results</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Review your past cognitive activities. This is <strong>not</strong> a medical diagnosis.</p>

      {results.length === 0 ? (
        <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>No results found. Play a game to see your history!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map(result => {
            const game = cognitiveGames.find(g => g.id === result.gameId);
            return (
              <div key={result.id} className="card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{game?.title || "Unknown Game"}</h2>
                  <span style={{ fontSize: '1.1rem', color: 'var(--nav-text)', fontWeight: 'bold' }}>
                    {result.completedAt || (result.date ? `${result.date} • Time not recorded` : "Time not recorded")}
                  </span>
                </div>
                
                <div className="results-grid" style={{ marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>Score</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{result.score}</p>
                  </div>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>Accuracy</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{result.accuracy}%</p>
                  </div>
                  <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>Time</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{result.timeTaken}</p>
                  </div>
                  <div 
                    title={!result.averageResponseTime || result.averageResponseTime === '—' ? 'Not recorded for this activity.' : ''}
                    style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}
                  >
                    <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap' }}>Reaction Time</p>
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
