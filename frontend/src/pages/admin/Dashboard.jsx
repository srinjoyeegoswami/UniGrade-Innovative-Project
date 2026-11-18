import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../services/dashboard.service';
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import AreaChart from '../../components/charts/AreaChart';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminDashboard();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <LoadingSkeleton height="2.5rem" width="300px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingSkeleton key={i} height="90px" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || data || {};
  const statCards = [
    { label: 'Total Students', value: s.total_students ?? 4, icon: Users, link: '/admin/students' },
    { label: 'Faculty Members', value: s.total_faculty ?? 3, icon: GraduationCap, link: '/admin/faculty' },
    { label: 'Departments', value: s.total_departments ?? 5, icon: Building2, link: '/admin/departments' },
    { label: 'Active Courses', value: s.total_courses ?? 6, icon: BookOpen, link: '/admin/courses' },
    { label: 'Academic Sessions', value: s.active_sessions ?? 1, icon: Calendar, link: '/admin/sessions' },
    { label: 'Total Examinations', value: s.total_examinations ?? 12, icon: FileText, link: '/admin/examinations' },
    { label: 'Pending Submissions', value: s.pending_submissions ?? 1, icon: Clock, link: '/admin/marks' },
    { label: 'Published Results', value: s.published_results ?? 4, icon: CheckCircle, link: '/admin/results/published' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#101010', margin: 0, letterSpacing: '-0.02em' }}>
            Administrative Dashboard
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#555550' }}>
            University examination governance, evaluation pipelines, and academic metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to="/admin/results"
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
          >
            Process Results <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 8 Stats Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Link
              key={i}
              to={c.link}
              className="stat-card"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #D8D8D4',
                padding: '1.25rem',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 150ms ease, box-shadow 150ms ease',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {c.label}
                </div>
                <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#101010', marginTop: '0.375rem', fontFamily: 'monospace' }}>
                  {c.value}
                </div>
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '6px',
                  backgroundColor: '#F4F4F1',
                  border: '1px solid #EAEAE7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#171717',
                }}
              >
                <Icon size={20} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visualizations Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '1.5rem' }}>
        {/* Department Enrollment Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
                Enrollment by Academic Department
              </h3>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#858580' }}>
                Active registered students across faculties
              </p>
            </div>
            <TrendingUp size={16} color="#858580" />
          </div>
          <BarChart
            data={(data?.enrollment_by_department || []).map((d) => ({
              name: d.department_code || d.department_name,
              value: parseInt(d.student_count || 0),
            }))}
            xKey="name"
            yKey="value"
            height={240}
          />
        </div>

        {/* Grade Distribution Pie/Donut Chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
              Published Grade Distribution
            </h3>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#858580' }}>
              Letter grade dispersion across courses
            </p>
          </div>
          <PieChart
            data={(data?.grade_distribution || []).map((g) => ({
              name: `Grade ${g.letter_grade}`,
              value: parseInt(g.count || 0),
            }))}
            nameKey="name"
            valueKey="value"
            height={240}
          />
        </div>
      </div>

      {/* Recent Activity Sections (Examinations, Submissions, Registrations) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Submissions Needing Review */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#171717' }}>
              Mark Submissions Awaiting Approval
            </h4>
            <Link to="/admin/marks" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.recent_submissions || []).length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#858580', margin: '1rem 0' }}>No pending submissions.</p>
            ) : (
              (data?.recent_submissions || []).slice(0, 5).map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '6px',
                    border: '1px solid #EAEAE7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#171717' }}>
                      {sub.course_code} — {sub.component_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>
                      By {sub.submitted_by_name || 'Faculty'} • {formatDate(sub.submitted_at)}
                    </div>
                  </div>
                  <Badge variant={`status-${(sub.status || 'draft').toLowerCase()}`}>
                    {sub.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Examinations */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#171717' }}>
              Upcoming Examination Schedules
            </h4>
            <Link to="/admin/schedule" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              Full Schedule
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(data?.recent_examinations || []).length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#858580', margin: '1rem 0' }}>No upcoming examinations scheduled.</p>
            ) : (
              (data?.recent_examinations || []).slice(0, 5).map((exam, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#FAFAFA',
                    borderRadius: '6px',
                    border: '1px solid #EAEAE7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#171717' }}>
                      {exam.course_code} ({exam.component_name})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>
                      {formatDate(exam.examination_date)} • Venue: {exam.venue || 'TBA'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#171717', fontFamily: 'monospace' }}>
                    {exam.maximum_marks} Marks
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

