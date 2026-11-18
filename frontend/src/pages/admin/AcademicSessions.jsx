import React, { useState, useEffect } from 'react';
import { getSessions, createSession, updateSession } from '../../services/sessions.service';
import DataTable from '../../components/tables/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { Plus, Check, Edit2 } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const AcademicSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    session_name: '',
    start_date: '',
    end_date: '',
    status: 'INACTIVE',
  });

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getSessions();
      if (res.data?.success) {
        setSessions(res.data.data.sessions || res.data.data || []);
      }
    } catch (e) {
      toast.error('Failed to load academic sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingSession(null);
    setFormData({
      session_name: '',
      start_date: '',
      end_date: '',
      status: 'INACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSetActive = async (session) => {
    try {
      await updateSession(session.id, { ...session, status: 'ACTIVE' });
      toast.success(`Academic session ${session.session_name} is now ACTIVE.`);
      loadData();
    } catch (e) {
      toast.error('Failed to activate session.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingSession) {
        await updateSession(editingSession.id, formData);
        toast.success('Session updated');
      } else {
        await createSession(formData);
        toast.success('Academic session configured');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const columns = [
    { key: 'session_name', label: 'Session Name', render: (val) => <strong>{val}</strong> },
    { key: 'start_date', label: 'Start Date', render: (val) => formatDate(val) },
    { key: 'end_date', label: 'End Date', render: (val) => formatDate(val) },
    {
      key: 'status',
      label: 'Session Status',
      render: (val) => <Badge variant={`status-${(val || 'inactive').toLowerCase()}`}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status !== 'ACTIVE' && (
            <button
              onClick={() => handleSetActive(row)}
              style={{
                padding: '4px 8px',
                fontSize: '0.75rem',
                backgroundColor: '#171717',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Check size={12} /> Set Active
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
            Academic Sessions
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
            Configure calendar periods, active enrollment terms, and semester windows.
          </p>
        </div>
        <Button onClick={handleOpenAdd} icon={Plus}>
          Add Session
        </Button>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable columns={columns} data={sessions} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Academic Session">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Session Name"
            required
            value={formData.session_name}
            onChange={(e) => setFormData({ ...formData, session_name: e.target.value })}
            placeholder="e.g. 2026-2027"
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Start Date"
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Session</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AcademicSessions;

