
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import shelterService from '../services/shelterService';
import aidRequestService from '../services/aidRequestService';
import volunteerService from '../services/volunteerService';
import photoService from '../services/photoService';
import { AppContent } from '../context/AppContext';

function DashboardView() {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContent);
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photoError, setPhotoError] = useState('');

  useEffect(() => {
    const fetchShelters = async () => {
      const response = await shelterService.getAll();
      setShelters(response.data.data || []);
    };

    const fetchProtectedData = async () => {
      if (!isLoggedIn) return;
      const [reqRes, taskRes] = await Promise.all([
        aidRequestService.getAll(),
        volunteerService.getAll(),
      ]);
      setRequests(reqRes.data.data || []);
      setTasks(taskRes.data.data || []);
    };

    const fetchPhotos = async () => {
      try {
        const response = await photoService.getAll();
        setPhotos(response.data.data || []);
      } catch (err) {
        setPhotoError(err.response?.data?.message || err.message || 'Failed to load photos.');
      }
    };

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setPhotoError('');
        await fetchShelters();
        await fetchProtectedData();
        await fetchPhotos();
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isLoggedIn]);

  const totalCapacity = shelters.reduce((sum, shelter) => sum + (shelter.total || 0), 0);
  const totalOccupied = shelters.reduce((sum, shelter) => sum + (shelter.capacity || 0), 0);
  const totalPhotos = photos.length;
  const totalRequests = requests.length;
  const totalTasks = tasks.length;

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
        <h2 className="section-title">Live Statistics</h2>
        <div className="stats-grid">
          {[
            { title: 'Total Shelters', value: shelters.length, icon: '⌂', color: '#3b82f6' },
            { title: 'Total Requests', value: totalRequests, icon: '⚠', color: '#f97316' },
            { title: 'Total Photos', value: totalPhotos, icon: '📸', color: '#8b5cf6' },
            { title: 'People Sheltered', value: totalOccupied, icon: '↑', color: '#10b981' },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: stat.color + '18', color: stat.color, fontSize: '1.1rem' }}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-layout">
        <div className="photo-grid-section">
          <div className="map-header">
            <h3 className="map-title">📸 Shared Photos</h3>
            <div className="map-filters">
              <button className="filter-btn active">All</button>
            </div>
          </div>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {photoError ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--red)' }}>{photoError}</div>
            ) : photos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)' }}>
                No shared photos yet. Admins can upload photos from the Admin page.
              </div>
            ) : (
              photos.map((photo) => (
                <div 
                  key={photo._id || photo.id || photo.url} 
                  className="gallery-card" 
                  onClick={() => setSelectedPhoto(photo)}
                  style={{ 
                    borderRadius: '1rem', 
                    overflow: 'hidden', 
                    background: 'var(--bg-elevated)', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, cursor 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <img
                    src={photo.url || photo.image || photo.photoUrl}
                    alt={photo.caption || 'Shared photo'}
                    style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                      {photo.caption || 'Community update'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {photo.location || photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Just shared'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-card">
            <div className="sidebar-header">⌂ Shelter Status</div>
            <div className="sidebar-content">
              {shelters.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                  No shelters found.
                </div>
              ) : shelters.map((shelter) => (
                <div key={shelter._id} className="shelter-card">
                  <div className="shelter-name">{shelter.name}</div>
                  <div className="shelter-location">📍 {shelter.location}</div>
                  <div className="capacity-bar">
                    <div className={`capacity-fill ${shelter.status}`} style={{ width: `${((shelter.capacity || 0) / (shelter.total || 1)) * 100}%` }} />
                  </div>
                  <div className="capacity-text">{shelter.capacity || 0}/{shelter.total || 0} occupied</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-header">⚠ Recent Requests</div>
            <div className="sidebar-content">
              {isLoggedIn ? (
                requests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No requests available.
                  </div>
                ) : requests.slice(0, 5).map((req) => (
                  <div key={req._id} className="request-card">
                    <div className="request-header">
                      <span className="request-title">{req.type || 'Aid'} request</span>
                      <span className={`badge ${req.urgency === 'Critical' ? 'badge-urgent' : req.urgency === 'High' ? 'badge-pending' : 'badge-verified'}`}>
                        {req.urgency || 'Normal'}
                      </span>
                    </div>
                    <div className="request-description">{req.location || 'Location unavailable'}</div>
                    <div className="request-meta">
                      <span>{req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Unknown'}</span>
                      <span>{req.submittedBy?.name || req.submittedBy?.email || 'Submitted by anonymous'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  Log in to view live request activity.
                </div>
              )}
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={() => navigate('/aid-request')}
              >
                + Submit Urgent Request
              </button>
            </div>
          </div>
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
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
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

            {/* Image */}
            <img
              src={selectedPhoto.url || selectedPhoto.image || selectedPhoto.photoUrl}
              alt={selectedPhoto.caption || 'Photo'}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />

            {/* Photo details */}
            <div style={{ padding: '2rem', borderTop: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selectedPhoto.caption || 'Community Photo'}
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {selectedPhoto.createdAt ? `Shared on ${new Date(selectedPhoto.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'Recently shared'}
              </p>
              {selectedPhoto.uploadedBy && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  By <strong>{selectedPhoto.uploadedBy.name || 'Admin'}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardView;
