import React from 'react';
import { NavLink } from 'react-router-dom';

const TABS = [
  ['/dashboard', '▦  Overview'],
  ['/aid-request', '⚠  Request Aid'],
  ['/volunteer', '↗  Volunteer Hub'],
  ['/shelters', '⌂  Shelters Map'],
  ['/admin', '✦  Admin Panel'],
];

function TabNavigation() {
  return (
    <div className="tab-navigation">
      <div className="tab-nav-content">
        {TABS.map(([path, label]) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default TabNavigation;
