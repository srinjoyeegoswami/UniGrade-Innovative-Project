import React, { useState, useEffect } from 'react';
import { getStudentDashboard } from '../../services/dashboard.service';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import Badge from '../../components/common/Badge';
import { User, Mail, Phone, Building2, BookMarked, Calendar } from 'lucide-react';

const StudentProfile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProf = async () => {
      try {
        const res = await getStudentDashboard();
        if (res.data?.success) {
          setData(res.data.data.profile || {});
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchProf();
  }, []);

  if (loading) {
    return <LoadingSkeleton height="200px" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Student Academic Profile
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Official institutional identification, enrollment record, and contact details.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.5rem', borderBottom: '1px solid #EAEAE7' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: '#171717',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {data?.full_name ? data.full_name[0] : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{data?.full_name}</h2>
              <Badge variant={`status-${(data?.account_status || 'active').toLowerCase()}`}>
                {data?.account_status || 'ACTIVE'}
              </Badge>
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#555550', marginTop: 4 }}>
              Roll Number: <strong style={{ fontFamily: 'monospace' }}>{data?.roll_number}</strong> • Registration:{' '}
              <strong style={{ fontFamily: 'monospace' }}>{data?.registration_number}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Academic Program</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>
              {data?.program_name} ({data?.program_code})
            </div>
          </div>

          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>
              {data?.department_name || 'School of Computing'}
            </div>
          </div>

          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Current Semester</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>Semester {data?.current_semester || 1}</div>
          </div>

          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Admission Cohort</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>{data?.admission_year || 2025}</div>
          </div>

          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Institutional Email</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>{data?.email}</div>
          </div>

          <div>
            <div style={{ color: '#858580', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact Telephone</div>
            <div style={{ fontWeight: 600, color: '#101010', marginTop: 3 }}>{data?.contact_number || '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

