import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookMarked,
  Calendar,
  BookOpen,
  Layers,
  UserPlus,
  FileText,
  CalendarClock,
  Sliders,
  ClipboardCheck,
  Calculator,
  Award,
  BarChart2,
  ShieldAlert,
  Settings,
  PenTool,
  Send,
  User,
  FileCheck,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { getInitials } from '../../utils/formatters';

const Sidebar = ({ isOpen = true, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'STUDENT';

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Programs', path: '/admin/programs', icon: BookMarked },
    { label: 'Academic Sessions', path: '/admin/sessions', icon: Calendar },
    { label: 'Courses Catalog', path: '/admin/courses', icon: BookOpen },
    { label: 'Course Offerings', path: '/admin/offerings', icon: Layers },
    { label: 'Student Enrollment', path: '/admin/enrollments', icon: UserPlus },
    { label: 'Examinations', path: '/admin/examinations', icon: FileText },
    { label: 'Exam Schedule', path: '/admin/schedule', icon: CalendarClock },
    { label: 'Grading & Results', path: '/admin/results', icon: Calculator },
    { label: 'Publication of Results', path: '/admin/results/published', icon: Award },
  ];

  const facultyNav = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/faculty/courses', icon: BookOpen },
    { label: 'Exam Schedule', path: '/faculty/schedule', icon: CalendarClock },
    { label: 'Marks Entry', path: '/faculty/marks', icon: PenTool },
    { label: 'Submissions', path: '/faculty/submissions', icon: Send },
    { label: 'Course Results', path: '/faculty/results', icon: Award },
    { label: 'Settings', path: '/faculty/settings', icon: Settings },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/student/profile', icon: User },
    { label: 'Enrolled Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Exam Schedule', path: '/student/schedule', icon: CalendarClock },
    { label: 'My Results', path: '/student/results', icon: Award },
    { label: 'Academic Transcript', path: '/student/transcript', icon: FileCheck },
    { label: 'Announcements', path: '/student/announcements', icon: Bell },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'FACULTY' ? facultyNav : studentNav;

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      style={{
        width: '260px',
        height: '100vh',
        backgroundColor: '#171717',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '64px',
          padding: '0 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #242424',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#101010',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.05em',
            }}
          >
            U
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
              UniGrade
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#858580', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>
              {role} PORTAL
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5625rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#FFFFFF' : '#B8B8B3',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 150ms ease',
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={16} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={12} style={{ opacity: 0.4 }} />
            </NavLink>
          );
        })}
      </div>

      {/* User Card & Logout */}
      <div
        style={{
          padding: '0.875rem 1rem',
          borderTop: '1px solid #242424',
          backgroundColor: '#101010',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: '#242424',
              border: '1px solid #555550',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.full_name || user?.email)}
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.full_name || 'Academic User'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#858580', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out"
          style={{
            background: 'none',
            border: 'none',
            color: '#858580',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

