import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import AadhaarUpload from '../components/AadhaarUpload';

// Password Change Modal
const ChangePasswordModal = ({ onClose }) => {
  const [pwForm, setPwForm]       = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: ''
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setPwLoading(true);
      setPwError('');
      const res = await API.patch('/auth/change-password', pwForm);
      setPwSuccess(res.data.message);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setPwError(err.response?.data?.message || 'Could not change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    background: '#f8fafc',
    border:     '0.5px solid #e2e8f0',
    color:      '#0f172a',
    fontFamily: 'DM Sans, sans-serif',
    width:      '100%',
    padding:    '10px 14px',
    borderRadius: '8px',
    outline:    'none',
    fontSize:   '14px'
  };

  const EyeIcon = ({ show }) => show ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18"/>
      <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/>
      <path d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4 0 7.333 2.333 10
               7c-.778 1.361-1.612 2.524-2.503 3.488m-2.14 1.861C15.726
               18.332 13.942 19 12 19c-4 0-7.333-2.333-10-7c1.369-2.395
               2.913-4.175 4.632-5.341"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7
               c2.667-4.667 6-7 10-7s7.333 2.333 10 7"/>
    </svg>
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}  // click outside to close
    >
      {/* Modal box */}
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: '#ffffff' }}
        onClick={e => e.stopPropagation()}  // prevent close when clicking inside
      >
        {/* Accent bar */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #4160bf 0%, #4160bf 40%, #e2e8f0 40%)'
        }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
             style={{ borderBottom: '0.5px solid #f1f5f9' }}>
          <div>
            <h3 className="text-base font-medium" style={{ color: '#0f172a' }}>
              Change Password
            </h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
              Use a strong password with letters and numbers.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: '#f8fafc', color: '#94a3b8' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5">

          {/* Success */}
          {pwSuccess && (
            <div className="text-sm px-4 py-3 rounded-lg mb-4"
                 style={{ background: '#f0fdf4', color: '#16a34a',
                          border: '0.5px solid #bbf7d0' }}>
              ✓ {pwSuccess}
            </div>
          )}

          {/* Error */}
          {pwError && (
            <div className="text-sm px-4 py-3 rounded-lg mb-4"
                 style={{ background: '#fef2f2', color: '#dc2626',
                          border: '0.5px solid #fecaca' }}>
              {pwError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5
                                uppercase tracking-wider"
                     style={{ color: '#94a3b8' }}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm(p => ({
                    ...p, currentPassword: e.target.value
                  }))}
                  placeholder="Enter current password"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button type="button"
                        onClick={() => setShowPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#94a3b8' }}>
                  <EyeIcon show={showPw} />
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5
                                uppercase tracking-wider"
                     style={{ color: '#94a3b8' }}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm(p => ({
                    ...p, newPassword: e.target.value
                  }))}
                  placeholder="Minimum 6 characters"
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button type="button"
                        onClick={() => setShowNewPw(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: '#94a3b8' }}>
                  <EyeIcon show={showNewPw} />
                </button>
              </div>
              {/* Strength indicator */}
              {pwForm.newPassword && (
                <p className="text-xs mt-1" style={{
                  color: pwForm.newPassword.length < 6  ? '#dc2626'
                       : pwForm.newPassword.length < 10 ? '#d97706'
                       : '#16a34a'
                }}>
                  {pwForm.newPassword.length < 6  ? 'Too short'
                 : pwForm.newPassword.length < 10 ? 'Moderate'
                 : 'Strong ✓'}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5
                                uppercase tracking-wider"
                     style={{ color: '#94a3b8' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(p => ({
                  ...p, confirmPassword: e.target.value
                }))}
                placeholder="Repeat new password"
                style={inputStyle}
              />
              {/* Match indicator */}
              {pwForm.confirmPassword && (
                <p className="text-xs mt-1" style={{
                  color: pwForm.newPassword === pwForm.confirmPassword
                    ? '#16a34a' : '#dc2626'
                }}>
                  {pwForm.newPassword === pwForm.confirmPassword
                    ? 'Passwords match ✓'
                    : 'Passwords do not match'}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: pwLoading ? '#93c5fd' : '#4160bf',
                color:      '#ffffff',
                cursor:     pwLoading ? 'not-allowed' : 'pointer',
                marginTop:  '8px'
              }}
            >
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [profile, setProfile]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [showPwModal, setShowPwModal] = useState(false);  // ← modal toggle

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
           style={{ background: '#fef2f2', color: '#dc2626',
                    border: '0.5px solid #fecaca' }}>
        {error}
      </div>
    );
  }

  const data = profile || user;

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

      {/* Modal */}
      {showPwModal && (
        <ChangePasswordModal onClose={() => setShowPwModal(false)} />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            My Profile
          </h2>
          <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
            Your personal and civic registration details.
          </p>
        </div>

        {/* Change password button */}
        <button
          onClick={() => setShowPwModal(true)}
          className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: '#f8fafc',
            color:      '#4160bf',
            border:     '0.5px solid #e2e8f0'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4160bf';
            e.currentTarget.style.color      = '#ffffff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.color      = '#4160bf';
          }}
        >
          🔐 Change Password
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-xl overflow-hidden"
           style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>

        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #2563eb 0%, #2563eb 40%, #e2e8f0 40%)'
        }} />

        {/* Avatar + name */}
        <div className="px-6 py-6 flex items-center gap-4"
             style={{ borderBottom: '0.5px solid #f1f5f9' }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center
                          text-xl font-medium flex-shrink-0"
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
                    style={{ background: '#eff6ff', color: '#2563eb',
                             border: '0.5px solid #bfdbfe' }}>
                {data?.role}
              </span>

              {data?.aadhaarVerified ? (
                <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: '#f0fdf4', color: '#16a34a',
                               border: '0.5px solid #bbf7d0' }}>
                  ✓ Aadhaar verified
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: '#fefce8', color: '#ca8a04',
                                 border: '0.5px solid #fde68a' }}>
                    Aadhaar not verified
                  </span>
                  <button
                    onClick={() => navigate('/dashboard/verify-aadhaar')}
                    className="text-xs px-2 py-0.5 rounded-full transition-all"
                    style={{ background: '#eff6ff', color: '#2563eb',
                             border: '0.5px solid #bfdbfe', cursor: 'pointer' }}
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
          <InfoRow label="Email address"  value={data?.email} />
          <InfoRow label="Phone number"   value={data?.phone}
                   placeholder="Not provided" />
          <InfoRow label="Municipal ward" value={data?.ward}
                   placeholder="Not specified" />
          <InfoRow label="City"    value={data?.address?.city}
                   placeholder="Not provided" />
          <InfoRow label="State"   value={data?.address?.state}
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
