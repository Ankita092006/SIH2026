import React from 'react';
import { NavLink } from 'react-router-dom';
import { NERHomeIcon, NERGameIcon, NERBellIcon, NERProfileIcon, NERHistoryIcon } from './NERIcons';
import { Brain, Users, Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const { t } = useLanguage();
  const { role } = useAuth();

  const isCaregiver = role === 'caregiver';

  return (
    <nav className="nav-bar" role="navigation" aria-label="Main Navigation">
      <NavLink to="/home" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERHomeIcon size={24} />
        <span>{t('nav.home')}</span>
      </NavLink>

      <NavLink to="/games" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERGameIcon size={24} />
        <span>{t('nav.games')}</span>
      </NavLink>

      <NavLink to="/memory" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Brain size={24} />
        <span>Memory</span>
      </NavLink>

      <NavLink to="/reminders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERBellIcon size={24} />
        <span>{t('nav.reminders')}</span>
      </NavLink>

      {isCaregiver ? (
        <NavLink to="/caregiver" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={24} />
          <span>Caregiver</span>
        </NavLink>
      ) : (
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <NERProfileIcon size={24} />
          <span>{t('nav.profile')}</span>
        </NavLink>
      )}
    </nav>
  );
}
