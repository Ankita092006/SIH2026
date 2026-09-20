import React from 'react';
import { patientProfile } from '../../data/mockData';

const PatientProfile = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Patient Profile</h1>
        <p>View and manage patient information</p>
      </div>

      <div style={styles.card}>
        <div style={styles.profileSection}>
          <img
            src={patientProfile.avatar}
            alt={patientProfile.name}
            style={styles.avatar}
          />

          <div>
            <h2>{patientProfile.name}</h2>
            <p>Patient ID: {patientProfile.id}</p>
            <p>Age: {patientProfile.age} years</p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <span>Patient ID</span>
            <strong>{patientProfile.id}</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Name</span>
            <strong>{patientProfile.name}</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Age</span>
            <strong>{patientProfile.age} years</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Last Login</span>
            <strong>
              {new Date(patientProfile.lastLogin).toLocaleDateString()}
            </strong>
          </div>
        </div>
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

  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
  },

  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
  },

  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '3px solid #e5e7eb',
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },

  infoBox: {
    background: '#f8fafc',
    padding: '18px',
    borderRadius: '12px',
  },
};

export default PatientProfile;
