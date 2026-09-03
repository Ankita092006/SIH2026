import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gamepad2, Bell, User, LayoutDashboard } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="nav-bar">
      <NavLink to="/home" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/games" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Gamepad2 size={24} />
        <span>Games</span>
      </NavLink>
      <NavLink to="/reminders" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <Bell size={24} />
        <span>Reminders</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
