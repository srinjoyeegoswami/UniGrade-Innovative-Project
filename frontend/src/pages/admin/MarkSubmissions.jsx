import React, { useState, useEffect } from 'react';
import { getSubmissions, getComponentMarks, reviewMarks } from '../../services/marks.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { Tabs } from '../../components/common/Tabs';
import { useToast } from '../../components/common/Toast';
import { CheckCircle2, RotateCcw, Eye, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const MarkSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('SUBMITTED');

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [componentMarksData, setComponentMarksData] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const toast = useToast();

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await getSubmissions();
      if (res.data?.success) {
        setSubmissions(res.data.data.submissions || res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load mark submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleOpenReview = async (sub) => {
    setActiveSubmission(sub);
    setReviewComment(sub.review_comment || '');
    setReviewModalOpen(true);
    try {
      const res = await getComponentMarks(sub.assessment_component_id);
      if (res.data?.success) {
        setComponentMarksData(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load marks details');
    }
  };

  const handleReviewAction = async (action) => {
    if (!activeSubmission) return;
    setSubmittingReview(true);
    try {
      await reviewMarks({
        component_id: activeSubmission.assessment_component_id,
        action,
        comment: reviewComment,
      });
      toast.success(`Mark sheet has been ${action === 'approve' ? 'APPROVED' : 'RETURNED for correction'}.`);
      setReviewModalOpen(false);
      loadSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'ALL') return true;
    return s.status === activeTab;
  });

  const tabs = [
    { id: 'SUBMITTED', label: 'Pending Review', count: submissions.filter((s) => s.status === 'SUBMITTED').length },
    { id: 'APPROVED', label: 'Approved', count: submissions.filter((s) => s.status === 'APPROVED').length },
    { id: 'RETURNED', label: 'Returned for Correction', count: submissions.filter((s) => s.status === 'RETURNED').length },
    { id: 'ALL', label: 'All Submissions' },
  ];

  const columns = [
    {
      key: 'course_code',
      label: 'Course & Offering',
      render: (val, row) => (
        <div>
          <strong style={{ fontFamily: 'monospace' }}>{val}</strong> — {row.course_title}
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>
            Section {row.section} • Semester {row.semester_number}
          </div>
        </div>
      ),
    },
    {
      key: 'component_name',
      label: 'Exam Component',
      render: (val, row) => (
        <div>
          <div>{val}</div>
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>
            Max: {row.maximum_marks} M • Weight: {row.weight_percentage}%
          </div>
        </div>
      ),
    },
    {
      key: 'submitted_by_name',
      label: 'Submitted By',
      render: (val) => val || 'Faculty Member',
    },
    {
      key: 'status',
      label: 'Submission State',
      render: (val) => <Badge variant={`status-${(val || 'draft').toLowerCase()}`}>{val}</Badge>,
    },
    {
      key: 'updated_at',
      label: 'Last Updated',
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => handleOpenReview(row)}>
          <Eye size={14} style={{ marginRight: 4 }} /> Inspect Marks
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Examiner Mark Sheet Submissions
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Review candidate marks submitted by assigned faculty, audit attendance, and authorize results.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={filteredSubmissions}
          loading={loading}
          emptyTitle="No submissions found"
          emptyDescription="There are no mark sheets matching this review status filter."
        />
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Audit Mark Sheet: ${activeSubmission?.course_code || ''} — ${activeSubmission?.component_name || ''}`}
        size="xl"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Header Summary */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#F4F4F1',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8125rem', color: '#555550' }}>
                Course: <strong>{activeSubmission?.course_title}</strong> • Section {activeSubmission?.section}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#858580', marginTop: 2 }}>
                Submitted by: <strong>{activeSubmission?.submitted_by_name || 'Faculty'}</strong>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Badge variant={`status-${(activeSubmission?.status || 'draft').toLowerCase()}`}>
                {activeSubmission?.status}
              </Badge>
            </div>
          </div>

          {/* Marks Entered Table */}
          <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #D8D8D4', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#FFFFFF', zIndex: 1 }}>
                <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Roll No</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Student Name</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Attendance</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Obtained / Max</th>
                  <th style={{ padding: '0.5rem 0.75rem' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {(componentMarksData?.students || []).map((st, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EAEAE7' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {st.roll_number}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{st.student_name}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <Badge variant={`status-${(st.attendance_status || 'not_entered').toLowerCase()}`}>
                        {st.attendance_status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: 700 }}>
                      {st.attendance_status === 'PRESENT' ? st.obtained_marks : '0.00'} / {componentMarksData?.component?.maximum_marks}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#858580' }}>{st.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Review Comment Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Administrative Review Comments & Audit Note:
            </label>
            <textarea
              rows="3"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="e.g. All attendance reconciled; mark sheet approved for official grading engine processing."
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

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setReviewModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              loading={submittingReview}
              onClick={() => handleReviewAction('return')}
              style={{ border: '1px solid #171717' }}
            >
              <RotateCcw size={14} style={{ marginRight: 4 }} /> Return for Correction
            </Button>
            <Button
              variant="primary"
              loading={submittingReview}
              onClick={() => handleReviewAction('approve')}
            >
              <CheckCircle2 size={14} style={{ marginRight: 4 }} /> Approve Mark Sheet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MarkSubmissions;

