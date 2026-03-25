import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AidRequest from './pages/AidRequest';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/aid-request" replace />} />
        <Route path="/aid-request" element={<AidRequest />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;