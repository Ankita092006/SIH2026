import React from 'react';
import { NavLink } from 'react-router-dom';
import { NERHomeIcon, NERGameIcon, NERBellIcon, NERProfileIcon, NERHistoryIcon } from './NERIcons';
import { useLanguage } from '../context/LanguageContext';

export default function NavBar() {
  const { t } = useLanguage();
  return (
    <nav className="nav-bar">
      <NavLink to="/home" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERHomeIcon size={24} />
        <span>{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERGameIcon size={24} />
        <span>{t('nav.games')}</span>
      </NavLink>
      <NavLink to="/results" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERHistoryIcon size={24} />
        <span>{t('nav.history')}</span>
      </NavLink>
      <NavLink to="/reminders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERBellIcon size={24} />
        <span>{t('nav.reminders')}</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERProfileIcon size={24} />
        <span>{t('nav.profile')}</span>
      </NavLink>
    </nav>
  );
}
