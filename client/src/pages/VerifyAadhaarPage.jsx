import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AadhaarUpload from '../components/AadhaarUpload';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const VerifyAadhaarPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [extractedData, setExtractedData] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleExtracted = (data) => {
        setExtractedData(data);
        setError('');
    };

    const handleConfirm = async () => {
        if (!extractedData) return;

        try {
            setConfirming(true);
            setError('');

            await API.patch('/auth/verify-aadhaar', {
                aadhaarNumber: extractedData.aadhaar_number,
                name: extractedData.name,
                dob: extractedData.dob
            });

            setSuccess(true);
            setTimeout(() => navigate('/dashboard/profile'), 2000);

        } catch (err) {
            const message = err.response?.data?.message ||
                'Could not verify Aadhaar. Please try again.';
            setError(message);

            // If it's a name mismatch, also clear extracted data
            // so they must re-upload (can't retry with same wrong card)
            if (err.response?.data?.mismatch) {
                setTimeout(() => setExtractedData(null), 3000);
            }

        } finally {
            setConfirming(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto mt-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#f0fdf4' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="#16a34a" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="text-lg font-medium mb-1" style={{ color: '#0f172a' }}>
                    Aadhaar Verified!
                </h2>
                <p className="text-sm font-light" style={{ color: '#94a3b8' }}>
                    Redirecting you back to your profile...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto">

            {/* Back link */}
            <button
                onClick={() => navigate('/dashboard/profile')}
                className="flex items-center gap-1.5 text-xs mb-5 transition-opacity hover:opacity-70"
                style={{ color: '#94a3b8' }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to profile
            </button>

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-medium"
                    style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Verify Aadhaar
                </h2>
                <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
                    Upload your Aadhaar card to verify your identity as a citizen of Vijayawada.
                </p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{
                            background: extractedData ? '#4160bf' : '#e2e8f0',
                            color: extractedData ? '#ffffff' : '#94a3b8'
                        }}>
                        1
                    </div>
                    <span className="text-xs" style={{ color: '#64748b' }}>Upload</span>
                </div>
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
                        style={{
                            background: extractedData ? '#e2e8f0' : '#e2e8f0',
                            color: '#94a3b8'
                        }}>
                        2
                    </div>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>Confirm</span>
                </div>
            </div>

            {/* OCR Upload component */}
            <AadhaarUpload onExtracted={handleExtracted} />

            {/* Confirmation panel — shows after extraction */}
            {extractedData && (
                <div className="mt-5 rounded-xl p-5"
                    style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

                    <p className="text-sm font-medium mb-1" style={{ color: '#0f172a' }}>
                        Confirm your details
                    </p>
                    <p className="text-xs font-light mb-4" style={{ color: '#94a3b8' }}>
                        Review the extracted information before confirming.
                    </p>

                    <div className="space-y-3 mb-5">
                        <div className="flex justify-between py-2"
                            style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                            <span className="text-xs" style={{ color: '#94a3b8' }}>Full Name</span>
                            <span className="text-xs font-medium" style={{ color: '#0f172a' }}>
                                {extractedData.name || '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2"
                            style={{ borderBottom: '0.5px solid #f1f5f9' }}>
                            <span className="text-xs" style={{ color: '#94a3b8' }}>Date of Birth</span>
                            <span className="text-xs font-medium" style={{ color: '#0f172a' }}>
                                {extractedData.dob || '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-xs" style={{ color: '#94a3b8' }}>Aadhaar Number</span>
                            <span className="text-xs font-medium font-mono" style={{ color: '#0f172a' }}>
                                {extractedData.aadhaar_number || '—'}
                            </span>
                        </div>
                    </div>

                    {error && (
                        <div className="text-xs px-3 py-2 rounded-lg mb-4"
                            style={{
                                background: '#fef2f2', color: '#dc2626',
                                border: '0.5px solid #fecaca'
                            }}>
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: confirming ? '#93c5fd' : '#4160bf',
                            color: '#ffffff',
                            cursor: confirming ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {confirming ? 'Verifying...' : 'Confirm & Verify'}
                    </button>

                    <p className="text-xs text-center mt-3" style={{ color: '#cbd5e1' }}>
                        By confirming, you agree these details are accurate
                    </p>
                </div>
            )}

        </div>
    );
};

export default VerifyAadhaarPage;