// DashboardPage.jsx — Temporary placeholder
// We'll replace this with the full dashboard in Step 5

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">

        <div className="text-5xl mb-4">🏛️</div>
        <h1 className="text-2xl font-bold text-indigo-700 mb-2">
          Welcome to SUVIDHA!
        </h1>
        <p className="text-gray-600 mb-1">
          Hello, <span className="font-semibold">{user?.name}</span>!
        </p>
        <p className="text-gray-500 text-sm mb-2">
          Role: <span className="capitalize font-medium text-indigo-600">{user?.role}</span>
        </p>
        {user?.ward && (
          <p className="text-gray-500 text-sm mb-6">
            Ward: <span className="font-medium">{user?.ward}</span>
          </p>
        )}

        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
          ✅ Authentication is working correctly!
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;