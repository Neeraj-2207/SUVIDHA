import { useState, useEffect } from 'react';
import API from '../../api/axios';

const statusConfig = {
    pending: {
        label: 'Pending',
        color: '#d97706',
        bg: '#fffbeb',
        border: '#fde68a'
    },
    under_review: {
        label: 'Under Review',
        color: '#2563eb',
        bg: '#eff6ff',
        border: '#bfdbfe'
    },
    approved: {
        label: 'Approved',
        color: '#16a34a',
        bg: '#f0fdf4',
        border: '#bbf7d0'
    },
    rejected: {
        label: 'Rejected',
        color: '#dc2626',
        bg: '#fef2f2',
        border: '#fecaca'
    },
    completed: {
        label: 'Completed',
        color: '#7c3aed',
        bg: '#f5f3ff',
        border: '#ddd6fe'
    }
};

const serviceLabels = {
    water_connection: 'Water Connection',
    electricity_connection: 'Electricity Connection',
    gas_connection: 'Gas Connection'
};

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState('all');

    const [selected, setSelected] = useState(null);

    const [newStatus, setNewStatus] = useState('');
    const [statusNote, setStatusNote] = useState('');

    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchServices();
    }, [filter]);

    const fetchServices = async () => {
        try {
            setLoading(true);

            const query =
                filter !== 'all'
                    ? `?status=${filter}`
                    : '';

            const res = await API.get(`/admin/services${query}`);

            setServices(res.data.requests);

        } catch (err) {
            console.error('Could not fetch service requests');
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
                `/admin/services/${selected._id}/status`,
                {
                    status: newStatus,
                    note: statusNote
                }
            );

            setServices(prev =>
                prev.map(service =>
                    service._id === selected._id
                        ? res.data.request
                        : service
                )
            );

            setSelected(res.data.request);

            setNewStatus('');
            setStatusNote('');

            alert('Status updated successfully!');

        } catch (err) {
            alert('Could not update service request');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p
                    className="text-sm"
                    style={{ color: '#94a3b8' }}
                >
                    Loading service requests...
                </p>
            </div>
        );
    }
    return (
        <div className="max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2
                        className="text-xl font-medium"
                        style={{
                            color: '#0f172a',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Service Requests
                    </h2>

                    <p
                        className="text-sm font-light mt-1"
                        style={{ color: '#94a3b8' }}
                    >
                        {services.length} service requests found
                    </p>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        'all',
                        'pending',
                        'under_review',
                        'approved',
                        'rejected',
                        'completed'
                    ].map(status => (
                        <button
                            key={status}
                            onClick={() => {
                                setFilter(status);
                                setSelected(null);
                            }}
                            className="text-xs px-3 py-1.5 rounded-lg transition-all capitalize font-medium"
                            style={{
                                background:
                                    filter === status ? '#4160bf' : '#f8fafc',
                                color:
                                    filter === status ? '#ffffff' : '#64748b',
                                border: `0.5px solid ${filter === status
                                        ? '#4160bf'
                                        : '#e2e8f0'
                                    }`
                            }}
                        >
                            {status.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div
                className={`grid gap-6 ${selected
                        ? 'grid-cols-2'
                        : 'grid-cols-1'
                    }`}
            >

                {/* Service Request List */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{
                        background: '#ffffff',
                        border: '0.5px solid #e2e8f0'
                    }}
                >

                    {services.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-2xl mb-2">📄</p>

                            <p
                                className="text-sm"
                                style={{ color: '#94a3b8' }}
                            >
                                No service requests found
                            </p>
                        </div>
                    ) : (

                        services.map((service, index) => {

                            const cfg = statusConfig[service.status];

                            return (

                                <div
                                    key={service._id}
                                    onClick={() => {
                                        setSelected(
                                            selected?._id === service._id
                                                ? null
                                                : service
                                        );

                                        setNewStatus('');
                                        setStatusNote('');
                                    }}
                                    className="px-6 py-4 cursor-pointer transition-all"
                                    style={{
                                        borderBottom:
                                            index < services.length - 1
                                                ? '0.5px solid #f8fafc'
                                                : 'none',

                                        background:
                                            selected?._id === service._id
                                                ? '#f8fafc'
                                                : 'transparent'
                                    }}
                                >

                                    <div className="flex items-start justify-between gap-3">

                                        <div className="flex-1 min-w-0">

                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: '#0f172a' }}
                                            >
                                                {service.applicationNumber}
                                            </p>

                                            <p
                                                className="text-xs mt-1"
                                                style={{ color: '#94a3b8' }}
                                            >
                                                {service.applicantName}
                                            </p>

                                            <p
                                                className="text-xs mt-1"
                                                style={{ color: '#cbd5e1' }}
                                            >
                                                {serviceLabels[service.serviceType]}
                                                {' • '}
                                                {service.connectionType}
                                            </p>

                                            <p
                                                className="text-xs mt-1 truncate"
                                                style={{ color: '#94a3b8' }}
                                            >
                                                {service.propertyAddress}
                                            </p>

                                        </div>

                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full"
                                            style={{
                                                background: cfg.bg,
                                                color: cfg.color,
                                                border: `0.5px solid ${cfg.border}`
                                            }}
                                        >
                                            {cfg.label}
                                        </span>

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>
                {/* Service Request Details */}
                {selected && (
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{
                            background: '#ffffff',
                            border: '0.5px solid #e2e8f0'
                        }}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-4 flex items-center justify-between"
                            style={{ borderBottom: '0.5px solid #f1f5f9' }}
                        >
                            <p
                                className="text-sm font-medium"
                                style={{ color: '#0f172a' }}
                            >
                                Service Request Details
                            </p>

                            <button
                                onClick={() => setSelected(null)}
                                style={{
                                    color: '#94a3b8',
                                    fontSize: '18px'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">

                            {/* Application Number */}
                            <span
                                className="text-xs px-2 py-0.5 rounded font-mono"
                                style={{
                                    background: '#f1f5f9',
                                    color: '#64748b'
                                }}
                            >
                                {selected.applicationNumber}
                            </span>

                            <h3
                                className="text-base font-medium mt-3 mb-2"
                                style={{ color: '#0f172a' }}
                            >
                                {serviceLabels[selected.serviceType]}
                            </h3>

                            <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                                Applicant: {selected.applicantName}
                            </p>

                            <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                                Email: {selected.user?.email || '—'}
                            </p>

                            <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                                Phone: {selected.phone || '—'}
                            </p>

                            <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>
                                Ward: {selected.ward || '—'}
                            </p>

                            <p className="text-xs mb-4" style={{ color: '#94a3b8' }}>
                                Connection: {selected.connectionType}
                            </p>

                            <p
                                className="text-sm font-light mb-3"
                                style={{ color: '#64748b' }}
                            >
                                <strong>Property Address:</strong><br />
                                {selected.propertyAddress}
                            </p>

                            {selected.remarks && (
                                <p
                                    className="text-sm font-light mb-4"
                                    style={{ color: '#64748b' }}
                                >
                                    <strong>Remarks:</strong><br />
                                    {selected.remarks}
                                </p>
                            )}

                            <p
                                className="text-sm mb-4"
                                style={{ color: '#64748b' }}
                            >
                                <strong>Fee:</strong> ₹{selected.fee}
                                {' • '}
                                {selected.feePaid ? 'Paid' : 'Not Paid'}
                            </p>

                            {/* Uploaded Documents */}
                            {selected.documents?.length > 0 && (
                                <>
                                    <p
                                        className="text-xs uppercase tracking-wider mb-2"
                                        style={{ color: '#94a3b8' }}
                                    >
                                        Documents
                                    </p>

                                    <div className="flex gap-2 flex-wrap mb-5">
                                        {selected.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs px-3 py-2 rounded-lg"
                                                style={{
                                                    background: '#f8fafc',
                                                    border: '0.5px solid #e2e8f0',
                                                    color: '#4160bf'
                                                }}
                                            >
                                                Document {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div
                                style={{
                                    height: '0.5px',
                                    background: '#f1f5f9',
                                    margin: '18px 0'
                                }}
                            />

                            {/* Change Status */}
                            <p
                                className="text-xs uppercase tracking-wider mb-3"
                                style={{ color: '#94a3b8' }}
                            >
                                Change Status
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {Object.entries(statusConfig).map(([key, cfg]) => (
                                    <button
                                        key={key}
                                        onClick={() => setNewStatus(key)}
                                        className="text-xs px-3 py-2 rounded-lg text-left"
                                        style={{
                                            background:
                                                newStatus === key
                                                    ? cfg.bg
                                                    : '#f8fafc',

                                            color:
                                                newStatus === key
                                                    ? cfg.color
                                                    : '#64748b',

                                            border: `0.5px solid ${newStatus === key
                                                    ? cfg.border
                                                    : '#e2e8f0'
                                                }`
                                        }}
                                    >
                                        {cfg.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                rows={3}
                                placeholder="Add note..."
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                className="w-full rounded-lg p-3 text-sm mb-3 outline-none"
                                style={{
                                    resize: 'none',
                                    background: '#f8fafc',
                                    border: '0.5px solid #e2e8f0'
                                }}
                            />

                            <button
                                onClick={handleStatusUpdate}
                                disabled={updating || !newStatus}
                                className="w-full py-2.5 rounded-lg text-sm font-medium"
                                style={{
                                    background:
                                        updating || !newStatus
                                            ? '#e2e8f0'
                                            : '#4160bf',

                                    color:
                                        updating || !newStatus
                                            ? '#94a3b8'
                                            : '#ffffff'
                                }}
                            >
                                {updating
                                    ? 'Updating...'
                                    : 'Update Status'}
                            </button>

                            <div
                                style={{
                                    height: '0.5px',
                                    background: '#f1f5f9',
                                    margin: '20px 0'
                                }}
                            />

                            <p
                                className="text-xs uppercase tracking-wider mb-3"
                                style={{ color: '#94a3b8' }}
                            >
                                Status History
                            </p>

                            <div className="space-y-3">
                                {selected.statusHistory?.map((item, index) => {
                                    const cfg = statusConfig[item.status];

                                    return (
                                        <div key={index}>
                                            <p
                                                className="text-xs font-medium"
                                                style={{ color: cfg?.color }}
                                            >
                                                {cfg?.label}
                                            </p>

                                            {item.note && (
                                                <p
                                                    className="text-xs"
                                                    style={{ color: '#94a3b8' }}
                                                >
                                                    {item.note}
                                                </p>
                                            )}

                                            <p
                                                className="text-xs"
                                                style={{ color: '#cbd5e1' }}
                                            >
                                                {new Date(item.updatedAt).toLocaleDateString()}
                                            </p>
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

export default AdminServices;