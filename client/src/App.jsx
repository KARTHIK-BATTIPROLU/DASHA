import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import Branches from './pages/Branches';
import PDFViewer from './pages/PDFViewer';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
      {/* Persisted Floating Glass Navbar */}
      <Navbar />
      
      <Routes>
        {/* Public Enduser Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/colleges/:exam" element={<Colleges />} />
        <Route path="/branches/:collegeId" element={<Branches />} />
        <Route path="/pdf/:branchId" element={<PDFViewer />} />

        {/* Admin Secured Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
   </AuthProvider>
  );
}

export default App;
