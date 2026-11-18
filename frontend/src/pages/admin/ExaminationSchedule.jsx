import React, { useState, useEffect } from 'react';
import { getSchedule } from '../../services/assessments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';
import { CalendarClock, Download } from 'lucide-react';

const ExaminationSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const toast = useToast();

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      try {
        const res = await getSchedule();
        if (res.data?.success) {
          setSchedule(res.data.data.schedule || res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load examination schedules');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const filtered = schedule.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.course_code?.toLowerCase().includes(q) ||
      item.course_title?.toLowerCase().includes(q) ||
      item.component_name?.toLowerCase().includes(q) ||
      item.venue?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ['Course Code', 'Course Title', 'Exam Component', 'Date', 'Start Time', 'End Time', 'Venue', 'Max Marks'];
    const rows = filtered.map((r) => [
      `"${r.course_code || ''}"`,
      `"${r.course_title || ''}"`,
      `"${r.component_name || ''}"`,
      `"${r.examination_date || ''}"`,
      `"${r.start_time || ''}"`,
      `"${r.end_time || ''}"`,
      `"${r.venue || ''}"`,
      r.maximum_marks || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UniGrade_Exam_Schedule_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <span style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {row.start_time ? `${row.start_time.slice(0, 5)} – ${row.end_time?.slice(0, 5)}` : 'TBA'}
        </span>
      ),
    },
    {
      key: 'course_code',
      label: 'Course',
      render: (val, row) => (
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span> — {row.course_title}
        </div>
      ),
    },
    { key: 'component_name', label: 'Component / Paper' },
    { key: 'venue', label: 'Venue / Hall', render: (val) => val || 'To be announced' },
    {
      key: 'maximum_marks',
      label: 'Max Score',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val} M</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Master Examination Schedule
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Official university assessment timetables, exam halls, and schedule conflicts.
          </p>
        </div>
        <Button onClick={exportCSV} variant="secondary" icon={Download}>
          Export Timetable CSV
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
        }}
      >
        <SearchBar value={search} onChange={setSearch} placeholder="Filter schedule by course, component, room..." />
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No scheduled examinations"
          emptyDescription="Assessment components with defined examination dates will appear in this master schedule."
        />
      </div>
    </div>
  );
};

export default ExaminationSchedule;

