import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudent, getStudentResults } from '../../services/students.service';
import { useToast } from '../../components/common/Toast';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { formatPercentage, formatGradePoint, formatDate } from '../../utils/formatters';
import { ArrowLeft, User, BookOpen, Award, FileText } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const fetchStudentData = async () => {
      setLoading(true);
      try {
        const [sRes, rRes] = await Promise.all([
          getStudent(id),
          getStudentResults(id).catch(() => ({ data: { success: false } })),
        ]);

        if (sRes.data?.success) {
          setStudent(sRes.data.data.student || sRes.data.data);
        }
        if (rRes.data?.success) {
          setResultsData(rRes.data.data);
        }
      } catch (err) {
        toast.error('Failed to load student record.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <LoadingSkeleton height="3rem" width="240px" />
        <LoadingSkeleton height="180px" />
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <p>Student not found.</p>
        <Link to="/admin/students" className="btn btn-secondary">
          Back to Students
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Academic Overview', icon: User },
    { id: 'results', label: 'Published Results', icon: Award },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Back button */}
      <div>
        <Link
          to="/admin/students"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8125rem',
            color: '#555550',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Student Registry
        </Link>
      </div>

      {/* Hero Profile Card */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#171717',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {student.full_name ? student.full_name[0] : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#101010', margin: 0 }}>
                {student.full_name}
              </h1>
              <Badge variant={`status-${(student.account_status || 'active').toLowerCase()}`}>
                {student.account_status || 'ACTIVE'}
              </Badge>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#555550', marginTop: 4 }}>
              Roll: <strong style={{ fontFamily: 'monospace' }}>{student.roll_number}</strong> • Reg:{' '}
              <strong style={{ fontFamily: 'monospace' }}>{student.registration_number}</strong>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#858580', marginTop: 2 }}>
              {student.program_name} ({student.program_code}) • Semester {student.current_semester}
            </div>
          </div>
        </div>

        {/* CGPA Box */}
        <div
          style={{
            padding: '1rem 1.5rem',
            backgroundColor: '#F4F4F1',
            borderRadius: '6px',
            border: '1px solid #D8D8D4',
            textAlign: 'right',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Cumulative CGPA
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace' }}>
            {resultsData?.cgpa ? formatGradePoint(resultsData.cgpa) : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550' }}>
            Credits Earned: <strong>{resultsData?.passed_credits || 0}</strong>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #D8D8D4',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
              Academic & Identity Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #EAEAE7' }}>
                <span style={{ color: '#858580' }}>Email Address</span>
                <span style={{ fontWeight: 500 }}>{student.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #EAEAE7' }}>
                <span style={{ color: '#858580' }}>Contact Phone</span>
                <span style={{ fontWeight: 500 }}>{student.contact_number || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #EAEAE7' }}>
                <span style={{ color: '#858580' }}>Department</span>
                <span style={{ fontWeight: 500 }}>{student.department_name || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #EAEAE7' }}>
                <span style={{ color: '#858580' }}>Admission Year</span>
                <span style={{ fontWeight: 500 }}>{student.admission_year || '—'}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #D8D8D4',
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
              Enrollment Status
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#555550', lineHeight: 1.5 }}>
              Currently enrolled in regular coursework for academic year 2025–2026.
              Examinations are processed and published according to university grading policies.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Results */}
      {activeTab === 'results' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600, color: '#171717' }}>
            Official Course Results
          </h3>
          {(resultsData?.results || []).length === 0 ? (
            <p style={{ color: '#858580', fontSize: '0.875rem' }}>No published examination results recorded.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4', textAlign: 'left' }}>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Course</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Credits</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Percentage</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Grade</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Grade Point</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Published Date</th>
                </tr>
              </thead>
              <tbody>
                {resultsData.results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EAEAE7' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{r.course_code}</strong> — {r.course_title}
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>{r.credit_hours}</td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                      {formatPercentage(r.total_percentage)}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge badge-grade-${r.letter_grade}`}>{r.letter_grade}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace' }}>
                      {formatGradePoint(r.grade_point)}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#858580' }}>{formatDate(r.published_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;

