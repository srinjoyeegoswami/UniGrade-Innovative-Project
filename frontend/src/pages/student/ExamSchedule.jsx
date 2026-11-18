import React, { useState, useEffect } from 'react';
import { getSchedule } from '../../services/assessments.service';
import DataTable from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';

const StudentExamSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSched = async () => {
      setLoading(true);
      try {
        const res = await getSchedule();
        if (res.data?.success) {
          setSchedule(res.data.data.schedule || []);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchSched();
  }, []);

  const columns = [
    {
      key: 'examination_date',
      label: 'Exam Date',
      render: (val) => <strong>{formatDate(val)}</strong>,
    },
    {
      key: 'time',
      label: 'Time Window',
      render: (_, row) => (
        <span style={{ fontFamily: 'monospace' }}>
          {row.start_time ? `${row.start_time.slice(0, 5)} – ${row.end_time?.slice(0, 5)}` : 'TBA'}
        </span>
      ),
    },
    {
      key: 'course_code',
      label: 'Course',
      render: (val, row) => `${val} - ${row.course_title}`,
    },
    { key: 'component_name', label: 'Component / Paper' },
    { key: 'venue', label: 'Venue / Hall', render: (val) => val || 'To be announced' },
    {
      key: 'maximum_marks',
      label: 'Max Score',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{val} M</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          My Examination Timetable
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Scheduled examination papers, venues, and timings for your enrolled courses.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={schedule}
          loading={loading}
          emptyTitle="No scheduled examinations"
          emptyDescription="Your enrolled course examination schedules will appear here."
        />
      </div>
    </div>
  );
};

export default StudentExamSchedule;

