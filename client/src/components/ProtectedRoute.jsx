// ProtectedRoute.jsx
// A wrapper component that checks if user is logged in
// If not → redirects to /login
// If yes → renders the actual page

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  // Still checking auth status — show nothing
  if (loading) return null;

  // Not logged in — redirect to login page
  // 'replace' means the login page replaces current
  // history entry so back button doesn't loop
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Logged in — render the actual page
  return children;
};

export default ProtectedRoute;