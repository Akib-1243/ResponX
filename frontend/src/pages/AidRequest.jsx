import React, { useState } from 'react';
import aidRequestService from '../services/aidRequestService';

function AidRequest() {
  const [formData, setFormData] = useState({
    type: 'Medical Supplies', description: '', location: '', people: '', urgency: 'High',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await aidRequestService.create({ ...formData, people: Number(formData.people) || 1 });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="main-container">
        <div className="view-stub">
          <div className="view-stub-title">✓ Request Submitted</div>
          <p>Your aid request has been received and is being reviewed by our response team.</p>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => {
            setSubmitted(false);
            setFormData({ type: 'Medical Supplies', description: '', location: '', people: '', urgency: 'High' });
          }}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="sidebar-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <div className="sidebar-header">⚠ Submit Aid Request</div>
        <div className="sidebar-content">
          {error && (
            <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 'var(--r-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--red)', fontSize: '0.825rem' }}>
              ⚠ {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Request Type</label>
            <select className="form-select" name="type" value={formData.type} onChange={handleChange}>
              <option>Medical Supplies</option>
              <option>Food &amp; Water</option>
              <option>Shelter</option>
              <option>Clothing</option>
              <option>Rescue</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Urgency Level</label>
            <select className="form-select" name="urgency" value={formData.urgency} onChange={handleChange}>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Describe what you need in detail…" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input type="text" className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="Enter your current location" />
          </div>
          <div className="form-group">
            <label className="form-label">Number of People Affected</label>
            <input type="number" className="form-input" name="people" value={formData.people} onChange={handleChange} placeholder="0" min="1" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AidRequest;
