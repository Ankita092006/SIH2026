import React, { useState, useEffect } from 'react';
import { caregiverApi } from '../../api/caregiver.api';
import { patientProfile as fallbackProfile } from '../../data/mockData';

const PatientProfile = () => {
  const [patient, setPatient] = useState(fallbackProfile);

  useEffect(() => {
    let active = true;
    caregiverApi.getPatients()
      .then(res => {
        if (active && res.patients && res.patients.length > 0) {
          const p = res.patients[0];
          setPatient(prev => ({
            ...prev,
            id: p.id,
            name: p.name,
            age: p.age,
            avatar: p.avatarUrl || prev.avatar
          }));
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Patient Profile</h1>
        <p>View and manage patient information</p>
      </div>

      <div style={styles.card}>
        <div style={styles.profileSection}>
          <img
            src={patient.avatar}
            alt={patient.name}
            style={styles.avatar}
          />

          <div>
            <h2>{patient.name}</h2>
            <p>Patient ID: {patient.id}</p>
            <p>Age: {patient.age} years</p>
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <span>Patient ID</span>
            <strong>{patient.id}</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Name</span>
            <strong>{patient.name}</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Age</span>
            <strong>{patient.age} years</strong>
          </div>

          <div style={styles.infoBox}>
            <span>Last Login</span>
            <strong>
              {new Date(patient.lastLogin || Date.now()).toLocaleDateString()}
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
