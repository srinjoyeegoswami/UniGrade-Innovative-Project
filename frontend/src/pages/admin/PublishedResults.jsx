import React, { useState, useEffect } from 'react';
import { getPublishedBatches, unlockResults } from '../../services/results.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Unlock, Award, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const PublishedResults = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Unlock modal
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [unlockReason, setUnlockReason] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const toast = useToast();

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await getPublishedBatches();
      if (res.data?.success) {
        setBatches(res.data.data.published || res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load published results batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleOpenUnlock = (batch) => {
    setSelectedBatch(batch);
    setUnlockReason('');
    setUnlockModalOpen(true);
  };

  const handleConfirmUnlock = async (e) => {
    e.preventDefault();
    if (!unlockReason.trim()) {
      toast.error('Administrative reason is required to unlock published results.');
      return;
    }

    setUnlocking(true);
    try {
      await unlockResults({
        offering_id: selectedBatch.offering_id,
        reason: unlockReason,
      });
      toast.success('Results unlocked successfully. Status reverted to Provisional.');
      setUnlockModalOpen(false);
      loadBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to unlock results.');
    } finally {
      setUnlocking(false);
    }
  };

  const columns = [
    {
      key: 'course_code',
      label: 'Course & Section',
      render: (val, row) => (
        <div>
          <strong style={{ fontFamily: 'monospace' }}>{val}</strong> — {row.course_title}
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>
            Section {row.section} • Semester {row.semester_number} ({row.session_name})
          </div>
        </div>
      ),
    },
    { key: 'faculty_name', label: 'Instructor', render: (val) => val || '—' },
    {
      key: 'published_at',
      label: 'Published On',
      render: (val) => formatDate(val),
    },
    {
      key: 'total_students',
      label: 'Candidates',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'pass_count',
      label: 'Pass / Fail',
      render: (_, row) => (
        <span style={{ fontSize: '0.8125rem' }}>
          <strong>{row.pass_count || 0}</strong> passed / <strong>{row.fail_count || 0}</strong> failed
        </span>
      ),
    },
    {
      key: 'avg_grade_point',
      label: 'Avg GP',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{val || '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => handleOpenUnlock(row)}>
          <Unlock size={14} style={{ marginRight: 4 }} /> Unlock
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Published Examination Results
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Audit verified course results currently published to student transcripts.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={batches}
          loading={loading}
          emptyTitle="No published results found"
          emptyDescription="When courses are evaluated and published via Result Processing, they will be archived here."
        />
      </div>

      {/* Unlock Dialog */}
      <Modal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        title={`Unlock Published Results: ${selectedBatch?.course_code || ''}`}
        size="md"
      >
        <form onSubmit={handleConfirmUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#555550', lineHeight: 1.5 }}>
            Unlocking published results will temporarily remove them from student transcripts and revert their status
            to <strong>PROVISIONAL</strong> for faculty corrections or administrative revisions.
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Justification & Audit Log Note *
            </label>
            <textarea
              required
              rows="3"
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="e.g. Authorized grade revaluation request #102 approved by Exam Controller."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #D8D8D4',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setUnlockModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={unlocking}>
              Authorize Unlock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PublishedResults;

