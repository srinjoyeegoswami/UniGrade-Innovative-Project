import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import gsap from 'gsap';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    gsap.fromTo(
      '.student-page-content',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
    );
  }, [location.pathname]);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, idx) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
    path: '/' + pathSegments.slice(0, idx + 1).join('/'),
  }));

  return (
    <div className="layout-wrapper" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F4F1' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="layout-content"
        style={{
          marginLeft: '260px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} breadcrumbs={breadcrumbs} />

        <main
          className="student-page-content"
          style={{
            flex: 1,
            padding: '1.75rem',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;

