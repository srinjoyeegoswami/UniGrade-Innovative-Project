import React, { useState, useEffect } from 'react';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty } from '../../services/faculty.service';
import { getDepartments } from '../../services/departments.service';
import DataTable from '../../components/tables/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2, UserX } from 'lucide-react';

const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    employee_code: '',
    department_id: '',
    designation: 'Assistant Professor',
    contact_number: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    password: '',
  });

  const [deactivateId, setDeactivateId] = useState(null);
  const toast = useToast();

  const loadFaculty = async () => {
    setLoading(true);
    try {
      const res = await getFaculty({ department_id: selectedDept || undefined });
      if (res.data?.success) {
        setFaculty(res.data.data.faculty || res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load faculty members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, [selectedDept]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await getDepartments();
        if (res.data?.success) setDepartments(res.data.data.departments || res.data.data || []);
      } catch (err) {}
    };
    fetchDepts();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      full_name: '',
      email: '',
      employee_code: '',
      department_id: departments[0]?.id || '',
      designation: 'Assistant Professor',
      contact_number: '',
      date_of_joining: new Date().toISOString().split('T')[0],
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFaculty(f);
    setFormData({
      full_name: f.full_name || '',
      email: f.email || '',
      employee_code: f.employee_code || '',
      department_id: f.department_id || '',
      designation: f.designation || 'Assistant Professor',
      contact_number: f.contact_number || '',
      date_of_joining: f.date_of_joining || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        department_id: formData.department_id || departments[0]?.id || 1,
      };
      if (editingFaculty) {
        await updateFaculty(editingFaculty.user_id || editingFaculty.id, payload);
        toast.success('Faculty member updated.');
      } else {
        await createFaculty(payload);
        toast.success('Faculty member added.');
      }
      setIsModalOpen(false);
      loadFaculty();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save faculty.');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await deleteFaculty(deactivateId);
      toast.success('Faculty member deactivated.');
      setDeactivateId(null);
      loadFaculty();
    } catch (err) {
      toast.error('Failed to deactivate faculty.');
    }
  };

  const filteredFaculty = faculty.filter((f) => {
    const q = search.toLowerCase();
    return (
      f.full_name?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q) ||
      f.employee_code?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'employee_code',
      label: 'Employee Code',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'full_name',
      label: 'Faculty Member',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#171717' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'department_name',
      label: 'Department',
      render: (val) => val || '—',
    },
    {
      key: 'designation',
      label: 'Designation',
    },
    {
      key: 'account_status',
      label: 'Status',
      render: (val) => <Badge variant={`status-${(val || 'active').toLowerCase()}`}>{val || 'ACTIVE'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => handleOpenEdit(row)}
            style={{
              padding: '4px',
              backgroundColor: '#F4F4F1',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeactivateId(row.user_id || row.id)}
            style={{
              padding: '4px',
              backgroundColor: '#F4F4F1',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <UserX size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Faculty & Examiner Management
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Manage instructors, course evaluators, and academic department assignments.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Faculty Member
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
        }}
      >
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, employee code..." />
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.8125rem',
            borderRadius: '6px',
            border: '1px solid #D8D8D4',
            backgroundColor: '#FFFFFF',
            outline: 'none',
          }}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={filteredFaculty} loading={loading} />
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaculty ? 'Edit Faculty Member' : 'Register Faculty Member'}
        size="md"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            placeholder="Dr. Sarah Johnson"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="faculty@unigrade.edu"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Employee Code"
              required
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value.toUpperCase() })}
              placeholder="FAC004"
            />
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Department *
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: '1px solid #D8D8D4',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                {departments.length === 0 ? (
                  <option value="1">Computer Science &amp; Engineering (Default)</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Associate Professor"
            />
            <Input
              label="Contact Number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
            />
          </div>
          {!editingFaculty && (
            <Input
              label="Initial Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 8 characters"
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Faculty</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Faculty"
        message="Are you sure you want to deactivate this faculty member?"
      />
    </div>
  );
};

export default Faculty;

