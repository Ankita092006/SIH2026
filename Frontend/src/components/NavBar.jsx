import React from 'react';
import { NavLink } from 'react-router-dom';
import { NERHomeIcon, NERGameIcon, NERBellIcon, NERProfileIcon, NERHistoryIcon } from './NERIcons';

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/home" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERHomeIcon size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERGameIcon size={24} />
        <span>Games</span>
      </NavLink>
      <NavLink to="/results" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERHistoryIcon size={24} />
        <span>History</span>
      </NavLink>
      <NavLink to="/reminders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERBellIcon size={24} />
        <span>Reminders</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <NERProfileIcon size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
