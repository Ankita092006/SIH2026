import React from 'react';
import { patientProfile } from '../../data/mockData';

const MemoryLibrary = () => {
  const memories = [
    {
      id: 1,
      title: 'Patient Profile',
      description: 'Basic information and personal details of the patient.',
      type: 'Profile',
    },
    {
      id: 2,
      title: 'Recent Cognitive Activity',
      description: 'Recent cognitive game results and performance information.',
      type: 'Activity',
    },
    {
      id: 3,
      title: 'Daily Reminders',
      description: 'Important medication, hydration and activity reminders.',
      type: 'Reminder',
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Memory Library</h1>
        <p>
          Important patient information and records available for caregiver
          reference.
        </p>
      </div>

      <div style={styles.patientCard}>
        <div style={styles.avatar}>
          {patientProfile.name.charAt(0)}
        </div>

        <div>
          <h2>{patientProfile.name}</h2>
          <p>Patient ID: {patientProfile.id}</p>
          <p>Age: {patientProfile.age} years</p>
        </div>
      </div>

      <div style={styles.library}>
        <h2>Memory Records</h2>

        <div style={styles.grid}>
          {memories.map(memory => (
            <div style={styles.card} key={memory.id}>
              <div style={styles.icon}>🧠</div>

              <div style={styles.content}>
                <span style={styles.type}>{memory.type}</span>
                <h3>{memory.title}</h3>
                <p>{memory.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.infoCard}>
        <h2>About Memory Library</h2>
        <p>
          The Memory Library helps caregivers quickly access important
          patient-related information, recent activities and daily care
          details in one place.
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

  patientCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },

  avatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#e0e7ff',
    color: '#3730a3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  },

  library: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    marginBottom: '24px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginTop: '18px',
  },

  card: {
    display: 'flex',
    gap: '14px',
    padding: '18px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },

  icon: {
    fontSize: '28px',
  },

  content: {
    flex: 1,
  },

  type: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  infoCard: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },
};

export default MemoryLibrary;
