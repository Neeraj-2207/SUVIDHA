import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const response = await API.post('/auth/login', {
        email:    formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18"/>
      <path d="M10.584 10.587a2 2 0 0 0 2.828 2.83"/>
      <path d="M9.363 5.365A9.466 9.466 0 0 1 12 5c4 0 7.333 2.333 10 7c-.778 1.361-1.612 2.524-2.503 3.488m-2.14 1.861C15.726 18.332 13.942 19 12 19c-4 0-7.333-2.333-10-7c1.369-2.395 2.913-4.175 4.632-5.341"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
         viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M22 12c-2.667 4.667-6 7-10 7s-7.333-2.333-10-7c2.667-4.667 6-7 10-7s7.333 2.333 10 7"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ background: '#f0f4f8' }}>

      <div className="w-full max-w-3xl rounded-2xl overflow-hidden flex"
           style={{ boxShadow: '0 2px 24px 0 rgba(30,64,175,0.07)', border: '0.5px solid #dde3ed' }}>

        {/* ── Left Dark Panel ── */}
        <div className="hidden md:flex flex-col justify-between p-10 w-2/5"
             style={{ background: '#0f1117', minHeight: '480px' }}>

          {/* Top — brand */}
          <div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-baseline gap-0.5">
                <span className="text-xl font-semibold"
                      style={{ color: '#60a5fa', letterSpacing: '-0.02em' }}>S</span>
                <span className="text-sm font-light"
                      style={{ color: '#6b6b80', letterSpacing: '0.12em' }}>UVIDHA</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded"
                    style={{ background: '#1e1e2e', color: '#4a4a60', letterSpacing: '0.05em' }}>
                v1.0 · Beta
              </span>
            </div>

            {/* Eyebrow */}
            <p className="text-xs mb-3 uppercase tracking-widest"
               style={{ color: '#60a5fa', opacity: 0.8 }}>
              Citizen services portal
            </p>

            {/* Heading */}
            <h1 className="text-2xl font-medium leading-snug"
                style={{ color: '#e8e8f0', letterSpacing: '-0.02em' }}>
              Good to have<br />you back
              <span style={{ color: '#60a5fa' }}>.</span>
            </h1>

            <p className="mt-3 text-xs font-light leading-relaxed"
               style={{ color: '#4a4a60' }}>
              Vijayawada Municipal Corporation<br />
              digital services platform
            </p>
          </div>

          {/* Bottom — feature pills */}
          <div className="flex flex-wrap gap-2">
            {['Bill payments', 'Complaints', 'Water & gas', 'AI assistant'].map(f => (
              <span key={f} className="text-xs px-3 py-1 rounded-full"
                    style={{ border: '0.5px solid #2a2a3a', color: '#4a4a60' }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 p-8 md:p-10"
             style={{ background: '#ffffff' }}>

          {/* Mobile brand */}
          <div className="md:hidden mb-6 flex items-baseline gap-0.5">
            <span className="text-lg font-semibold" style={{ color: '#2563eb' }}>S</span>
            <span className="text-xs font-light tracking-widest" style={{ color: '#9ca3af' }}>UVIDHA</span>
          </div>

          {/* Badge */}
          <span className="inline-block text-xs px-3 py-1 rounded-full mb-7"
                style={{ background: '#eff6ff', color: '#3b82f6',
                         border: '0.5px solid #bfdbfe', letterSpacing: '0.03em' }}>
            Citizen login
          </span>

          <h2 className="text-xl font-medium mb-1"
              style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            Sign in to your account
          </h2>
          <p className="text-sm font-light mb-8" style={{ color: '#94a3b8' }}>
            Enter your registered email and password.
          </p>

          {/* Error */}
          {error && (
            <div className="text-sm px-4 py-3 rounded-lg mb-5"
                 style={{ background: '#fef2f2', color: '#dc2626',
                          border: '0.5px solid #fecaca' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                     style={{ color: '#94a3b8' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ravi@example.com"
                className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all"
                style={{
                  background: '#f8fafc',
                  border: '0.5px solid #e2e8f0',
                  color: '#0f172a',
                  fontFamily: 'DM Sans, sans-serif'
                }}
                onFocus={e => e.target.style.border = '0.5px solid #93c5fd'}
                onBlur={e  => e.target.style.border = '0.5px solid #e2e8f0'}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
                     style={{ color: '#94a3b8' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 text-sm rounded-lg outline-none transition-all pr-11"
                  style={{
                    background: '#f8fafc',
                    border: '0.5px solid #e2e8f0',
                    color: '#0f172a',
                    fontFamily: 'DM Sans, sans-serif'
                  }}
                  onFocus={e => e.target.style.border = '0.5px solid #93c5fd'}
                  onBlur={e  => e.target.style.border = '0.5px solid #e2e8f0'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#94a3b8' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all mt-1"
              style={{
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.01em'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in to your account'}
            </button>

          </form>

          <p className="text-center text-xs mt-7" style={{ color: '#94a3b8' }}>
            No account yet?{' '}
            <Link to="/register"
                  className="font-medium hover:underline"
                  style={{ color: '#2563eb' }}>
              Register as a citizen →
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;