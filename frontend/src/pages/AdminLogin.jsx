import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      if (data.success) {
        const user = await getUserData();
        if (user && user.role === 'admin') {
          setIsLoggedIn(true);
          navigate('/admin');
          return;
        }

        toast.error('Only admins may access this page. Please use the regular login page.');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c16] flex items-center justify-content-center p-6">
      <div className="w-full max-w-[900px] flex border border-[#1e2130] rounded-xl overflow-hidden min-h-[540px]">
        {/* Left Panel - Branding */}
        <div className="hidden md:flex w-[42%] bg-[#0d0f1a] border-r border-[#1e2130] p-10 flex-col justify-between">
          {/* Logo Row */}
          <div className="flex items-center gap-2.5">
            <div className="w-[38px] h-[38px] bg-[#7c3aed] rounded-[10px] flex items-center justify-center">
              <span className="text-white font-bold text-base">RX</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">ResponX</div>
              <div className="text-[#555] text-[11px]">Emergency Response Platform</div>
            </div>
          </div>

          {/* Middle Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-white text-2xl font-bold mb-4 leading-tight">
              Administrator<br />Control Centre
            </h1>
            <p className="text-[#555] text-sm mb-8 leading-relaxed">
              Restricted access area. All login attempts are logged and monitored for security compliance.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#2d1a0a] rounded-lg flex items-center justify-center">
                  <span className="text-orange-400 text-sm">🔐</span>
                </div>
                <span className="text-[#888] text-[12px]">Two-factor authentication enforced</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#1e1040] rounded-lg flex items-center justify-center">
                  <span className="text-[#7c3aed] text-sm">📊</span>
                </div>
                <span className="text-[#888] text-[12px]">Full audit trail of all admin actions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#0a2d1a] rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-sm">⏰</span>
                </div>
                <span className="text-[#888] text-[12px]">Sessions expire after 2 hours</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-[#333] text-[11px]">
            © 2026 ResponX · Emergency Response Platform
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-[58%] bg-[#0a0c16] p-10 flex flex-col justify-center">
          {/* Mobile Logo - Only visible on small screens */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <div className="w-[38px] h-[38px] bg-[#7c3aed] rounded-[10px] flex items-center justify-center">
              <span className="text-white font-bold text-base">RX</span>
            </div>
            <div>
              <div className="text-white font-bold text-lg">ResponX</div>
              <div className="text-[#555] text-[11px]">Emergency Response Platform</div>
            </div>
          </div>

          <div className="max-w-md mx-auto w-full">
            {/* Admin Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#1a0a2e] border border-[#3d1a6e] rounded px-3 py-1.5 mb-5">
              <span className="text-sm">🔐</span>
              <span className="text-[#a78bfa] text-[11px] font-medium">Administrator Access Only</span>
            </div>

            <h2 className="text-white text-xl font-bold mb-2">Admin sign in</h2>
            <p className="text-[#555] text-sm mb-6">Enter your administrator credentials to continue</p>

            {/* Warning Box */}
            <div className="bg-[#1a0a0a] border border-[#3d0a0a] rounded-lg p-3.5 mb-6">
              <p className="text-[#f87171] text-[12px] leading-relaxed">
                ⚠ This portal is for authorized system administrators only. Do not share this URL publicly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Admin email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@responx.org"
                  className="w-full bg-[#111320] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:border-[#7c3aed] outline-none"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111320] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:border-[#7c3aed] outline-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#991b1b] hover:bg-[#7f1d1d] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Accessing...' : 'Access Admin Panel'}
              </button>
            </form>

            {/* Divider */}
            <hr className="border-[#1e2130] my-3.5" />

            {/* Return to Regular Login */}
            <p className="text-center">
              <span
                onClick={() => navigate('/login')}
                className="text-[#7c3aed] text-sm cursor-pointer hover:underline"
              >
                Return to regular login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
