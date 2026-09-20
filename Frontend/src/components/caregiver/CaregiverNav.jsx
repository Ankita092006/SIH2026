import React from 'react';
import { NavLink } from 'react-router-dom';

const CaregiverNav = () => {
  const links = [
    { name: 'Dashboard', path: '/caregiver/dashboard' },
    { name: 'Patient Profile', path: '/caregiver/patient' },
    { name: 'Trends', path: '/caregiver/trends' },
    { name: 'Adherence', path: '/caregiver/adherence' },
    { name: 'Alerts', path: '/caregiver/alerts' },
    { name: 'Memory Library', path: '/caregiver/memory' },
    { name: 'Patient Insights', path: '/caregiver/insights' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>Caregiver Portal</div>

      <div style={styles.links}>
        {links.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            {link.name}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: '#1e293b',
    padding: '16px',
    color: '#ffffff',
  },

  brand: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },

  links: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },

  link: {
    color: '#ffffff',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '14px',
  },

  activeLink: {
    background: '#475569',
  },
};

export default CaregiverNav;
