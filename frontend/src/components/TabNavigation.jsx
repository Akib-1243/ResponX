import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContent } from '../context/AppContext.jsx';

function TabNavigation() {
  const { userData } = useContext(AppContent);
  const isAdmin = userData?.role === 'admin';
  const canViewVolunteer = userData?.role !== 'requester';
  const tabs = [
    ['/dashboard', '▦  Overview'],
    ['/aid-request', '⚠  Request Aid'],
    ...(canViewVolunteer ? [['/volunteer', '↗  Volunteer Hub']] : []),
    ['/shelters', '⌂  Shelters Map'],
    ['/missing-persons', '👁  Missing Persons'],
  ];

  if (isAdmin) {
    tabs.push(['/admin', '✦  Admin Panel']);
  }

  return (
    <div className="tab-navigation">
      <div className="tab-nav-content">
        {tabs.map(([path, label]) => (
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
