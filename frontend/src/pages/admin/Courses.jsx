import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, updateCourse } from '../../services/courses.service';
import { getDepartments } from '../../services/departments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Edit2 } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    course_code: '',
    course_title: '',
    description: '',
    department_id: '',
    credit_hours: 4,
    course_type: 'THEORY',
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, dRes] = await Promise.all([getCourses(), getDepartments()]);
      if (cRes.data?.success) setCourses(cRes.data.data.courses || cRes.data.data || []);
      if (dRes.data?.success) setDepartments(dRes.data.data.departments || dRes.data.data || []);
    } catch (e) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_title: '',
      description: '',
      department_id: departments[0]?.id || '',
      credit_hours: 4,
      course_type: 'THEORY',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setFormData({
      course_code: c.course_code,
      course_title: c.course_title,
      description: c.description || '',
      department_id: c.department_id,
      credit_hours: c.credit_hours,
      course_type: c.course_type || 'THEORY',
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
      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        toast.success('Course updated');
      } else {
        await createCourse(payload);
        toast.success('Course registered');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'course_code',
      label: 'Course Code',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'course_title', label: 'Course Title', render: (val) => <strong>{val}</strong> },
    { key: 'department_name', label: 'Department' },
    {
      key: 'credit_hours',
      label: 'Credits',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val} Cr</span>,
    },
    { key: 'course_type', label: 'Type' },
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
            Course Catalog
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            University subject master list, credits, curriculum types, and descriptions.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Course
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={courses} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Course Information">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
            <Input
              label="Course Code"
              required
              value={formData.course_code}
              onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
              placeholder="CS101"
            />
            <Input
              label="Course Title"
              required
              value={formData.course_title}
              onChange={(e) => setFormData({ ...formData, course_title: e.target.value })}
              placeholder="Programming Fundamentals"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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
                }}
              >
                {departments.length === 0 ? (
                  <option value="1">Computer Science &amp; Engineering (Default)</option>
                ) : (
                  departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.department_name} ({d.department_code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <Input
              label="Credit Hours"
              type="number"
              min="1"
              max="10"
              required
              value={formData.credit_hours}
              onChange={(e) => setFormData({ ...formData, credit_hours: e.target.value })}
            />

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Course Type *
              </label>
              <select
                value={formData.course_type}
                onChange={(e) => setFormData({ ...formData, course_type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  border: '1px solid #D8D8D4',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="THEORY">THEORY</option>
                <option value="PRACTICAL">PRACTICAL</option>
                <option value="LAB">LAB</option>
                <option value="SEMINAR">SEMINAR</option>
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Course syllabus description"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Courses;

