import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Trophy, CheckCircle2, XCircle, Clock, Percent, Award } from 'lucide-react';
import { cognitiveGames } from '../data/mockData';
import { getGameResults } from '../services/gameService';

export default function Results() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { score = 100, turns = 0, accuracy = 100, timeTaken = "0s", correct = 0, incorrect = 0 } = location.state || {};
  const gameName = cognitiveGames.find(g => g.id === gameId)?.title || "Game";

  const allResults = getGameResults();
  const gameHistory = allResults.filter(r => r.gameId === gameId);
  const bestScore = Math.max(score, ...gameHistory.map(r => r.score || 0));

  return (
    <div style={{ paddingBottom: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--nav-text)', margin: '0 0 1rem 0' }}>Cognitive Activity Complete</h2>
        <Trophy size={64} color="#d69e2e" style={{ margin: '0 auto' }} />
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', margin: '1rem 0' }}>{gameName}</h1>
        <p style={{ fontSize: '1.5rem', margin: 0 }}>Well done! You completed today's activity.</p>
      </div>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', borderBottom: '2px solid var(--secondary-color)', paddingBottom: '1rem', marginTop: 0 }}>Performance Summary</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0' }}>Score</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>{score}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}><Percent size={16}/> Accuracy</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{accuracy}%</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}><Clock size={16}/> Time</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>{timeTaken}</p>
          </div>
          <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--nav-text)', margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem' }}><Award size={16}/> Best</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: 'var(--nav-active)' }}>{bestScore}</p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem', fontSize: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'green' }}>
            <CheckCircle2 /> {correct} Correct
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e53e3e' }}>
            <XCircle /> {incorrect} Incorrect
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', border: '1px solid #ffeeba', fontSize: '1.2rem', marginBottom: '2rem' }}>
        <strong>Cognitive Activity Result:</strong> This activity is for cognitive exercise and tracking. It is not a medical diagnosis.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button onClick={() => navigate(`/games/${gameId}/play`)} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem' }}>Play Again</button>
        <button onClick={() => navigate('/games')} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)', border: '2px solid var(--primary-color)' }}>Choose Another Game</button>
        <button onClick={() => navigate('/results')} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>View All Results</button>
        <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem', backgroundColor: 'transparent', color: 'var(--nav-text)', border: 'none', textDecoration: 'underline' }}>Back to Home</button>
      </div>
    </div>
  );
}
