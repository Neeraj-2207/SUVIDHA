// App.jsx
// The root component — defines all routes
// Wraps everything in AuthProvider so all pages
// can access authentication state

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage     from './pages/LoginPage';
import RegisterPage  from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    // BrowserRouter enables URL-based routing
    <BrowserRouter>
      {/* AuthProvider wraps everything so all components
          can access user, login(), logout() */}
      <AuthProvider>
        <Routes>

          {/* Public Routes — no login needed */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes — must be logged in */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          {/* Anyone visiting "/" goes to /dashboard */}
          {/* ProtectedRoute will push them to /login if not logged in */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;