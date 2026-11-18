import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboard } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  BookOpen,
  Users,
  Clock,
  Calendar,
  PenTool,
  ArrowRight,
  Send,
  AlertCircle,
} from 'lucide-react';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getFacultyDashboard();
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <LoadingSkeleton height="3rem" width="280px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} height="100px" />
          ))}
        </div>
      </div>
    );
  }

  const s = data?.summary || {};
  const courses = data?.assigned_courses || [];
  const upcomingExams = data?.upcoming_examinations || [];
  const pendingSubs = data?.pending_submissions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Welcome back, {user?.full_name || 'Faculty Member'}
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#555550' }}>
          Faculty Examiner Portal • Assessment grading pipelines & candidate mark sheets.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase' }}>
              Assigned Courses
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {s.assigned_courses_count || courses.length}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <BookOpen size={20} color="#171717" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase' }}>
              Enrolled Students
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {s.total_students || 0}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <Users size={20} color="#171717" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase' }}>
              Pending Mark Sheets
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {s.pending_submissions || pendingSubs.length}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <Clock size={20} color="#171717" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase' }}>
              Scheduled Exams
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {upcomingExams.length}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <Calendar size={20} color="#171717" />
          </div>
        </div>
      </div>

      {/* Main Content Grid: Assigned Courses & Submissions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Assigned Courses Grid */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600, color: '#101010' }}>
              My Assigned Course Offerings
            </h3>
            <Link to="/faculty/courses" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              View All
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {courses.length === 0 ? (
              <p style={{ color: '#858580', fontSize: '0.875rem' }}>No courses currently assigned.</p>
            ) : (
              courses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #EAEAE7',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#101010' }}>
                      <span style={{ fontFamily: 'monospace' }}>{c.course_code}</span> — {c.course_title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 3 }}>
                      Section {c.section} • Semester {c.semester_number} ({c.session_name}) •{' '}
                      <strong>{c.enrolled_count || 0}</strong> students
                    </div>
                  </div>
                  <Link
                    to={`/faculty/marks`}
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <PenTool size={13} /> Enter Marks
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Mark Sheets / Deadlines */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 600, color: '#101010' }}>
              Mark Sheet Status
            </h3>
            <Link to="/faculty/submissions" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              History
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingSubs.length === 0 ? (
              <p style={{ color: '#858580', fontSize: '0.875rem' }}>All mark sheets are up to date.</p>
            ) : (
              pendingSubs.slice(0, 5).map((sub, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#FAFAFA',
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
                      Max: {sub.maximum_marks} M • Weight: {sub.weight_percentage}%
                    </div>
                  </div>
                  <Badge variant={`status-${(sub.status || 'draft').toLowerCase()}`}>
                    {sub.status || 'DRAFT'}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;

