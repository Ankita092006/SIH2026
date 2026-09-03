import { getStorage, setStorage } from './storage';

const RESULTS_KEY = 'sih_game_results';

export const getGameResults = () => {
  return getStorage(RESULTS_KEY, []);
};

export const saveGameResult = (result) => {
  const currentResults = getGameResults();
  const now = new Date();
  const newResult = {
    ...result,
    id: Date.now().toString(),
    date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    completedAt: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  };
  // Add to beginning of array
  const updated = [newResult, ...currentResults];
  setStorage(RESULTS_KEY, updated);
  return newResult;
};

export const getRecentResults = (count = 3) => {
  const results = getGameResults();
  return results.slice(0, count);
};
