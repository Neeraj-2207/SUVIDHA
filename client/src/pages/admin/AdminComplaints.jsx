// AdminComplaints.jsx
// View ALL complaints + update their statuses

import { useState, useEffect } from 'react';
import API from '../../api/axios';

const categories = [
  { value: 'roads',        label: 'Roads' },
  { value: 'water_supply', label: 'Water Supply' },
  { value: 'electricity',  label: 'Electricity' },
  { value: 'sanitation',   label: 'Sanitation' },
  { value: 'streetlights', label: 'Streetlights' },
  { value: 'drainage',     label: 'Drainage' },
  { value: 'parks',        label: 'Parks' },
  { value: 'noise',        label: 'Noise' },
  { value: 'other',        label: 'Other' }
];

const statusConfig = {
  pending:     { label: 'Pending',     color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  in_progress: { label: 'In Progress', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  resolved:    { label: 'Resolved',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  closed:      { label: 'Closed',      color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
};

const AdminComplaints = () => {
  const [complaints, setComplaints]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');
  const [selected, setSelected]       = useState(null);
  const [updating, setUpdating]       = useState(false);
  const [statusNote, setStatusNote]   = useState('');
  const [newStatus, setNewStatus]     = useState('');

  useEffect(() => { fetchComplaints(); }, [filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const res   = await API.get(`/admin/complaints${query}`);
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error('Could not fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    try {
      setUpdating(true);
      const res = await API.patch(
        `/admin/complaints/${selected._id}/status`,
        { status: newStatus, note: statusNote }
      );

      // Update in local state
      setComplaints(prev =>
        prev.map(c => c._id === selected._id ? res.data.complaint : c)
      );
      setSelected(res.data.complaint);
      setStatusNote('');
      setNewStatus('');
      alert('Status updated successfully!');
    } catch (err) {
      alert('Could not update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading complaints...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            All Complaints
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            {complaints.length} complaints found
          </p>
        </div>

        {/* Status filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'in_progress', 'resolved', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setSelected(null); }}
              className="text-xs px-3 py-1.5 rounded-lg transition-all capitalize font-medium"
              style={{
                background: filter === s ? '#4160bf' : '#f8fafc',
                color:      filter === s ? '#ffffff'  : '#64748b',
                border:     `0.5px solid ${filter === s ? '#4160bf' : '#e2e8f0'}`
              }}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className={`grid gap-6 ${selected ? 'grid-cols-2' : 'grid-cols-1'}`}>

        {/* Complaints list */}
        <div className="rounded-xl overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
          {complaints.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                No complaints found
              </p>
            </div>
          ) : (
            complaints.map((c, i) => {
              const cfg = statusConfig[c.status];
              return (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelected(selected?._id === c._id ? null : c);
                    setNewStatus('');
                    setStatusNote('');
                  }}
                  className="px-6 py-4 cursor-pointer transition-all"
                  style={{
                    borderBottom: i < complaints.length - 1
                      ? '0.5px solid #f8fafc' : 'none',
                    background: selected?._id === c._id
                      ? '#f8fafc' : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate"
                         style={{ color: '#0f172a' }}>
                        {c.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                        {c.user?.name} · {c.complaintNumber}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                        {c.user?.ward || 'No ward'} ·{' '}
                        {categories.find(cat => cat.value === c.category)?.label} ·{' '}
                        {new Date(c.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color,
                                   border: `0.5px solid ${cfg.border}` }}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Complaint detail + status update panel */}
        {selected && (
          <div className="rounded-xl overflow-hidden"
               style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

            <div className="px-6 py-4 flex items-center justify-between"
                 style={{ borderBottom: '0.5px solid #f1f5f9' }}>
              <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Update Status
              </p>
              <button onClick={() => setSelected(null)}
                      style={{ color: '#94a3b8', fontSize: '18px' }}>
                ×
              </button>
            </div>

            <div className="p-6">

              {/* Complaint info */}
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                {selected.complaintNumber}
              </span>
              <h3 className="text-base font-medium mt-3 mb-1"
                  style={{ color: '#0f172a' }}>
                {selected.title}
              </h3>
              <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                Filed by: {selected.user?.name} ({selected.user?.email})
              </p>
              <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
                Ward: {selected.user?.ward || '—'} ·{' '}
                Priority: <span className="capitalize">{selected.priority}</span>
              </p>
              <p className="text-sm font-light leading-relaxed mb-4"
                 style={{ color: '#64748b' }}>
                {selected.description}
              </p>

              {/* Images */}
              {selected.images?.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {selected.images.map((img, i) => (
                    <img key={i} src={img} alt={`img-${i}`}
                         className="w-20 h-20 object-cover rounded-lg"
                         style={{ border: '0.5px solid #e2e8f0' }} />
                  ))}
                </div>
              )}

              <div style={{ height: '0.5px', background: '#f1f5f9',
                            margin: '16px 0' }} />

              {/* Status update form */}
              <p className="text-xs uppercase tracking-wider mb-3"
                 style={{ color: '#94a3b8' }}>
                Change Status
              </p>

              {/* Status selector */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setNewStatus(key)}
                    className="text-xs px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: newStatus === key ? cfg.bg    : '#f8fafc',
                      color:      newStatus === key ? cfg.color : '#64748b',
                      border:     `0.5px solid ${newStatus === key
                        ? cfg.border : '#e2e8f0'}`
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Note */}
              <textarea
                placeholder="Add a note for the citizen (optional)..."
                value={statusNote}
                onChange={e => setStatusNote(e.target.value)}
                rows={3}
                className="w-full text-sm rounded-lg outline-none p-3 mb-3"
                style={{
                  background: '#f8fafc',
                  border:     '0.5px solid #e2e8f0',
                  color:      '#0f172a',
                  resize:     'none',
                  fontFamily: 'DM Sans, sans-serif'
                }}
              />

              {/* Update button */}
              <button
                onClick={handleStatusUpdate}
                disabled={updating || !newStatus}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: updating || !newStatus ? '#e2e8f0' : '#4160bf',
                  color:      updating || !newStatus ? '#94a3b8'  : '#ffffff',
                  cursor:     updating || !newStatus ? 'not-allowed' : 'pointer'
                }}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>

              {/* Current timeline */}
              <div style={{ height: '0.5px', background: '#f1f5f9',
                            margin: '16px 0' }} />
              <p className="text-xs uppercase tracking-wider mb-3"
                 style={{ color: '#94a3b8' }}>
                History
              </p>
              <div className="space-y-3">
                {selected.statusHistory?.map((entry, i) => {
                  const cfg    = statusConfig[entry.status];
                  const isLast = i === selected.statusHistory.length - 1;
                  return (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                             style={{ background: isLast ? cfg?.color : '#e2e8f0' }} />
                        {i < selected.statusHistory.length - 1 && (
                          <div className="w-px flex-1 mt-1"
                               style={{ background: '#e2e8f0', minHeight: '16px' }} />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-xs font-medium capitalize"
                           style={{ color: isLast ? cfg?.color : '#64748b' }}>
                          {cfg?.label}
                        </p>
                        {entry.note && (
                          <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                            {entry.note}
                          </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                          {new Date(entry.updatedAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;