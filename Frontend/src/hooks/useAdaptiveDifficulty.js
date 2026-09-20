import { useState, useCallback } from 'react';
import { adaptiveDifficultyApi } from '../api/adaptiveDifficulty.api';

/**
 * Hook to manage Adaptive Difficulty prediction and safe fallback
 */
export function useAdaptiveDifficulty(initialDifficulty = 2) {
  const [currentDifficulty, setCurrentDifficulty] = useState(initialDifficulty);
  const [nextDifficulty, setNextDifficulty] = useState(initialDifficulty);
  const [confidence, setConfidence] = useState(null);
  const [source, setSource] = useState('initial');
  const [isPredicting, setIsPredicting] = useState(false);

  const predictNext = useCallback(async (telemetry) => {
    setIsPredicting(true);
    try {
      const result = await adaptiveDifficultyApi.getNextDifficulty({
        ...telemetry,
        current_difficulty: currentDifficulty
      });

      // Strict clamping guarantee [1, 5]
      const clamped = Math.min(5, Math.max(1, result.nextDifficulty));
      setNextDifficulty(clamped);
      setConfidence(result.confidence);
      setSource(result.source);
      return {
        nextDifficulty: clamped,
        confidence: result.confidence,
        source: result.source
      };
    } catch (err) {
      // Fallback guarantee: never crash
      setNextDifficulty(currentDifficulty);
      setConfidence(null);
      setSource('fallback');
      return {
        nextDifficulty: currentDifficulty,
        confidence: null,
        source: 'fallback'
      };
    } finally {
      setIsPredicting(false);
    }
  }, [currentDifficulty]);

  const applyNextDifficulty = useCallback(() => {
    setCurrentDifficulty(nextDifficulty);
  }, [nextDifficulty]);

  return {
    currentDifficulty,
    nextDifficulty,
    confidence,
    source,
    isPredicting,
    predictNext,
    applyNextDifficulty,
    setCurrentDifficulty
  };
}

export default useAdaptiveDifficulty;
