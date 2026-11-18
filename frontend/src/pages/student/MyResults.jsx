import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStudentResults } from '../../services/results.service';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import { formatPercentage, formatGradePoint, formatDate } from '../../utils/formatters';
import { Award, BookOpen, CheckCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentResults = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRes = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const res = await getStudentResults(user.id);
          if (res.data?.success) {
            setData(res.data.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRes();
  }, [user]);

  const semesters = data?.semesters || [];
  const results = data?.results || [];

  const columns = [
    {
      key: 'course_code',
      label: 'Course Code',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'course_title', label: 'Course Title', render: (val) => <strong>{val}</strong> },
    {
      key: 'credit_hours',
      label: 'Credits',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{val} Cr</span>,
    },
    {
      key: 'total_percentage',
      label: 'Final Marks (%)',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{formatPercentage(val)}</span>,
    },
    {
      key: 'letter_grade',
      label: 'Letter Grade',
      render: (val) => <span className={`badge badge-grade-${val}`}>{val}</span>,
    },
    {
      key: 'grade_point',
      label: 'Grade Points',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formatGradePoint(val)}</span>,
    },
    {
      key: 'result_status',
      label: 'Status',
      render: (val, row) => (
        <Badge variant={row.letter_grade !== 'F' ? 'status-approved' : 'status-returned'}>
          {row.letter_grade !== 'F' ? 'PASS' : 'FAIL'}
        </Badge>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Official Academic Results & Grade Sheets
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Verified institutional examination evaluations, semester GPA, and cumulative performance.
          </p>
        </div>
        <Link to="/student/transcript" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <FileText size={16} /> Official Transcript
        </Link>
      </div>

      {/* Summary Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#171717',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#B8B8B3', textTransform: 'uppercase' }}>Cumulative CGPA</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', marginTop: 4 }}>
            {data?.cgpa ? formatGradePoint(data.cgpa) : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>Weighted across all semesters</div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Total Credits Earned</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
            {data?.passed_credits || 0} / {data?.total_credits || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550', marginTop: 2 }}>Degree credit progress</div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Courses Completed</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#101010', fontFamily: 'monospace', marginTop: 4 }}>
            {results.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550', marginTop: 2 }}>Certified examinations passed</div>
        </div>
      </div>

      {/* Semester Wise Results */}
      {semesters.length > 0 ? (
        semesters.map((sem, sIdx) => (
          <div
            key={sIdx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #D8D8D4',
              padding: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '1rem',
                borderBottom: '1px solid #EAEAE7',
                marginBottom: '1rem',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
                  {sem.session_name} — Semester {sem.semester_number}
                </h3>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  fontSize: '0.875rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  Semester Credits: <strong>{sem.total_credits}</strong>
                </div>
                <div
                  style={{
                    padding: '4px 12px',
                    backgroundColor: '#F4F4F1',
                    borderRadius: '4px',
                    border: '1px solid #D8D8D4',
                  }}
                >
                  Semester SGPA: <strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{formatGradePoint(sem.sgpa)}</strong>
                </div>
              </div>
            </div>

            <DataTable columns={columns} data={sem.courses || []} />
          </div>
        ))
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
          <DataTable
            columns={columns}
            data={results}
            loading={loading}
            emptyTitle="No published results available"
            emptyDescription="Official course grades will be visible here once verified and published by the university examination department."
          />
        </div>
      )}
    </div>
  );
};

export default StudentResults;

