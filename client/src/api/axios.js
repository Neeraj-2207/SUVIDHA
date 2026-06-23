// axios.js
// A pre-configured Axios instance for SUVIDHA
// Every API call in the app uses this — not raw axios
// Benefits:
//   1. Base URL set once — not repeated everywhere
//   2. Token automatically attached to every request
//   3. One place to handle global errors

import axios from 'axios';

// Create a custom axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  // Every request goes to http://localhost:5000/api/...
  // So axios.post('/auth/login') calls http://localhost:5000/api/auth/login
});

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs before EVERY request is sent
// Perfect place to attach the JWT token
// ─────────────────────────────────────────
API.interceptors.request.use(
  (config) => {
    // Read token from localStorage
    const token = localStorage.getItem('suvidha_token');

    if (token) {
      // Attach token to Authorization header
      // Backend's protect middleware reads this
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Must return config to continue
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs after EVERY response is received
// Perfect place to handle expired tokens globally
// ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response, // Success — just pass through

  (error) => {
    // If server returns 401 (Unauthorized)
    // Token is expired or invalid — force logout
    if (error.response?.status === 401) {
      localStorage.removeItem('suvidha_token');
      localStorage.removeItem('suvidha_user');
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default API;