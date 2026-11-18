import React, { useState, useEffect } from 'react';
import { getOfferings } from '../../services/offerings.service';
import { getStudents } from '../../services/students.service';
import { getEnrollments, createEnrollment, bulkEnrollment, deleteEnrollment } from '../../services/enrollments.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const StudentEnrollment = () => {
  const [offerings, setOfferings] = useState([]);
  const [selectedOffering, setSelectedOffering] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');

  const toast = useToast();

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [oRes, sRes] = await Promise.all([getOfferings(), getStudents({ per_page: 100 })]);
        if (oRes.data?.success) {
          const offs = oRes.data.data.offerings || oRes.data.data || [];
          setOfferings(offs);
          if (offs.length > 0) setSelectedOffering(offs[0].id);
        }
        if (sRes.data?.success) {
          setStudents(sRes.data.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInit();
  }, []);

  const loadEnrollments = async () => {
    if (!selectedOffering) return;
    setLoading(true);
    try {
      const res = await getEnrollments({ offering_id: selectedOffering });
      if (res.data?.success) {
        setEnrollments(res.data.data.enrollments || res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load course enrollments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [selectedOffering]);

  const handleEnrollSingle = async (e) => {
    e.preventDefault();
    const studentToEnroll = selectedStudent || students[0]?.user_id || students[0]?.id;
    if (!studentToEnroll || !selectedOffering) {
      toast.warning('Please select both a course offering and a student');
      return;
    }
    try {
      await createEnrollment({
        offering_id: selectedOffering,
        student_user_id: studentToEnroll,
      });
      toast.success('Student enrolled successfully');
      setIsModalOpen(false);
      setSelectedStudent('');
      loadEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const handleEnrollAllProgramStudents = async () => {
    if (!selectedOffering) return;
    try {
      const currentOff = offerings.find((o) => o.id == selectedOffering);
      const studentIds = students
        .filter((s) => !currentOff?.program_id || s.program_id == currentOff.program_id)
        .map((s) => s.user_id || s.id);

      if (studentIds.length === 0) {
        toast.info('No matching students to enroll.');
        return;
      }

      await bulkEnrollment({
        offering_id: selectedOffering,
        student_user_ids: studentIds,
      });
      toast.success(`Enrolled eligible students into course offering.`);
      loadEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk enrollment failed');
    }
  };

  const handleRemove = async (enrollmentId) => {
    try {
      await deleteEnrollment(enrollmentId);
      toast.success('Enrollment cancelled');
      loadEnrollments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not drop enrollment');
    }
  };

  const currentOfferingObj = offerings.find((o) => o.id == selectedOffering);

  const columns = [
    {
      key: 'roll_number',
      label: 'Roll Number',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'student_name',
      label: 'Student Name',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#171717' }}>{val || row.full_name}</div>
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>{row.email}</div>
        </div>
      ),
    },
    {
      key: 'registration_number',
      label: 'Registration No',
      render: (val) => <span style={{ fontFamily: 'monospace' }}>{val}</span>,
    },
    {
      key: 'enrollment_date',
      label: 'Enrolled On',
      render: (val) => formatDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <Badge variant={`status-${(val || 'enrolled').toLowerCase()}`}>{val || 'ENROLLED'}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleRemove(row.id)}
          title="Remove student"
          style={{ padding: '4px', background: '#F4F4F1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          <Trash2 size={16} color="#555550" />
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Student Course Enrollment
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Register students into scheduled course sections and track class rosters.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={handleEnrollAllProgramStudents}>
            Enroll Program Cohort
          </Button>
          <Button onClick={() => setIsModalOpen(true)} icon={UserPlus}>
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Select Course Offering */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
            Select Course Offering:
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

        {currentOfferingObj && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: '#F4F4F1',
              borderRadius: '6px',
              border: '1px solid #D8D8D4',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              Instructor: <strong>{currentOfferingObj.faculty_name || 'Assigned'}</strong>
            </div>
            <div style={{ marginTop: 2 }}>
              Class Size: <strong>{enrollments.length}</strong> / {currentOfferingObj.enrollment_capacity || 60}
            </div>
          </div>
        )}
      </div>

      {/* Enrollments Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={enrollments}
          loading={loading}
          emptyTitle="No students enrolled yet"
          emptyDescription="Select an offering and click 'Enroll Student' or 'Enroll Program Cohort' to populate this class roster."
        />
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enroll Individual Student">
        <form onSubmit={handleEnrollSingle} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Select Student *
            </label>
            <select
              required
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #D8D8D4',
                fontSize: '0.875rem',
              }}
            >
              <option value="">Choose student...</option>
              {students.map((st) => (
                <option key={st.user_id || st.id} value={st.user_id || st.id}>
                  {st.roll_number} — {st.full_name} ({st.program_code || 'Student'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Enrollment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentEnrollment;

