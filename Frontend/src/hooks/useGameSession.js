import { useState, useCallback } from 'react';
import { gameApi } from '../api/game.api';

/**
 * Game session state machine hook
 * States: LOADING, READY, PLAYING, SUBMITTING, SUCCESS, ERROR, RETRY
 */
export function useGameSession(gameId) {
  const [sessionState, setSessionState] = useState('READY');
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);

  const initSession = useCallback(async () => {
    setSessionState('LOADING');
    setError(null);
    try {
      const res = await gameApi.startSession(gameId);
      setSessionId(res.sessionId);
      setSessionState('PLAYING');
      return res;
    } catch (err) {
      console.warn('[Game Session] Session init fallback:', err.message);
      // Fallback local session ID so game is never blocked
      setSessionId(`local_ses_${Date.now()}`);
      setSessionState('PLAYING');
      return { sessionId: `local_ses_${Date.now()}` };
    }
  }, [gameId]);

  const submitSession = useCallback(async (submitFn) => {
    setSessionState('SUBMITTING');
    try {
      const result = await submitFn();
      setSessionState('SUCCESS');
      return result;
    } catch (err) {
      setError(err.message || 'Your result could not be loaded.');
      setSessionState('ERROR');
      throw err;
    }
  }, []);

  const retrySession = useCallback(() => {
    setSessionState('READY');
    setError(null);
  }, []);

  return {
    sessionState,
    sessionId,
    error,
    setSessionState,
    initSession,
    submitSession,
    retrySession
  };
}

export default useGameSession;
