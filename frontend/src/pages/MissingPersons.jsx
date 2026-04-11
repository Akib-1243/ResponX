import React, { useState, useEffect, useContext } from 'react';
import { AppContent } from '../context/AppContext';
import missingPersonService from '../services/missingPersonService';
import { toast } from 'react-toastify';

function MissingPersons() {
  const { userData, isLoggedIn } = useContext(AppContent);
  const [persons, setPersons] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'male',
    vulnerability: 'none',
    lastLocation: '',
    description: '',
    contactNumber: '',
    urgency: 'normal',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await missingPersonService.getAll();
      const data = response.data?.data || response.data || [];
      setPersons(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load missing persons';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Fetch persons error:', err);
      setPersons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (!file) {
      setPhotoPreview('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('Please login to report a missing person');
      return;
    }

    try {
      setFormLoading(true);
      const payload = { ...formData };

      if (photoFile) {
        payload.photoData = photoPreview;
      }

      await missingPersonService.create(payload);
      toast.success('Missing person report submitted successfully!');
      setFormData({
        fullName: '',
        age: '',
        gender: 'male',
        vulnerability: 'none',
        lastLocation: '',
        description: '',
        contactNumber: '',
        urgency: 'normal',
      });
      setPhotoFile(null);
      setPhotoPreview('');
      setShowForm(false);
      await fetchPersons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleMarkAsFound = async (id) => {
    if (!['volunteer', 'admin'].includes(userData?.role)) {
      toast.error('Only volunteers and admins can mark persons as found');
      return;
    }

    try {
      await missingPersonService.markAsFound(id);
      toast.success('Person marked as found!');
      await fetchPersons();
      setSelectedPerson(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (userData?.role !== 'admin') {
      toast.error('Only admins can delete records');
      return;
    }

    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await missingPersonService.delete(id);
        toast.success('Record deleted successfully');
        await fetchPersons();
        setSelectedPerson(null);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete record');
        console.error(err);
      }
    }
  };

  // Stat calculations
  const activeCount = persons.filter(p => p.status === 'missing').length;
  const foundCount = persons.filter(p => p.status === 'found').length;
  const criticalCount = persons.filter(p => 
    p.urgency === 'critical' || p.vulnerability === 'child'
  ).length;
  const todayCount = persons.filter(p => 
    new Date(p.reportedAt).toDateString() === new Date().toDateString()
  ).length;

  // Filter logic
  const filtered = persons.filter(p => {
    const matchSearch = 
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.lastLocation.toLowerCase().includes(search.toLowerCase());
    
    const matchFilter = 
      filter === 'all' || 
      (filter === 'critical' && (p.urgency === 'critical' || p.vulnerability === 'child')) ||
      p.status === filter;
    
    return matchSearch && matchFilter;
  });

  const daysMissing = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getAvatarColor = (gender) => {
    if (gender === 'female') return 'bg-purple-900 text-purple-300';
    if (gender === 'male') return 'bg-green-900 text-green-300';
    return 'bg-gray-700 text-gray-300';
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="main-container flex justify-center items-center py-12">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error && persons.length === 0) {
    return (
      <div className="main-container">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 mb-6">
          <div className="text-red-400 font-bold mb-2">⚠ Error Loading Missing Persons</div>
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => fetchPersons()}
            className="mt-4 bg-purple-700 hover:bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      {/* STAT CARDS */}
      <div className="stats-section">
        <h2 className="section-title">Missing Persons Dashboard</h2>
        <div className="stats-grid">
          {[
            { title: 'Active Reports', value: activeCount, icon: '⚠', color: '#f97316' },
            { title: 'Found Safe', value: foundCount, icon: '✓', color: '#22c55e' },
            { title: 'Critical / Children', value: criticalCount, icon: '🚨', color: '#ef4444' },
            { title: 'Reported Today', value: todayCount, icon: '📅', color: '#3b82f6' },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: stat.color + '18', color: stat.color }}>
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

      {/* SEARCH & FILTER BAR */}
      <div className="mt-8 mb-6 space-y-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by name, age, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-700 hover:bg-purple-600 text-white rounded-full px-4 py-2 font-medium text-sm whitespace-nowrap"
          >
            + Report Missing Person
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {['all', 'missing', 'found', 'critical'].map(option => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`filter-btn ${filter === option ? 'active' : ''}`}
              style={
                filter === option
                  ? {
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      borderColor: '#7c3aed',
                    }
                  : {}
              }
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* REPORT FORM (COLLAPSIBLE) */}
      {showForm && (
        <div className="bg-[#131625] border border-[#1e2130] rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Report Missing Person</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Vulnerability</label>
                <select
                  name="vulnerability"
                  value={formData.vulnerability}
                  onChange={handleFormChange}
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="none">None</option>
                  <option value="child">Child under 12</option>
                  <option value="elderly">Elderly</option>
                  <option value="medical">Medical condition</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="form-label block text-sm font-medium mb-2">Last Known Location *</label>
                <input
                  type="text"
                  name="lastLocation"
                  value={formData.lastLocation}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="form-label block text-sm font-medium mb-2">Physical Description / Clothing</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Photo of Victim</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-gray-300 file:bg-purple-700 file:text-white file:px-3 file:py-2 file:rounded-full file:border-0"
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Victim preview"
                    className="mt-3 w-full max-h-52 object-cover rounded-xl border border-[#2a2d3a]"
                  />
                )}
              </div>

              <div>
                <label className="form-label block text-sm font-medium mb-2">Urgency Level</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleFormChange}
                  className="w-full bg-[#0d0f1a] border border-[#2a2d3a] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-[#2a2d3a] text-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-[#1a1d28]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="bg-purple-700 hover:bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
              >
                {formLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PERSON CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
        {filtered.length > 0 ? (
          filtered.map(person => (
            <div key={person._id} className="bg-[#131625] border border-[#1e2130] rounded-lg p-5 hover:border-[#2a2d3a] transition-all">
              {/* Avatar & Name Section */}
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(person.gender)}`}>
                  {getInitials(person.fullName)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base">{person.fullName}</h3>
                  <p className="text-sm text-gray-400">{person.age} years old • {person.gender}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    person.status === 'found'
                      ? 'bg-green-900 text-green-400'
                      : person.urgency === 'critical'
                      ? 'bg-red-900 text-red-400'
                      : 'bg-orange-900 text-orange-400'
                  }`}
                >
                  {person.status === 'found' ? 'Found Safe' : person.urgency === 'critical' ? 'Critical' : 'Missing'}
                </span>
              </div>

              {/* Victim Photo */}
              {person.photoUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-[#2a2d3a]">
                  <img
                    src={person.photoUrl}
                    alt={`${person.fullName} photo`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Location */}
              <div className="mb-2 text-sm">
                <p className="text-gray-400">📍 <span className="text-gray-300">{person.lastLocation}</span></p>
              </div>

              {/* Description */}
              {person.description && (
                <div className="mb-2 text-sm">
                  <p className="text-gray-400">👗 <span className="text-gray-300">{person.description}</span></p>
                </div>
              )}

              {/* Contact */}
              <div className="mb-3 text-sm">
                <p className="text-gray-400">📞 <span className="text-gray-300">{person.contactNumber}</span></p>
              </div>

              {/* Days Missing */}
              <div className="mb-4 text-xs text-gray-500">
                Missing for {daysMissing(person.reportedAt)} day{daysMissing(person.reportedAt) !== 1 ? 's' : ''}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPerson(person)}
                  className="flex-1 border border-[#2a2d3a] text-gray-300 rounded-full px-3 py-2 text-sm font-medium hover:bg-[#1a1d28]"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleMarkAsFound(person._id)}
                  disabled={person.status === 'found' || !['volunteer', 'admin'].includes(userData?.role)}
                  className="flex-1 bg-purple-700 hover:bg-purple-600 text-white rounded-full px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Found
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-sm">No missing persons found. {search || filter !== 'all' ? 'Try adjusting your search.' : ''}</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#131625] border border-[#1e2130] rounded-lg p-6 max-w-md w-full max-h-80 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{selectedPerson.fullName}</h2>
              <button
                onClick={() => setSelectedPerson(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm mb-6">
              {selectedPerson.photoUrl && (
                <div className="mb-3 overflow-hidden rounded-xl border border-[#2a2d3a]">
                  <img
                    src={selectedPerson.photoUrl}
                    alt={`${selectedPerson.fullName} photo`}
                    className="w-full object-cover max-h-64"
                  />
                </div>
              )}
              <div>
                <p className="text-gray-400">Age</p>
                <p className="text-gray-200">{selectedPerson.age} years old • {selectedPerson.gender}</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className={`font-bold ${selectedPerson.status === 'found' ? 'text-green-400' : 'text-orange-400'}`}>
                  {selectedPerson.status === 'found' ? 'Found Safe' : 'Missing'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Last Known Location</p>
                <p className="text-gray-200">{selectedPerson.lastLocation}</p>
              </div>
              {selectedPerson.description && (
                <div>
                  <p className="text-gray-400">Description</p>
                  <p className="text-gray-200">{selectedPerson.description}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400">Contact Number</p>
                <p className="text-gray-200">{selectedPerson.contactNumber}</p>
              </div>
              <div>
                <p className="text-gray-400">Vulnerability</p>
                <p className="text-gray-200">{selectedPerson.vulnerability === 'none' ? 'None' : selectedPerson.vulnerability.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400">Urgency</p>
                <p className="text-gray-200">{selectedPerson.urgency.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400">Reported</p>
                <p className="text-gray-200">{new Date(selectedPerson.reportedAt).toLocaleDateString()} - {new Date(selectedPerson.reportedAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPerson(null)}
                className="flex-1 border border-[#2a2d3a] text-gray-300 rounded-full px-4 py-2 text-sm font-medium hover:bg-[#1a1d28]"
              >
                Close
              </button>
              {['volunteer', 'admin'].includes(userData?.role) && selectedPerson.status === 'missing' && (
                <button
                  onClick={() => {
                    handleMarkAsFound(selectedPerson._id);
                  }}
                  className="flex-1 bg-purple-700 hover:bg-purple-600 text-white rounded-full px-4 py-2 text-sm font-medium"
                >
                  Mark Found
                </button>
              )}
              {userData?.role === 'admin' && (
                <button
                  onClick={() => {
                    handleDelete(selectedPerson._id);
                  }}
                  className="flex-1 bg-red-700 hover:bg-red-600 text-white rounded-full px-4 py-2 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MissingPersons;
