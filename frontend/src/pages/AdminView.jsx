import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import shelterService from '../services/shelterService';
import aidRequestService from '../services/aidRequestService';
import userService from '../services/userService';
import photoService from '../services/photoService';
import { AppContent } from '../context/AppContext.jsx';


function AdminView() {
  const navigate = useNavigate();
  const { userData, isLoggedIn, authLoading, backendUrl } = useContext(AppContent);
  const [users, setUsers]            = useState([]);
  const [shelters, setShelters]      = useState([]);
  const [requests, setRequests]      = useState([]);
  const [photos, setPhotos]          = useState([]);
  const [photoFile, setPhotoFile]    = useState(null);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [loadingShelters, setLoadingShelters] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [errorShelters, setErrorShelters]     = useState('');
  const [errorRequests, setErrorRequests]     = useState('');
  const [errorUsers, setErrorUsers]     = useState('');
  const [errorPhotos, setErrorPhotos]     = useState('');
  const [roleFilter, setRoleFilter]  = useState('All');
  const [search, setSearch]          = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [adminCreateLoading, setAdminCreateLoading] = useState(false);
  const [adminCreateError, setAdminCreateError] = useState('');
  const [adminCreateSuccess, setAdminCreateSuccess] = useState('');

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    // Explicitly check userData is loaded and user is admin
    if (!userData || userData.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
  }, [authLoading, isLoggedIn, userData, navigate]);

  useEffect(() => {
    if (authLoading || !isLoggedIn || !userData || userData.role !== 'admin') return;

    const fetchShelters = async () => {
      try {
        const response = await shelterService.getAll();
        setShelters(response.data.data || []);
      } catch (err) {
        setErrorShelters('Failed to load shelters');
        console.error(err);
      } finally {
        setLoadingShelters(false);
      }
    };

    const fetchRequests = async () => {
      try {
        const response = await aidRequestService.getAll();
        setRequests(response.data.data || []);
      } catch (err) {
        setErrorRequests('Failed to load request activity');
        console.error(err);
      } finally {
        setLoadingRequests(false);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        setUsers(response.data.data || []);
      } catch (err) {
        setErrorUsers('Failed to load users');
        console.error(err);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchPhotos = async () => {
      try {
        const response = await photoService.getAll();
        setPhotos(response.data.data || []);
      } catch (err) {
        setErrorPhotos('Failed to load photos');
        console.error(err);
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchShelters();
    fetchRequests();
    fetchUsers();
    fetchPhotos();
  }, [authLoading, isLoggedIn, isAdmin]);

  if (authLoading) {
    return (
      <div className="main-container">
        <div className="view-stub" style={{ maxWidth: 620, margin: '4rem auto' }}>
          <div className="view-stub-title">Loading...</div>
          <p style={{ color: 'var(--text-secondary)' }}>Checking your permissions, please wait.</p>
        </div>
      </div>
    );
  }

  const approve = id => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'verified' } : u));
  const reject  = id => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'rejected' } : u));

  const handlePhotoFileChange = (event) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name);
    setPhotoFile(file || null);
    setUploadStatus('');
    setPhotoError('');
  };

  const uploadPhoto = async () => {
    console.log('=== UPLOAD PHOTO CLICKED ===');
    console.log('Current photoFile:', photoFile);
    console.log('Button state - uploadLoading:', uploadLoading, 'photoFile exists:', !!photoFile);
    
    if (!photoFile) {
      const errMsg = 'Please select a photo file first.';
      console.error('ERROR:', errMsg);
      setPhotoError(errMsg);
      return;
    }

    console.log('File info:', { name: photoFile.name, size: photoFile.size, type: photoFile.type });
    
    setUploadLoading(true);
    setUploadStatus('Converting file to base64...');
    setPhotoError('');

    const reader = new FileReader();
    
    reader.onload = async () => {
      try {
        const base64String = reader.result;
        console.log('✓ Base64 conversion complete, file size in bytes:', base64String.length);
        
        setUploadStatus('Uploading to Cloudinary...');
        console.log('Sending POST request to /api/photos');
        
        const uploadResponse = await photoService.saveMetadata({
          data: base64String,
          caption: photoCaption.trim() || 'Untitled',
        });

        console.log('Backend response received:', uploadResponse?.data);

        if (!uploadResponse?.data?.success) {
          const msg = uploadResponse?.data?.message || 'Failed to upload photo.';
          console.error('Backend upload failed:', msg);
          throw new Error(msg);
        }

        console.log('SUCCESS! Photo uploaded:', uploadResponse.data.data);
        setUploadStatus('Photo uploaded successfully!');
        
        if (uploadResponse.data?.data) {
          setPhotos(prev => [uploadResponse.data.data, ...prev]);
        }
        
        // Clear form
        setPhotoCaption('');
        setPhotoFile(null);
        
        // Clear file input
        const fileInput = document.querySelector('input[type="file"][accept="image/*"]');
        if (fileInput) fileInput.value = '';
        
      } catch (err) {
        console.error('Upload error:', err.message);
        setPhotoError(err.message || 'Upload failed');
      } finally {
        setUploadLoading(false);
        console.log('=== UPLOAD PROCESS COMPLETE ===');
      }
    };

    reader.onerror = (_event) => {
      const errMsg = 'Failed to read the image file.';
      console.error(errMsg, reader.error);
      setPhotoError(errMsg);
      setUploadLoading(false);
    };

    console.log('Starting FileReader...');
    reader.readAsDataURL(photoFile);
  };

  if (!isLoggedIn) {
    return (
      <div className="main-container">
        <div className="view-stub" style={{ maxWidth: 620, margin: '4rem auto' }}>
          <div className="view-stub-title">Unauthorized</div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            You need to be logged in as an admin to access this page.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
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
            Your account does not have admin privileges. Return to the dashboard or login with an admin account.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>Login as Admin</button>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const matchRole   = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const pending  = users.filter(u => u.status === 'pending').length;
  const verified = users.filter(u => u.status === 'verified').length;

  return (
    <div className="main-container">
      <div className="stats-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>✦ Admin Panel</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setShowAdminForm(prev => !prev)}>{showAdminForm ? 'Hide Admin Form' : '+ New Admin User'}</button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/create-shelter')}>+ Create New Shelter</button>
          </div>
        </div>
        <div className="stats-grid">
          {[
            { title: 'Total Users',      value: users.length,    icon: '👥', color: '#3b82f6' },
            { title: 'Active Users',     value: users.length,    icon: '👥', color: '#3b82f6' },
            { title: 'Open Requests',    value: requests.filter(r => r.status === 'open').length, icon: '⚠', color: '#f97316' },
            { title: 'Total Shelters',   value: shelters.length,  icon: '⌂', color: '#8b5cf6' },
            { title: 'Recent Requests',  value: requests.length,  icon: '✉', color: '#8b5cf6' },
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

      {showAdminForm && (
        <div className="admin-panel-card" style={{ marginBottom: '1.5rem', padding: '1.25rem', borderRadius: 'var(--r-lg)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create additional admin user</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Only current admins can add another admin login.</div>
            </div>
            <button className="btn btn-secondary" onClick={() => setShowAdminForm(false)}>Close</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} placeholder="Admin name" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} placeholder="Strong password" />
            </div>
          </div>
          {adminCreateError && <div style={{ color: 'var(--red)', marginTop: '0.85rem' }}>{adminCreateError}</div>}
          {adminCreateSuccess && <div style={{ color: 'var(--green)', marginTop: '0.85rem' }}>{adminCreateSuccess}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => {
              setNewAdminName(''); setNewAdminEmail(''); setNewAdminPassword(''); setAdminCreateError(''); setAdminCreateSuccess('');
            }}>Clear</button>
            <button className="btn btn-primary" onClick={async () => {
              setAdminCreateError('');
              setAdminCreateSuccess('');
              if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
                setAdminCreateError('All fields are required.');
                return;
              }
              setAdminCreateLoading(true);
              try {
                const { data } = await userService.createAdmin({
                  name: newAdminName.trim(),
                  email: newAdminEmail.trim(),
                  password: newAdminPassword,
                });
                if (data.success) {
                  setAdminCreateSuccess(data.message || 'Admin user created.');
                  setNewAdminName('');
                  setNewAdminEmail('');
                  setNewAdminPassword('');
                  setUsers(prev => [
                    { ...data.user, status: 'verified', createdAt: new Date().toISOString(), isAccountVerified: true },
                    ...prev,
                  ]);
                } else {
                  setAdminCreateError(data.message || 'Unable to create admin.');
                }
              } catch (err) {
                setAdminCreateError(err.response?.data?.message || err.message || 'Failed to create admin.');
              } finally {
                setAdminCreateLoading(false);
              }
            }} disabled={adminCreateLoading}>{adminCreateLoading ? 'Creating…' : 'Create Admin'}</button>
          </div>
        </div>
      )}

      <div className="content-layout">
        <div>
          <div className="sidebar-card">
            <div className="sidebar-header">👥 User Management</div>
            <div className="sidebar-content">
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="🔍  Search users…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 150 }}
                />
                <div className="map-filters">
                  {['All', 'Volunteer', 'Requester', 'Admin'].map(r => (
                    <button key={r} className={`filter-btn ${roleFilter === r ? 'active' : ''}`} onClick={() => setRoleFilter(r)}>{r}</button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Role', 'Status', 'Joined', 'Verified', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                        <td style={{ padding: '0.7rem 0.75rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-secondary)' }}>{user.role}</td>
                        <td style={{ padding: '0.7rem 0.75rem' }}>
                          <span className={`badge ${user.status === 'verified' ? 'badge-verified' : user.status === 'pending' ? 'badge-pending' : 'badge-urgent'}`}>
                            {user.status === 'verified' ? '✓ Verified' : user.status === 'pending' ? '⏳ Pending' : '✕ Rejected'}
                          </span>
                        </td>
                        <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{user.isAccountVerified ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '0.7rem 0.75rem' }}>
                          {user.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button className="btn btn-primary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={() => approve(user.id)}>Approve</button>
                              <button className="btn btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }} onClick={() => reject(user.id)}>Reject</button>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No users found.</div>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-header">⌂ Shelter Management</div>
            <div className="sidebar-content">
              {loadingShelters ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Loading shelters...</div>
              ) : errorShelters ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--red)' }}>{errorShelters}</div>
              ) : shelters.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No shelters found.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {shelters.slice(0, 5).map((shelter) => (
                    <div key={shelter._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{shelter.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{shelter.location} • {shelter.capacity}/{shelter.total} capacity</div>
                      </div>
                      <span className={`badge ${shelter.open ? 'badge-verified' : 'badge-pending'}`}>{shelter.open ? 'Open' : 'Closed'}</span>
                    </div>
                  ))}
                  {shelters.length > 5 && (
                    <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      +{shelters.length - 5} more shelters
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-header">📸 Photo Upload</div>
            <div className="sidebar-content">
              <label className="form-label" htmlFor="photo-caption">Caption</label>
              <input
                id="photo-caption"
                name="photo-caption"
                className="form-input"
                value={photoCaption}
                onChange={e => setPhotoCaption(e.target.value)}
                placeholder="Describe the photo"
              />
              <label className="form-label" htmlFor="photo-file" style={{ marginTop: '1rem' }}>Select photo</label>
              <input
                id="photo-file"
                name="photo-file"
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                style={{ width: '100%' }}
              />
              {photoFile && (
                <div style={{ marginTop: '0.85rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ✓ Selected: {photoFile.name} ({(photoFile.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              )}
              {uploadStatus && <div style={{ color: 'var(--green)', marginTop: '0.85rem', fontWeight: 500 }}>✓ {uploadStatus}</div>}
              {photoError && <div style={{ color: 'var(--red)', marginTop: '0.85rem', fontWeight: 500 }}>✗ {photoError}</div>}
              <button
                className="btn btn-primary"
                onClick={uploadPhoto}
                disabled={uploadLoading || !photoFile}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {uploadLoading ? 'Uploading…' : 'Upload Photo'}
              </button>
              <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Uploaded photos appear on the dashboard gallery.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="sidebar-card">
            <div className="sidebar-header">⚡ Recent Aid Requests</div>
            <div className="sidebar-content" style={{ padding: '0.75rem 1.25rem' }}>
              {loadingRequests ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Loading requests...</div>
              ) : errorRequests ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--red)' }}>{errorRequests}</div>
              ) : requests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No requests available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {requests.slice(0, 6).map((req, i) => (
                    <div key={req._id || i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.6rem 0', borderBottom: i < Math.min(requests.length, 6) - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(79, 70, 229, 0.16)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>⚠</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{req.type || 'Shelter'} request</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.location || req.address || 'No location provided'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Submitted by {req.submittedBy?.name || req.submittedBy?.email || 'Unknown'}</div>
                      </div>
                      <div style={{ display: 'grid', gap: '0.25rem', alignItems: 'flex-end', textAlign: 'right', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                        <span className={`badge ${req.status === 'open' ? 'badge-pending' : req.status === 'in-progress' ? 'badge-urgent' : 'badge-verified'}`}>
                          {req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-header">⚙ Live Overview</div>
            <div className="sidebar-content">
              {[
                { label: 'Total Users', value: users.length, detail: 'Registered users' },
                { label: 'Open Requests', value: requests.filter(r => r.status === 'open').length, detail: 'Pending aid requests' },
                { label: 'Shelters Available', value: shelters.filter(s => s.open).length, detail: 'Open shelter locations' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.detail}</div>
                  </div>
                  <span className="badge badge-verified">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminView;
