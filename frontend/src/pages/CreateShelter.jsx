import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import shelterService from '../services/shelterService';
import { AppContent } from '../context/AppContext.jsx';

const ALL_AMENITIES = ['Food', 'Medical', 'Wi-Fi', 'Showers', 'Childcare', 'Pets Allowed'];
const AMENITY_ICONS = {
  Food: '🍽', Medical: '🏥', 'Wi-Fi': '📶', Showers: '🚿', Childcare: '👶', 'Pets Allowed': '🐾',
};
const EMPTY_FORM = { name: '', location: '', address: '', phone: '', total: '', capacity: '', amenities: [], open: true };

function getStatus(capacity, total) {
  const r = capacity / total;
  return r >= 0.8 ? 'high' : r >= 0.5 ? 'medium' : 'low';
}

function CreateShelter() {
  const navigate = useNavigate();
  const { userData, isLoggedIn, authLoading } = useContext(AppContent);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        navigate('/login');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [authLoading, isLoggedIn, isAdmin, navigate]);

  if (authLoading) {
    return (
      <div className="main-container">
        <div className="view-stub" style={{ maxWidth: 620, margin: '4rem auto' }}>
          <div className="view-stub-title">Loading...</div>
          <p style={{ color: 'var(--text-secondary)' }}>Verifying your account status.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="main-container">
        <div className="view-stub" style={{ maxWidth: 620, margin: '4rem auto' }}>
          <div className="view-stub-title">Access denied</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Your account does not have admin privileges. Please login with an admin account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Login as Admin</button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const toggleAmenity = a => setForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a) ? prev.amenities.filter(x => x !== a) : [...prev.amenities, a],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name     = 'Shelter name is required.';
    if (!form.location.trim()) e.location = 'Location is required.';
    if (!form.address.trim()) e.address  = 'Full address is required.';
    if (!form.phone.trim())   e.phone    = 'Contact number is required.';
    if (!form.total || Number(form.total) <= 0) e.total = 'Total capacity must be > 0.';
    if (form.capacity === '' || Number(form.capacity) < 0) e.capacity = 'Occupancy cannot be negative.';
    if (Number(form.capacity) > Number(form.total)) e.capacity = 'Occupancy cannot exceed capacity.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    setApiError('');
    try {
      await shelterService.create({
        name: form.name.trim(), location: form.location.trim(),
        address: form.address.trim(), phone: form.phone.trim(),
        total: Number(form.total), capacity: Number(form.capacity),
        amenities: form.amenities, open: form.open,
      });
      setSubmitted(true);
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Failed to create shelter.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="main-container">
        <div className="view-stub" style={{ maxWidth: 520, margin: '4rem auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✓</div>
          <div className="view-stub-title" style={{ color: 'var(--green)' }}>Shelter Created!</div>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{form.name}</strong> is now saved in MongoDB and visible in the Shelters directory.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => { setForm(EMPTY_FORM); setSubmitted(false); }}>+ Add Another</button>
            <button className="btn btn-primary" onClick={() => navigate('/shelters')}>View Shelters</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.825rem' }} onClick={() => navigate('/admin')}>✦ Admin Panel</button>
        <span>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Create New Shelter</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
        <div className="sidebar-card">
          <div className="sidebar-header">⌂ New Shelter Details</div>
          <div className="sidebar-content">
            {apiError && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--r-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--red)', fontSize: '0.825rem' }}>
                ⚠ {apiError}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Shelter Name *</label>
                <input type="text" className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. North Hill Relief Center" />
                {errors.name && <FieldError msg={errors.name} />}
              </div>
              <div className="form-group">
                <label className="form-label">District / Location *</label>
                <input type="text" className="form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. North District" />
                {errors.location && <FieldError msg={errors.location} />}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Address *</label>
                <input type="text" className="form-input" name="address" value={form.address} onChange={handleChange} placeholder="e.g. 55 Hill Rd, North District" />
                {errors.address && <FieldError msg={errors.address} />}
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone *</label>
                <input type="text" className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="e.g. +1 (555) 000-0000" />
                {errors.phone && <FieldError msg={errors.phone} />}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Total Capacity *</label>
                <input type="number" className="form-input" name="total" value={form.total} onChange={handleChange} placeholder="e.g. 100" min="1" />
                {errors.total && <FieldError msg={errors.total} />}
              </div>
              <div className="form-group">
                <label className="form-label">Current Occupancy *</label>
                <input type="number" className="form-input" name="capacity" value={form.capacity} onChange={handleChange} placeholder="e.g. 0" min="0" />
                {errors.capacity && <FieldError msg={errors.capacity} />}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Amenities Available</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {ALL_AMENITIES.map(a => {
                  const active = form.amenities.includes(a);
                  return (
                    <button key={a} type="button" onClick={() => toggleAmenity(a)} style={{ padding: '0.4rem 0.875rem', borderRadius: 'var(--r-sm)', border: `1px solid ${active ? 'var(--green)' : 'var(--border)'}`, background: active ? 'var(--green-dim)' : 'var(--bg-elevated)', color: active ? 'var(--green)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.15s' }}>
                      {AMENITY_ICONS[a]} {a}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="open" checked={form.open} onChange={handleChange} style={{ accentColor: 'var(--green)', width: 16, height: 16 }} />
                <span className="form-label" style={{ marginBottom: 0 }}>
                  Mark as <strong style={{ color: form.open ? 'var(--green)' : 'var(--red)' }}>{form.open ? 'Open' : 'Closed'}</strong>
                </span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/admin')}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving…' : '⌂ Create Shelter'}</button>
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '120px' }}>
          <div className="sidebar-card">
            <div className="sidebar-header">👁 Live Preview</div>
            <div className="sidebar-content">
              <div className="shelter-card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div className="shelter-name">{form.name || <span style={{ color: 'var(--text-muted)' }}>Shelter Name</span>}</div>
                    <div className="shelter-location">📍 {form.address || <span style={{ color: 'var(--text-muted)' }}>Address</span>}</div>
                  </div>
                  <span className="badge" style={{ background: form.open ? 'var(--green-dim)' : 'var(--red-dim)', color: form.open ? 'var(--green)' : 'var(--red)' }}>
                    {form.open ? '● Open' : '✕ Closed'}
                  </span>
                </div>
                {form.total > 0 && (
                  <>
                    <div className="capacity-bar">
                      <div className={`capacity-fill ${getStatus(Number(form.capacity) || 0, Number(form.total))}`} style={{ width: `${Math.min(((Number(form.capacity) || 0) / Number(form.total)) * 100, 100)}%` }} />
                    </div>
                    <div className="capacity-text" style={{ marginTop: '0.4rem' }}>{form.capacity || 0}/{form.total} occupied</div>
                  </>
                )}
                {form.amenities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {form.amenities.map(a => (
                      <span key={a} className="badge badge-verified">{AMENITY_ICONS[a]} {a}</span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--r-md)', fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                📞 {form.phone || 'Phone number'}<br />
                📍 {form.location || 'District'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldError({ msg }) {
  return <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginTop: '0.3rem', fontWeight: 500 }}>⚠ {msg}</div>;
}

export default CreateShelter;
