import React, { useState, useEffect } from 'react';
import { getOfferings } from '../../services/offerings.service';
import { getAssessments, createAssessment, updateAssessment, deleteAssessment } from '../../services/assessments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { ASSESSMENT_TYPES } from '../../utils/constants';

const ExaminationManagement = () => {
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState('1');
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);
  const [formData, setFormData] = useState({
    component_name: 'Final Examination',
    assessment_type: 'FINAL',
    maximum_marks: 80,
    weight_percentage: 50,
    minimum_pass_percentage: 40,
    is_mandatory: true,
    examination_date: '',
    start_time: '10:00:00',
    end_time: '13:00:00',
    venue: 'Exam Hall 1',
  });

  const toast = useToast();

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const res = await getOfferings();
        if (res.data?.success) {
          const offs = res.data.data.offerings || res.data.data || [];
          setOfferings(offs);
          if (offs.length > 0) setSelectedOffering(offs[0].id);
        }
      } catch (err) {}
    };
    fetchOfferings();
  }, []);

  const loadComponents = async () => {
    if (!selectedOffering) return;
    setLoading(true);
    try {
      const res = await getAssessments({ offering_id: selectedOffering });
      if (res.data?.success) {
        setComponents(res.data.data.assessments || res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load assessment components');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, [selectedOffering]);

  const totalWeight = components.reduce((acc, c) => acc + parseFloat(c.weight_percentage || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100.0) < 0.05;

  const handleOpenAdd = () => {
    setEditingComp(null);
    setFormData({
      component_name: '',
      assessment_type: 'FINAL',
      maximum_marks: 80,
      weight_percentage: 50,
      minimum_pass_percentage: 40,
      is_mandatory: true,
      examination_date: '',
      start_time: '10:00:00',
      end_time: '13:00:00',
      venue: 'Exam Hall 1',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setEditingComp(comp);
    setFormData({
      component_name: comp.component_name,
      assessment_type: comp.assessment_type,
      maximum_marks: comp.maximum_marks,
      weight_percentage: comp.weight_percentage,
      minimum_pass_percentage: comp.minimum_pass_percentage || 40,
      is_mandatory: !!comp.is_mandatory,
      examination_date: comp.examination_date || '',
      start_time: comp.start_time || '10:00:00',
      end_time: comp.end_time || '13:00:00',
      venue: comp.venue || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const targetOffering = selectedOffering || offerings[0]?.id || 1;
      const payload = { ...formData, offering_id: targetOffering };
      if (editingComp) {
        await updateAssessment(editingComp.id, payload);
        toast.success('Assessment component updated');
      } else {
        await createAssessment(payload);
        toast.success('Assessment component scheduled');
      }
      setIsModalOpen(false);
      loadComponents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'component_name',
      label: 'Component Name',
      render: (val, row) => (
        <div>
          <strong>{val}</strong>
          {row.is_mandatory ? (
            <span style={{ fontSize: '0.6875rem', marginLeft: 8, padding: '2px 6px', background: '#171717', color: '#FFF', borderRadius: 4 }}>
              MANDATORY
            </span>
          ) : (
            <span style={{ fontSize: '0.6875rem', marginLeft: 8, color: '#858580' }}>OPTIONAL</span>
          )}
        </div>
      ),
    },
    { key: 'assessment_type', label: 'Type' },
    {
      key: 'maximum_marks',
      label: 'Max Marks',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'weight_percentage',
      label: 'Weight',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#171717' }}>
          {val}%
        </span>
      ),
    },
    {
      key: 'minimum_pass_percentage',
      label: 'Min Pass %',
      render: (val) => (val ? `${val}%` : '—'),
    },
    {
      key: 'examination_date',
      label: 'Exam Date & Venue',
      render: (val, row) => (
        <div style={{ fontSize: '0.8125rem' }}>
          <div>{formatDate(val)}</div>
          <div style={{ color: '#858580', fontSize: '0.75rem' }}>
            {row.venue ? `${row.venue} (${row.start_time || ''})` : 'No venue set'}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          style={{ padding: '4px', background: '#F4F4F1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Edit2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Examination & Assessment Components
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Define weighted evaluation schemes, maximum scores, mandatory passing rules, and venues.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Assessment Component
        </Button>
      </div>

      {/* Offering Selector & Weight Status */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Course Offering Evaluation Scheme:
          </label>
          <select
            value={selectedOffering}
            onChange={(e) => setSelectedOffering(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              backgroundColor: '#FFFFFF',
            }}
          >
            {offerings.length === 0 ? (
              <option value="1">CS101 - Data Structures &amp; Algorithms (Sec A) • 2026-2027 Academic Year</option>
            ) : (
              offerings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.course_code} - {o.course_title} (Sec {o.section}) • {o.session_name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Weight Validation Box */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '6px',
            backgroundColor: isWeightValid ? '#F4F4F1' : '#171717',
            color: isWeightValid ? '#101010' : '#FFFFFF',
            border: '1px solid #D8D8D4',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cumulative Evaluation Weight
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'monospace' }}>
              {totalWeight.toFixed(1)}% / 100%
            </div>
          </div>
          <div>
            {isWeightValid ? (
              <CheckCircle size={22} color="#171717" />
            ) : (
              <AlertTriangle size={22} color="#FFFFFF" />
            )}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={components} loading={loading} />
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assessment Component Details" size="lg">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <Input
              label="Component Name"
              required
              value={formData.component_name}
              onChange={(e) => setFormData({ ...formData, component_name: e.target.value })}
              placeholder="e.g. Final Examination"
            />
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Assessment Type *
              </label>
              <select
                value={formData.assessment_type}
                onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Max Marks"
              type="number"
              step="0.5"
              required
              value={formData.maximum_marks}
              onChange={(e) => setFormData({ ...formData, maximum_marks: e.target.value })}
            />
            <Input
              label="Weight Percentage (%)"
              type="number"
              step="0.5"
              required
              value={formData.weight_percentage}
              onChange={(e) => setFormData({ ...formData, weight_percentage: e.target.value })}
            />
            <Input
              label="Min Passing %"
              type="number"
              step="1"
              value={formData.minimum_pass_percentage}
              onChange={(e) => setFormData({ ...formData, minimum_pass_percentage: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Examination Date"
              type="date"
              value={formData.examination_date}
              onChange={(e) => setFormData({ ...formData, examination_date: e.target.value })}
            />
            <Input
              label="Start Time"
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              label="End Time"
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <Input
              label="Examination Venue / Room"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Science Block Room 102"
            />
            <div style={{ paddingTop: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                />
                <strong>Mandatory for Passing</strong>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Assessment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExaminationManagement;

