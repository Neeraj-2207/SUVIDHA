import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardHome  from './pages/DashboardHome';
import ProfilePage    from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected + Layout wrapped routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Nested routes — render inside Layout's <Outlet /> */}
            <Route index          element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Placeholder routes — we'll build these in later steps */}
            <Route path="bills"      element={<ComingSoon name="Bill Management" />} />
            <Route path="complaints" element={<ComingSoon name="Complaints" />} />
            <Route path="services"   element={<ComingSoon name="Service Requests" />} />
            <Route path="documents"  element={<ComingSoon name="Documents" />} />
            <Route path="ai"         element={<ComingSoon name="AI Assistant" />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Temporary placeholder for routes not built yet
const ComingSoon = ({ name }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-2xl mb-2">🚧</p>
      <p className="text-sm font-medium" style={{ color: '#0f172a' }}>{name}</p>
      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Coming in the next step</p>
    </div>
  </div>
);

export default App;