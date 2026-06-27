// AdminUsers.jsx
// View all registered citizens + activate/deactivate accounts

import { useState, useEffect } from 'react';
import API from '../../api/axios';

const AdminUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Could not fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId) => {
    try {
      setToggling(userId);
      const res = await API.patch(`/admin/users/${userId}/toggle`);
      // Update user in local state without refetching
      setUsers(prev => prev.map(u =>
        u._id === userId ? { ...u, isActive: res.data.isActive } : u
      ));
    } catch (err) {
      alert('Could not update user status');
    } finally {
      setToggling(null);
    }
  };

  // Filter users by search term
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.ward || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading users...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            Citizens
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            {users.length} registered citizens on the platform
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, ward..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm px-4 py-2 rounded-lg outline-none"
          style={{
            background: '#ffffff',
            border:     '0.5px solid #e2e8f0',
            color:      '#0f172a',
            width:      '260px',
            fontFamily: 'DM Sans, sans-serif'
          }}
        />
      </div>

      {/* Users table */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3"
             style={{ borderBottom: '0.5px solid #f1f5f9', background: '#f8fafc' }}>
          {[
            { label: 'Citizen',         col: 'col-span-4' },
            { label: 'Ward',            col: 'col-span-2' },
            { label: 'Phone',           col: 'col-span-2' },
            { label: 'Aadhaar',         col: 'col-span-2' },
            { label: 'Status / Action', col: 'col-span-2' }
          ].map(h => (
            <div key={h.label}
                 className={`${h.col} text-xs uppercase tracking-wider`}
                 style={{ color: '#94a3b8' }}>
              {h.label}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              No users found
            </p>
          </div>
        ) : (
          filtered.map((user, index) => (
            <div key={user._id}
                 className="grid grid-cols-12 px-6 py-4 items-center"
                 style={{
                   borderBottom: index < filtered.length - 1
                     ? '0.5px solid #f8fafc' : 'none'
                 }}>

              {/* Name + email */}
              <div className="col-span-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center
                                  justify-center text-xs font-medium flex-shrink-0"
                       style={{ background: '#eff6ff', color: '#4160bf' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium"
                       style={{ color: '#0f172a' }}>
                      {user.name}
                    </p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ward */}
              <div className="col-span-2">
                <p className="text-sm" style={{ color: '#64748b' }}>
                  {user.ward || '—'}
                </p>
              </div>

              {/* Phone */}
              <div className="col-span-2">
                <p className="text-sm" style={{ color: '#64748b' }}>
                  {user.phone || '—'}
                </p>
              </div>

              {/* Aadhaar */}
              <div className="col-span-2">
                {user.aadhaarVerified ? (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#f0fdf4', color: '#16a34a',
                                 border: '0.5px solid #bbf7d0' }}>
                    Verified
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#fefce8', color: '#ca8a04',
                                 border: '0.5px solid #fde68a' }}>
                    Not verified
                  </span>
                )}
              </div>

              {/* Toggle active status */}
              <div className="col-span-2">
                <button
                  onClick={() => handleToggle(user._id)}
                  disabled={toggling === user._id}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: user.isActive ? '#fef2f2' : '#f0fdf4',
                    color:      user.isActive ? '#dc2626' : '#16a34a',
                    border:     `0.5px solid ${user.isActive ? '#fecaca' : '#bbf7d0'}`,
                    cursor:     toggling === user._id ? 'not-allowed' : 'pointer',
                    opacity:    toggling === user._id ? 0.6 : 1
                  }}
                >
                  {toggling === user._id
                    ? '...'
                    : user.isActive ? 'Deactivate' : 'Activate'
                  }
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminUsers;