import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import statsService from '../services/statsService';
import { AppContent } from '../context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AppContent);
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
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setFetchError('');

      try {
        const response = await statsService.getPublicStats();
        const data = response.data?.data || response.data || {};

        setShelters(Array.isArray(data.shelters) ? data.shelters : []);
        setRequests(Array.isArray(data.requests) ? data.requests : []);
        setStats({
          totalShelters: Number(data.totalShelters) || 0,
          openShelters: Number(data.openShelters) || 0,
          openRequests: Number(data.openRequests) || 0,
          peopleSheltered: Number(data.peopleSheltered) || 0,
          activeVolunteers: Number(data.activeVolunteers) || 0,
          resolvedRequests: Number(data.resolvedRequests) || 0,
          assistedToday: Number(data.assistedToday) || 0,
        });
        setFetchError('');
      } catch (err) {
        console.error('Landing data error:', err);
        setFetchError('Unable to load live stats right now.');
        setShelters([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const openRequests = stats.openRequests;
  const resolvedRequests = stats.resolvedRequests;
  const peopleSheltered = stats.peopleSheltered;
  const activeVolunteers = stats.activeVolunteers;
  const openShelters = stats.openShelters;
  const totalShelters = stats.totalShelters;
  const assistedToday = stats.assistedToday;

  const liveShelters = shelters.slice(0, 3);
  const liveRequests = requests
    .filter((request) => request.status === 'open')
    .sort((a, b) => {
      const order = { Critical: 1, High: 2, Medium: 3, Low: 4 };
      return (order[a.urgency] || 99) - (order[b.urgency] || 99);
    })
    .slice(0, 3);

  const initials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const volunteerAvatars = [
    { label: 'AR', bg: '#7c3aed' },
    { label: 'JS', bg: '#0f766e' },
    { label: 'MT', bg: '#b45309' },
    { label: 'LN', bg: '#991b1b' },
  ];

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
              <span className="font-semibold text-white">{peopleSheltered}</span>
              people sheltered
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
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-[6px] border border-[#3d1a6e] bg-[#120a2e] px-3 py-2 text-[11px] font-medium text-[#a78bfa]">
              <span className="inline-flex h-[6px] w-[6px] rounded-full bg-[#22c55e]" />
              Real-time crisis coordination
            </div>

            <div className="space-y-4">
              <h1 className="text-[38px] font-extrabold leading-[1.15] tracking-[-1px] text-white">
                When seconds matter, <span className="text-[#7c3aed]">clarity</span> saves lives.
              </h1>
              <p className="max-w-[420px] text-[14px] leading-7 text-[#666]">
                ResponX centralises shelter capacity, aid requests, and volunteer coordination into one real-time dashboard — cutting through the chaos when it matters most.
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex -space-x-2">
                {volunteerAvatars.map((avatar, index) => (
                  <div
                    key={index}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#080a12] text-[11px] font-semibold text-white"
                    style={{ backgroundColor: avatar.bg, marginLeft: index === 0 ? '0' : '-8px' }}
                  >
                    {avatar.label}
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#555]">
                <span className="text-[#888] font-semibold">{peopleSheltered}</span> people assisted in the last 24 hours
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[10px] border border-[#1a1d2e] bg-[#0d0f1a] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12px] font-semibold text-white">Shelter status</h2>
                <span className="rounded-[5px] border border-[#14532d] bg-[#052010] px-2.5 py-1 text-[10px] font-semibold text-[#22c55e]">
                  Live
                </span>
              </div>
              {liveShelters.length > 0 ? (
                liveShelters.map((shelter) => {
                  const fill = shelter.total ? Math.min(100, Math.round((shelter.capacity / shelter.total) * 100)) : 0;
                  const fillColor = fill >= 90 ? '#ef4444' : fill >= 70 ? '#f97316' : '#22c55e';
                  return (
                    <div key={shelter._id} className="space-y-2 border-b border-[#111520] pb-3 last:border-none last:pb-0">
                      <div className="flex items-center justify-between text-[12px] text-[#bbb]">
                        <span>{shelter.name}</span>
                        <span className="text-[#555]">{shelter.capacity}/{shelter.total}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1a1d2e]">
                        <div className="h-1.5 rounded-full" style={{ width: `${fill}%`, backgroundColor: fillColor }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[12px] text-[#666]">No shelter data available.</p>
              )}
            </div>

            <div className="rounded-[10px] border border-[#1a1d2e] bg-[#0d0f1a] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[12px] font-semibold text-white">Active aid requests</h2>
                <span className="rounded-[5px] border border-[#7c2d12] bg-[#2d1a0a] px-2.5 py-1 text-[10px] font-semibold text-[#f97316]">
                  {openRequests} open
                </span>
              </div>
              {liveRequests.length > 0 ? (
                liveRequests.map((request) => {
                  const urgencyColor = request.urgency === 'Critical' ? '#f87171' : request.urgency === 'High' ? '#fb923c' : '#fbbf24';
                  return (
                    <div key={request._id} className="flex items-center gap-3 border-b border-[#111520] py-3 last:border-none">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: urgencyColor }} />
                      <div className="min-w-0 flex-1 text-[12px] text-[#bbb]">
                        {request.type} — {request.location}
                      </div>
                      <span
                        className={`rounded-[4px] px-2 py-1 text-[10px] font-semibold ${
                          request.urgency === 'Critical'
                            ? 'bg-[#3d0a0a] text-[#f87171]'
                            : 'bg-[#2d1a0a] text-[#fb923c]'
                        }`}
                      >
                        {request.urgency.toLowerCase()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-[12px] text-[#666]">No open requests available.</p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { label: 'People assisted today', value: assistedToday },
                { label: 'Active volunteers', value: activeVolunteers },
                { label: 'Requests resolved', value: resolvedRequests },
                { label: 'Open shelters', value: openShelters },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[7px] border border-[#111520] bg-[#080a12] p-3">
                  <div className="text-[18px] font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-[10px] text-[#555]">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: '🏠',
              iconBg: '#1e1040',
              title: 'Live shelter tracking',
              desc: 'Real-time occupancy counts so victims always reach a shelter with space.',
            },
            {
              icon: '✓',
              iconBg: '#0a2d1a',
              title: 'Verified volunteers',
              desc: 'Admin-verified badges eliminate misinformation and build trust on the ground.',
            },
            {
              icon: '⚡',
              iconBg: '#2d1a0a',
              title: 'Priority aid routing',
              desc: 'Urgent requests are surfaced instantly so volunteers respond where they’re needed most.',
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-[10px] border border-[#1a1d2e] bg-[#0d0f1a] p-4">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ backgroundColor: feature.iconBg }}>
                <span className="text-sm">{feature.icon}</span>
              </div>
              <h3 className="text-[13px] font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-[12px] leading-6 text-[#555]">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Home;

 