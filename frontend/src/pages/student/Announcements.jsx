import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../../services/announcements.service';
import { formatDate } from '../../utils/formatters';
import { Bell } from 'lucide-react';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnn = async () => {
      setLoading(true);
      try {
        const res = await getAnnouncements();
        if (res.data?.success) {
          setAnnouncements(res.data.data.announcements || res.data.data || []);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchAnn();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Academic Announcements & Circulars
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Official notices published by university administration and examination controllers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #D8D8D4',
              textAlign: 'center',
              color: '#858580',
            }}
          >
            No active announcements.
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #D8D8D4',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.0625rem', fontWeight: 600, color: '#171717' }}>
                  {a.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#858580' }}>{formatDate(a.created_at)}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#555550', lineHeight: 1.6 }}>
                {a.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentAnnouncements;

