import React, { useState } from 'react';
import AidRequest from './pages/AidRequest';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <Header activeView={activeView} setActiveView={setActiveView} />
      <TabNavigation activeView={activeView} setActiveView={setActiveView} />

      {activeView === 'dashboard' && <DashboardView setShowModal={setShowModal} setActiveView={setActiveView} />}
      {/* AidRequest and VolunteerDashboard pages*/}
      {activeView === 'aid-request' && <AidRequest />}
      {activeView === 'volunteer' && <VolunteerDashboard />}
      
      {activeView === 'shelters' && <SheltersView />}
      {activeView === 'admin' && <AdminView />}

      {showModal && <RequestModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

function Header({ activeView, setActiveView }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <div className="logo-icon">⚡</div>
          <span>Respon<em>X</em></span>
        </div>

        <nav className="nav-menu">
          {[
            ['dashboard', 'Dashboard'],
            ['aid-request', 'Request Aid'],
            ['volunteer', 'Volunteer'],
            ['shelters', 'Shelters'],
          ].map(([view, label]) => (
            <button
              key={view}
              className={`nav-link ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="user-badge">
          <span>👤 John Doe</span>
          <span className="badge-trusted">✓ Trusted</span>
        </div>
      </div>
    </header>
  );
}

function TabNavigation({ activeView, setActiveView }) {
  const tabs = [
    ['dashboard', '▦  Overview'],
    ['aid-request', '⚠  Request Aid'],
    ['volunteer', '↗  Volunteer Hub'],
    ['shelters', '⌂  Shelters Map'],
    ['admin', '✦  Admin Panel'],
  ];
  return (
    <div className="tab-navigation">
      <div className="tab-nav-content">
        {tabs.map(([view, label]) => (
          <button
            key={view}
            className={`tab-button ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ setShowModal, setActiveView }) {
  const stats = [
    { title: 'Active Shelters', value: '24', change: '+3 today', positive: true, icon: '⌂', color: '#3b82f6' },
    { title: 'People Helped', value: '1,847', change: '+256 today', positive: true, icon: '↑', color: '#10b981' },
    { title: 'Urgent Requests', value: '12', change: '-4 pending', positive: true, icon: '⚠', color: '#f97316' },
    { title: 'Active Volunteers', value: '89', change: '+12 online', positive: true, icon: '↗', color: '#8b5cf6' },
  ];

  const shelters = [
    { name: 'City Central Shelter', capacity: 45, total: 50, location: 'Downtown', status: 'active' },
    { name: 'East Side Community Center', capacity: 32, total: 40, location: 'East District', status: 'active' },
    { name: 'North Valley School', capacity: 28, total: 30, location: 'North Valley', status: 'active' },
  ];

  const requests = [
    { id: 'REQ-001', type: 'Medical', priority: 'High', location: 'Downtown', verified: true },
    { id: 'REQ-002', type: 'Food', priority: 'Medium', location: 'East Side', verified: false },
    { id: 'REQ-003', type: 'Shelter', priority: 'High', location: 'North Valley', verified: true },
  ];

  return (
    <div className="main-container">
      {/* Stats Cards - Full Width */}
      <div className="stats-section">
        <h2 className="section-title">📊 Live Statistics</h2>
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: stat.color + '18', color: stat.color, fontSize: '1.1rem' }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="content-layout">
        {/* Map Section - Left Side */}
        <div className="map-section">
          <div className="map-header">
            <h3 className="map-title">🗺️ Active Response Zones</h3>
            <div className="map-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">Critical</button>
              <button className="filter-btn">Active</button>
            </div>
          </div>
          <div className="map-placeholder">
            <div className="map-marker" style={{ color: '#e03535', top: '22%', left: '32%' }}>24</div>
            <div className="map-marker" style={{ color: '#10b981', top: '52%', left: '61%' }}>38</div>
            <div className="map-marker" style={{ color: '#f97316', top: '71%', left: '42%' }}>12</div>
          </div>
        </div>

        {/* Sidebar - Right Side */}
        <div className="sidebar-section">
          {/* Shelters Card */}
          <div className="sidebar-card">
            <div className="sidebar-header">⌂ Shelter Status</div>
            <div className="sidebar-content">
              {shelters.map((s, i) => (
                <div key={i} className="shelter-card">
                  <div className="shelter-name">{s.name}</div>
                  <div className="shelter-location">📍 {s.location}</div>
                  <div className="capacity-bar">
                    <div
                      className={`capacity-fill ${s.capacity / s.total > 0.8 ? 'high' : s.capacity / s.total > 0.6 ? 'medium' : 'low'}`}
                      style={{ width: `${(s.capacity / s.total) * 100}%` }}
                    />
                  </div>
                  <div className="capacity-text">{s.capacity}/{s.total} occupied</div>
                </div>
              ))}
            </div>
          </div>

          {/* Requests Card */}
          <div className="sidebar-card">
            <div className="sidebar-header">⚠ Recent Requests</div>
            <div className="sidebar-content">
              {requests.map((req, i) => (
                <div key={i} className="request-card">
                  <div className="request-header">
                    <span className="request-title">{req.type} Aid</span>
                    <span className={`badge ${req.priority === 'High' ? 'badge-urgent' : 'badge-pending'}`}>
                      {req.priority}
                    </span>
                  </div>
                  <div className="request-description">Request #{req.id.split('-')[1]}</div>
                  <div className="request-meta">
                    <span>📍 {req.location}</span>
                    {req.verified && <span className="badge badge-verified">✓ Verified</span>}
                  </div>
                </div>
              ))}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => setActiveView('aid-request')}
              >
                + Submit Urgent Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StubView({ emoji, title, description }) {
  return (
    <div className="main-container">
      <div className="view-stub">
        <div className="view-stub-title">{emoji} {title}</div>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SheltersView() {
  return (
    <StubView
      emoji="⌂"
      title="Active Shelters"
      description="Full shelter management interface with real-time capacity tracking, amenities list, contact information, and navigation features."
    />
  );
}

function AdminView() {
  return (
    <StubView
      emoji="⚙"
      title="Admin Dashboard"
      description="Comprehensive admin panel for user verification, data analytics, system monitoring, and content moderation."
    />
  );
}

function RequestModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Submit Urgent Request</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Request Type</label>
            <select className="form-select">
              <option>Medical Supplies</option>
              <option>Food &amp; Water</option>
              <option>Shelter</option>
              <option>Clothing</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what you need in detail…"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter your current location"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Number of People Affected</label>
            <input type="number" className="form-input" placeholder="0" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

export default App;