import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminManageAdmins = () => {
  const { user }                  = useAuth();
  const [admins, setAdmins]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [toggling, setToggling]   = useState(null);
  const [error, setError]         = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const res = await API.get('/admin/admins');
      setAdmins(res.data.admins);
    } catch (err) {
      setError('Could not fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email and password are required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      const res = await API.post('/admin/create-admin', formData);
      setSuccessMsg(res.data.message);
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      fetchAdmins();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create admin');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (adminId) => {
    try {
      setToggling(adminId);
      const res = await API.patch(`/admin/admins/${adminId}/toggle`);
      setAdmins(prev => prev.map(a =>
        a._id === adminId ? { ...a, isActive: res.data.isActive } : a
      ));
    } catch (err) {
      alert('Could not update admin status');
    } finally {
      setToggling(null);
    }
  };

  const inputStyle = {
    background: '#f8fafc',
    border:     '0.5px solid #e2e8f0',
    color:      '#0f172a',
    fontFamily: 'DM Sans, sans-serif',
    width:      '100%',
    padding:    '9px 12px',
    borderRadius: '8px',
    outline:    'none',
    fontSize:   '13px'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#fef3c7', color: '#d97706',
                           border: '0.5px solid #fde68a' }}>
              Super Admin
            </span>
          </div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            Manage Admins
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            {admins.length} admin{admins.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="text-sm px-4 py-2 rounded-lg font-medium"
          style={{ background: '#1a1a2e', color: '#ffffff' }}
        >
          {showForm ? 'Cancel' : '+ Create Admin'}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm"
             style={{ background: '#f0fdf4', color: '#16a34a',
                      border: '0.5px solid #bbf7d0' }}>
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg mb-5 text-sm"
             style={{ background: '#fef2f2', color: '#dc2626',
                      border: '0.5px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* Create Admin Form */}
      {showForm && (
        <div className="rounded-xl mb-6 overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #1a1a2e 0%, #1a1a2e 40%, #e2e8f0 40%)'
          }} />
          <div className="p-6">
            <h3 className="text-sm font-medium mb-4" style={{ color: '#0f172a' }}>
              Create New Admin Account
            </h3>
            <form onSubmit={handleCreateAdmin}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Full Name *
                  </label>
                  <input
                    type="text" name="name"
                    value={formData.name} onChange={handleChange}
                    placeholder="Admin Name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Phone
                  </label>
                  <input
                    type="tel" name="phone"
                    value={formData.phone} onChange={handleChange}
                    placeholder="9876543210"
                    style={inputStyle}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Email *
                  </label>
                  <input
                    type="email" name="email"
                    value={formData.email} onChange={handleChange}
                    placeholder="admin@suvidha.com"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider mb-1.5"
                         style={{ color: '#94a3b8' }}>
                    Password *
                  </label>
                  <input
                    type="password" name="password"
                    value={formData.password} onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg mb-4"
                   style={{ background: '#fffbeb', border: '0.5px solid #fde68a' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="#d97706" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-xs" style={{ color: '#d97706' }}>
                  The admin will receive their credentials and should change
                  their password after first login.
                </p>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: creating ? '#e2e8f0' : '#1a1a2e',
                  color:      creating ? '#94a3b8' : '#ffffff',
                  cursor:     creating ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creating...' : 'Create Admin Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admins list */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-3"
             style={{ borderBottom: '0.5px solid #f1f5f9',
                      background: '#f8fafc' }}>
          {[
            { label: 'Admin',   col: 'col-span-5' },
            { label: 'Phone',   col: 'col-span-3' },
            { label: 'Created', col: 'col-span-2' },
            { label: 'Action',  col: 'col-span-2' }
          ].map(h => (
            <div key={h.label}
                 className={`${h.col} text-xs uppercase tracking-wider`}
                 style={{ color: '#94a3b8' }}>
              {h.label}
            </div>
          ))}
        </div>

        {admins.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              No admins created yet
            </p>
            <p className="text-xs mt-1" style={{ color: '#cbd5e1' }}>
              Click "Create Admin" to add your first admin
            </p>
          </div>
        ) : (
          admins.map((admin, index) => (
            <div key={admin._id}
                 className="grid grid-cols-12 px-6 py-4 items-center"
                 style={{
                   borderBottom: index < admins.length - 1
                     ? '0.5px solid #f8fafc' : 'none'
                 }}>

              {/* Name + email */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                text-xs font-medium flex-shrink-0"
                     style={{ background: '#1a1a2e', color: '#e8c96d' }}>
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    {admin.name}
                  </p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>
                    {admin.email}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="col-span-3">
                <p className="text-sm" style={{ color: '#64748b' }}>
                  {admin.phone || '—'}
                </p>
              </div>

              {/* Created date */}
              <div className="col-span-2">
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  {new Date(admin.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>

              {/* Toggle */}
              <div className="col-span-2">
                <button
                  onClick={() => handleToggle(admin._id)}
                  disabled={toggling === admin._id}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{
                    background: admin.isActive ? '#fef2f2' : '#f0fdf4',
                    color:      admin.isActive ? '#dc2626' : '#16a34a',
                    border:     `0.5px solid ${admin.isActive ? '#fecaca' : '#bbf7d0'}`,
                    cursor:     toggling === admin._id ? 'not-allowed' : 'pointer',
                    opacity:    toggling === admin._id ? 0.6 : 1
                  }}
                >
                  {toggling === admin._id
                    ? '...'
                    : admin.isActive ? 'Deactivate' : 'Activate'
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

export default AdminManageAdmins;