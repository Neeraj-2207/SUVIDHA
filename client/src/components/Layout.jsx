// Layout.jsx
// The master wrapper for all dashboard pages
// Sidebar + Navbar + page content (Outlet)

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import FloatingChat from './FloatingChat'; 

const Layout = () => {
  // Controls mobile sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden"
         style={{ background: '#f0f4f8' }}>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Outlet renders whichever child route is active */}
          <Outlet />
        </main>

      </div>
      <FloatingChat />
    </div>
  );
};

export default Layout;