import { patientProfile } from '../data/mockData';
import { getGameResults } from './gameService';
import { getReminders } from './reminderService';

export const getCaregiverPatient = () => {
  return patientProfile;
};

export const getPatientTrends = () => {
  return getGameResults();
};

export const getPatientReminders = () => {
  return getReminders();
};

export const getCaregiverSummary = () => {
  const results = getGameResults();
  const reminders = getReminders();

  const pendingReminders = reminders.filter(
    reminder => reminder.status === 'pending'
  );

  const completedReminders = reminders.filter(
    reminder => reminder.status === 'completed'
  );

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((total, result) => total + result.score, 0) /
            results.length
        )
      : 0;

  return {
    patient: patientProfile,
    totalActivities: results.length,
    averageScore,
    totalReminders: reminders.length,
    pendingReminders: pendingReminders.length,
    completedReminders: completedReminders.length,
  };
};
