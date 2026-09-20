import React from 'react';
import { getGameResults } from '../../services/gameService';

const Trends = () => {
  const results = getGameResults();

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, item) => sum + Number(item.score || 0), 0) /
            results.length
        )
      : 0;

  const averageAccuracy =
    results.length > 0
      ? Math.round(
          results.reduce(
            (sum, item) => sum + Number(item.accuracy || 0),
            0
          ) / results.length
        )
      : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Cognitive Trends</h1>
        <p>Monitor the patient's cognitive performance over time.</p>
      </div>

      <div style={styles.stats}>
        <div style={styles.card}>
          <span>Average Score</span>
          <strong>{averageScore}</strong>
          <small>Overall game performance</small>
        </div>

        <div style={styles.card}>
          <span>Average Accuracy</span>
          <strong>{averageAccuracy}%</strong>
          <small>Average accuracy across games</small>
        </div>

        <div style={styles.card}>
          <span>Total Activities</span>
          <strong>{results.length}</strong>
          <small>Recorded activities</small>
        </div>
      </div>

      <div style={styles.history}>
        <h2>Recent Performance</h2>

        {results.length === 0 ? (
          <p>No performance data available yet.</p>
        ) : (
          results.slice(0, 10).map((result, index) => (
            <div style={styles.row} key={result.id || index}>
              <div>
                <strong>
                  {result.gameId
                    ?.replace(/-/g, ' ')
                    .replace(/\b\w/g, letter => letter.toUpperCase())}
                </strong>
                <p>{result.date || 'Recent activity'}</p>
              </div>

              <div style={styles.score}>
                <strong>{result.score || 0}</strong>
                <span>{result.accuracy || 0}% accuracy</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },

  header: {
    marginBottom: '24px',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  card: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  history: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
  },

  score: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
};

export default Trends;
