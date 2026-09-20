import { useState, useRef, useCallback } from 'react';

/**
 * Hook to accumulate cognitive gameplay telemetry for Python ML Random Forest ingestion
 * Features: accuracy, response_time, attempts, hints_used, recent_accuracy, trends, consecutive_successes
 */
export function useGameAttempt(gameType = 'memory', domain = 'memory') {
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [consecutiveSuccesses, setConsecutiveSuccesses] = useState(0);

  const responseTimesRef = useRef([]);
  const recentHistoryRef = useRef([]);

  const recordAttempt = useCallback((isCorrect, responseTimeSec = 0) => {
    setAttempts(prev => prev + 1);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setConsecutiveSuccesses(prev => prev + 1);
    } else {
      setConsecutiveSuccesses(0);
    }
    if (responseTimeSec > 0) {
      responseTimesRef.current.push(responseTimeSec);
    }
  }, []);

  const useHint = useCallback(() => {
    setHintsUsed(prev => prev + 1);
  }, []);

  const getTelemetry = useCallback((currentDifficulty = 2) => {
    const totalAttempts = Math.max(1, attempts);
    const accuracy = parseFloat((correctCount / totalAttempts).toFixed(2));
    
    // Average response time
    const rts = responseTimesRef.current;
    const avgResponseTime = rts.length > 0
      ? parseFloat((rts.reduce((a, b) => a + b, 0) / rts.length).toFixed(2))
      : 3.0;

    // Recent metrics from past rounds
    const history = recentHistoryRef.current;
    const recentAccuracy = history.length > 0
      ? parseFloat((history.reduce((a, b) => a + b.accuracy, 0) / history.length).toFixed(2))
      : accuracy;
    
    const recentResponseTime = history.length > 0
      ? parseFloat((history.reduce((a, b) => a + b.rt, 0) / history.length).toFixed(2))
      : avgResponseTime;

    const accuracyTrend = parseFloat((accuracy - recentAccuracy).toFixed(2));
    const responseTimeTrend = parseFloat((avgResponseTime - recentResponseTime).toFixed(2));

    return {
      game_type: gameType,
      cognitive_domain: domain,
      current_difficulty: currentDifficulty,
      accuracy,
      response_time: avgResponseTime,
      attempts: totalAttempts,
      hints_used: hintsUsed,
      recent_accuracy: recentAccuracy,
      recent_response_time: recentResponseTime,
      accuracy_trend: accuracyTrend,
      response_time_trend: responseTimeTrend,
      consecutive_successes: consecutiveSuccesses
    };
  }, [attempts, correctCount, hintsUsed, consecutiveSuccesses, gameType, domain]);

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    setCorrectCount(0);
    setHintsUsed(0);
    setConsecutiveSuccesses(0);
    responseTimesRef.current = [];
  }, []);

  return {
    attempts,
    correctCount,
    hintsUsed,
    consecutiveSuccesses,
    recordAttempt,
    useHint,
    getTelemetry,
    resetAttempts
  };
}

export default useGameAttempt;
