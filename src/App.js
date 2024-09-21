import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HostProvider } from './contexts/HostContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import HostManagementPage from './pages/HostManagementPage';
import VerificationPage from './pages/VerificationPage';
import NotFoundPage from './pages/NotFoundPage';
import ReportPage from './pages/ReportPage';
import HostProfilePage from './pages/HostProfilePage';
import UserDashboardPage from './pages/UserDashboardPage'; 
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
    <AuthProvider>
      <HostProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify/:id" element={<VerificationPage />} />
            <Route
              path="/"
              element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
            >
              {/* Use 'index' to ensure it's the main route under DashboardLayout */}
              <Route index element={<DashboardSwitcher />} />
              <Route path="signup" element={<ProtectedRoute roles={['admin']}><SignUpPage /></ProtectedRoute>} />
              <Route path="host-management" element={<ProtectedRoute roles={['admin']}><HostManagementPage /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute roles={['security', 'admin']}><ReportPage /></ProtectedRoute>} />
              <Route path="user-management" element={<ProtectedRoute roles={['admin']}><UserManagementPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            {/* Fallback route for profile */}
            <Route path="/profile" element={<ProtectedRoute roles={['user']}><HostProfilePage /></ProtectedRoute>} />
            {/* Catch-all route for unmatched paths */}

          </Routes>
        </Router>
      </HostProvider>
    </AuthProvider>
  );
}

function DashboardSwitcher() {
  const { userRole } = useAuth();

  if (userRole === 'user' || userRole === 'security') {
    return <UserDashboardPage />;
  } else if (userRole === 'admin') {
    return <DashboardPage />;
  } else {
    return <NotFoundPage />;
  }
}

export default App;
