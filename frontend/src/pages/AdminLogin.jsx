import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

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
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-gray-900 to-slate-800'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='ResponX'
        className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
      />
      <div className='bg-slate-950 p-10 rounded-lg shadow-xl w-full sm:w-96 text-indigo-100'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>Admin Access</h2>
        <p className='text-center text-sm mb-6'>This page is for authorized administrators only. Do not share this URL publicly.</p>

        <form onSubmit={handleSubmit}>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#1e293b]'>
            <img src={assets.mail_icon} alt='Email' />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none w-full text-white'
              type='email'
              placeholder='Admin email'
              required
            />
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#1e293b]'>
            <img src={assets.lock_icon} alt='Password' />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none w-full text-white'
              type='password'
              placeholder='Password'
              required
            />
          </div>

          <button
            className='w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-slate-900 text-white font-medium'
            type='submit'
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Admin Sign In'}
          </button>
        </form>

        <p className='text-gray-400 text-center text-xs mt-4'>
          If you are not an admin, please use the{' '}
          <span onClick={() => navigate('/login')} className='text-blue-400 cursor-pointer underline'>regular login</span> page.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
