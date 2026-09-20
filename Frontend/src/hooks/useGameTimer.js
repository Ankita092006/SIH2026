import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook to manage gameplay timers and per-question response times cleanly
 */
export function useGameTimer(autoStart = true) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  
  const timerRef = useRef(null);
  const actionStartTimeRef = useRef(null);

  useEffect(() => {
    actionStartTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    actionStartTimeRef.current = performance.now();
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setElapsedSeconds(0);
    actionStartTimeRef.current = performance.now();
  }, []);

  /**
   * Calculates time taken since previous action or round in seconds
   */
  const markActionTime = useCallback(() => {
    const now = performance.now();
    const start = actionStartTimeRef.current || now;
    const durationSeconds = Math.max(0.1, (now - start) / 1000);
    actionStartTimeRef.current = now;
    return parseFloat(durationSeconds.toFixed(2));
  }, []);

  return {
    elapsedSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    markActionTime
  };
}

export default useGameTimer;
