import React, { useState, useEffect } from 'react';
import { changePassword } from '../../services/auth.service';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/announcements.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatDate } from '../../utils/formatters';
import { Lock, Bell, Plus, Trash2 } from 'lucide-react';

const Settings = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [targetRole, setTargetRole] = useState('ALL');

  const toast = useToast();

  const loadAnnouncements = async () => {
    try {
      const res = await getAnnouncements();
      if (res.data?.success) {
        setAnnouncements(res.data.data.announcements || res.data.data || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      toast.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: annTitle,
        content: annContent,
        target_role: targetRole,
      });
      toast.success('Announcement broadcasted');
      setIsAnnounceModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      loadAnnouncements();
    } catch (err) {
      toast.error('Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
      loadAnnouncements();
    } catch (e) {
      toast.error('Failed to delete announcement');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          Institutional Settings & Announcements
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Broadcast university notices and maintain security credentials.
        </p>
      </div>

      {/* Announcements Manager */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#101010' }}>
              Academic Announcements
            </h3>
            <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#858580' }}>
              Notices displayed across Faculty and Student portals
            </p>
          </div>
          <Button onClick={() => setIsAnnounceModalOpen(true)} size="sm" icon={Plus}>
            Post Notice
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {announcements.length === 0 ? (
            <p style={{ color: '#858580', fontSize: '0.875rem' }}>No active notices.</p>
          ) : (
            announcements.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '1rem',
                  borderRadius: '6px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #EAEAE7',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9375rem', color: '#171717' }}>{a.title}</strong>
                    <span style={{ fontSize: '0.6875rem', padding: '2px 6px', background: '#171717', color: '#FFF', borderRadius: 4 }}>
                      {a.target_role}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#555550', margin: '0.375rem 0 0.5rem' }}>
                    {a.content}
                  </p>
                  <div style={{ fontSize: '0.6875rem', color: '#858580' }}>
                    Posted on {formatDate(a.created_at)}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(a.id)}
                  style={{ background: 'none', border: 'none', color: '#858580', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Credentials */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #D8D8D4',
          padding: '1.5rem',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.125rem', fontWeight: 600, color: '#101010' }}>
          Change Account Password
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.8125rem', color: '#555550' }}>
          Ensure your administrator account uses a strong passphrase.
        </p>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <Input
            label="Current Password"
            type="password"
            required
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="Minimum 8 characters"
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <div>
            <Button type="submit" loading={passwordLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Modal */}
      <Modal isOpen={isAnnounceModalOpen} onClose={() => setIsAnnounceModalOpen(false)} title="Broadcast Notice">
        <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Title"
            required
            value={annTitle}
            onChange={(e) => setAnnTitle(e.target.value)}
            placeholder="e.g. End-Semester Examination Schedule Published"
          />
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Target Audience *
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4' }}
            >
              <option value="ALL">All University Users (Faculty + Students)</option>
              <option value="FACULTY">Faculty Members Only</option>
              <option value="STUDENT">Students Only</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>
              Notice Content *
            </label>
            <textarea
              required
              rows="4"
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Detailed announcement details..."
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D8D8D4', fontSize: '0.875rem' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={() => setIsAnnounceModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Broadcast</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Settings;

