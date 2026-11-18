import React, { useState, useEffect } from 'react';
import { getFacultyDashboard } from '../../services/dashboard.service';
import { getAssessments } from '../../services/assessments.service';
import { getComponentMarks, saveMarksDraft, submitMarks } from '../../services/marks.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { useToast } from '../../components/common/Toast';
import { ATTENDANCE_STATUSES } from '../../utils/constants';
import { Save, Send, AlertTriangle, CheckCircle2, Lock, RotateCcw } from 'lucide-react';

const MarksEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [components, setComponents] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState('');

  // Mark Sheet state
  const [componentInfo, setComponentInfo] = useState(null);
  const [submissionInfo, setSubmissionInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);

  const toast = useToast();

  // 1. Fetch faculty courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getFacultyDashboard();
        if (res.data?.success) {
          const list = res.data.data.assigned_courses || [];
          setCourses(list);
          if (list.length > 0) {
            setSelectedOfferingId(list[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  // 2. Fetch assessment components when offering changes
  useEffect(() => {
    if (!selectedOfferingId) return;
    const fetchComps = async () => {
      try {
        const res = await getAssessments({ offering_id: selectedOfferingId });
        if (res.data?.success) {
          const comps = res.data.data.assessments || res.data.data || [];
          setComponents(comps);
          if (comps.length > 0) {
            setSelectedComponentId(comps[0].id);
          } else {
            setSelectedComponentId('');
            setStudents([]);
            setComponentInfo(null);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchComps();
  }, [selectedOfferingId]);

  // 3. Load students & marks when component changes
  const loadMarksTable = async () => {
    if (!selectedComponentId) return;
    setLoading(true);
    try {
      const res = await getComponentMarks(selectedComponentId);
      if (res.data?.success) {
        const d = res.data.data;
        setComponentInfo(d.component);
        setSubmissionInfo(d.submission || { status: 'DRAFT' });

        // Map students with local editable state
        const mapped = (d.students || []).map((st) => ({
          enrollment_id: st.enrollment_id,
          roll_number: st.roll_number,
          registration_number: st.registration_number,
          student_name: st.student_name,
          email: st.email,
          obtained_marks: st.obtained_marks !== null && st.obtained_marks !== undefined ? st.obtained_marks : '',
          attendance_status: st.attendance_status || 'NOT_ENTERED',
          remarks: st.remarks || '',
          error: '',
        }));
        setStudents(mapped);
      }
    } catch (err) {
      toast.error('Failed to load marks table');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarksTable();
  }, [selectedComponentId]);

  const maxMarks = parseFloat(componentInfo?.maximum_marks || 100);
  const isReadOnly = submissionInfo?.status === 'SUBMITTED' || submissionInfo?.status === 'APPROVED';

  // Input change handlers
  const handleAttendanceChange = (index, value) => {
    if (isReadOnly) return;
    const updated = [...students];
    updated[index].attendance_status = value;
    if (value === 'ABSENT') {
      updated[index].obtained_marks = '0.00';
      updated[index].error = '';
    } else if (value === 'NOT_ENTERED') {
      updated[index].obtained_marks = '';
    }
    setStudents(updated);
  };

  const handleMarksChange = (index, value) => {
    if (isReadOnly) return;
    const updated = [...students];
    updated[index].obtained_marks = value;

    if (value === '') {
      updated[index].error = '';
    } else {
      const num = parseFloat(value);
      if (isNaN(num)) {
        updated[index].error = 'Must be a number';
      } else if (num < 0) {
        updated[index].error = 'Cannot be negative';
      } else if (num > maxMarks) {
        updated[index].error = `Exceeds max (${maxMarks})`;
      } else {
        updated[index].error = '';
        if (updated[index].attendance_status === 'NOT_ENTERED') {
          updated[index].attendance_status = 'PRESENT';
        }
      }
    }
    setStudents(updated);
  };

  const handleRemarksChange = (index, value) => {
    if (isReadOnly) return;
    const updated = [...students];
    updated[index].remarks = value;
    setStudents(updated);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const payload = {
        component_id: selectedComponentId,
        marks: students.map((s) => ({
          enrollment_id: s.enrollment_id,
          obtained_marks: s.obtained_marks === '' ? null : parseFloat(s.obtained_marks),
          attendance_status: s.attendance_status,
          remarks: s.remarks,
        })),
      };

      await saveMarksDraft(payload);
      toast.success('Marks draft saved successfully');
      loadMarksTable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  // Submit Mark Sheet
  const handleConfirmSubmit = async () => {
    // Validate that all students have attendance status entered
    const unentered = students.filter((s) => s.attendance_status === 'NOT_ENTERED');
    if (unentered.length > 0) {
      toast.error(`Cannot submit: ${unentered.length} student(s) still have attendance marked as 'NOT_ENTERED'.`);
      setIsSubmitConfirmOpen(false);
      return;
    }

    // Validate that there are no input errors
    const hasErrors = students.some((s) => s.error !== '');
    if (hasErrors) {
      toast.error('Cannot submit: Please fix invalid marks inputs before submitting.');
      setIsSubmitConfirmOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      // First save current entries
      await saveMarksDraft({
        component_id: selectedComponentId,
        marks: students.map((s) => ({
          enrollment_id: s.enrollment_id,
          obtained_marks: s.obtained_marks === '' ? null : parseFloat(s.obtained_marks),
          attendance_status: s.attendance_status,
          remarks: s.remarks,
        })),
      });

      // Then submit for administrative review
      await submitMarks({ component_id: selectedComponentId });
      toast.success('Mark sheet successfully submitted for administrative review!');
      setIsSubmitConfirmOpen(false);
      loadMarksTable();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit mark sheet.');
    } finally {
      setSubmitting(false);
    }
  };

  const markedCount = students.filter((s) => s.attendance_status !== 'NOT_ENTERED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Examiner Marks Entry & Submission
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Record candidate evaluation scores, track attendance status, and submit official mark sheets.
        </p>
      </div>

      {/* Selectors Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.25rem',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '1.25rem',
        }}
      >
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Course Offering:
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => setSelectedOfferingId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              fontSize: '0.875rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code} - {c.course_title} (Sec {c.section}) • {c.session_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Assessment Paper / Component:
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              fontSize: '0.875rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            {components.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.component_name} (Max: {comp.maximum_marks} M, Weight: {comp.weight_percentage}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submission State Banner */}
      {submissionInfo && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '6px',
            backgroundColor:
              submissionInfo.status === 'APPROVED'
                ? '#F4F4F1'
                : submissionInfo.status === 'RETURNED'
                ? '#171717'
                : '#FFFFFF',
            color: submissionInfo.status === 'RETURNED' ? '#FFFFFF' : '#101010',
            border: '1px solid #D8D8D4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isReadOnly ? <Lock size={18} /> : <AlertTriangle size={18} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Status: {submissionInfo.status || 'DRAFT'}
              </div>
              {submissionInfo.status === 'RETURNED' && (
                <div style={{ fontSize: '0.8125rem', color: '#EAEAE7', marginTop: 2 }}>
                  Correction note from Admin: "{submissionInfo.review_comment || 'Please verify marks and resubmit.'}"
                </div>
              )}
              {isReadOnly && (
                <div style={{ fontSize: '0.75rem', color: '#858580', marginTop: 2 }}>
                  This mark sheet is locked for editing.
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8125rem' }}>
            Progress: <strong>{markedCount}</strong> of <strong>{students.length}</strong> evaluated
          </div>
        </div>
      )}

      {/* Marks Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <LoadingSkeleton height="2rem" />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <LoadingSkeleton key={i} height="2.5rem" />
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#858580' }}>
            No students enrolled in this offering or no assessment selected.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', width: '50px' }}>#</th>
                  <th style={{ padding: '0.75rem 1rem', width: '120px' }}>Roll Number</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Candidate Name</th>
                  <th style={{ padding: '0.75rem 1rem', width: '160px' }}>Attendance</th>
                  <th style={{ padding: '0.75rem 1rem', width: '160px' }}>Obtained Marks</th>
                  <th style={{ padding: '0.75rem 1rem', width: '220px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => (
                  <tr
                    key={st.enrollment_id}
                    style={{
                      borderBottom: '1px solid #EAEAE7',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#858580', fontSize: '0.75rem' }}>{idx + 1}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {st.roll_number}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: 600 }}>{st.student_name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#858580' }}>{st.registration_number}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <select
                        disabled={isReadOnly}
                        value={st.attendance_status}
                        onChange={(e) => handleAttendanceChange(idx, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #D8D8D4',
                          fontSize: '0.8125rem',
                          backgroundColor: isReadOnly ? '#EAEAE7' : '#FFFFFF',
                          fontWeight: st.attendance_status === 'ABSENT' ? 700 : 400,
                        }}
                      >
                        {ATTENDANCE_STATUSES.map((att) => (
                          <option key={att.value} value={att.value}>
                            {att.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max={maxMarks}
                          disabled={isReadOnly || st.attendance_status === 'ABSENT'}
                          value={st.obtained_marks}
                          onChange={(e) => handleMarksChange(idx, e.target.value)}
                          placeholder="0.0"
                          style={{
                            width: '80px',
                            padding: '0.35rem 0.5rem',
                            borderRadius: '4px',
                            border: st.error ? '2px solid #101010' : '1px solid #D8D8D4',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            backgroundColor:
                              isReadOnly || st.attendance_status === 'ABSENT' ? '#EAEAE7' : '#FFFFFF',
                          }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#858580' }}>/ {maxMarks}</span>
                      </div>
                      {st.error && (
                        <div style={{ fontSize: '0.6875rem', color: '#171717', fontWeight: 600, marginTop: 2 }}>
                          {st.error}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={st.remarks}
                        onChange={(e) => handleRemarksChange(idx, e.target.value)}
                        placeholder="Optional comment"
                        style={{
                          width: '100%',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #D8D8D4',
                          fontSize: '0.8125rem',
                          backgroundColor: isReadOnly ? '#EAEAE7' : '#FFFFFF',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Footer */}
      {!isReadOnly && students.length > 0 && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '0.8125rem', color: '#555550' }}>
            Unsaved changes will be lost if you navigate away. Save draft periodically.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={handleSaveDraft} loading={saving} icon={Save}>
              Save Draft
            </Button>
            <Button variant="primary" onClick={() => setIsSubmitConfirmOpen(true)} icon={Send}>
              Submit for Administrative Review
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSubmitConfirmOpen}
        onClose={() => setIsSubmitConfirmOpen(false)}
        onConfirm={handleConfirmSubmit}
        loading={submitting}
        title="Submit Mark Sheet for Approval"
        message="Are you sure you want to officially submit this mark sheet? Once submitted, the mark sheet will be locked from further edits until reviewed and approved by the academic administrator."
        confirmText="Confirm & Submit"
      />
    </div>
  );
};

export default MarksEntry;

