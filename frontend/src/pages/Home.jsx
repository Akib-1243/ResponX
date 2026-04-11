import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarbonFootprint } from 'react-carbon-footprint';
import statsService from '../services/statsService';
import missingPersonService from '../services/missingPersonService';
import photoService from '../services/photoService';
import { AppContent } from '../context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContent);
  const [gCO2, bytesTransferred] = useCarbonFootprint();
  const [shelters, setShelters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalShelters: 0,
    openShelters: 0,
    openRequests: 0,
    peopleSheltered: 0,
    activeVolunteers: 0,
    resolvedRequests: 0,
    assistedToday: 0,
  });
  const [photos, setPhotos] = useState([]);
  const [missingPeople, setMissingPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const [statsResponse, photoResponse, missingResponse] = await Promise.all([
          statsService.getPublicStats(),
          photoService.getAll(),
          missingPersonService.getAll(),
        ]);

        const statsData = statsResponse.data?.data || statsResponse.data || {};
        setShelters(Array.isArray(statsData.shelters) ? statsData.shelters : []);
        setRequests(Array.isArray(statsData.requests) ? statsData.requests : []);

        setStats({
          totalShelters: Number(statsData.totalShelters) || 0,
          openShelters: Number(statsData.openShelters) || 0,
          openRequests: Number(statsData.openRequests) || 0,
          peopleSheltered: Number(statsData.peopleSheltered) || 0,
          activeVolunteers: Number(statsData.activeVolunteers) || 0,
          resolvedRequests: Number(statsData.resolvedRequests) || 0,
          assistedToday: Number(statsData.assistedToday) || 0,
        });

        setPhotos(Array.isArray(photoResponse.data?.data) ? photoResponse.data.data : []);
        setMissingPeople(Array.isArray(missingResponse.data?.data) ? missingResponse.data.data : []);
      } catch (err) {
        console.error('Landing data error:', err);
        setFetchError('Unable to load live stats right now.');
        setShelters([]);
        setRequests([]);
        setPhotos([]);
        setMissingPeople([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openRequests = stats.openRequests;
  const peopleSheltered = stats.peopleSheltered;
  const activeVolunteers = stats.activeVolunteers;
  const openShelters = stats.openShelters;
  const totalShelters = stats.totalShelters;
  const assistedToday = stats.assistedToday;

  const latestMissing = missingPeople.filter((person) => person.status === 'missing').slice(0, 4);
  const activeMissingCount = missingPeople.filter((person) => person.status === 'missing').length;
  const foundCount = missingPeople.filter((person) => person.status === 'found').length;
  const galleryPhotos = photos.slice(0, 4);

  const liveShelters = shelters.slice(0, 3);
  const liveRequests = requests
    .filter((request) => request.status === 'open')
    .sort((a, b) => {
      const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
      return (order[a.urgency] || 99) - (order[b.urgency] || 99);
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080a12] text-white">
      <header className="border-b border-[#1a1d2e] bg-[#080a12] px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#7c3aed] text-sm font-bold text-white">
              RX
            </div>
            <div>
              <div className="text-white text-sm font-semibold">ResponX</div>
              <div className="text-[11px] text-[#444]">Emergency Response Platform</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="rounded-[7px] border border-[#1e2130] bg-transparent px-4 py-2 text-[13px] font-medium text-[#888] transition hover:border-[#2e2f47]"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="rounded-[7px] bg-[#7c3aed] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#6d28d9]"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-[#1a1d2e] bg-[#0d0f1a] px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 text-[11px] text-[#888]">
          <div className="inline-flex items-center gap-2 text-[#888]">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            <span className="font-semibold uppercase tracking-[0.24em] text-[#555]">Live</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 border-r border-[#1e2130] pr-4 text-[#888]">
              <span className="font-semibold text-white">{totalShelters}</span>
              active shelter(s)
            </div>
            <div className="flex items-center gap-2 border-r border-[#1e2130] pr-4 text-[#888]">
              <span className="font-semibold text-white">{openRequests}</span>
              open requests
            </div>
            <div className="hidden md:flex items-center gap-2 border-r border-[#1e2130] pr-4 text-[#888]">
              <span className="font-semibold text-white">{activeMissingCount}</span>
              missing persons
            </div>
            <div className="hidden md:flex items-center gap-2 text-[#888]">
              <span className="font-semibold text-white">{activeVolunteers}</span>
              volunteers on duty
            </div>
          </div>
          {fetchError && <div className="ml-auto text-sm text-[#f87171]">{fetchError}</div>}
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-4 pb-12 pt-8 sm:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#3d1a6e] bg-[#120a2e] px-3 py-2 text-[11px] font-medium text-[#a78bfa]">
              <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[#22c55e]" />
              Crisis response intelligence
            </div>

            <div className="space-y-4">
              <h1 className="text-[38px] font-extrabold leading-[1.15] tracking-[-1px] text-white">
                When seconds matter, <span className="text-[#7c3aed]">clarity</span> saves lives.
              </h1>
              <p className="max-w-[650px] text-[14px] leading-7 text-[#8b95ae]">
                ResponX brings shelter capacity, urgent aid requests, missing person alerts and community photo intelligence into one operational command center.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate(isLoggedIn ? '/aid-request' : '/login')}
                className="rounded-[8px] bg-[#7c3aed] px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#6d28d9]"
              >
                Request Aid
              </button>
              <button
                onClick={() => navigate(isLoggedIn ? '/volunteer' : '/login')}
                className="rounded-[8px] border border-[#2a2d3a] bg-transparent px-5 py-3 text-[14px] font-semibold text-[#888] transition hover:border-[#3a3f5a]"
              >
                Volunteer Hub
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { title: 'Active shelters', value: totalShelters, accent: '#6366f1' },
                { title: 'Open requests', value: openRequests, accent: '#f97316' },
                { title: 'Current missing', value: activeMissingCount, accent: '#ef4444' },
                { title: 'Field updates', value: photos.length, accent: '#38bdf8' },
                { title: 'CO2 Emissions', value: `${gCO2.toFixed(2)}g`, subtitle: `${(bytesTransferred / 1024).toFixed(2)} KB`, accent: '#10b981' },
              ].map((card) => (
                <div key={card.title} className="rounded-[18px] border border-[#1e2130] bg-[#0d0f1a] p-5 shadow-[0_12px_30px_rgba(15,23,42,0.35)]">
                  <div className="mb-2 text-[11px] text-[#8b95ae] uppercase tracking-[0.18em]">{card.title}</div>
                  <div className="text-[2rem] font-semibold text-white">{card.value}</div>
                  {card.subtitle && <div className="mt-1 text-[10px] text-[#666]">{card.subtitle} transferred</div>}
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[20px] border border-[#1e2130] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.45)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#8b95ae]">Featured insight</div>
                  <h2 className="mt-2 text-[24px] font-semibold text-white">Response Snapshot</h2>
                </div>
                <div className="inline-flex items-center rounded-full border border-[#2c2f45] bg-[#111827] px-3 py-1 text-[11px] font-semibold uppercase text-[#9ca3af]">
                  Live
                </div>
              </div>
              <div className="rounded-[18px] bg-[#111827] p-5">
                <div className="mb-3 flex items-center justify-between text-[13px] text-[#9ca3af]">
                  <span>{openShelters} shelters online</span>
                  <span>{activeVolunteers} volunteers active</span>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[16px] bg-[#0d101f] p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase text-[#8b95ae]">Urgent requests</div>
                    <div className="mt-3 text-[1.8rem] font-semibold text-white">{openRequests}</div>
                  </div>
                  <div className="rounded-[16px] bg-[#0d101f] p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase text-[#8b95ae]">Case updates</div>
                    <div className="mt-3 text-[1.8rem] font-semibold text-white">{foundCount} resolved</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#1e2130] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.45)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Field imagery</div>
                  <h3 className="text-[20px] font-semibold text-white">Photo highlights</h3>
                </div>
                <button
                  onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                  className="rounded-full border border-[#2f3545] bg-[#111827] px-4 py-2 text-[11px] font-semibold text-[#cbd5e1] transition hover:border-[#3d445a]"
                >
                  View gallery
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryPhotos.length > 0 ? (
                  galleryPhotos.map((photo, index) => (
                    <button
                      key={photo._id || photo.id || index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative overflow-hidden rounded-[18px] bg-[#111827]"
                      style={{ minHeight: 180 }}
                    >
                      <img
                        src={photo.url || photo.image || photo.photoUrl}
                        alt={photo.caption || 'ResponX update'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 py-3 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="text-sm font-semibold text-white">{photo.caption || 'ResponX update'}</div>
                        <div className="mt-1 text-[11px] text-[#9ca3af]">{photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Recent'}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[16px] bg-[#111827] p-5 text-[13px] text-[#8b95ae]">No gallery images available yet.</div>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Shelter status</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Live shelter operations</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{liveShelters.length} tracked</span>
              </div>
              {liveShelters.length > 0 ? (
                <div className="space-y-4">
                  {liveShelters.map((shelter) => {
                    const fill = shelter.total ? Math.min(100, Math.round((shelter.capacity / shelter.total) * 100)) : 0;
                    const fillColor = fill >= 90 ? '#ef4444' : fill >= 70 ? '#f97316' : '#22c55e';
                    return (
                      <div key={shelter._id} className="space-y-3 rounded-[16px] bg-[#111827] p-4">
                        <div className="flex items-center justify-between text-sm text-[#cbd5e1]">
                          <span className="font-semibold text-white">{shelter.name}</span>
                          <span>{shelter.capacity}/{shelter.total}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1e293b]">
                          <div className="h-2 rounded-full" style={{ width: `${fill}%`, backgroundColor: fillColor }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#9ca3af]">
                          <span>{shelter.location || 'Location unavailable'}</span>
                          <span>{fill}% full</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#8b95ae]">No shelter data available.</p>
              )}
            </div>

            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Urgent request feed</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Top emergency requests</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{liveRequests.length} open</span>
              </div>
              {liveRequests.length > 0 ? (
                <div className="space-y-4">
                  {liveRequests.map((request) => {
                    const urgencyColor = request.urgency === 'Critical' ? '#f87171' : request.urgency === 'High' ? '#fb923c' : '#fbbf24';
                    return (
                      <div key={request._id} className="rounded-[16px] bg-[#111827] p-4">
                        <div className="flex items-center justify-between gap-3 text-[13px] text-[#cbd5e1]">
                          <span className="font-semibold text-white">{request.type || 'Aid'} — {request.location}</span>
                          <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: urgencyColor + '22', color: urgencyColor }}>
                            {request.urgency || 'Normal'}
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] leading-6 text-[#9ca3af]">
                          {request.description || request.details || 'Request is awaiting support.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#8b95ae]">No open requests available.</p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Missing persons</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Watchlist</h2>
                </div>
                <button
                  onClick={() => navigate('/missing-persons')}
                  className="rounded-full border border-[#2f3545] bg-[#111827] px-4 py-2 text-[11px] font-semibold text-[#cbd5e1] transition hover:border-[#3d445a]"
                >
                  View all cases
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-[16px] bg-[#111827] p-4">
                  <div className="flex items-center justify-between text-[13px] text-[#9ca3af]">
                    <span className="font-semibold text-white">Open cases</span>
                    <span className="text-[#ef4444]">{activeMissingCount}</span>
                  </div>
                  <div className="mt-3 text-[2rem] font-semibold text-white">{missingPeople.length}</div>
                  <div className="mt-1 text-[12px] text-[#8b95ae]">Total reports in the system</div>
                </div>

                {latestMissing.length > 0 ? (
                  <div className="grid gap-3">
                    {latestMissing.map((person) => (
                      <div key={person._id} className="rounded-[16px] border border-[#1b2030] bg-[#111827] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{person.fullName}</div>
                            <div className="mt-1 text-[12px] text-[#8b95ae]">Last seen: {person.lastLocation || 'Unknown'}</div>
                          </div>
                          <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold uppercase text-[#cbd5e1]">
                            {person.urgency || 'Normal'}
                          </span>
                        </div>
                        <div className="mt-3 text-[12px] leading-6 text-[#9ca3af]">
                          Age {person.age || 'N/A'} • {person.gender || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8b95ae]">No missing person reports available yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Photo gallery</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Field imagery</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{photos.length} images</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryPhotos.length > 0 ? (
                  galleryPhotos.map((photo, index) => (
                    <button
                      key={photo._id || photo.id || index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative overflow-hidden rounded-[18px] bg-[#111827]"
                      style={{ minHeight: 170 }}
                    >
                      <img
                        src={photo.url || photo.image || photo.photoUrl}
                        alt={photo.caption || 'Field update'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 py-3 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="text-sm font-semibold text-white">{photo.caption || 'Field update'}</div>
                        <div className="mt-1 text-[11px] text-[#9ca3af]">{photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Recent'}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[16px] bg-[#111827] p-5 text-[13px] text-[#8b95ae]">No gallery images available yet.</div>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Shelter status</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Live shelter operations</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{liveShelters.length} tracked</span>
              </div>
              {liveShelters.length > 0 ? (
                <div className="space-y-4">
                  {liveShelters.map((shelter) => {
                    const fill = shelter.total ? Math.min(100, Math.round((shelter.capacity / shelter.total) * 100)) : 0;
                    const fillColor = fill >= 90 ? '#ef4444' : fill >= 70 ? '#f97316' : '#22c55e';
                    return (
                      <div key={shelter._id} className="space-y-3 rounded-[16px] bg-[#111827] p-4">
                        <div className="flex items-center justify-between text-sm text-[#cbd5e1]">
                          <span className="font-semibold text-white">{shelter.name}</span>
                          <span>{shelter.capacity}/{shelter.total}</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#1e293b]">
                          <div className="h-2 rounded-full" style={{ width: `${fill}%`, backgroundColor: fillColor }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#9ca3af]">
                          <span>{shelter.location || 'Location unavailable'}</span>
                          <span>{fill}% full</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#8b95ae]">No shelter data available.</p>
              )}
            </div>

            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Urgent request feed</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Top emergency requests</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{liveRequests.length} open</span>
              </div>
              {liveRequests.length > 0 ? (
                <div className="space-y-4">
                  {liveRequests.map((request) => {
                    const urgencyColor = request.urgency === 'Critical' ? '#f87171' : request.urgency === 'High' ? '#fb923c' : '#fbbf24';
                    return (
                      <div key={request._id} className="rounded-[16px] bg-[#111827] p-4">
                        <div className="flex items-center justify-between gap-3 text-[13px] text-[#cbd5e1]">
                          <span className="font-semibold text-white">{request.type || 'Aid'} — {request.location}</span>
                          <span className="rounded-full px-2 py-1 text-[11px] font-semibold" style={{ backgroundColor: urgencyColor + '22', color: urgencyColor }}>
                            {request.urgency || 'Normal'}
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] leading-6 text-[#9ca3af]">
                          {request.description || request.details || 'Request is awaiting support.'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#8b95ae]">No open requests available.</p>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Missing persons</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Watchlist</h2>
                </div>
                <button
                  onClick={() => navigate('/missing-persons')}
                  className="rounded-full border border-[#2f3545] bg-[#111827] px-4 py-2 text-[11px] font-semibold text-[#cbd5e1] transition hover:border-[#3d445a]"
                >
                  View all cases
                </button>
              </div>
              <div className="space-y-4">
                <div className="rounded-[16px] bg-[#111827] p-4">
                  <div className="flex items-center justify-between text-[13px] text-[#9ca3af]">
                    <span className="font-semibold text-white">Open cases</span>
                    <span className="text-[#ef4444]">{activeMissingCount}</span>
                  </div>
                  <div className="mt-3 text-[2rem] font-semibold text-white">{missingPeople.length}</div>
                  <div className="mt-1 text-[12px] text-[#8b95ae]">Total reports in the system</div>
                </div>

                {latestMissing.length > 0 ? (
                  <div className="grid gap-3">
                    {latestMissing.map((person) => (
                      <div key={person._id} className="rounded-[16px] border border-[#1b2030] bg-[#111827] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{person.fullName}</div>
                            <div className="mt-1 text-[12px] text-[#8b95ae]">Last seen: {person.lastLocation || 'Unknown'}</div>
                          </div>
                          <span className="rounded-full bg-[#1f2937] px-3 py-1 text-[10px] font-semibold uppercase text-[#cbd5e1]">
                            {person.urgency || 'Normal'}
                          </span>
                        </div>
                        <div className="mt-3 text-[12px] leading-6 text-[#9ca3af]">
                          Age {person.age || 'N/A'} • {person.gender || 'Unknown'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-[#8b95ae]">No missing person reports available yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#1a1d2e] bg-[#0d0f1a] p-6 shadow-[0_25px_60px_rgba(10,14,34,0.35)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8b95ae]">Photo gallery</div>
                  <h2 className="mt-2 text-[20px] font-semibold text-white">Field imagery</h2>
                </div>
                <span className="rounded-full bg-[#111827] px-3 py-1 text-[11px] font-semibold text-[#9ca3af]">{photos.length} images</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {galleryPhotos.length > 0 ? (
                  galleryPhotos.map((photo, index) => (
                    <button
                      key={photo._id || photo.id || index}
                      onClick={() => setSelectedPhoto(photo)}
                      className="group relative overflow-hidden rounded-[18px] bg-[#111827]"
                      style={{ minHeight: 170 }}
                    >
                      <img
                        src={photo.url || photo.image || photo.photoUrl}
                        alt={photo.caption || 'Field update'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 py-3 opacity-0 transition duration-300 group-hover:opacity-100">
                        <div className="text-sm font-semibold text-white">{photo.caption || 'Field update'}</div>
                        <div className="mt-1 text-[11px] text-[#9ca3af]">{photo.createdAt ? new Date(photo.createdAt).toLocaleDateString() : 'Recent'}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-[16px] bg-[#111827] p-5 text-[13px] text-[#8b95ae]">No gallery images available yet.</div>
                )}
              </div>
            </div>
          </aside>
        </section>

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
                backgroundColor: '#0d111f',
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
                onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.7)')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)')}
              >
                ✕
              </button>

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

              <div style={{ padding: '2rem', borderTop: '1px solid rgba(148,163,184,0.15)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
                  {selectedPhoto.caption || 'Community Photo'}
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                  {selectedPhoto.createdAt ? `Shared on ${new Date(selectedPhoto.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : 'Recently shared'}
                </p>
                {selectedPhoto.uploadedBy && (
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    By <strong>{selectedPhoto.uploadedBy.name || 'Admin'}</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

 