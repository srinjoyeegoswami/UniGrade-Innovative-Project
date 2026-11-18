import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFacultyDashboard } from '../../services/dashboard.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { BookOpen, PenTool, Users } from 'lucide-react';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const res = await getFacultyDashboard();
        if (res.data?.success) {
          setCourses(res.data.data.assigned_courses || []);
        }
      } catch (err) {
        toast.error('Failed to load assigned courses');
      } finally {
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
    { key: 'session_name', label: 'Academic Session' },
    {
      key: 'semester_number',
      label: 'Semester / Section',
      render: (val, row) => `Semester ${val} (Sec ${row.section})`,
    },
    {
      key: 'enrolled_count',
      label: 'Enrolled Students',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {val || 0} / {row.enrollment_capacity || 60}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Examiner Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to="/faculty/marks"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <PenTool size={13} /> Marks Entry
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          My Assigned Courses & Class Rosters
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Overview of courses assigned for instruction and examination grading.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={courses}
          loading={loading}
          emptyTitle="No assigned courses"
          emptyDescription="You currently have no course offerings assigned for this academic session."
        />
      </div>
    </div>
  );
};

export default MyCourses;

