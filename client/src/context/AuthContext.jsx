// AuthContext.jsx
// The global authentication state manager
// Any component in the app can read/update auth state
// without passing props through every level

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

// ─────────────────────────────────────────
// STEP 1: Create the Context
// Think of this as creating an empty container
// that will hold our auth data
// ─────────────────────────────────────────
const AuthContext = createContext(null);

// ─────────────────────────────────────────
// STEP 2: Create the Provider Component
// This wraps the entire app and provides
// auth data to every child component
// ─────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  // user = the logged-in user object (or null)
  const [user, setUser] = useState(null);

  // loading = true while we check localStorage on startup
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────
  // On app startup — check if user was already logged in
  // (token saved in localStorage from previous session)
  // ─────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('suvidha_token');
    const savedUser = localStorage.getItem('suvidha_user');

    if (token && savedUser) {
      // Restore the user from localStorage
      setUser(JSON.parse(savedUser));
    }

    // Done checking — allow app to render
    setLoading(false);
  }, []); // Empty array = run only once when app starts

  // ─────────────────────────────────────────
  // LOGIN FUNCTION
  // Called from LoginPage after successful API call
  // ─────────────────────────────────────────
  const login = (userData, token) => {
    // Save to localStorage so user stays logged in
    // even after browser refresh
    localStorage.setItem('suvidha_token', token);
    localStorage.setItem('suvidha_user', JSON.stringify(userData));

    // Update React state — triggers re-render
    setUser(userData);
  };

  // ─────────────────────────────────────────
  // LOGOUT FUNCTION
  // Clears everything and redirects to login
  // ─────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('suvidha_token');
    localStorage.removeItem('suvidha_user');
    setUser(null);
  };

  // ─────────────────────────────────────────
  // STEP 3: Provide the context value
  // Everything inside 'value' is accessible
  // to any child component via useAuth()
  // ─────────────────────────────────────────
  const value = {
    user,        // The current user object (or null)
    loading,     // Is app still initializing?
    login,       // Call this to log in
    logout,      // Call this to log out
    isLoggedIn: !!user,          // Boolean: is user logged in?
    isAdmin: user?.role === 'admin'  // Boolean: is user an admin?
  };

  // Don't render children until we know auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading SUVIDHA...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────
// STEP 4: Custom Hook
// Instead of importing AuthContext everywhere,
// components just call useAuth()
// ─────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

export default AuthContext;