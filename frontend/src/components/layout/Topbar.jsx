import React, { useState } from 'react';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../common/Breadcrumb';

const Topbar = ({ onToggleSidebar, breadcrumbs = [] }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header
      className="topbar"
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #D8D8D4',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-menu-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: '#171717',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#555550',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <Bell size={18} />
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                backgroundColor: '#101010',
                borderRadius: '50%',
              }}
            />
          </button>
        </div>

        {/* User profile dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#171717',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#171717' }}>
                {user?.full_name || 'Academic User'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#858580' }}>
                {user?.role}
              </div>
            </div>
            <ChevronDown size={14} color="#858580" />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                width: '180px',
                backgroundColor: '#FFFFFF',
                borderRadius: '6px',
                border: '1px solid #D8D8D4',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '0.375rem',
                zIndex: 100,
              }}
            >
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8125rem',
                  color: '#171717',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderRadius: '4px',
                }}
                className="dropdown-item"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;

