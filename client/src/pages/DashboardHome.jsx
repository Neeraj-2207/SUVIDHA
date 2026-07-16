import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

// ─────────────────────────────────────────
// Stat Card
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
        {value ?? '—'}
      </p>
      {sub && (
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{sub}</p>
      )}
    </div>
    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
         style={{ background: color + '15', color }}>
      {icon}
    </div>
  </div>
);

// ─────────────────────────────────────────
// Action Card
// ─────────────────────────────────────────
const ActionCard = ({ label, desc, icon, color, onClick }) => (
  <div
    onClick={onClick}
    className="rounded-xl p-5 cursor-pointer transition-all"
    style={{ background: '#ffffff', border: '0.5px solid #e2e8f0' }}
    onMouseEnter={e => e.currentTarget.style.border = `0.5px solid ${color}40`}
    onMouseLeave={e => e.currentTarget.style.border = '0.5px solid #e2e8f0'}
  >
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
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate                         = useNavigate();

  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning'
                 : hour < 17 ? 'Good afternoon'
                 : 'Good evening';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(false);

      // ─────────────────────────────────────────
      // ADMIN / SUPERADMIN — fetch platform stats
      // ─────────────────────────────────────────
      if (isAdmin || isSuperAdmin) {
        const res = await API.get('/admin/stats');
        setStats({
          type:       'admin',
          totalUsers: res.data.stats.users.total,
          totalBills: res.data.stats.bills.total,
          paidBills:  res.data.stats.bills.paid,
          revenue:    res.data.stats.bills.revenue,
          totalComplaints:   res.data.stats.complaints.total,
          pendingComplaints: res.data.stats.complaints.pending,
          resolvedComplaints: res.data.stats.complaints.resolved
        });
        return;
      }

      // ─────────────────────────────────────────
      // CITIZEN — fetch their own stats only
      // ─────────────────────────────────────────
      const [billsRes, complaintsRes, servicesRes] = await Promise.all([
        API.get('/bills'),
        API.get('/complaints'),
        API.get('/services')
      ]);

      setStats({
        type:            'citizen',
        pendingBills:    billsRes.data.summary.unpaid +
                         billsRes.data.summary.overdue,
        overdueBills:    billsRes.data.summary.overdue,
        totalDue:        billsRes.data.summary.totalDue,
        activeComplaints: complaintsRes.data.summary.pending +
                          complaintsRes.data.summary.in_progress,
        totalComplaints:  complaintsRes.data.summary.total,
        pendingServices:  servicesRes.data.summary.pending +
                          servicesRes.data.summary.under_review,
        totalServices:    servicesRes.data.summary.total
      });

    } catch (err) {
      console.error('Dashboard stats error:', err);
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ICONS (reusable)
  // ─────────────────────────────────────────
  const icons = {
    bill: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    complaint: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    service: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      </svg>
    ),
    user: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    money: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    doc: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" strokeWidth="1.5"
           strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    )
  };

  // ─────────────────────────────────────────
  // BUILD STAT CARDS based on role
  // ─────────────────────────────────────────
  const buildStatCards = () => {
    if (!stats) return [];

    if (stats.type === 'admin') {
      return [
        {
          label: 'Total Citizens',
          value: stats.totalUsers,
          color: '#4160bf',
          icon:  icons.user
        },
        {
          label: 'Total Revenue',
          value: `₹${(stats.revenue || 0).toLocaleString('en-IN')}`,
          color: '#16a34a',
          sub:   `${stats.paidBills} bills paid`,
          icon:  icons.money
        },
        {
          label: 'Pending Complaints',
          value: stats.pendingComplaints,
          color: '#ef4444',
          sub:   `${stats.totalComplaints} total`,
          icon:  icons.complaint
        },
        {
          label: 'Resolved',
          value: stats.resolvedComplaints,
          color: '#22c55e',
          sub:   'Complaints resolved',
          icon:  icons.complaint
        }
      ];
    }

    // Citizen stats
    return [
      {
        label: 'Pending Bills',
        value: stats.pendingBills,
        color: '#f59e0b',
        sub:   stats.totalDue > 0
          ? `₹${stats.totalDue.toLocaleString('en-IN')} due`
          : 'All clear!',
        icon: icons.bill
      },
      {
        label: 'Overdue Bills',
        value: stats.overdueBills,
        color: '#ef4444',
        sub:   stats.overdueBills > 0
          ? 'Pay immediately!'
          : 'None overdue ✓',
        icon: icons.bill
      },
      {
        label: 'Active Complaints',
        value: stats.activeComplaints,
        color: '#2563eb',
        sub:   `${stats.totalComplaints} total filed`,
        icon:  icons.complaint
      },
      {
        label: 'Service Requests',
        value: stats.pendingServices,
        color: '#8b5cf6',
        sub:   `${stats.totalServices} total applied`,
        icon:  icons.service
      }
    ];
  };

  // ─────────────────────────────────────────
  // QUICK ACTIONS based on role
  // ─────────────────────────────────────────
  const citizenActions = [
    {
      label: 'Pay a bill',
      desc:  'View and pay your pending utility bills',
      color: '#f59e0b',
      path:  '/dashboard/bills',
      icon:  icons.bill
    },
    {
      label: 'File a complaint',
      desc:  'Report civic issues in your ward',
      color: '#ef4444',
      path:  '/dashboard/complaints',
      icon:  icons.complaint
    },
    {
      label: 'Ask AI assistant',
      desc:  'Get answers to civic service questions',
      color: '#2563eb',
      path:  '/dashboard/ai',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.5"
             strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
    {
      label: 'Service request',
      desc:  'Apply for water, electricity or gas',
      color: '#8b5cf6',
      path:  '/dashboard/services',
      icon:  icons.service
    }
  ];

  const adminActions = [
    {
      label: 'View complaints',
      desc:  'Review and update complaint statuses',
      color: '#ef4444',
      path:  '/admin/complaints',
      icon:  icons.complaint
    },
    {
      label: 'Service requests',
      desc:  'Approve or reject connection requests',
      color: '#8b5cf6',
      path:  '/admin/services',
      icon:  icons.service
    },
    {
      label: 'All citizens',
      desc:  'View and manage citizen accounts',
      color: '#4160bf',
      path:  '/admin/users',
      icon:  icons.user
    },
    {
      label: 'Create bill',
      desc:  'Generate a bill for a citizen',
      color: '#16a34a',
      path:  '/admin/users',
      icon:  icons.bill
    }
  ];

  const actions = (isAdmin || isSuperAdmin) ? adminActions : citizenActions;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          Loading dashboard...
        </p>
      </div>
    );
  }

  const statCards = buildStatCards();

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
          {(isAdmin || isSuperAdmin)
            ? 'Platform overview — all citizens and services.'
            : `Here's what's happening with your municipal services today.${
                user?.ward
                  ? ` Registered under ${user.ward}.`
                  : ''
              }`
          }
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-3 mb-5">
        <p className="text-xs uppercase tracking-widest flex-shrink-0"
           style={{ color: '#94a3b8' }}>
          Quick actions
        </p>
        <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map(a => (
          <ActionCard
            key={a.label}
            {...a}
            onClick={() => navigate(a.path)}
          />
        ))}
      </div>

    </div>
  );
};

export default DashboardHome;
