import React, { useState, useEffect } from 'react';
import { getOfferings, createOffering, updateOffering } from '../../services/offerings.service';
import { getCourses } from '../../services/courses.service';
import { getPrograms } from '../../services/programs.service';
import { getSessions } from '../../services/sessions.service';
import { getFaculty } from '../../services/faculty.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Users, Edit2 } from 'lucide-react';

const CourseOfferings = () => {
  const [offerings, setOfferings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    course_id: '',
    program_id: '',
    academic_session_id: '',
    semester_number: 1,
    section: 'A',
    faculty_user_id: '',
    enrollment_capacity: 60,
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getOfferings();
      if (res.data?.success) {
        setOfferings(res.data.data.offerings || res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load course offerings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const fetchSelects = async () => {
      try {
        const [c, p, s, f] = await Promise.all([
          getCourses(),
          getPrograms(),
          getSessions(),
          getFaculty(),
        ]);
        if (c.data?.success) setCourses(c.data.data.courses || c.data.data || []);
        if (p.data?.success) setPrograms(p.data.data.programs || p.data.data || []);
        if (s.data?.success) setSessions(s.data.data.sessions || s.data.data || []);
        if (f.data?.success) setFaculty(f.data.data.faculty || f.data.data || []);
      } catch (err) {}
    };
    fetchSelects();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      course_id: courses[0]?.id || '',
      program_id: programs[0]?.id || '',
      academic_session_id: sessions[0]?.id || '',
      semester_number: 1,
      section: 'A',
      faculty_user_id: faculty[0]?.id || '',
      enrollment_capacity: 60,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        course_id: formData.course_id || courses[0]?.id || 1,
        program_id: formData.program_id || programs[0]?.id || 1,
        academic_session_id: formData.academic_session_id || sessions[0]?.id || 1,
        faculty_user_id: formData.faculty_user_id || faculty[0]?.user_id || faculty[0]?.id || null,
      };
      await createOffering(payload);
      toast.success('Course offering scheduled successfully');
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    {
      key: 'course_code',
      label: 'Course',
      render: (val, row) => (
        <div>
          <strong style={{ fontFamily: 'monospace' }}>{val}</strong> — {row.course_title}
        </div>
      ),
    },
    { key: 'program_code', label: 'Program', render: (val, row) => val || row.program_name },
    { key: 'session_name', label: 'Session' },
    {
      key: 'semester_number',
      label: 'Sem / Sec',
      render: (val, row) => `Sem ${val} (Sec ${row.section || 'A'})`,
    },
    {
      key: 'faculty_name',
      label: 'Instructor',
      render: (val) => val || 'Unassigned',
    },
    {
      key: 'enrolled_count',
      label: 'Enrollment',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace' }}>
          {val || 0} / {row.enrollment_capacity || 60}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={`status-${(val || 'active').toLowerCase()}`}>{val || 'ACTIVE'}</Badge>,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Course Offerings & Sections
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Schedule courses within academic sessions and assign designated faculty examiners.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          New Course Offering
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={offerings} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Course Offering" size="lg">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Course *
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
              >
                {courses.length === 0 ? (
                  <option value="1">CS101 - Data Structures &amp; Algorithms</option>
                ) : (
                  courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.course_title} ({c.credit_hours} Cr)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Academic Program *
              </label>
              <select
                value={formData.program_id}
                onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
              >
                {programs.length === 0 ? (
                  <option value="1">B.Tech in Computer Science &amp; Engineering</option>
                ) : (
                  programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.program_name} ({p.program_code})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Academic Session *
              </label>
              <select
                value={formData.academic_session_id}
                onChange={(e) => setFormData({ ...formData, academic_session_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
              >
                {sessions.length === 0 ? (
                  <option value="1">2026-2027 Academic Year</option>
                ) : (
                  sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.session_name} {s.status === 'ACTIVE' || s.status === 'CURRENT' ? '(CURRENT)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
                Assigned Faculty
              </label>
              <select
                value={formData.faculty_user_id}
                onChange={(e) => setFormData({ ...formData, faculty_user_id: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
              >
                <option value="">Assign Later / Open</option>
                {faculty.map((f) => (
                  <option key={f.user_id || f.id} value={f.user_id || f.id}>
                    {f.full_name} ({f.employee_code || f.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input
              label="Semester Number"
              type="number"
              min="1"
              max="10"
              required
              value={formData.semester_number}
              onChange={(e) => setFormData({ ...formData, semester_number: e.target.value })}
            />
            <Input
              label="Section"
              required
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
              placeholder="A"
            />
            <Input
              label="Enrollment Capacity"
              type="number"
              required
              value={formData.enrollment_capacity}
              onChange={(e) => setFormData({ ...formData, enrollment_capacity: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Offering</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CourseOfferings;

