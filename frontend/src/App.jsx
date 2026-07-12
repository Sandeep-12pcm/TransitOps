import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import VehicleRegistry from './pages/VehicleRegistry';

function App() {
  return (
    <Router>
      {/* Toast notifications handler */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000, 
          style: {
            fontFamily: 'Outfit, Inter, sans-serif font-semibold',
            background: '#0f172a',
            color: '#fff',
            borderRadius: '0.75rem',
            border: '1px solid #334155'
          }
        }} 
      />
      
      {/* Route mapping */}
      <Routes>
        <Route path="/" element={<Navigate to="/vehicles" replace />} />
        <Route path="/vehicles" element={<VehicleRegistry />} />
        {/* Wildcard redirect back to vehicles */}
        <Route path="*" element={<Navigate to="/vehicles" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
