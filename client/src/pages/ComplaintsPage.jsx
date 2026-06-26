import { useState, useEffect } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────
// Category config
// ─────────────────────────────────────────
const categories = [
    { value: 'roads', label: 'Roads & Potholes' },
    { value: 'water_supply', label: 'Water Supply' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'streetlights', label: 'Streetlights' },
    { value: 'drainage', label: 'Drainage' },
    { value: 'parks', label: 'Parks & Gardens' },
    { value: 'noise', label: 'Noise Pollution' },
    { value: 'other', label: 'Other' }
];

// ─────────────────────────────────────────
// Status config
// ─────────────────────────────────────────
const statusConfig = {
    pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    in_progress: { label: 'In Progress', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    resolved: { label: 'Resolved', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    closed: { label: 'Closed', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' }
};

const StatusBadge = ({ status }) => {
    const cfg = statusConfig[status];
    return (
        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
                background: cfg.bg, color: cfg.color,
                border: `0.5px solid ${cfg.border}`
            }}>
            {cfg.label}
        </span>
    );
};

// ─────────────────────────────────────────
// Status Timeline Component
// ─────────────────────────────────────────
const StatusTimeline = ({ history }) => (
    <div className="space-y-3 mt-4">
        {history.map((entry, index) => {
            const cfg = statusConfig[entry.status];
            const isLast = index === history.length - 1;
            return (
                <div key={index} className="flex gap-3">
                    {/* Dot + line */}
                    <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
                            style={{ background: isLast ? cfg.color : '#e2e8f0' }} />
                        {index < history.length - 1 && (
                            <div className="w-px flex-1 mt-1"
                                style={{ background: '#e2e8f0', minHeight: '20px' }} />
                        )}
                    </div>
                    {/* Content */}
                    <div className="pb-3">
                        <p className="text-xs font-medium capitalize"
                            style={{ color: isLast ? cfg.color : '#64748b' }}>
                            {cfg.label}
                        </p>
                        {entry.note && (
                            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                {entry.note}
                            </p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                            {new Date(entry.updatedAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short',
                                year: 'numeric', hour: '2-digit', minute: '2-digit'
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
const ComplaintsPage = () => {
    const { user } = useAuth();

    const [complaints, setComplaints] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedComplaint, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [filter, setFilter] = useState('all');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        address: '',
        ward: user?.ward || '',
        pincode: ''
    });
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const res = await API.get('/complaints');
            setComplaints(res.data.complaints);
            setSummary(res.data.summary);
        } catch (err) {
            setError('Could not load complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.category) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Use FormData because we're sending files
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            images.forEach(img => data.append('images', img));

            const res = await API.post('/complaints', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMsg(res.data.message);
            setShowForm(false);
            setFormData({
                title: '', description: '', category: '',
                priority: 'medium', address: '',
                ward: user?.ward || '', pincode: ''
            });
            setImages([]);
            fetchComplaints();

            // Clear success message after 5 seconds
            setTimeout(() => setSuccessMsg(''), 5000);

        } catch (err) {
            setError(err.response?.data?.message || 'Could not file complaint');
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = {
        background: '#f8fafc',
        border: '0.5px solid #e2e8f0',
        color: '#0f172a',
        fontFamily: 'DM Sans, sans-serif',
        width: '100%',
        padding: '10px 12px',
        borderRadius: '8px',
        outline: 'none',
        fontSize: '14px'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '11px',
        fontWeight: '500',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#94a3b8'
    };

    const filteredComplaints = filter === 'all'
        ? complaints
        : complaints.filter(c => c.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm" style={{ color: '#94a3b8' }}>Loading complaints...</p>
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
                        Complaints
                    </h2>
                    <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
                        Report and track civic issues in your area.
                    </p>
                </div>
                <button
                    onClick={() => { setShowForm(!showForm); setError(''); }}
                    className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
                    style={{ background: '#4160bf', color: '#ffffff' }}
                >
                    {showForm ? 'Cancel' : '+ File Complaint'}
                </button>
            </div>

            {/* Success message */}
            {successMsg && (
                <div className="px-4 py-3 rounded-lg mb-5 text-sm"
                    style={{
                        background: '#f0fdf4', color: '#16a34a',
                        border: '0.5px solid #bbf7d0'
                    }}>
                    {successMsg}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="px-4 py-3 rounded-lg mb-5 text-sm"
                    style={{
                        background: '#fef2f2', color: '#dc2626',
                        border: '0.5px solid #fecaca'
                    }}>
                    {error}
                </div>
            )}

            {/* ── NEW COMPLAINT FORM ── */}
            {showForm && (
                <div className="rounded-xl mb-6 overflow-hidden"
                    style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

                    <div style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, #4160bf 0%, #4160bf 40%, #e2e8f0 40%)'
                    }} />

                    <div className="p-6">
                        <h3 className="text-base font-medium mb-5"
                            style={{ color: '#0f172a' }}>
                            File a New Complaint
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Title */}
                            <div>
                                <label style={labelStyle}>
                                    Title <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text" name="title"
                                    value={formData.title} onChange={handleChange}
                                    placeholder="e.g. Broken streetlight on MG Road"
                                    style={inputStyle}
                                />
                            </div>

                            {/* Category + Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label style={labelStyle}>
                                        Category <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Priority</label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                {/* Label row — label on left, counter on right */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                                        Description <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <span className="text-xs"
                                        style={{
                                            color: formData.description.length > 900
                                                ? '#dc2626'                           // red when near limit
                                                : formData.description.length > 700
                                                    ? '#d97706'                           // orange when getting close
                                                    : '#94a3b8'                           // grey normally
                                        }}>
                                        {formData.description.length} / 1000
                                    </span>
                                </div>

                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the issue in detail..."
                                    rows={4}
                                    maxLength={1000}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />

                                {/* Helper text */}
                                {formData.description.length > 900 && (
                                    <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
                                        {1000 - formData.description.length} characters remaining
                                    </p>
                                )}
                            </div>
                            {/* Address + Ward + Pincode */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label style={labelStyle}>Ward</label>
                                    <input
                                        type="text" name="ward"
                                        value={formData.ward} onChange={handleChange}
                                        placeholder="Ward 12"
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label style={labelStyle}>Pincode</label>
                                    <input
                                        type="text" name="pincode"
                                        value={formData.pincode} onChange={handleChange}
                                        placeholder="520001"
                                        style={inputStyle}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label style={labelStyle}>Address</label>
                                    <input
                                        type="text" name="address"
                                        value={formData.address} onChange={handleChange}
                                        placeholder="Street / Landmark"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label style={labelStyle}>
                                    Attach Photos (max 3)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={e => setImages(Array.from(e.target.files).slice(0, 3))}
                                    className="w-full text-sm"
                                    style={{ color: '#64748b' }}
                                />
                                {images.length > 0 && (
                                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                                        {images.length} file{images.length > 1 ? 's' : ''} selected
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                                style={{
                                    background: submitting ? '#93c5fd' : '#4160bf',
                                    color: '#ffffff',
                                    cursor: submitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Complaint'}
                            </button>

                        </form>
                    </div>
                </div>
            )}

            {/* ── COMPLAINTS LIST + DETAIL VIEW ── */}
            <div className={`grid gap-6 ${selectedComplaint ? 'grid-cols-2' : 'grid-cols-1'}`}>

                {/* Complaints list */}
                <div className="rounded-xl overflow-hidden"
                    style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

                    <div className="px-6 py-4"
                        style={{ borderBottom: '0.5px solid #f1f5f9' }}>

                        {/* Title row */}
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                                Your Complaints
                            </p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>
                                {filteredComplaints.length} of {complaints.length}
                            </p>
                        </div>

                        {/* Filter buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { key: 'all', label: 'All', count: complaints.length },
                                { key: 'pending', label: 'Pending', count: summary?.pending || 0 },
                                { key: 'in_progress', label: 'In Progress', count: summary?.in_progress || 0 },
                                { key: 'resolved', label: 'Resolved', count: summary?.resolved || 0 },
                            ].map(btn => (
                                <button
                                    key={btn.key}
                                    onClick={() => setFilter(btn.key)}
                                    className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                                    style={{
                                        background: filter === btn.key ? '#4160bf' : '#f8fafc',
                                        color: filter === btn.key ? '#ffffff' : '#64748b',
                                        border: `0.5px solid ${filter === btn.key ? '#4160bf' : '#e2e8f0'}`
                                    }}
                                >
                                    {btn.label}
                                    <span className="ml-1.5 text-xs opacity-70">
                                        {btn.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                    </div>

                    {filteredComplaints.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-center">
                                <p className="text-2xl mb-2">📋</p>
                                <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                                    No complaints yet
                                </p>
                                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                                    Click "File Complaint" to report an issue
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {filteredComplaints.map((complaint, index) => (
                                <div
                                    key={complaint._id}
                                    onClick={() => setSelected(
                                        selectedComplaint?._id === complaint._id ? null : complaint
                                    )}
                                    className="px-6 py-4 cursor-pointer transition-all"
                                    style={{
                                        borderBottom: index < complaints.length - 1
                                            ? '0.5px solid #f8fafc' : 'none',
                                        background: selectedComplaint?._id === complaint._id
                                            ? '#f8fafc' : 'transparent'
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate"
                                                style={{ color: '#0f172a' }}>
                                                {complaint.title}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                                {complaint.complaintNumber} ·{' '}
                                                {categories.find(c => c.value === complaint.category)?.label}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#cbd5e1' }}>
                                                {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <StatusBadge status={complaint.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Complaint detail + timeline */}
                {selectedComplaint && (
                    <div className="rounded-xl overflow-hidden"
                        style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

                        <div className="px-6 py-4 flex items-center justify-between"
                            style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                            <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                                Complaint Details
                            </p>
                            <button
                                onClick={() => setSelected(null)}
                                style={{ color: '#94a3b8', fontSize: '18px', lineHeight: 1 }}>
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Reference number */}
                            <span className="text-xs px-2 py-0.5 rounded font-mono"
                                style={{ background: '#f1f5f9', color: '#64748b' }}>
                                {selectedComplaint.complaintNumber}
                            </span>

                            {/* Title */}
                            <h3 className="text-base font-medium mt-3 mb-1"
                                style={{ color: '#0f172a' }}>
                                {selectedComplaint.title}
                            </h3>

                            {/* Meta */}
                            <div className="flex items-center gap-2 mb-4">
                                <StatusBadge status={selectedComplaint.status} />
                                <span className="text-xs" style={{ color: '#94a3b8' }}>
                                    {categories.find(c => c.value === selectedComplaint.category)?.label}
                                </span>
                                <span className="text-xs capitalize px-2 py-0.5 rounded-full"
                                    style={{
                                        background: selectedComplaint.priority === 'high'
                                            ? '#fef2f2' : selectedComplaint.priority === 'medium'
                                                ? '#fffbeb' : '#f0fdf4',
                                        color: selectedComplaint.priority === 'high'
                                            ? '#dc2626' : selectedComplaint.priority === 'medium'
                                                ? '#d97706' : '#16a34a'
                                    }}>
                                    {selectedComplaint.priority} priority
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm font-light leading-relaxed mb-4"
                                style={{ color: '#64748b' }}>
                                {selectedComplaint.description}
                            </p>

                            {/* Location */}
                            {selectedComplaint.location?.address && (
                                <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
                                    📍 {selectedComplaint.location.address}
                                    {selectedComplaint.location.ward && ` · ${selectedComplaint.location.ward}`}
                                </p>
                            )}

                            {/* Images */}
                            {selectedComplaint.images?.length > 0 && (
                                <div className="flex gap-2 mb-4">
                                    {selectedComplaint.images.map((img, i) => (
                                        <img key={i} src={img} alt={`evidence-${i}`}
                                            className="w-20 h-20 object-cover rounded-lg"
                                            style={{ border: '0.5px solid #e2e8f0' }} />
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{ height: '0.5px', background: '#f1f5f9', margin: '16px 0' }} />

                            {/* Status Timeline */}
                            <p className="text-xs uppercase tracking-wider mb-2"
                                style={{ color: '#94a3b8' }}>
                                Status Timeline
                            </p>
                            <StatusTimeline history={selectedComplaint.statusHistory} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsPage;