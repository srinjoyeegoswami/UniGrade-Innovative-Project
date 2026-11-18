import React, { useState, useEffect } from 'react';
import { getPrograms, createProgram, updateProgram } from '../../services/programs.service';
import { getDepartments } from '../../services/departments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2 } from 'lucide-react';

const Programs = () => {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [formData, setFormData] = useState({
    program_name: '',
    program_code: '',
    department_id: '',
    degree_type: 'Bachelor',
    duration_years: 3,
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([getPrograms(), getDepartments()]);
      if (pRes.data?.success) setPrograms(pRes.data.data.programs || pRes.data.data || []);
      if (dRes.data?.success) setDepartments(dRes.data.data.departments || dRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load academic programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProg(null);
    setFormData({
      program_name: '',
      program_code: '',
      department_id: departments[0]?.id || '',
      degree_type: 'Bachelor',
      duration_years: 3,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProg(p);
    setFormData({
      program_name: p.program_name,
      program_code: p.program_code,
      department_id: p.department_id,
      degree_type: p.degree_type || 'Bachelor',
      duration_years: p.duration_years || 3,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProg) {
        await updateProgram(editingProg.id, formData);
        toast.success('Program updated');
      } else {
        await createProgram(formData);
        toast.success('Program created');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'program_code',
      label: 'Program Code',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'program_name', label: 'Program Name', render: (val) => <strong>{val}</strong> },
    { key: 'department_name', label: 'Department' },
    { key: 'degree_type', label: 'Degree' },
    { key: 'duration_years', label: 'Duration', render: (val) => `${val} Years` },
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
            Academic Programs
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Degree tracks, curriculum duration, and affiliated academic departments.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Program
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={programs} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProg ? 'Edit Program' : 'New Program'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Program Code"
            required
            value={formData.program_code}
            onChange={(e) => setFormData({ ...formData, program_code: e.target.value.toUpperCase() })}
            placeholder="BSCS"
          />
          <Input
            label="Program Name"
            required
            value={formData.program_name}
            onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
            placeholder="B.Sc. Computer Science"
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Department *
            </label>
            <select
              required
              value={formData.department_id}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                fontSize: '0.875rem',
                borderRadius: '6px',
                border: '1px solid #D8D8D4',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">Select department...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Degree Type"
              value={formData.degree_type}
              onChange={(e) => setFormData({ ...formData, degree_type: e.target.value })}
              placeholder="Bachelor"
            />
            <Input
              label="Duration (Years)"
              type="number"
              value={formData.duration_years}
              onChange={(e) => setFormData({ ...formData, duration_years: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Program</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Programs;

