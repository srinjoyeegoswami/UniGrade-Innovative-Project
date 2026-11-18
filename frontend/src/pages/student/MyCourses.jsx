import React, { useState, useEffect } from 'react';
import { getStudentDashboard } from '../../services/dashboard.service';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getStudentDashboard();
        if (res.data?.success) {
          setCourses(res.data.data.enrolled_courses || []);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
    { key: 'course_type', label: 'Type' },
    { key: 'faculty_name', label: 'Instructor / Examiner', render: (val) => val || 'Assigned Faculty' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant="status-enrolled">{val || 'ENROLLED'}</Badge>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Enrolled Coursework
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Active semester courses registered for institutional credit and examination evaluation.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={courses}
          loading={loading}
          emptyTitle="No courses registered"
          emptyDescription="You have not been registered for courses in this session."
        />
      </div>
    </div>
  );
};

export default StudentCourses;

