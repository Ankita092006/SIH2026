import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cognitiveGames } from '../data/mockData';

export default function GameInstructions() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  
  const game = cognitiveGames.find(g => g.id === gameId);

  const renderInstructions = () => {
    switch (gameId) {
      case 'memory-match':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>Find matching pairs.</li>
            <li>Tap two cards at a time.</li>
            <li>Try to remember where each picture is.</li>
          </ul>
        );
      case 'pattern-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>Look at the pattern.</li>
            <li>Choose what comes next.</li>
          </ul>
        );
      case 'number-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>Remember the number shown.</li>
            <li>After it disappears, enter the number you remember.</li>
          </ul>
        );
      case 'word-recall':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>Remember the words shown.</li>
            <li>Select the words you remember afterward.</li>
          </ul>
        );
      case 'attention-test':
        return (
          <ul style={{ textAlign: 'left', fontSize: '1.5rem', lineHeight: '2', margin: '2rem auto', maxWidth: '400px' }}>
            <li>Watch the shapes and symbols.</li>
            <li>Tap when the target appears.</li>
          </ul>
        );
      default:
        return <p>Follow the on-screen instructions.</p>;
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>{game?.title || 'Game'} Instructions</h1>
      
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {renderInstructions()}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}>
        <button onClick={() => navigate(`/games/${gameId}/play`)} style={{ fontSize: '1.5rem', padding: '1.2rem' }}>
          Start Game
        </button>
        <button onClick={() => navigate('/games')} style={{ fontSize: '1.5rem', padding: '1.2rem', backgroundColor: 'var(--secondary-color)', color: 'var(--text-color)' }}>
          Back
        </button>
      </div>
    </div>
  );
}
