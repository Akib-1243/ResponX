import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import DashboardView from './pages/DashboardView';
import AidRequest from './pages/AidRequest';
import VolunteerDashboard from './pages/VolunteerDashboard';
import SheltersView from './pages/SheltersView';
import AdminView from './pages/AdminView';
import CreateShelter from './pages/CreateShelter';
import MissingPersons from './pages/MissingPersons';
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
  const location = useLocation();

  useEffect(() => {
    const revealSelector = [
      '.stat-card',
      '.photo-card',
      '.upload-card',
      '.shelter-card',
      '.request-card',
      '.sidebar-card',
      '.missing-summary-card',
      '.missing-critical-card',
      '.request-summary-card',
      '.admin-panel-card',
    ].join(', ');

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const observeElements = (root = document) => {
      const elements = Array.from(root.querySelectorAll(revealSelector));
      elements.forEach((element) => {
        if (!element.classList.contains('reveal-visible')) {
          element.classList.add('reveal-item');
          observer.observe(element);
        }
      });
    };

    observeElements();

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches(revealSelector)) {
            observeElements(node.parentElement || document);
          } else if (node.querySelectorAll) {
            observeElements(node);
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [location]);

  return (
    <div className="app-shell">
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route path='/dashboard' element={<FeatureLayout><DashboardView /></FeatureLayout>} />
        <Route path='/aid-request' element={<FeatureLayout><AidRequest /></FeatureLayout>} />
        <Route path='/volunteer' element={<FeatureLayout><VolunteerDashboard /></FeatureLayout>} />
        <Route path='/shelters' element={<FeatureLayout><SheltersView /></FeatureLayout>} />
        <Route path='/missing-persons' element={<FeatureLayout><MissingPersons /></FeatureLayout>} />
        <Route path='/admin' element={<FeatureLayout><AdminView /></FeatureLayout>} />
        <Route path='/admin/create-shelter' element={<FeatureLayout><CreateShelter /></FeatureLayout>} />
      </Routes>
    </div>
  );
};

export default App;

