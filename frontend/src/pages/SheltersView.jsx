import React, { useState, useEffect } from 'react';
import shelterService from '../services/shelterService';

const AMENITY_ICONS = {
  Food: '🍽', Medical: '🏥', 'Wi-Fi': '📶',
  Showers: '🚿', Childcare: '👶', 'Pets Allowed': '🐾',
};
const STATUS_LABEL = { high: 'Near Full', medium: 'Moderate', low: 'Available' };
const STATUS_COLOR = { high: '#e03535', medium: '#f97316', low: '#10b981' };

function SheltersView() {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    shelterService.getAll()
      .then(res => setShelters(res.data.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = shelters.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'All' ||
      (filter === 'Available' && s.status === 'low'  && s.open) ||
      (filter === 'Open'      && s.open) ||
      (filter === 'Near Full' && s.status === 'high');
    return matchSearch && matchFilter;
  });

  const totalCapacity = shelters.reduce((a, s) => a + s.total, 0);
  const totalOccupied = shelters.reduce((a, s) => a + s.capacity, 0);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen message={error} />;

  return (
    <div className="main-container">
      <div className="stats-section">
        <h2 className="section-title">⌂ Shelters Map &amp; Directory</h2>
        <div className="stats-grid">
          {[
            { title: 'Total Shelters',   value: shelters.length,                    icon: '⌂', color: '#3b82f6' },
            { title: 'Open Now',         value: shelters.filter(s => s.open).length, icon: '✓', color: '#10b981' },
            { title: 'Total Capacity',   value: totalCapacity,                       icon: '👥', color: '#8b5cf6' },
            { title: 'People Sheltered', value: totalOccupied,                       icon: '↑', color: '#f97316' },
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

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <input type="text" className="form-input" placeholder="🔍  Search by name or location…"
          value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
        <div className="map-filters">
          {['All', 'Open', 'Available', 'Near Full'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.length === 0 && (
            <div className="view-stub" style={{ padding: '2rem' }}>🔍 No shelters match your search.</div>
          )}
          {filtered.map(shelter => (
            <div key={shelter._id} className="shelter-card"
              style={{ cursor: 'pointer', border: selected?._id === shelter._id ? `1px solid ${STATUS_COLOR[shelter.status]}` : undefined, opacity: shelter.open ? 1 : 0.55 }}
              onClick={() => setSelected(selected?._id === shelter._id ? null : shelter)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <div className="shelter-name">{shelter.name}</div>
                  <div className="shelter-location">📍 {shelter.address}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <span className="badge" style={{ background: STATUS_COLOR[shelter.status] + '20', color: STATUS_COLOR[shelter.status] }}>
                    {STATUS_LABEL[shelter.status]}
                  </span>
                  {!shelter.open && <span className="badge badge-urgent">Closed</span>}
                </div>
              </div>
              <div className="capacity-bar">
                <div className={`capacity-fill ${shelter.status}`} style={{ width: `${(shelter.capacity / shelter.total) * 100}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                <div className="capacity-text">{shelter.capacity}/{shelter.total} occupied</div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {shelter.amenities.slice(0, 4).map(a => (
                    <span key={a} title={a} style={{ fontSize: '0.85rem' }}>{AMENITY_ICONS[a]}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-card" style={{ position: 'sticky', top: '120px' }}>
          {selected ? (
            <>
              <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>⌂ Shelter Details</span>
                <button className="modal-close" onClick={() => setSelected(null)}>×</button>
              </div>
              <div className="sidebar-content">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{selected.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {selected.address}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Status',    value: selected.open ? 'Open' : 'Closed', color: selected.open ? '#10b981' : '#e03535' },
                    { label: 'Occupancy', value: `${selected.capacity}/${selected.total}`, color: STATUS_COLOR[selected.status] },
                    { label: 'Available', value: selected.total - selected.capacity, color: '#3b82f6' },
                    { label: 'Capacity',  value: `${Math.round((selected.capacity / selected.total) * 100)}%`, color: STATUS_COLOR[selected.status] },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{item.label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div className="capacity-bar" style={{ marginBottom: '1rem' }}>
                  <div className={`capacity-fill ${selected.status}`} style={{ width: `${(selected.capacity / selected.total) * 100}%` }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>AMENITIES</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {selected.amenities.map(a => (
                      <span key={a} className="badge badge-verified">{AMENITY_ICONS[a]} {a}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CONTACT</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>📞 {selected.phone}</div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }}>Get Directions</button>
              </div>
            </>
          ) : (
            <div className="sidebar-content" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1.25rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⌂</div>
              <div style={{ fontSize: '0.875rem' }}>Click a shelter to view details.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="main-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="loading-spinner" />
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="main-container">
      <div className="view-stub">
        <div className="view-stub-title" style={{ color: 'var(--red)' }}>⚠ Failed to load shelters</div>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default SheltersView;
