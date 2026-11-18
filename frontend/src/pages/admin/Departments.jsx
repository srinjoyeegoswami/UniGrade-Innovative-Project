import React, { useState, useEffect } from 'react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../services/departments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ department_name: '', department_code: '', description: '' });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      if (res.data?.success) {
        setDepartments(res.data.data.departments || res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setFormData({ department_name: '', department_code: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      department_name: dept.department_name,
      department_code: dept.department_code,
      description: dept.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await updateDepartment(editingDept.id, formData);
        toast.success('Department updated successfully');
      } else {
        await createDepartment(formData);
        toast.success('Department created successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'department_code',
      label: 'Dept Code',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'department_name', label: 'Department Name', render: (val) => <strong>{val}</strong> },
    { key: 'description', label: 'Description', render: (val) => val || '—' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={`status-${(val || 'active').toLowerCase()}`}>{val || 'ACTIVE'}</Badge>,
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
            Academic Departments
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Organizational university faculties, divisions, and program sponsors.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Department
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={departments} loading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Department Code"
            required
            value={formData.department_code}
            onChange={(e) => setFormData({ ...formData, department_code: e.target.value.toUpperCase() })}
            placeholder="e.g. CS"
          />
          <Input
            label="Department Name"
            required
            value={formData.department_name}
            onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
            placeholder="e.g. Computer Science"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Department overview"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;

