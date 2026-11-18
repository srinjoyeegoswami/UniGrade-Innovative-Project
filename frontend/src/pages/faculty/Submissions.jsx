import React, { useState, useEffect } from 'react';
import { getSubmissions } from '../../services/marks.service';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';

const Submissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const res = await getSubmissions();
        if (res.data?.success) {
          setSubmissions(res.data.data.submissions || res.data.data || []);
        }
      } catch (err) {
        toast.error('Failed to load submission history');
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, []);

  const columns = [
    {
      key: 'course_code',
      label: 'Course & Section',
      render: (val, row) => (
        <div>
          <strong style={{ fontFamily: 'monospace' }}>{val}</strong> — {row.course_title}
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>Section {row.section}</div>
        </div>
      ),
    },
    { key: 'component_name', label: 'Component' },
    {
      key: 'status',
      label: 'Submission State',
      render: (val) => <Badge variant={`status-${(val || 'draft').toLowerCase()}`}>{val}</Badge>,
    },
    {
      key: 'submitted_at',
      label: 'Submitted Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'review_comment',
      label: 'Admin Feedback / Review Notes',
      render: (val) => (val ? <span>{val}</span> : <span style={{ color: '#858580' }}>—</span>),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Mark Sheet Submission Records
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Track review statuses, administrator approvals, and correction requests.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={submissions}
          loading={loading}
          emptyTitle="No submissions recorded"
          emptyDescription="When you submit mark sheets for administrative approval, your records will appear here."
        />
      </div>
    </div>
  );
};

export default Submissions;

