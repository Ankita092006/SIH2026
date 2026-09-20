import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCaregiverPatient,
  getPatientTrends,
  getPatientReminders,
  getCaregiverSummary
} from '../services/caregiverService';
import { saveReminders } from '../services/reminderService';
import { saveGameResult } from '../services/gameService';

describe('Caregiver Module Integration & Service Contract', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves patient profile correctly', () => {
    const patient = getCaregiverPatient();
    expect(patient).toBeDefined();
    expect(patient.name).toBe('Robert Smith');
    expect(patient.id).toBe('PT-8472');
  });

  it('computes caregiver summary metrics accurately with mock reminders and game results', () => {
    saveReminders([
      { id: '1', text: 'Morning Medication', status: 'completed', date: '2026-09-20', time: '08:00' },
      { id: '2', text: 'Evening Walk', status: 'pending', date: '2026-09-20', time: '18:00' }
    ]);

    saveGameResult({
      gameId: 'word-recall',
      score: 80,
      accuracy: 90,
      timeTaken: 45
    });
    saveGameResult({
      gameId: 'memory-match',
      score: 100,
      accuracy: 100,
      timeTaken: 30
    });

    const summary = getCaregiverSummary();
    expect(summary.patient.name).toBe('Robert Smith');
    expect(summary.totalActivities).toBe(2);
    expect(summary.averageScore).toBe(90);
    expect(summary.totalReminders).toBe(2);
    expect(summary.completedReminders).toBe(1);
    expect(summary.pendingReminders).toBe(1);
  });

  it('handles empty activity data gracefully', () => {
    const summary = getCaregiverSummary();
    expect(summary.totalActivities).toBe(0);
    expect(summary.averageScore).toBe(0);
    expect(summary.totalReminders).toBe(0);
  });
});
