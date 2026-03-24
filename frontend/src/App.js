import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AidRequest from './pages/AidRequest';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/aid-request" element={<AidRequest />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;