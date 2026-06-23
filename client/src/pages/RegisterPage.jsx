import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    confirmPassword: '', phone: '', ward: ''
  });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await API.post('/auth/register', {
        name:     formData.name,
        email:    formData.email,
        password: formData.password,
        phone:    formData.phone,
        ward:     formData.ward
      });
      const { token, user } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18"/>
      <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/>
      <path d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4 0 7.333 2.333 10 7c-.778 1.361-1.612 2.524-2.503 3.488m-2.14 1.861C15.726 18.332 13.942 19 12 19c-4 0-7.333-2.333-10-7c1.369-2.395 2.913-4.175 4.632-5.341"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7"/>
    </svg>
  );

  const inputStyle = {
    background: '#f8fafc',
    border: '0.5px solid #e2e8f0',
    color: '#0f172a',
    fontFamily: 'DM Sans, sans-serif'
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

  const handleFocus = e => e.target.style.border = '0.5px solid #93c5fd';
  const handleBlur  = e => e.target.style.border = '0.5px solid #e2e8f0';

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: '#f0f4f8' }}>

      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
           style={{ background: '#ffffff',
                    border: '0.5px solid #dde3ed',
                    boxShadow: '0 2px 24px 0 rgba(30,64,175,0.07)' }}>

        {/* Blue accent bar — asymmetric, intentional */}
        <div style={{
          height: '3px',
          background: 'linear-gradient(90deg, #2563eb 0%, #2563eb 35%, #e2e8f0 35%)'
        }} />

        <div className="p-8 md:p-10">

          {/* Header row */}
          <div className="flex items-start justify-between mb-7">
            <div>
              {/* Brand */}
              <div className="flex items-baseline gap-0.5 mb-3">
                <span className="text-base font-semibold"
                      style={{ color: '#2563eb', letterSpacing: '-0.01em' }}>S</span>
                <span className="text-xs font-light tracking-widest"
                      style={{ color: '#9ca3af' }}>UVIDHA</span>
              </div>
              <h2 className="text-xl font-medium"
                  style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Create your account
              </h2>
              <p className="text-xs font-light mt-1" style={{ color: '#94a3b8' }}>
                Takes about 2 minutes
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex flex-col items-end gap-1 pt-1">
              <span className="text-xs" style={{ color: '#94a3b8' }}>Step 1 of 1</span>
              <div className="flex gap-1.5">
                {[true, false, false].map((active, i) => (
                  <div key={i}
                       style={{
                         width: '20px', height: '3px', borderRadius: '2px',
                         background: active ? '#2563eb' : '#e2e8f0'
                       }} />
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '0.5px', background: '#f1f5f9', marginBottom: '24px' }} />

          {/* Error */}
          {error && (
            <div className="text-sm px-4 py-3 rounded-lg mb-5"
                 style={{ background: '#fef2f2', color: '#dc2626',
                          border: '0.5px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Row 1 — Name + Phone */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label style={labelStyle}>
                  Full name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="Ravi Kumar"
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="tel" name="phone" value={formData.phone}
                  onChange={handleChange} placeholder="98765 43210"
                  className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                  style={inputStyle}
                  onFocus={handleFocus} onBlur={handleBlur}
                />
                <p className="text-xs mt-1 font-light italic"
                   style={{ color: '#cbd5e1' }}>
                  Indian mobile number only
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label style={labelStyle}>
                Email address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} placeholder="ravi@example.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
            </div>

            {/* Ward */}
            <div className="mb-4">
              <label style={labelStyle}>Municipal ward</label>
              <input
                type="text" name="ward" value={formData.ward}
                onChange={handleChange} placeholder="Ward 12 — Governorpet"
                className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                style={inputStyle}
                onFocus={handleFocus} onBlur={handleBlur}
              />
              <p className="text-xs mt-1 font-light italic"
                 style={{ color: '#cbd5e1' }}>
                Used to route your complaints to the right officer
              </p>
            </div>

            {/* Row 2 — Password + Confirm */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label style={labelStyle}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={formData.password}
                    onChange={handleChange} placeholder="Min. 6 chars"
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none pr-10"
                    style={inputStyle}
                    onFocus={handleFocus} onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#94a3b8' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  Confirm <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword" value={formData.confirmPassword}
                    onChange={handleChange} placeholder="Repeat password"
                    className="w-full px-3 py-2.5 text-sm rounded-lg outline-none pr-10"
                    style={inputStyle}
                    onFocus={handleFocus} onBlur={handleBlur}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#94a3b8' }}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon show={showConfirm} />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: loading ? '#93c5fd' : '#1e40af',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.01em'
              }}
            >
              {loading ? 'Creating account...' : 'Create my account →'}
            </button>

          </form>

          <p className="text-center text-xs mt-5" style={{ color: '#94a3b8' }}>
            Already registered?{' '}
            <Link to="/login"
                  className="font-medium hover:underline"
                  style={{ color: '#2563eb' }}>
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;