import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { formatDate, formatGradePoint, formatPercentage } from '../../utils/formatters';
import { Award, BookOpen, Calendar, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getStudentDashboard();
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

  const profile = data?.profile || {};
  const courses = data?.enrolled_courses || [];
  const exams = data?.upcoming_examinations || [];
  const results = data?.recent_results || [];
  const cgpa = data?.cgpa || 0;
  const latestSgpa = data?.latest_sgpa || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: '#101010', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome, {profile.full_name || user?.full_name || 'Student'}
          </h1>
          <div style={{ fontSize: '0.8125rem', color: '#555550', marginTop: 4 }}>
            Roll: <strong style={{ fontFamily: 'monospace' }}>{profile.roll_number || '—'}</strong> • Reg:{' '}
            <strong style={{ fontFamily: 'monospace' }}>{profile.registration_number || '—'}</strong>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>
            {profile.program_name} ({profile.program_code}) • Semester {profile.current_semester || 1}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link
            to="/student/transcript"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <FileText size={16} /> Official Transcript
          </Link>
          <Link
            to="/student/results"
            className="btn btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            View Results <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Cumulative CGPA Card */}
        <div
          style={{
            backgroundColor: '#171717',
            color: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #101010',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#B8B8B3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cumulative CGPA
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'monospace', marginTop: 4 }}>
              {cgpa ? formatGradePoint(cgpa) : '—'}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#242424', borderRadius: '6px' }}>
            <Award size={24} color="#FFFFFF" />
          </div>
        </div>

        {/* Latest Semester SGPA */}
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
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Latest SGPA
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {latestSgpa ? formatGradePoint(latestSgpa) : '—'}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <Award size={20} color="#171717" />
          </div>
        </div>

        {/* Enrolled Courses */}
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
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Enrolled Courses
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {courses.length}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <BookOpen size={20} color="#171717" />
          </div>
        </div>

        {/* Upcoming Examinations */}
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
            <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#858580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Upcoming Exams
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
              {exams.length}
            </div>
          </div>
          <div style={{ padding: '10px', backgroundColor: '#F4F4F1', borderRadius: '6px' }}>
            <Calendar size={20} color="#171717" />
          </div>
        </div>
      </div>

      {/* Main Grid: Enrolled Courses & Upcoming Exams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Enrolled Courses */}
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
              Current Semester Courses
            </h3>
            <Link to="/student/courses" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              Course Details
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {courses.length === 0 ? (
              <p style={{ color: '#858580', fontSize: '0.875rem' }}>No courses enrolled currently.</p>
            ) : (
              courses.map((c) => (
                <div
                  key={c.offering_id || c.id}
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
                      Instructor: {c.faculty_name || 'Assigned'} • Credits:{' '}
                      <strong style={{ fontFamily: 'monospace' }}>{c.credit_hours} Cr</strong>
                    </div>
                  </div>
                  <Badge variant="status-enrolled">Enrolled</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Exams & Timetable */}
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
              Examination Timetable
            </h3>
            <Link to="/student/schedule" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              All Dates
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {exams.length === 0 ? (
              <p style={{ color: '#858580', fontSize: '0.875rem' }}>No upcoming exams scheduled.</p>
            ) : (
              exams.slice(0, 5).map((ex, i) => (
                <div
                  key={i}
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
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#101010' }}>
                      {ex.course_code} ({ex.component_name})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>
                      {formatDate(ex.examination_date)} • {ex.venue || 'Hall TBA'}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>
                    {ex.maximum_marks} M
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Published Results Section */}
      {results.length > 0 && (
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
              Recently Released Course Results
            </h3>
            <Link to="/student/results" style={{ fontSize: '0.75rem', color: '#171717', fontWeight: 600, textDecoration: 'none' }}>
              Complete Grade Sheet
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {results.map((r, i) => (
              <div
                key={i}
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
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    <span style={{ fontFamily: 'monospace' }}>{r.course_code}</span> — {r.course_title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 3 }}>
                    Score: <strong>{formatPercentage(r.total_percentage)}</strong> • Points:{' '}
                    <strong>{formatGradePoint(r.grade_point)}</strong>
                  </div>
                </div>
                <span className={`badge badge-grade-${r.letter_grade}`} style={{ fontSize: '0.9375rem', padding: '4px 10px' }}>
                  {r.letter_grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

