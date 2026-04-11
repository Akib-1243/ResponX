
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import shelterService from '../services/shelterService';
import aidRequestService from '../services/aidRequestService';
import photoService from '../services/photoService';
import missingPersonService from '../services/missingPersonService';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

function DashboardView() {
  const navigate = useNavigate();
  const { isLoggedIn, userData } = useContext(AppContent);
  const isAdmin = userData?.role === 'admin';
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [missingPersons, setMissingPersons] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Shelters');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  const photoCategories = ['All', 'Shelters', 'Damage', 'Aid', 'Missing'];

  const getInitials = (name) => {
    if (!name) return 'XX';
    return name
      .split(' ')
      .map((part) => part[0] || '')
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatTimeAgo = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      setPhotoError('');

      const [shelterRes, photoRes, missingRes] = await Promise.all([
        shelterService.getAll(),
        photoService.getAll(),
        missingPersonService.getAll(),
      ]);

      setShelters(shelterRes.data.data || []);
      setPhotos(photoRes.data.data || []);
      setMissingPersons(missingRes.data.data || []);

      if (isLoggedIn) {
        const reqRes = await aidRequestService.getAll();
        setRequests(reqRes.data.data || []);
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to load dashboard data.';
      setError(message);
      setPhotoError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const missingCount = missingPersons.filter((person) => person.status === 'missing').length;
  const criticalCount = missingPersons.filter((person) => person.urgency === 'critical').length;
  const foundCount = missingPersons.filter((person) => person.status === 'found').length;
  const foundThisWeek = missingPersons.filter((person) => {
    if (person.status !== 'found' || !person.foundAt) return false;
    return Date.now() - new Date(person.foundAt).getTime() < 7 * 86400000;
  }).length;

  const criticalFirst = [...missingPersons]
    .filter((person) => person.status === 'missing')
    .sort((a, b) => {
      const order = { critical: 0, high: 1, normal: 2 };
      const diff = order[a.urgency || 'normal'] - order[b.urgency || 'normal'];
      if (diff !== 0) return diff;
      return new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime();
    });

  const topMissingCases = criticalFirst.slice(0, 4);
  const topCriticalCases = criticalFirst.slice(0, 3);

  const filteredPhotos = selectedCategory === 'All'
    ? photos
    : photos.filter((photo) => (photo.category || 'Aid').toLowerCase() === selectedCategory.toLowerCase());

  const totalCapacity = shelters.reduce((sum, shelter) => sum + (shelter.total || 0), 0);

  const handleDeletePhoto = async (photoId) => {
    if (!isAdmin) return;
    try {
      await photoService.delete(photoId);
      setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
      if (selectedPhoto?._id === photoId) {
        setSelectedPhoto(null);
      }
      toast.success('Photo deleted successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete photo');
      console.error('Delete photo error:', err);
    }
  };

  const totalOccupied = shelters.reduce((sum, shelter) => sum + (shelter.capacity || 0), 0);
  const totalPhotos = photos.length;
  const totalRequests = requests.length;

  const getCapacityColor = (percent) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 70) return '#f97316';
    return '#22c55e';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    setUploadError('');
    setUploadSuccess('');
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
  };

  const uploadPhoto = async () => {
    if (!uploadFile) {
      setUploadError('Please select an image before uploading.');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const data = reader.result;
        const response = await photoService.saveMetadata({
          data,
          caption: uploadCaption || 'Field photo',
          category: uploadCategory,
        });
        setPhotos((prev) => [response.data.data, ...prev]);
        setUploadSuccess('Photo uploaded successfully.');
        setUploadFile(null);
        setUploadCaption('');
        setUploadCategory('Shelters');
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="view-stub">
          <div className="view-stub-title" style={{ color: 'var(--red)' }}>⚠ Failed to load dashboard</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="stats-section">
        <div className="section-heading">Live Statistics</div>
        <div className="stats-grid">
          {[
            { title: 'Total Shelters', value: shelters.length, icon: '⌂', color: '#3b82f6', delta: '+4 shelters', deltaColor: '#22c55e' },
            { title: 'Total Requests', value: totalRequests, icon: '⚠', color: '#f97316', delta: '+12 since yesterday', deltaColor: '#f97316' },
            { title: 'Total Photos', value: totalPhotos, icon: '📸', color: '#8b5cf6', delta: '+3 uploads', deltaColor: '#22c55e' },
            { title: 'People Sheltered', value: totalOccupied, icon: '↑', color: '#10b981', delta: '+27 today', deltaColor: '#22c55e' },
            { title: 'Missing Persons', value: missingCount, icon: '👁', color: '#f87171', border: '#3d1a6e', delta: `${criticalCount} critical`, deltaColor: '#f87171' },
            { title: 'Found Safe', value: foundCount, icon: '✓', color: '#22c55e', border: '#14532d', delta: `+${foundThisWeek} this week`, deltaColor: '#22c55e' },
          ].map((stat, index) => (
            <div
              key={index}
              className="stat-card"
              style={{ borderColor: stat.border || 'var(--border)' }}
            >
              <div className="stat-icon" style={{ background: stat.color + '18', color: stat.color, fontSize: '1.1rem' }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className="stat-change" style={{ color: stat.deltaColor, fontSize: '10px', marginTop: '4px' }}>
                  {stat.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="summary-grid">
        <div className="missing-summary-card" style={{ padding: '1rem', border: '1px solid #1a1d2e', background: '#0d0f1a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>👁 Missing Persons — Active Cases</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div className="badge-pill badge-critical">{criticalCount} critical</div>
              <div className="badge-pill badge-missing">{missingCount} missing</div>
            </div>
          </div>

          {topMissingCases.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: '12px', padding: '1rem 0' }}>No active missing cases found.</div>
          ) : (
            topMissingCases.map((person) => {
              const daysMissing = person.status === 'found'
                ? 'Closed'
                : `${Math.floor((Date.now() - new Date(person.reportedAt).getTime()) / 86400000)} days`;
              const statusColor = person.status === 'critical'
                ? { background: '#3d0a0a', color: '#f87171' }
                : person.status === 'missing'
                ? { background: '#2d1a0a', color: '#fb923c' }
                : { background: '#052010', color: '#22c55e' };
              return (
                <div key={person._id} className="missing-row-item" style={{ background: '#080a12', border: '1px solid #111520', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '12px', fontWeight: 700, color: person.gender === 'female' ? '#a78bfa' : '#4ade80', background: person.gender === 'female' ? '#2d1a6e' : '#0a2d1a' }}>
                    {getInitials(person.fullName)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>
                      {person.fullName}{person.vulnerability === 'child' ? ' · Child' : person.vulnerability === 'elderly' ? ' · Elderly' : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>
                      📍 {person.lastLocation || 'Unknown'}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.35rem', textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', borderRadius: '4px', padding: '2px 7px', background: statusColor.background, color: statusColor.color, fontWeight: 700 }}>
                      {person.urgency?.toUpperCase() || person.status?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#555' }}>{daysMissing}</div>
                  </div>
                </div>
              );
            })
          )}

          <button
            className="text-link-action"
            onClick={() => navigate('/missing-persons')}
          >
            View all {missingPersons.length} cases in Missing Persons registry →
          </button>
        </div>

        <div className="shelter-status-card" style={{ padding: '1rem' }}>
          <div className="section-heading">Shelter Status</div>
          {shelters.length === 0 ? (
            <div style={{ color: '#94a3b8', padding: '1rem 0' }}>No shelter status data available.</div>
          ) : shelters.map((shelter) => {
            const percent = shelter.total ? Math.round(((shelter.capacity || 0) / shelter.total) * 100) : 0;
            return (
              <div key={shelter._id} className="shelter-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{shelter.name}</div>
                    <div className="text-muted-tight">📍 {shelter.location || 'Unknown'}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{shelter.capacity || 0}/{shelter.total || 0} occupied</div>
                </div>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: `${percent}%`, background: getCapacityColor(percent) }} />
                </div>
              </div>
            );
          })}
          <button
            className="text-link-action"
            onClick={() => navigate('/shelters')}
          >
            View shelters map →
          </button>
        </div>
      </div>

      <div className="photo-grid-section" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
          <div className="section-heading">📷 Shared Photos</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {photoCategories.map((category) => {
              const active = category === selectedCategory;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    fontSize: '11px',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    border: '1px solid #1e2130',
                    background: active ? '#7c3aed' : 'transparent',
                    color: active ? '#fff' : '#888',
                    cursor: 'pointer',
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
          {filteredPhotos.slice(0, 12).map((photo, index) => {
            const category = photo.category || 'Aid';
            const badgeStyles = {
              Shelter: { background: '#1e1040', color: '#a78bfa' },
              Damage: { background: '#3d0a0a', color: '#f87171' },
              Aid: { background: '#052010', color: '#22c55e' },
              Missing: { background: '#2d1040', color: '#c084fc' },
            };
            const badge = badgeStyles[category] || { background: '#1e1040', color: '#a78bfa' };
            return (
              <div
                key={photo._id || photo.id || index}
                className="photo-card"
                onClick={() => setSelectedPhoto(photo)}
                style={{ cursor: 'pointer' }}
              >
                <div className="photo-card-thumb">
                  <img src={photo.url} alt={photo.caption || 'Shared photo'} />
                  <div className="photo-card-overlay">
                    <span style={{ color: '#fff', fontSize: '18px' }}>🔍</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePhoto(photo._id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.12)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                      }}
                      title="Delete photo"
                    >
                      ✕
                    </button>
                  )}
                  <div className="photo-card-badge" style={badge}>{category}</div>
                </div>
                <div className="photo-card-info">
                  <div className="photo-card-category">{category}</div>
                  <div className="photo-card-caption">{photo.caption || 'Untitled image'}</div>
                  <div className="photo-card-meta">
                    {formatTimeAgo(photo.createdAt)} · by {photo.uploadedBy?.name || 'Admin'}
                  </div>
                </div>
              </div>
            );
          })}

          {isAdmin ? (
            <button className="upload-card" onClick={handleUploadClick}>
              <span>+</span>
              <div style={{ fontSize: '11px', fontWeight: 700 }}>Upload photo</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Supported categories only</div>
            </button>
          ) : (
            <div className="upload-card" style={{ cursor: 'default', color: '#94a3b8' }}>
              <span>🔒</span>
              <div style={{ fontSize: '11px', fontWeight: 700 }}>Admin upload only</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Contact an administrator to add photos.</div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {uploadFile && (
          <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem', padding: '0.8rem', border: '1px solid #1e2130', borderRadius: '12px' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Caption"
                style={{ flex: 1, minWidth: '180px', padding: '0.7rem', borderRadius: '10px', border: '1px solid #1e2130', background: '#0f172a', color: '#fff' }}
              />
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                style={{ padding: '0.7rem', borderRadius: '10px', border: '1px solid #1e2130', background: '#0f172a', color: '#fff', minWidth: '150px' }}
              >
                {photoCategories.filter((option) => option !== 'All').map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>Selected file: {uploadFile.name}</div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ minWidth: '110px' }}
                  onClick={uploadPhoto}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? 'Uploading…' : 'Upload'}
                </button>
                <button
                  className="btn"
                  style={{ minWidth: '110px' }}
                  onClick={() => { setUploadFile(null); setUploadCaption(''); setUploadError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {uploadError && <div style={{ color: '#f87171', fontSize: '12px' }}>{uploadError}</div>}
            {uploadSuccess && <div style={{ color: '#22c55e', fontSize: '12px' }}>{uploadSuccess}</div>}
          </div>
        )}
      </div>

      <div className="summary-row" style={{ marginTop: '1.5rem' }}>
        <div className="request-summary-card" style={{ padding: '1rem' }}>
          <div className="section-heading">Recent Aid Requests</div>
          {isLoggedIn ? (
            requests.length === 0 ? (
              <div style={{ color: '#94a3b8', padding: '1rem 0' }}>No recent requests to display.</div>
            ) : (
              requests.slice(0, 5).map((req) => {
                const dotColor = req.urgency === 'Critical' ? '#f87171' : req.urgency === 'High' ? '#fb923c' : '#22c55e';
                return (
                  <div key={req._id} className="request-row-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="request-dot" style={{ background: dotColor }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{req.type || 'Aid'} request</div>
                      <div className="text-muted-tight">{req.location || 'Location unavailable'} · {req.peopleAffected ? `${req.peopleAffected} affected` : 'People affected unknown'}</div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{req.status?.charAt(0).toUpperCase() + req.status?.slice(1) || 'Unknown'}</div>
                  </div>
                );
              })
            )
          ) : (
            <div style={{ color: '#94a3b8', padding: '1rem 0' }}>Log in to see recent requests.</div>
          )}
          <button className="text-link-action" onClick={() => navigate('/aid-request')}>
            View all requests →
          </button>
        </div>

        <div className="missing-critical-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div className="section-heading">👁 Missing — Critical First</div>
            <div className="badge-pill badge-critical">{criticalCount} critical</div>
          </div>
          {topCriticalCases.length === 0 ? (
            <div style={{ color: '#94a3b8', padding: '1rem 0' }}>No critical missing cases are active.</div>
          ) : (
            topCriticalCases.map((person) => {
              const dotColor = person.urgency === 'critical' ? '#f87171' : '#fb923c';
              return (
                <div key={person._id} className="missing-row-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="missing-dot" style={{ background: dotColor }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {person.fullName}, {person.age || 'N/A'}{person.gender?.[0]?.toUpperCase() || ''}
                    </div>
                    <div className="text-muted-tight">Last: {person.lastLocation || 'Unknown'} · {Math.floor((Date.now() - new Date(person.reportedAt).getTime()) / 86400000)} days</div>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 700, borderRadius: '4px', padding: '2px 7px', background: person.urgency === 'critical' ? '#3d0a0a' : '#2d1a0a', color: person.urgency === 'critical' ? '#f87171' : '#fb923c' }}>
                    {person.urgency?.toUpperCase() || 'HIGH'}
                  </div>
                </div>
              );
            })
          )}
          <button className="text-link-action" onClick={() => navigate('/missing-persons')}>
            View full registry →
          </button>
        </div>
      </div>

      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0d0f1a',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'}
            >
              ✕
            </button>

            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Photo'}
              style={{
                maxWidth: '80vw',
                maxHeight: '80vh',
                objectFit: 'contain',
                display: 'block',
                background: '#000',
              }}
            />
            <div style={{ padding: '1.5rem', background: '#0b1220', color: '#e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selectedPhoto.caption || 'Field photo'}</h2>
                <div style={{ fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '999px', background: '#111827', color: '#94a3b8' }}>{selectedPhoto.category || 'Aid'}</div>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '0.5rem' }}>
                {formatTimeAgo(selectedPhoto.createdAt)} · by {selectedPhoto.uploadedBy?.name || 'Admin'}
              </div>
              {selectedPhoto.caption && (
                <p style={{ fontSize: '12px', color: '#cbd5e1' }}>{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardView;
