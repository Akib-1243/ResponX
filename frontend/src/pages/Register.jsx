import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContent);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('requester');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
        role
      });

      if (data.success) {
        const user = await getUserData();
        if (user) {
          setIsLoggedIn(true);
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/dashboard');
          }
        } else {
          toast.error('Failed to verify auth data after registration.');
        }
      } else {
        toast.error(data.message);
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
              Join the<br />response network.
            </h1>
            <p className="text-[#555] text-sm mb-8 leading-relaxed">
              Whether you need help or want to provide it — create your account and connect with your community.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#1e1040] rounded-lg flex items-center justify-center">
                  <span className="text-[#7c3aed] text-sm">📦</span>
                </div>
                <span className="text-[#888] text-[12px]">Requesters get immediate aid routing</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#0a2d1a] rounded-lg flex items-center justify-center">
                  <span className="text-green-400 text-sm">✅</span>
                </div>
                <span className="text-[#888] text-[12px]">Volunteers earn verified trust badges</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#2d1a0a] rounded-lg flex items-center justify-center">
                  <span className="text-orange-400 text-sm">🔒</span>
                </div>
                <span className="text-[#888] text-[12px]">Secure, verified accounts only</span>
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
            <h2 className="text-white text-xl font-bold mb-2">Create your account</h2>
            <p className="text-[#555] text-sm mb-8">Get started with ResponX in under a minute</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#111320] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:border-[#7c3aed] outline-none"
                  required
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                  Account type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setRole('requester')}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      role === 'requester'
                        ? 'border-[#7c3aed] bg-[#1a0a35]'
                        : 'border-[#1e2130] bg-[#111320]'
                    }`}
                  >
                    <div className="text-white text-sm font-semibold mb-1">Requester</div>
                    <div className="text-[#555] text-[11px]">I need aid or shelter</div>
                  </div>
                  <div
                    onClick={() => setRole('volunteer')}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      role === 'volunteer'
                        ? 'border-[#7c3aed] bg-[#1a0a35]'
                        : 'border-[#1e2130] bg-[#111320]'
                    }`}
                  >
                    <div className="text-white text-sm font-semibold mb-1">Volunteer</div>
                    <div className="text-[#555] text-[11px]">I want to help others</div>
                  </div>
                </div>
              </div>

              {/* Email and Password Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#555] uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#111320] border border-[#1e2130] rounded-lg px-3.5 py-2.5 text-white text-sm placeholder-[#333] focus:border-[#7c3aed] outline-none"
                    required
                  />
                </div>
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-semibold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {/* Switch to Login */}
            <p className="text-[#555] text-sm text-center mt-6">
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-[#7c3aed] cursor-pointer hover:underline"
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
