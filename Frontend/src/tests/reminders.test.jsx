import { describe, it, expect } from 'vitest';
import { reminderApi } from '../api/reminder.api';

describe('Reminders API Service & Adherence Tracking', () => {
  it('retrieves daily reminders', async () => {
    const res = await reminderApi.getReminders();
    expect(res.success).toBe(true);
    expect(Array.isArray(res.reminders)).toBe(true);
    expect(res.reminders.length).toBeGreaterThan(0);
  });

  it('toggles completion status of a reminder', async () => {
    const remindersRes = await reminderApi.getReminders();
    const firstReminder = remindersRes.reminders[0];
    const initialStatus = firstReminder.completed;

    const toggleRes = await reminderApi.toggleReminder(firstReminder.id);
    expect(toggleRes.success).toBe(true);
    expect(toggleRes.reminder.completed).toBe(!initialStatus);
  });

  it('creates a new medication reminder', async () => {
    const newRem = {
      title: 'Afternoon Hydration',
      time: '03:00 PM',
      type: 'hydration',
      recurrence: 'Daily'
    };

    const res = await reminderApi.createReminder(newRem);
    expect(res.success).toBe(true);
    expect(res.reminder.title).toBe('Afternoon Hydration');
    expect(res.reminder.id).toBeDefined();
  });
});
