import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/students.service';
import { getDepartments } from '../../services/departments.service';
import { getPrograms } from '../../services/programs.service';
import DataTable from '../../components/tables/DataTable';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { useDebounce } from '../../hooks/useDebounce';
import { Plus, Eye, Edit2, UserX, FileDown } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedProg, setSelectedProg] = useState('');

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    roll_number: '',
    registration_number: '',
    program_id: '',
    admission_year: new Date().getFullYear(),
    current_semester: 1,
    contact_number: '',
    password: '',
  });

  // Deactivate dialog
  const [deactivateId, setDeactivateId] = useState(null);

  const toast = useToast();

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudents({
        page,
        per_page: perPage,
        search: debouncedSearch,
        department_id: selectedDept || undefined,
        program_id: selectedProg || undefined,
      });
      if (res.data?.success) {
        setStudents(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      toast.error('Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, debouncedSearch, selectedDept, selectedProg]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [dRes, pRes] = await Promise.all([getDepartments(), getPrograms()]);
        if (dRes.data?.success) setDepartments(dRes.data.data.departments || dRes.data.data || []);
        if (pRes.data?.success) setPrograms(pRes.data.data.programs || pRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetadata();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      full_name: '',
      email: '',
      roll_number: '',
      registration_number: '',
      program_id: programs[0]?.id || '',
      admission_year: new Date().getFullYear(),
      current_semester: 1,
      contact_number: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name || '',
      email: student.email || '',
      roll_number: student.roll_number || '',
      registration_number: student.registration_number || '',
      program_id: student.program_id || '',
      admission_year: student.admission_year || new Date().getFullYear(),
      current_semester: student.current_semester || 1,
      contact_number: student.contact_number || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        program_id: formData.program_id || programs[0]?.id || 1,
      };
      if (editingStudent) {
        await updateStudent(editingStudent.user_id || editingStudent.id, payload);
        toast.success('Student record updated successfully.');
      } else {
        await createStudent(payload);
        toast.success('New student registered successfully.');
      }
      setIsModalOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save student.');
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateId) return;
    try {
      await deleteStudent(deactivateId);
      toast.success('Student account deactivated.');
      setDeactivateId(null);
      loadStudents();
    } catch (err) {
      toast.error('Failed to deactivate student.');
    }
  };

  const columns = [
    {
      key: 'roll_number',
      label: 'Roll Number',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'full_name',
      label: 'Student Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#171717' }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'registration_number',
      label: 'Reg Number',
      render: (val) => <span style={{ fontFamily: 'monospace', color: '#555550' }}>{val}</span>,
    },
    {
      key: 'program_code',
      label: 'Program',
      render: (val, row) => val || row.program_name || '—',
    },
    {
      key: 'current_semester',
      label: 'Semester',
      render: (val) => `Sem ${val}`,
    },
    {
      key: 'account_status',
      label: 'Status',
      render: (val) => (
        <Badge variant={`status-${(val || 'active').toLowerCase()}`}>{val || 'ACTIVE'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/admin/students/${row.user_id || row.id}`}
            title="View Profile"
            style={{
              padding: '4px',
              color: '#171717',
              backgroundColor: '#F4F4F1',
              borderRadius: '4px',
              display: 'flex',
            }}
          >
            <Eye size={16} />
          </Link>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Student"
            style={{
              padding: '4px',
              color: '#171717',
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
            title="Deactivate Account"
            style={{
              padding: '4px',
              color: '#555550',
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
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Student Management
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Register, configure, and maintain enrolled student profiles and credentials.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          flexWrap: 'wrap',
        }}
      >
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, roll, reg..." />

        <select
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setPage(1);
          }}
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

        <select
          value={selectedProg}
          onChange={(e) => {
            setSelectedProg(e.target.value);
            setPage(1);
          }}
          style={{
            padding: '0.45rem 0.75rem',
            fontSize: '0.8125rem',
            borderRadius: '6px',
            border: '1px solid #D8D8D4',
            backgroundColor: '#FFFFFF',
            outline: 'none',
          }}
        >
          <option value="">All Programs</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.program_name} ({p.program_code})
            </option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: '#858580' }}>
          Total registered: <strong>{total}</strong>
        </div>
      </div>

      {/* Students Data Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          overflow: 'hidden',
        }}
      >
        <DataTable
          columns={columns}
          data={students}
          loading={loading}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / perPage) || 1,
            totalItems: total,
            pageSize: perPage,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        size="lg"
      >
        <form onSubmit={handleSaveStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Full Name"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="e.g. Eleanor Vance"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="student@unigrade.edu"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Roll Number"
              required
              value={formData.roll_number}
              onChange={(e) => setFormData({ ...formData, roll_number: e.target.value.toUpperCase() })}
              placeholder="CS2026001"
            />
            <Input
              label="Registration Number"
              required
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value.toUpperCase() })}
              placeholder="UG2026CS001"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Academic Program *
              </label>
              <select
                value={formData.program_id}
                onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
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
                {programs.length === 0 ? (
                  <option value="1">B.Tech in Computer Science &amp; Engineering (Default)</option>
                ) : (
                  programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.program_name} ({p.program_code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <Input
                label="Admission Year"
                type="number"
                value={formData.admission_year}
                onChange={(e) => setFormData({ ...formData, admission_year: e.target.value })}
              />
              <Input
                label="Current Sem"
                type="number"
                min="1"
                max="10"
                value={formData.current_semester}
                onChange={(e) => setFormData({ ...formData, current_semester: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Contact Phone Number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              placeholder="+1-555-0192"
            />
            {!editingStudent && (
              <Input
                label="Initial Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
              />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingStudent ? 'Save Changes' : 'Register Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate confirmation dialog */}
      <ConfirmDialog
        isOpen={!!deactivateId}
        onClose={() => setDeactivateId(null)}
        onConfirm={handleDeactivate}
        title="Deactivate Student Account"
        message="Are you sure you want to deactivate this student account? The student will no longer be able to log in or register for courses."
        confirmText="Deactivate Account"
        variant="primary"
      />
    </div>
  );
};

export default Students;

