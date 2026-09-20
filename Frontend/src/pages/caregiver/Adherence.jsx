import React from 'react';
import { getReminders } from '../../services/reminderService';

const Adherence = () => {
  const reminders = getReminders();

  const completed = reminders.filter(
    reminder => reminder.status === 'completed'
  ).length;

  const pending = reminders.filter(
    reminder => reminder.status === 'pending'
  ).length;

  const upcoming = reminders.filter(
    reminder => reminder.status === 'upcoming'
  ).length;

  const total = reminders.length;

  const adherence =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Adherence</h1>
        <p>Monitor medication and daily reminder adherence.</p>
      </div>

      <div style={styles.stats}>
        <div style={styles.card}>
          <span>Adherence Rate</span>
          <strong>{adherence}%</strong>
        </div>

        <div style={styles.card}>
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>

        <div style={styles.card}>
          <span>Pending</span>
          <strong>{pending}</strong>
        </div>

        <div style={styles.card}>
          <span>Upcoming</span>
          <strong>{upcoming}</strong>
        </div>
      </div>

      <div style={styles.listCard}>
        <h2>Reminder Activity</h2>

        {reminders.length === 0 ? (
          <p>No reminders available.</p>
        ) : (
          reminders.map(reminder => (
            <div style={styles.row} key={reminder.id}>
              <div>
                <strong>{reminder.text}</strong>
                <p>
                  {reminder.date} • {reminder.time}
                </p>
              </div>

              <span
                style={{
                  ...styles.status,
                  ...(reminder.status === 'completed'
                    ? styles.completed
                    : reminder.status === 'pending'
                    ? styles.pending
                    : styles.upcoming),
                }}
              >
                {reminder.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
  },

  header: {
    marginBottom: '24px',
  },

  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  card: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  listCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
  },

  status: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    textTransform: 'capitalize',
  },

  completed: {
    background: '#dcfce7',
    color: '#166534',
  },

  pending: {
    background: '#fef3c7',
    color: '#92400e',
  },

  upcoming: {
    background: '#dbeafe',
    color: '#1e40af',
  },
};

export default Adherence;
