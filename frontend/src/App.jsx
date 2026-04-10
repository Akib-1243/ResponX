import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import DashboardView from './pages/DashboardView';
import AidRequest from './pages/AidRequest';
import VolunteerDashboard from './pages/VolunteerDashboard';
import SheltersView from './pages/SheltersView';
import AdminView from './pages/AdminView';
import CreateShelter from './pages/CreateShelter';
import Navbar from './components/Navbar';
import TabNavigation from './components/TabNavigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FeatureLayout = ({ children }) => (
  <>
    <Navbar />
    <div className="feature-shell">
      <TabNavigation />
      {children}
    </div>
  </>
);

const App = () => {
  return (
    <div className="app-shell">
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route path='/dashboard' element={<FeatureLayout><DashboardView /></FeatureLayout>} />
        <Route path='/aid-request' element={<FeatureLayout><AidRequest /></FeatureLayout>} />
        <Route path='/volunteer' element={<FeatureLayout><VolunteerDashboard /></FeatureLayout>} />
        <Route path='/shelters' element={<FeatureLayout><SheltersView /></FeatureLayout>} />
        <Route path='/admin' element={<FeatureLayout><AdminView /></FeatureLayout>} />
        <Route path='/admin/create-shelter' element={<FeatureLayout><CreateShelter /></FeatureLayout>} />
      </Routes>
    </div>
  );
};

export default App;

