import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────
// Service config
// ─────────────────────────────────────────
const serviceConfig = {
  water_connection: {
    label: 'Water Connection',
    color: '#0ea5e9',
    bg:    '#f0f9ff',
    fee:   { domestic: 500, commercial: 2000 },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6 9 4 13.5 4 16a8 8 0 0 0 16 0c0-2.5-2-7-8-14z"/>
      </svg>
    )
  },
  electricity_connection: {
    label: 'Electricity Connection',
    color: '#f59e0b',
    bg:    '#fffbeb',
    fee:   { domestic: 1500, commercial: 5000 },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    )
  },
  gas_connection: {
    label: 'Gas Connection',
    color: '#ef4444',
    bg:    '#fef2f2',
    fee:   { domestic: 1000, commercial: 3000 },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/>
        <path d="M12 22v-4"/>
      </svg>
    )
  }
};

const statusConfig = {
  pending:      { label: 'Pending',      color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  under_review: { label: 'Under Review', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  approved:     { label: 'Approved',     color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected:     { label: 'Rejected',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  completed:    { label: 'Completed',    color: '#4160bf', bg: '#eef2ff', border: '#c7d2fe' }
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: cfg.bg, color: cfg.color,
                   border: `0.5px solid ${cfg.border}` }}>
      {cfg.label}
    </span>
  );
};

// ─────────────────────────────────────────
// Status timeline — reused pattern from complaints
// ─────────────────────────────────────────
const StatusTimeline = ({ history }) => (
  <div className="space-y-3 mt-3">
    {history.map((entry, i) => {
      const cfg    = statusConfig[entry.status];
      const isLast = i === history.length - 1;
      return (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                 style={{ background: isLast ? cfg?.color : '#e2e8f0' }} />
            {i < history.length - 1 && (
              <div className="w-px flex-1 mt-1"
                   style={{ background: '#e2e8f0', minHeight: '16px' }} />
            )}
          </div>
          <div className="pb-2">
            <p className="text-xs font-medium"
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
);

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const ServiceRequestsPage = () => {
  const { user } = useAuth();

  const [requests, setRequests]       = useState([]);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showForm, setShowForm]       = useState(false);
  const [selected, setSelected]       = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const [successMsg, setSuccessMsg]   = useState('');
  const [error, setError]             = useState('');
  const [documents, setDocuments]     = useState([]);

  const [formData, setFormData] = useState({
    serviceType:     '',
    connectionType:  'domestic',
    propertyAddress: '',
    ward:            user?.ward || '',
    remarks:         ''
  });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get('/services');
      setRequests(res.data.requests);
      setSummary(res.data.summary);
    } catch (err) {
      setError('Could not load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.serviceType || !formData.propertyAddress) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      documents.forEach(doc => data.append('documents', doc));

      const res = await API.post('/services', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg(res.data.message);
      setShowForm(false);
      setFormData({
        serviceType: '', connectionType: 'domestic',
        propertyAddress: '', ward: user?.ward || '', remarks: ''
      });
      setDocuments([]);
      fetchRequests();
      setTimeout(() => setSuccessMsg(''), 6000);

    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request');
    } finally {
      setSubmitting(false);
    }
  };

  // Fee calculator
  const currentFee = formData.serviceType
    ? serviceConfig[formData.serviceType]?.fee[formData.connectionType]
    : null;

  const inputStyle = {
    background: '#f8fafc',
    border:     '0.5px solid #e2e8f0',
    color:      '#0f172a',
    fontFamily: 'DM Sans, sans-serif',
    width:      '100%',
    padding:    '10px 12px',
    borderRadius: '8px',
    outline:    'none',
    fontSize:   '14px'
  };

  const labelStyle = {
    display:       'block',
    fontSize:      '11px',
    fontWeight:    '500',
    marginBottom:  '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color:         '#94a3b8'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading service requests...
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
            Service Requests
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            Apply for new water, electricity, or gas connections.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); }}
          className="text-sm px-4 py-2 rounded-lg font-medium"
          style={{ background: '#4160bf', color: '#ffffff' }}
        >
          {showForm ? 'Cancel' : '+ New Request'}
        </button>
      </div>

      {/* Success message */}
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

      {/* Summary cards */}
      {summary && !showForm && (
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total',        value: summary.total,        color: '#0f172a' },
            { label: 'Pending',      value: summary.pending,      color: '#d97706' },
            { label: 'Under Review', value: summary.under_review, color: '#2563eb' },
            { label: 'Approved',     value: summary.approved,     color: '#16a34a' },
            { label: 'Completed',    value: summary.completed,    color: '#4160bf' }
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4"
                 style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
              <p className="text-xs uppercase tracking-wider mb-1"
                 style={{ color: '#94a3b8' }}>{s.label}</p>
              <p className="text-xl font-medium"
                 style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── APPLICATION FORM ── */}
      {showForm && (
        <div className="rounded-xl mb-6 overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
          <div style={{
            height: '3px',
            background: 'linear-gradient(90deg, #4160bf 0%, #4160bf 40%, #e2e8f0 40%)'
          }} />
          <div className="p-6">
            <h3 className="text-base font-medium mb-5" style={{ color: '#0f172a' }}>
              New Service Request
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Service type cards */}
              <div>
                <label style={labelStyle}>
                  Service Type <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(serviceConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, serviceType: key }))}
                      className="p-3 rounded-lg text-left transition-all"
                      style={{
                        background: formData.serviceType === key ? cfg.bg    : '#f8fafc',
                        border:     `0.5px solid ${formData.serviceType === key
                          ? cfg.color : '#e2e8f0'}`,
                        color: formData.serviceType === key ? cfg.color : '#64748b'
                      }}
                    >
                      <div className="mb-2" style={{
                        color: formData.serviceType === key ? cfg.color : '#94a3b8'
                      }}>
                        {cfg.icon}
                      </div>
                      <p className="text-xs font-medium">{cfg.label}</p>
                      <p className="text-xs mt-0.5 opacity-70">
                        From ₹{cfg.fee.domestic}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Connection type + fee display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Connection Type</label>
                  <select
                    name="connectionType"
                    value={formData.connectionType}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="domestic">Domestic</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Applicable Fee</label>
                  <div className="px-3 py-2.5 rounded-lg text-sm font-medium"
                       style={{ background: '#f0fdf4', color: '#16a34a',
                                border: '0.5px solid #bbf7d0' }}>
                    {currentFee ? `₹${currentFee.toLocaleString('en-IN')}` : '—'}
                  </div>
                </div>
              </div>

              {/* Property address */}
              <div>
                <label style={labelStyle}>
                  Property Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleChange}
                  placeholder="Full address where connection is required..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>

              {/* Ward + Remarks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Ward</label>
                  <input
                    type="text" name="ward"
                    value={formData.ward} onChange={handleChange}
                    placeholder="Ward 12"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Additional Remarks</label>
                  <input
                    type="text" name="remarks"
                    value={formData.remarks} onChange={handleChange}
                    placeholder="Any special notes..."
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Document upload */}
              <div>
                <label style={labelStyle}>
                  Supporting Documents (Aadhaar, Property Tax Receipt)
                </label>
                <input
                  type="file" accept="image/*,.pdf" multiple
                  onChange={e => setDocuments(Array.from(e.target.files).slice(0, 3))}
                  className="text-sm w-full"
                  style={{ color: '#64748b' }}
                />
                {documents.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                    {documents.length} file{documents.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Fee notice */}
              {currentFee && (
                <div className="px-4 py-3 rounded-lg text-xs"
                     style={{ background: '#fffbeb', color: '#d97706',
                              border: '0.5px solid #fde68a' }}>
                  ⚠️ A processing fee of ₹{currentFee.toLocaleString('en-IN')} will be
                  collected at the ward office upon approval of this request.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: submitting ? '#93c5fd' : '#4160bf',
                  color:      '#ffffff',
                  cursor:     submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* ── REQUESTS LIST + DETAIL ── */}
      <div className={`grid gap-6 ${selected ? 'grid-cols-2' : 'grid-cols-1'}`}>

        {/* List */}
        <div className="rounded-xl overflow-hidden"
             style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

          <div className="px-6 py-4 flex items-center justify-between"
               style={{ borderBottom: '0.5px solid #f1f5f9' }}>
            <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
              Your Applications
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {requests.length} total
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-2xl mb-2">🔌</p>
              <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                No service requests yet
              </p>
              <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                Click "+ New Request" to apply for a connection
              </p>
            </div>
          ) : (
            requests.map((req, i) => {
              const cfg = serviceConfig[req.serviceType];
              return (
                <div
                  key={req._id}
                  onClick={() => setSelected(
                    selected?._id === req._id ? null : req
                  )}
                  className="px-6 py-4 cursor-pointer transition-all"
                  style={{
                    borderBottom: i < requests.length - 1
                      ? '0.5px solid #f8fafc' : 'none',
                    background: selected?._id === req._id
                      ? '#f8fafc' : 'transparent'
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center
                                      justify-center flex-shrink-0 mt-0.5"
                           style={{ background: cfg?.bg, color: cfg?.color }}>
                        {cfg?.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium"
                           style={{ color: '#0f172a' }}>
                          {cfg?.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                          {req.applicationNumber} · {req.connectionType}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                          {new Date(req.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="rounded-xl overflow-hidden"
               style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

            <div className="px-6 py-4 flex items-center justify-between"
                 style={{ borderBottom: '0.5px solid #f1f5f9' }}>
              <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                Application Details
              </p>
              <button onClick={() => setSelected(null)}
                      style={{ color: '#94a3b8', fontSize: '18px' }}>
                ×
              </button>
            </div>

            <div className="p-6">
              {/* App number */}
              <span className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: '#f1f5f9', color: '#64748b' }}>
                {selected.applicationNumber}
              </span>

              {/* Service type */}
              <div className="flex items-center gap-2 mt-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                     style={{
                       background: serviceConfig[selected.serviceType]?.bg,
                       color:      serviceConfig[selected.serviceType]?.color
                     }}>
                  {serviceConfig[selected.serviceType]?.icon}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    {serviceConfig[selected.serviceType]?.label}
                  </p>
                  <p className="text-xs capitalize" style={{ color: '#94a3b8' }}>
                    {selected.connectionType} connection
                  </p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              {/* Details */}
              <div style={{ height: '0.5px', background: '#f1f5f9',
                            margin: '12px 0' }} />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    Property Address
                  </span>
                  <span className="text-xs text-right max-w-32"
                        style={{ color: '#0f172a' }}>
                    {selected.propertyAddress}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Ward</span>
                  <span className="text-xs" style={{ color: '#0f172a' }}>
                    {selected.ward || '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>Fee</span>
                  <span className="text-xs font-medium" style={{ color: '#0f172a' }}>
                    ₹{selected.fee?.toLocaleString('en-IN')}
                  </span>
                </div>
                {selected.remarks && (
                  <div className="flex justify-between">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>
                      Remarks
                    </span>
                    <span className="text-xs" style={{ color: '#64748b' }}>
                      {selected.remarks}
                    </span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ height: '0.5px', background: '#f1f5f9',
                            margin: '12px 0' }} />
              <p className="text-xs uppercase tracking-wider mb-2"
                 style={{ color: '#94a3b8' }}>
                Application Timeline
              </p>
              <StatusTimeline history={selected.statusHistory} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceRequestsPage;