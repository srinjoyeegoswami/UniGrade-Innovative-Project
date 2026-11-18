import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentResults } from '../../services/results.service';
import { getStudentDashboard } from '../../services/dashboard.service';
import Button from '../../components/common/Button';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { Printer, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate, formatGradePoint } from '../../utils/formatters';

const Transcript = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const [dRes, rRes] = await Promise.all([
            getStudentDashboard(),
            getStudentResults(user.id),
          ]);
          if (dRes.data?.success) setProfile(dRes.data.data.profile || {});
          if (rRes.data?.success) setResultsData(rRes.data.data || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <LoadingSkeleton height="3rem" />
        <LoadingSkeleton height="400px" />
      </div>
    );
  }

  const semesters = resultsData?.semesters || [];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Non-printed action bar */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link
          to="/student/results"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8125rem',
            color: '#555550',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Back to Results
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button onClick={handlePrint} icon={Printer}>
            Print Official Transcript
          </Button>
        </div>
      </div>

      {/* Official Printable Academic Transcript Document */}
      <div
        className="transcript-document"
        style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #171717',
          padding: '3rem',
          color: '#101010',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          borderRadius: '4px',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            borderBottom: '2px solid #171717',
            paddingBottom: '1.5rem',
            marginBottom: '1.75rem',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              lineHeight: 1.2,
            }}
          >
            UniGrade University of Excellence
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#555550', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
            Office of the Controller of Examinations • Central Academic Registry
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              padding: '4px 16px',
              border: '1px solid #171717',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Official Academic Transcript
          </div>
        </div>

        {/* Student Identification Meta Grid */}
        <div
          style={{
            border: '1px solid #D8D8D4',
            backgroundColor: '#FAFAFA',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem 1.5rem',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <span style={{ color: '#858580' }}>Student Name:</span>{' '}
            <strong style={{ color: '#171717' }}>{profile?.full_name}</strong>
          </div>
          <div>
            <span style={{ color: '#858580' }}>Roll Number:</span>{' '}
            <strong style={{ fontFamily: 'monospace', color: '#171717' }}>{profile?.roll_number}</strong>
          </div>
          <div>
            <span style={{ color: '#858580' }}>Registration No:</span>{' '}
            <strong style={{ fontFamily: 'monospace', color: '#171717' }}>{profile?.registration_number}</strong>
          </div>
          <div>
            <span style={{ color: '#858580' }}>Degree Program:</span>{' '}
            <strong style={{ color: '#171717' }}>{profile?.program_name}</strong>
          </div>
          <div>
            <span style={{ color: '#858580' }}>Department:</span>{' '}
            <strong style={{ color: '#171717' }}>{profile?.department_name || 'School of Computing'}</strong>
          </div>
          <div>
            <span style={{ color: '#858580' }}>Admission Year:</span>{' '}
            <strong style={{ color: '#171717' }}>{profile?.admission_year || 2025}</strong>
          </div>
        </div>

        {/* Semester-wise Results */}
        {semesters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#858580' }}>
            No published semester results on record.
          </div>
        ) : (
          semesters.map((sem, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor: '#171717',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  marginBottom: '0.5rem',
                }}
              >
                {sem.session_name} — Semester {sem.semester_number} Course Results
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #171717', textAlign: 'left', backgroundColor: '#F4F4F1' }}>
                    <th style={{ padding: '6px 8px' }}>Course Code</th>
                    <th style={{ padding: '6px 8px' }}>Course Title</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center' }}>Credits</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center' }}>Letter Grade</th>
                    <th style={{ padding: '6px 8px', textAlign: 'center' }}>Grade Points</th>
                  </tr>
                </thead>
                <tbody>
                  {(sem.courses || []).map((c, cIdx) => (
                    <tr key={cIdx} style={{ borderBottom: '1px solid #EAEAE7' }}>
                      <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{c.course_code}</td>
                      <td style={{ padding: '6px 8px' }}>{c.course_title}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace' }}>{c.credit_hours}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700 }}>{c.letter_grade}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace' }}>
                        {formatGradePoint(c.grade_point)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Semester Summary Line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '2rem',
                  fontSize: '0.8125rem',
                  padding: '6px 8px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #EAEAE7',
                }}
              >
                <div>
                  Semester Credits: <strong>{sem.total_credits}</strong>
                </div>
                <div>
                  Semester SGPA: <strong style={{ fontFamily: 'monospace' }}>{formatGradePoint(sem.sgpa)}</strong>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Overall Degree Summary Box */}
        <div
          style={{
            border: '2px solid #171717',
            padding: '1.25rem',
            marginTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F4F4F1',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#555550' }}>
              Final Degree Standing
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2 }}>
              {parseFloat(resultsData?.cgpa || 0) >= 8.0
                ? 'FIRST CLASS WITH DISTINCTION'
                : parseFloat(resultsData?.cgpa || 0) >= 6.5
                ? 'FIRST CLASS'
                : 'SECOND CLASS'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', textAlign: 'right' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#858580' }}>Total Credits Earned</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace' }}>
                {resultsData?.passed_credits || 0}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#858580' }}>Cumulative CGPA</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>
                {resultsData?.cgpa ? formatGradePoint(resultsData.cgpa) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Verification & Signatures */}
        <div
          style={{
            marginTop: '3.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #D8D8D4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '0.75rem',
            color: '#555550',
          }}
        >
          <div>
            <div>Date of Issue: {formatDate(new Date().toISOString())}</div>
            <div style={{ marginTop: 2 }}>
              Transcript Verification Code: <span style={{ fontFamily: 'monospace' }}>TR-UG-2026-X77A</span>
            </div>
            <div style={{ marginTop: 2, fontStyle: 'italic' }}>
              This is a certified academic transcript generated by the UniGrade Grading Engine.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '3rem', textAlign: 'center' }}>
            <div>
              <div style={{ width: '130px', borderBottom: '1px solid #171717', marginBottom: '6px' }} />
              <div>Prepared By</div>
            </div>
            <div>
              <div style={{ width: '150px', borderBottom: '1px solid #171717', marginBottom: '6px' }} />
              <div style={{ fontWeight: 600, color: '#171717' }}>Controller of Examinations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transcript;

