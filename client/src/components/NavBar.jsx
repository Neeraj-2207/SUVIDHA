// Navbar.jsx
// Top bar — page title, mobile menu toggle, user badge

import { useState } from 'react';
import { useLocation } from 'react-router-dom';

// Map paths to readable page titles
const pageTitles = {
  '/dashboard':           'Overview',
  '/dashboard/profile':   'My Profile',
  '/dashboard/bills':     'Bill Management',
  '/dashboard/complaints':'Complaints',
  '/dashboard/services':  'Service Requests',
  '/dashboard/documents': 'Documents',
  '/dashboard/ai':        'AI Assistant'
};

const Navbar = ({ onMenuToggle }) => {
  const location = useLocation();

  // Get current page title from the map above
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{
              background: '#ffffff',
              borderBottom: '0.5px solid #e2e8f0',
              minHeight: '64px'
            }}>

      <div className="flex items-center gap-4">
        {/* Mobile hamburger menu */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg transition"
          style={{ color: '#64748b' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        {/* Page title + breadcrumb */}
        <div>
          <p className="text-xs uppercase tracking-widest mb-0.5"
             style={{ color: '#94a3b8' }}>
            SUVIDHA
          </p>
          <h1 className="text-base font-medium"
              style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side — status badge */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full"
               style={{ background: '#22c55e' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>
            All systems operational
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-4"
             style={{ background: '#e2e8f0' }} />

        {/* Version tag */}
        {/* <span className="text-xs px-2 py-1 rounded"
              style={{ background: '#f0f4f8', color: '#94a3b8',
                       border: '0.5px solid #e2e8f0' }}>
          v1.0
        </span> */}
      </div>
    </header>
  );
};

export default Navbar;