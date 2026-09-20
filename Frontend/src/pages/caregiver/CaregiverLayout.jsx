import React from 'react';
import { Outlet } from 'react-router-dom';
import CaregiverNav from '../../components/caregiver/CaregiverNav';

const CaregiverLayout = () => {
  return (
    <div style={styles.container}>
      <CaregiverNav />

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
  },

  content: {
    width: '100%',
  },
};

export default CaregiverLayout;
