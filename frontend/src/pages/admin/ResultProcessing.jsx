import React, { useState, useEffect } from 'react';
import { getOfferings } from '../../services/offerings.service';
import { calculateGrades } from '../../services/grading.service';
import { publishResults } from '../../services/results.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../components/common/Toast';
import { Calculator, CheckCircle2, AlertTriangle, Send, Eye } from 'lucide-react';
import { formatPercentage, formatGradePoint } from '../../utils/formatters';

const ResultProcessing = () => {
  const [offerings, setOfferings] = useState([]);
  const [selectedOfferingId, setSelectedOfferingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculatedData, setCalculatedData] = useState(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const toast = useToast();

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await getOfferings();
        if (res.data?.success) {
          const offs = res.data.data.offerings || res.data.data || [];
          setOfferings(offs);
          if (offs.length > 0) setSelectedOfferingId(offs[0].id);
        }
      } catch (err) {}
    };
    fetchOfferings();
  }, []);

  const handleRunGradingEngine = async () => {
    if (!selectedOfferingId) return;
    setLoading(true);
    setCalculatedData(null);
    try {
      const res = await calculateGrades({ offering_id: selectedOfferingId });
      if (res.data?.success) {
        setCalculatedData(res.data.data);
        toast.success('Grading calculations completed. Provisional results ready for review.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Grading engine encountered an error.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = async () => {
    if (!selectedOfferingId) return;
    setPublishing(true);
    try {
      const res = await publishResults({ offering_id: selectedOfferingId });
      if (res.data?.success) {
        toast.success('Course results officially published and available to students.');
        setIsPublishDialogOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish results.');
    } finally {
      setPublishing(false);
    }
  };

  const selectedOfferingObj = offerings.find((o) => o.id == selectedOfferingId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Result Processing & Publication Engine
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Execute credit-weighted evaluations, apply mandatory passing gates, and officially release student results.
        </p>
      </div>

      {/* Control Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Select Course Offering for Result Processing:
          </label>
          <select
            value={selectedOfferingId}
            onChange={(e) => {
              setSelectedOfferingId(e.target.value);
              setCalculatedData(null);
            }}
            style={{
              width: '100%',
              padding: '0.625rem 0.75rem',
              fontSize: '0.875rem',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              backgroundColor: '#FFFFFF',
              fontWeight: 500,
            }}
          >
            {offerings.map((o) => (
              <option key={o.id} value={o.id}>
                {o.course_code} - {o.course_title} (Sec {o.section}, Sem {o.semester_number}) • {o.session_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <Button onClick={handleRunGradingEngine} loading={loading} icon={Calculator}>
            Run Grading Engine
          </Button>
          {calculatedData && (
            <Button variant="primary" onClick={() => setIsPublishDialogOpen(true)} icon={Send}>
              Publish Official Results
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Checkpoints */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Step 1</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#171717', marginTop: 2 }}>
            Evaluation Weights Reconciled
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550', marginTop: 4 }}>
            Sum of internal, midterm, and final weights must equal 100%.
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Step 2</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#171717', marginTop: 2 }}>
            Mark Sheets Approved
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550', marginTop: 4 }}>
            All mandatory assessment submissions verified by administration.
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1rem',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#858580', textTransform: 'uppercase' }}>Step 3</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#171717', marginTop: 2 }}>
            Official Publication
          </div>
          <div style={{ fontSize: '0.75rem', color: '#555550', marginTop: 4 }}>
            Grades recorded onto student academic transcripts.
          </div>
        </div>
      </div>

      {/* Provisional Results Preview Table */}
      {calculatedData && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #D8D8D4',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#101010' }}>
                Provisional Results Preview ({calculatedData.results?.length || 0} candidates)
              </h3>
              <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#858580' }}>
                Grading Policy Applied: <strong>{calculatedData.scale?.scale_name}</strong> (Min Pass:{' '}
                {calculatedData.scale?.minimum_overall_pass_percentage}%)
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem' }}>
              <div>
                Passed:{' '}
                <strong style={{ color: '#171717' }}>
                  {calculatedData.results?.filter((r) => r.status === 'PASS').length}
                </strong>
              </div>
              <div>
                Failed / Incomplete:{' '}
                <strong style={{ color: '#555550' }}>
                  {calculatedData.results?.filter((r) => r.status !== 'PASS').length}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4', textAlign: 'left' }}>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Roll Number</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Student Name</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Total Marks</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Weighted %</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Letter Grade</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Grade Points</th>
                  <th style={{ padding: '0.625rem 0.75rem' }}>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {calculatedData.results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #EAEAE7' }}>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {r.roll_number}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>{r.student_name}</td>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace' }}>
                      {parseFloat(r.total_marks || 0).toFixed(1)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatPercentage(r.total_percentage)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <span className={`badge badge-grade-${r.letter_grade}`}>{r.letter_grade}</span>
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>
                      {formatGradePoint(r.grade_point)}
                    </td>
                    <td style={{ padding: '0.625rem 0.75rem' }}>
                      <Badge variant={r.status === 'PASS' ? 'status-approved' : 'status-returned'}>
                        {r.status}
                      </Badge>
                      {r.mandatory_failed && (
                        <span style={{ fontSize: '0.6875rem', marginLeft: 6, color: '#555550' }}>(Mandatory Failed)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Dialog to Publish */}
      <ConfirmDialog
        isOpen={isPublishDialogOpen}
        onClose={() => setIsPublishDialogOpen(false)}
        onConfirm={handlePublishResults}
        loading={publishing}
        title="Publish Official University Results"
        message="Are you sure you want to officially publish these examination results? Once published, they will become visible to all enrolled students on their portals and will contribute directly to SGPA/CGPA transcripts."
        confirmText="Publish Results"
      />
    </div>
  );
};

export default ResultProcessing;

