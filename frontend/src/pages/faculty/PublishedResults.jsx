import React, { useState, useEffect } from 'react';
import { getResults } from '../../services/results.service';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/common/Badge';
import { formatPercentage, formatGradePoint } from '../../utils/formatters';

const PublishedResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await getResults({ status: 'PUBLISHED' });
        if (res.data?.success) {
          setResults(res.data.data.results || []);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const columns = [
    {
      key: 'roll_number',
      label: 'Roll Number',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'student_name', label: 'Candidate Name' },
    {
      key: 'course_code',
      label: 'Course',
      render: (val, row) => `${val} - ${row.course_title}`,
    },
    {
      key: 'total_percentage',
      label: 'Final Score',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{formatPercentage(val)}</span>,
    },
    {
      key: 'letter_grade',
      label: 'Grade',
      render: (val) => <span className={`badge badge-grade-${val}`}>{val}</span>,
    },
    {
      key: 'grade_point',
      label: 'Grade Point',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatGradePoint(val)}</span>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Published Course Results
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Official, certified candidate results released by the university examination board.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={results}
          loading={loading}
          emptyTitle="No published results"
          emptyDescription="Results for your assigned courses will appear here once officially approved and released by the administrator."
        />
      </div>
    </div>
  );
};

export default PublishedResults;

