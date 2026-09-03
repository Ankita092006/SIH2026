import { getStorage, setStorage } from './storage';

const REMINDERS_KEY = 'sih_reminders';

export const getReminders = () => {
  return getStorage(REMINDERS_KEY, []);
};

export const saveReminders = (reminders) => {
  setStorage(REMINDERS_KEY, reminders);
};

export const addReminder = (reminder) => {
  const current = getReminders();
  const newReminder = {
    ...reminder,
    id: Date.now().toString(),
    status: reminder.status || 'pending'
  };
  saveReminders([...current, newReminder]);
  return newReminder;
};

export const updateReminder = (id, updates) => {
  const current = getReminders();
  const updated = current.map(r => r.id === id ? { ...r, ...updates } : r);
  saveReminders(updated);
};

export const deleteReminder = (id) => {
  const current = getReminders();
  const filtered = current.filter(r => r.id !== id);
  saveReminders(filtered);
};
