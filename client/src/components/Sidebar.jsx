import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )
  },
  {
    label: 'My Profile',
    path: '/dashboard/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    )
  },
  {
    label: 'Bills',
    path: '/dashboard/bills',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    )
  },
  {
    label: 'Complaints',
    path: '/dashboard/complaints',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    label: 'Service Requests',
    path: '/dashboard/services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    )
  },
  {
    label: 'Documents',
    path: '/dashboard/documents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    label: 'AI Assistant',
    path: '/dashboard/ai',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        <circle cx="9" cy="14" r="1" fill="currentColor" />
        <circle cx="15" cy="14" r="1" fill="currentColor" />
      </svg>
    )
  }
];


const adminNavItems = [
  {
    label: 'Admin Overview',
    path: '/admin',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
  },
  {
    label: 'All Citizens',
    path: '/admin/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  },
  {
    label: 'All Complaints',
    path: '/admin/complaints',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    label: 'Service Requests',
    path: '/admin/services',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    )
  }
];

// Superadmin-only items — separate array
const superAdminNavItems = [
  {
    label: 'Manage Admins',
    path: '/admin/manage-admins',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-transform duration-200
          md:relative md:translate-x-0 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '240px',
          background: '#4160bf',
          borderRight: '0.5px solid #3550a8'
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '0.5px solid #3550a8' }}>
          <div className="flex items-baseline gap-0.5">
            <span className="text-lg font-semibold"
              style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>S</span>
            <span className="text-xs font-light tracking-widest"
              style={{ color: '#c7d2fe' }}>UVIDHA</span>
          </div>
          <button onClick={onClose} className="md:hidden"
            style={{ color: '#c7d2fe' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User info strip */}
        <div className="px-6 py-4"
          style={{ borderBottom: '0.5px solid #3550a8' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg
                            text-xs font-medium flex-shrink-0"
              style={{ background: '#3550a8', color: '#ffffff' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate"
                style={{ color: '#ffffff' }}>
                {user?.name}
              </p>
              <p className="text-xs capitalize"
                style={{ color: '#c7d2fe' }}>
                {user?.role}{user?.ward ? ` Ward : ${user.ward}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest mb-3 px-3"
            style={{ color: '#93a8f0' }}>
            Main menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all"
              style={({ isActive }) => ({
                background: isActive ? '#3550a8' : 'transparent',
                color: isActive ? '#ffffff' : '#c7d2fe',
                fontWeight: isActive ? '500' : '400'
              })}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Admin section */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <>
              <div className="mt-4 mb-3 px-3 flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: '#3550a8' }} />
                <p className="text-xs uppercase tracking-widest flex-shrink-0"
                  style={{ color: '#93a8f0' }}>
                  Admin
                </p>
                <div className="flex-1 h-px" style={{ background: '#3550a8' }} />
              </div>
              {adminNavItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.exact}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all"
                  style={({ isActive }) => ({
                    background: isActive ? '#3550a8' : 'transparent',
                    color: isActive ? '#ffffff' : '#c7d2fe',
                    fontWeight: isActive ? '500' : '400'
                  })}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          {/* Superadmin only section */}
          {user?.role === 'superadmin' && (
            <>
              <div className="mt-3 mb-3 px-3 flex items-center gap-2">
                <div className="flex-1 h-px" style={{ background: '#3550a8' }} />
                <p className="text-xs uppercase tracking-widest flex-shrink-0"
                  style={{ color: '#f59e0b' }}>
                  Super Admin
                </p>
                <div className="flex-1 h-px" style={{ background: '#3550a8' }} />
              </div>
              {superAdminNavItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.exact}
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all"
                  style={({ isActive }) => ({
                    background: isActive ? '#3550a8' : 'transparent',
                    color: isActive ? '#f59e0b' : '#fcd34d',
                    fontWeight: isActive ? '500' : '400'
                  })}>
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

        </nav>
        {/* Logout */}
        <div className="px-3 py-4"
          style={{ borderTop: '0.5px solid #3550a8' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm transition-all"
            style={{ color: '#c7d2fe' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#3550a8';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#c7d2fe';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
