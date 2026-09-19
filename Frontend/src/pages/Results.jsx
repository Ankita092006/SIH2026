import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, Percent, Award, Activity, Sparkles } from 'lucide-react';
import { cognitiveGames } from '../data/mockData';
import { getGameResults } from '../services/gameService';
import { useLanguage } from '../context/LanguageContext';
import { formatResultDateTime } from '../utils/timeUtils';

export default function Results() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const {
    score = 100,
    accuracy = 100,
    timeTaken = "0s",
    correct = 0,
    incorrect = 0,
    averageResponseTime = "—",
    nextDifficulty = 2,
    predictionSource = 'ml'
  } = location.state || {};

  const gameKey = cognitiveGames.find(g => g.id === gameId)?.id;
  const gameName = gameKey ? t(`games.${gameKey.replace(/-([a-z])/g, g => g[1].toUpperCase())}`) : 'Cognitive Activity';

  const allResults = getGameResults();
  const gameHistory = allResults.filter(r => r.gameId === gameId);
  const bestScore = Math.max(score, ...gameHistory.map(r => r.score || 0));

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--nav-text)', margin: '0 0 1rem 0' }}>{t('games.activityComplete')}</h2>
        <Trophy size={64} color="#d69e2e" style={{ margin: '0 auto' }} />
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '1rem 0' }}>{gameName}</h1>
        <p style={{ fontSize: '1.4rem', margin: 0 }}>{t('games.wellDoneActivity')}</p>
      </div>

      {/* Adaptive Difficulty Recommendation Card */}
      <div
        style={{
          backgroundColor: '#ebf8ff',
          border: '2px solid #bee3f8',
          borderRadius: '16px',
          padding: '1.2rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ padding: '0.6rem', backgroundColor: '#3182ce', borderRadius: '50%', color: '#ffffff' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#2b6cb0' }}>Adaptive Challenge Pacing</h3>
            <p style={{ fontSize: '0.95rem', margin: '0.2rem 0 0 0', color: '#4a5568' }}>
              Tailored to your current pace and focus
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1rem', color: '#718096', display: 'block' }}>Next Recommended</span>
          <strong style={{ fontSize: '1.4rem', color: '#2b6cb0' }}>Level {nextDifficulty} of 5</strong>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--secondary-color)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--secondary-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={24} /> {gameName} {t('games.summary')}
          </h2>
          <span style={{ backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', padding: '0.4rem 1rem', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            {formatResultDateTime(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }), language)}
          </span>
        </div>

        <div className="results-grid">
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}><Trophy size={16} color="var(--primary-color)"/> {t('games.score')}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{score}</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}><Percent size={16} color="#4A5568"/> {t('games.accuracy')}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#2D3748' }}>{accuracy}%</p>
          </div>
          <div style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}><Clock size={16} color="#4A5568"/> {t('games.timeTaken')}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#2D3748' }}>{timeTaken}</p>
          </div>
          <div
            title={averageResponseTime === '—' ? 'Not recorded for this activity.' : ''}
            style={{ backgroundColor: '#fff', border: '1px solid var(--secondary-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <p style={{ fontSize: '0.9rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}><Activity size={16} color="#4A5568"/> {t('games.reactionTime')}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#2D3748' }}>{averageResponseTime}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem', fontSize: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'green' }}>
            <CheckCircle2 /> {correct} {t('games.correct')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e53e3e' }}>
            <XCircle /> {incorrect} {t('games.incorrect')}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', border: '1px solid #ffeeba', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.4 }}>
        <strong>{t('games.resultDisclaimer')}</strong> {t('games.resultDisclaimerText')}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => navigate(`/games/${gameId}/play`)} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem' }}>{t('games.playAgain')}</button>
        <button onClick={() => navigate('/games')} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', border: '2px solid var(--primary-color)' }}>{t('games.chooseAnother')}</button>
      </div>
    </div>
  );
}
