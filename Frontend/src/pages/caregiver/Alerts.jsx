import React from 'react';
import { getReminders } from '../../services/reminderService';

const Alerts = () => {
  const reminders = getReminders();

  const pendingReminders = reminders.filter(
    reminder => reminder.status === 'pending'
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Alerts</h1>
        <p>Important notifications and reminders for the caregiver.</p>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <span>Active Alerts</span>
          <strong>{pendingReminders.length}</strong>
        </div>

        <div style={styles.summaryCard}>
          <span>Total Reminders</span>
          <strong>{reminders.length}</strong>
        </div>
      </div>

      <div style={styles.alertCard}>
        <h2>Current Alerts</h2>

        {pendingReminders.length === 0 ? (
          <div style={styles.empty}>
            <h3>No active alerts</h3>
            <p>There are currently no pending reminders.</p>
          </div>
        ) : (
          pendingReminders.map(reminder => (
            <div style={styles.alert} key={reminder.id}>
              <div style={styles.icon}>!</div>

              <div style={styles.alertContent}>
                <h3>{reminder.text}</h3>
                <p>
                  Scheduled for {reminder.date} at {reminder.time}
                </p>
              </div>

              <span style={styles.badge}>Pending</span>
            </div>
          ))
        )}
      </div>

      <div style={styles.infoCard}>
        <h2>Caregiver Attention</h2>
        <p>
          Check pending reminders regularly and follow up when the patient
          misses an important activity or medication reminder.
        </p>
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

  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },

  summaryCard: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  alertCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },

  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #e5e7eb',
  },

  icon: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: '#fee2e2',
    color: '#b91c1c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
    flexShrink: 0,
  },

  alertContent: {
    flex: 1,
  },

  badge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
  },

  empty: {
    textAlign: 'center',
    padding: '30px',
  },

  infoCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
};

export default Alerts;
