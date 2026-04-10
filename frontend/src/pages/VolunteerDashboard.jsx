import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import aidRequestService from '../services/aidRequestService';
import { AppContent } from '../context/AppContext.jsx';

function VolunteerDashboard() {
  const navigate = useNavigate();
  const { userData, isLoggedIn, authLoading } = useContext(AppContent);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('available'); // available, my-tasks, all

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (userData?.role === 'requester') {
      navigate('/dashboard');
      return;
    }
  }, [authLoading, isLoggedIn, userData, navigate]);

  useEffect(() => {
    if (authLoading || !isLoggedIn || userData?.role === 'requester') return;

    loadRequests();
  }, [authLoading, isLoggedIn, userData, filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await aidRequestService.getAll();
      setRequests(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (id) => {
    try {
      setError('');
      const res = await aidRequestService.accept(id);
      setRequests(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to accept request');
    }
  };

  const completeRequest = async (id) => {
    try {
      setError('');
      const res = await aidRequestService.complete(id);
      setRequests(prev => prev.map(r => r._id === id ? res.data : r));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to complete request');
    }
  };

  const urgencyClass = u =>
    u === 'Critical' ? 'badge-urgent' : u === 'High' ? 'badge-pending' : 'badge-verified';

  const statusClass = s =>
    s === 'open' ? 'badge-verified' : s === 'in-progress' ? 'badge-pending' : 'badge-urgent';

  // Filter requests based on current filter
  const filteredRequests = requests.filter(request => {
    if (filter === 'available') return request.status === 'open' && !request.assignedTo;
    if (filter === 'my-tasks') return request.assignedTo && request.assignedTo._id === userData?._id;
    return true; // all
  });

  const stats = {
    available: requests.filter(r => r.status === 'open' && !r.assignedTo).length,
    myTasks: requests.filter(r => r.assignedTo && r.assignedTo._id === userData?._id).length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'resolved').length,
  };

  if (loading) return (
    <div className="main-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="loading-spinner" />
    </div>
  );

  return (
    <div className="main-container">
      <div className="stats-section">
        <h2 className="section-title">↗ Volunteer Hub</h2>
        <div className="stats-grid">
          {[
            { title: 'Available Requests', value: stats.available, icon: '📋', color: '#f97316' },
            { title: 'My Tasks', value: stats.myTasks, icon: '✓', color: '#10b981' },
            { title: 'In Progress', value: stats.inProgress, icon: '⏳', color: '#8b5cf6' },
            { title: 'Completed', value: stats.completed, icon: '✅', color: '#06b6d4' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
              <div className="stat-content">
                <div className="stat-value">{s.value}</div>
                <div className="stat-title">{s.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--r-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--red)' }}>
          ⚠ {error}
        </div>
      )}

      <div className="content-layout">
        <div className="sidebar-card">
          <div className="sidebar-header">
            Aid Requests
            <div className="map-filters" style={{ marginTop: '0.5rem' }}>
              {[
                { key: 'available', label: 'Available' },
                { key: 'my-tasks', label: 'My Tasks' },
                { key: 'all', label: 'All Requests' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sidebar-content">
            {filteredRequests.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                {filter === 'available' && 'No available requests at this time.'}
                {filter === 'my-tasks' && 'You have no assigned tasks.'}
                {filter === 'all' && 'No requests found.'}
              </div>
            )}
            {filteredRequests.map(request => (
              <div key={request._id} className="request-card">
                <div className="request-header">
                  <span className="request-title">{request.type}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge ${urgencyClass(request.urgency)}`}>{request.urgency}</span>
                    <span className={`badge ${statusClass(request.status)}`}>
                      {request.status === 'in-progress' ? 'In Progress' :
                       request.status === 'resolved' ? 'Completed' : 'Open'}
                    </span>
                  </div>
                </div>
                <div className="request-meta">
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Description:</strong> {request.description}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Location:</strong> 📍 {request.location}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>People Affected:</strong> 👥 {request.people}
                  </div>
                  {request.submittedBy && (
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Requested by:</strong> {request.submittedBy.name}
                    </div>
                  )}
                  {request.assignedTo && (
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <strong>Assigned to:</strong> {request.assignedTo.name}
                    </div>
                  )}
                </div>
                <div className="request-meta" style={{ justifyContent: 'space-between', marginTop: '1rem' }}>
                  {request.status === 'open' && !request.assignedTo && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.9rem', fontSize: '0.75rem' }}
                      onClick={() => acceptRequest(request._id)}
                    >
                      Accept Request
                    </button>
                  )}
                  {request.assignedTo && request.assignedTo._id === userData?._id && request.status === 'in-progress' && (
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.3rem 0.9rem', fontSize: '0.75rem' }}
                      onClick={() => completeRequest(request._id)}
                    >
                      Mark as Done
                    </button>
                  )}
                  {request.assignedTo && request.assignedTo._id === userData?._id && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      ✓ Assigned to you
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
