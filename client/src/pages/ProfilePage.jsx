// ProfilePage.jsx
// Shows current user's details
// Fetches fresh data from GET /api/auth/me

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

import AadhaarUpload from '../components/AadhaarUpload';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ─────────────────────────────────────────
    // Fetch fresh profile from backend on mount
    // useEffect with [] = runs once when page loads
    // ─────────────────────────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await API.get('/auth/me');
                setProfile(response.data.user);
            } catch (err) {
                setError('Could not load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-sm" style={{ color: '#94a3b8' }}>
                    Loading profile...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto mt-8 px-4 py-3 rounded-lg text-sm"
                style={{ background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca' }}>
                {error}
            </div>
        );
    }

    const data = profile || user;

    // Reusable info row
    const InfoRow = ({ label, value, placeholder }) => (
        <div className="py-4" style={{ borderBottom: '0.5px solid #f1f5f9' }}>
            <p className="text-xs uppercase tracking-wider mb-1"
                style={{ color: '#94a3b8' }}>
                {label}
            </p>
            <p className="text-sm" style={{ color: value ? '#0f172a' : '#cbd5e1' }}>
                {value || placeholder || '—'}
            </p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">

            {/* Page header */}
            <div className="mb-6">
                <h2 className="text-xl font-medium"
                    style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                    My Profile
                </h2>
                <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
                    Your personal and civic registration details.
                </p>
            </div>

            {/* Profile card */}
            <div className="rounded-xl overflow-hidden"
                style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

                {/* Blue accent top bar */}
                <div style={{
                    height: '3px',
                    background: 'linear-gradient(90deg, #2563eb 0%, #2563eb 40%, #e2e8f0 40%)'
                }} />

                {/* Avatar + name header */}
                <div className="px-6 py-6 flex items-center gap-4"
                    style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-medium flex-shrink-0"
                        style={{ background: '#eff6ff', color: '#2563eb' }}>
                        {data?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-medium"
                            style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
                            {data?.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                                style={{
                                    background: '#eff6ff', color: '#2563eb',
                                    border: '0.5px solid #bfdbfe'
                                }}>
                                {data?.role}
                            </span>
                            {data?.aadhaarVerified && (
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                    style={{
                                        background: '#f0fdf4', color: '#16a34a',
                                        border: '0.5px solid #bbf7d0'
                                    }}>
                                    ✓ Aadhaar verified
                                </span>
                            )}
                            {!data?.aadhaarVerified && (
                                <div className="flex items-center gap-2">

                                    {/* Not verified badge */}
                                    <span className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                            background: '#fefce8', color: '#ca8a04',
                                            border: '0.5px solid #fde68a'
                                        }}>
                                        Aadhaar not verified
                                    </span>

                                    {/* Verify now button */}
                                    <button
                                        onClick={() => navigate('/dashboard/verify-aadhaar')}
                                        className="text-xs px-2 py-0.5 rounded-full transition-all"
                                        style={{
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            border: '0.5px solid #bfdbfe',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#2563eb';
                                            e.currentTarget.style.color = '#ffffff';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#eff6ff';
                                            e.currentTarget.style.color = '#2563eb';
                                        }}
                                    >
                                        Verify now →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info fields */}
                <div className="px-6">
                    <InfoRow label="Email address" value={data?.email} />
                    <InfoRow label="Phone number" value={data?.phone}
                        placeholder="Not provided" />
                    <InfoRow label="Municipal ward" value={data?.ward}
                        placeholder="Not specified" />
                    <InfoRow label="City" value={data?.address?.city}
                        placeholder="Not provided" />
                    <InfoRow label="State" value={data?.address?.state}
                        placeholder="Not provided" />
                    <InfoRow label="Pincode" value={data?.address?.pincode}
                        placeholder="Not provided" />
                    <InfoRow
                        label="Member since"
                        value={data?.createdAt
                            ? new Date(data.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })
                            : null}
                    />
                    <div className="py-4">
                        <p className="text-xs uppercase tracking-wider mb-1"
                            style={{ color: '#94a3b8' }}>
                            Last login
                        </p>
                        <p className="text-sm" style={{ color: '#0f172a' }}>
                            {data?.lastLogin
                                ? new Date(data.lastLogin).toLocaleString('en-IN', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })
                                : '—'}
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default ProfilePage;