import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Colleges from './pages/Colleges';
import Branches from './pages/Branches';
import PDFViewer from './pages/PDFViewer';
import Onboarding from './pages/Onboarding';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// Redirects logged-in users with incomplete profiles to /onboarding
// Skips admin routes and the onboarding route itself
const OnboardingGuard = ({ children }) => {
  const { currentUser, profileCompleted } = useAuth();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isOnboarding = location.pathname === '/onboarding';

  if (currentUser && !profileCompleted && !isAdminRoute && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent logged-in users with complete profiles from revisiting /onboarding
  if (currentUser && profileCompleted && isOnboarding) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <OnboardingGuard>
        <Routes>
          {/* Public Enduser Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/colleges/:exam" element={<Colleges />} />
          <Route path="/branches/:collegeId" element={<Branches />} />
          <Route path="/pdf/:branchId" element={<PDFViewer />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Admin Secured Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </OnboardingGuard>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
