// AdminDashboard.jsx
// Overview page for admins — platform-wide stats

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// Stat card component
const StatCard = ({ label, value, sub, color, prefix }) => (
  <div className="rounded-xl p-5"
    style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
    <p className="text-xs uppercase tracking-wider mb-2"
      style={{ color: '#94a3b8' }}>
      {label}
    </p>
    <p className="text-2xl font-medium"
      style={{ color: color || '#0f172a', letterSpacing: '-0.02em' }}>
      {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
    </p>
    {sub && (
      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{sub}</p>
    )}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data.stats);
      setRecent(res.data.recentComplaints);
    } catch (err) {
      console.error('Could not load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  const statusColors = {
    pending: '#d97706',
    in_progress: '#2563eb',
    resolved: '#16a34a',
    closed: '#64748b'
  };

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: '#fef3c7', color: '#d97706',
              border: '0.5px solid #fde68a'
            }}>
            Admin
          </span>
          <p className="text-xs uppercase tracking-widest"
            style={{ color: '#94a3b8' }}>
            Control panel
          </p>
        </div>
        <h2 className="text-2xl font-medium"
          style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          Platform Overview
          <span style={{ color: '#4160bf' }}>.</span>
        </h2>
        <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
          SUVIDHA — Vijayawada Municipal Corporation
        </p>
      </div>

      {/* User + Bill stats */}
      <p className="text-xs uppercase tracking-widest mb-3"
        style={{ color: '#94a3b8' }}>
        Platform stats
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Citizens"
          value={stats?.users?.total}
          color="#4160bf"
        />
        <StatCard
          label="Total Revenue"
          value={stats?.bills?.revenue}
          prefix="₹"
          color="#16a34a"
          sub={`${stats?.bills?.paid} bills paid`}
        />
        <StatCard
          label="Unpaid Bills"
          value={stats?.bills?.unpaid}
          color="#d97706"
        />
        <StatCard
          label="Overdue Bills"
          value={stats?.bills?.overdue}
          color="#dc2626"
        />
      </div>

      {/* Complaint stats */}
      <p className="text-xs uppercase tracking-widest mb-3"
        style={{ color: '#94a3b8' }}>
        Complaint stats
      </p>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Complaints"
          value={stats?.complaints?.total}
        />
        <StatCard
          label="Pending"
          value={stats?.complaints?.pending}
          color="#d97706"
          sub="Awaiting action"
        />
        <StatCard
          label="Resolved"
          value={stats?.complaints?.resolved}
          color="#16a34a"
          sub="Successfully closed"
        />
      </div>

      {/* Recent complaints */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs uppercase tracking-widest flex-shrink-0"
          style={{ color: '#94a3b8' }}>
          Recent complaints
        </p>
        <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
        <button
          onClick={() => navigate('/admin/complaints')}
          className="text-xs" style={{ color: '#4160bf' }}>
          View all →
        </button>
      </div>

      <button
        onClick={() => navigate('/admin/services')}
        className="text-xs" style={{ color: '#4160bf' }}>
        View service requests →
      </button>

      <div className="rounded-xl overflow-hidden"
        style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
        {recent.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              No complaints yet
            </p>
          </div>
        ) : (
          recent.map((c, i) => (
            <div key={c._id}
              className="px-6 py-4 flex items-center justify-between"
              style={{
                borderBottom: i < recent.length - 1
                  ? '0.5px solid #f8fafc' : 'none'
              }}>
              <div>
                <p className="text-sm font-medium"
                  style={{ color: '#0f172a' }}>
                  {c.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  {c.user?.name} · {c.user?.ward || 'No ward'} ·{' '}
                  {new Date(c.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short'
                  })}
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                style={{
                  background: statusColors[c.status] + '15',
                  color: statusColors[c.status],
                  border: `0.5px solid ${statusColors[c.status]}40`
                }}>
                {c.status.replace('_', ' ')}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;