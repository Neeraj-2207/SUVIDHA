// DashboardHome.jsx
// The overview page — quick stats and welcome message
// This replaces the temporary DashboardPage.jsx

import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────
// Stat Card — reusable component
// ─────────────────────────────────────────
const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="rounded-xl p-5 flex items-start justify-between"
       style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}>
    <div>
      <p className="text-xs uppercase tracking-wider mb-2"
         style={{ color: '#94a3b8' }}>
        {label}
      </p>
      <p className="text-2xl font-medium"
         style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          {sub}
        </p>
      )}
    </div>
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
         style={{ background: color + '15', color: color }}>
      {icon}
    </div>
  </div>
);

// ─────────────────────────────────────────
// Quick Action Card
// ─────────────────────────────────────────
const ActionCard = ({ label, desc, icon, color }) => (
  <div className="rounded-xl p-5 cursor-pointer transition-all group"
       style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}
       onMouseEnter={e => e.currentTarget.style.border = `0.5px solid ${color}40`}
       onMouseLeave={e => e.currentTarget.style.border = '0.5px solid #e2e8f0'}>
    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
         style={{ background: color + '15', color }}>
      {icon}
    </div>
    <p className="text-sm font-medium mb-1" style={{ color: '#0f172a' }}>
      {label}
    </p>
    <p className="text-xs font-light" style={{ color: '#94a3b8' }}>
      {desc}
    </p>
  </div>
);

const DashboardHome = () => {
  const { user } = useAuth();
    // console.log(user);
    
  // Get hour to show contextual greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const stats = [
    {
      label: 'Pending Bills',
      value: '3',
      sub: '₹2,450 due this month',
      color: '#f59e0b',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )
    },
    {
      label: 'Active Complaints',
      value: '1',
      sub: 'Last updated 2 days ago',
      color: '#ef4444',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      label: 'Service Requests',
      value: '0',
      sub: 'No pending requests',
      color: '#2563eb',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
      )
    },
    {
      label: 'Documents',
      value: '0',
      sub: 'No uploads yet',
      color: '#22c55e',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
      )
    }
  ];

  const actions = [
    {
      label: 'Pay a bill',
      desc: 'View and pay your pending utility bills',
      color: '#f59e0b',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      )
    },
    {
      label: 'File a complaint',
      desc: 'Report civic issues in your ward',
      color: '#ef4444',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      label: 'Ask AI assistant',
      desc: 'Get answers to civic service questions',
      color: '#2563eb',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
    {
      label: 'Upload document',
      desc: 'Store important civic documents safely',
      color: '#22c55e',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">

      {/* Welcome header */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-1"
           style={{ color: '#94a3b8' }}>
          {greeting}
        </p>
        <h2 className="text-2xl font-medium"
            style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
          {user?.name}
          <span style={{ color: '#2563eb' }}>.</span>
        </h2>
        <p className="text-sm font-light mt-1" style={{ color: '#94a3b8' }}>
          Here's what's happening with your municipal services today.
          {user?.ward && (
            <span> You are registered under <strong style={{ color: '#64748b' }}>{user.ward}</strong>.</span>
          )}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Divider with label */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-xs uppercase tracking-widest flex-shrink-0"
           style={{ color: '#94a3b8' }}>
          Quick actions
        </p>
        <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
      </div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map(a => <ActionCard key={a.label} {...a} />)}
      </div>

    </div>
  );
};

export default DashboardHome;