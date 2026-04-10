import React, { useState, useEffect } from 'react';
import volunteerService from '../services/volunteerService';

function VolunteerDashboard() {
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    volunteerService.getAll()
      .then(res => setTasks(res.data.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id) => {
    try {
      const res = await volunteerService.toggleAssign(id);
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const urgencyClass = u =>
    u === 'Critical' ? 'badge-urgent' : u === 'High' ? 'badge-pending' : 'badge-verified';

  if (loading) return (
    <div className="main-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="loading-spinner" />
    </div>
  );

  if (error) return (
    <div className="main-container">
      <div className="view-stub">
        <div className="view-stub-title" style={{ color: 'var(--red)' }}>⚠ {error}</div>
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <div className="stats-section">
        <h2 className="section-title">↗ Volunteer Hub</h2>
        <div className="stats-grid">
          {[
            { title: 'Open Tasks',       value: tasks.filter(t => !t.assigned).length, icon: '⚑', color: '#f97316' },
            { title: 'My Assignments',   value: tasks.filter(t => t.assigned).length,  icon: '✓', color: '#10b981' },
            { title: 'Volunteers Active',value: '—',                                   icon: '↗', color: '#8b5cf6' },
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

      <div className="sidebar-card">
        <div className="sidebar-header">Available Tasks</div>
        <div className="sidebar-content">
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
              No tasks available right now.
            </div>
          )}
          {tasks.map(task => (
            <div key={task._id} className="request-card" style={{ opacity: task.assigned ? 0.6 : 1 }}>
              <div className="request-header">
                <span className="request-title">{task.title}</span>
                <span className={`badge ${urgencyClass(task.urgency)}`}>{task.urgency}</span>
              </div>
              <div className="request-meta" style={{ justifyContent: 'space-between' }}>
                <span>📍 {task.location}</span>
                <button
                  className={`btn ${task.assigned ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ padding: '0.3rem 0.9rem', fontSize: '0.75rem' }}
                  onClick={() => toggle(task._id)}
                >
                  {task.assigned ? 'Unassign' : 'Accept Task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;
