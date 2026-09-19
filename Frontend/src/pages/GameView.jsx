import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { playCorrectSound, playIncorrectSound, playCompletionSound } from '../utils/audioUtils';
import { useLanguage } from '../context/LanguageContext';
import { useGameSession } from '../hooks/useGameSession';
import { useAdaptiveDifficulty } from '../hooks/useAdaptiveDifficulty';
import { attemptApi } from '../api/attempt.api';

// Modularized game components
import MemoryMatch from '../components/games/MemoryMatch';
import NumberRecall from '../components/games/NumberRecall';
import WordRecall from '../components/games/WordRecall';
import PatternRecall from '../components/games/PatternRecall';
import AttentionTest from '../components/games/AttentionTest';
import GameFeedback from '../components/games/GameFeedback';
import GameControls from '../components/games/GameControls';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';

export default function GameView() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { soundEnabled } = useAccessibility();
  const { t } = useLanguage();
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const { sessionId, sessionState, error, retrySession } = useGameSession(gameId);
  const { currentDifficulty, nextDifficulty, predictNext } = useAdaptiveDifficulty(2);

  const showFeedback = (isCorrect) => {
    setFeedbackMessage(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => setFeedbackMessage(null), 1000);
  };

  const triggerFeedback = (isCorrect) => {
    showFeedback(isCorrect);
    if (isCorrect) playCorrectSound(soundEnabled);
    else playIncorrectSound(soundEnabled);
  };

  const handleGameComplete = async (score, accuracy, timeTaken, correct, incorrect, avgResponseTime = "—") => {
    playCompletionSound(soundEnabled);

    // Collect telemetry matching Python ML schema in schemas.py
    const telemetry = {
      sessionId: sessionId || `ses_${Date.now()}`,
      gameId,
      game_type: gameId === 'attention-test' ? 'attention' : 'memory',
      cognitive_domain: gameId === 'attention-test' ? 'attention' : 'memory',
      current_difficulty: currentDifficulty,
      accuracy: accuracy / 100,
      response_time: parseFloat(avgResponseTime) || 3.0,
      attempts: (correct || 0) + (incorrect || 0) || 1,
      hints_used: 0,
      recent_accuracy: accuracy / 100,
      recent_response_time: parseFloat(avgResponseTime) || 3.0,
      accuracy_trend: 0.05,
      response_time_trend: -0.2,
      consecutive_successes: correct || 1
    };

    // Safe Adaptive ML invocation through Node.js API client (handles fallback internally)
    let adaptiveResult = { nextDifficulty: currentDifficulty, source: 'fallback' };
    try {
      adaptiveResult = await predictNext(telemetry);
    } catch (err) {
      console.warn('[GameView] Adaptive prediction fallback:', err);
    }

    navigate(`/games/${gameId}/results`, {
      state: {
        score,
        accuracy,
        timeTaken,
        correct,
        incorrect,
        averageResponseTime: avgResponseTime,
        nextDifficulty: adaptiveResult.nextDifficulty,
        predictionSource: adaptiveResult.source
      }
    });
  };

  const renderGame = () => {
    switch (gameId) {
      case 'memory-match':
        return <MemoryMatch onComplete={handleGameComplete} soundEnabled={soundEnabled} />;
      case 'number-recall':
        return <NumberRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'word-recall':
        return <WordRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'pattern-recall':
        return <PatternRecall onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      case 'attention-test':
        return <AttentionTest onComplete={handleGameComplete} soundEnabled={soundEnabled} triggerFeedback={triggerFeedback} />;
      default:
        return (
          <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h2>{t('games.gameNotFound')}</h2>
            <button onClick={() => navigate('/games')}>{t('games.returnToGames')}</button>
          </div>
        );
    }
  };

  if (sessionState === 'LOADING') {
    return <LoadingState message="Setting up your cognitive game..." />;
  }

  if (sessionState === 'ERROR') {
    return (
      <ErrorState
        title="Session Error"
        message={error || 'Unable to start game session.'}
        onRetry={retrySession}
      />
    );
  }

  return (
    <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <GameControls
        onQuit={() => navigate('/games')}
        quitLabel={t('games.quitGame')}
      />
      <GameFeedback message={feedbackMessage} />
      {renderGame()}
    </div>
  );
}
