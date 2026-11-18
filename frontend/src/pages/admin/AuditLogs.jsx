import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/audit.service';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import { formatDateTime } from '../../utils/formatters';
import { ShieldAlert, Eye, Search } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const toast = useToast();

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ page, limit: 25 });
      if (res.data?.success) {
        setLogs(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (e) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page]);

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      render: (val) => <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{formatDateTime(val)}</span>,
    },
    {
      key: 'user_name',
      label: 'Actor / User',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: '#171717' }}>{val || 'System'}</div>
          <div style={{ fontSize: '0.75rem', color: '#858580' }}>{row.user_role}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Security Action',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8125rem' }}>{val}</span>,
    },
    {
      key: 'entity_type',
      label: 'Entity Target',
      render: (val, row) => `${val} #${row.entity_id || '—'}`,
    },
    {
      key: 'ip_address',
      label: 'Client IP',
      render: (val) => <span style={{ fontFamily: 'monospace', color: '#858580', fontSize: '0.75rem' }}>{val || '127.0.0.1'}</span>,
    },
    {
      key: 'actions',
      label: 'Audit Payload',
      render: (_, row) => (
        <button
          onClick={() => setSelectedLog(row)}
          style={{
            padding: '4px 8px',
            fontSize: '0.75rem',
            background: '#F4F4F1',
            border: '1px solid #D8D8D4',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Eye size={12} /> Inspect State
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#101010', margin: 0 }}>
          System Audit Trail & Security Logs
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: '#555550' }}>
          Immutable ledger of marks submissions, grading executions, results publication, and administrative mutations.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #D8D8D4', overflow: 'hidden' }}>
        <DataTable
          columns={columns}
          data={logs}
          loading={loading}
          pagination={{
            currentPage: page,
            totalPages: Math.ceil(total / 25) || 1,
            totalItems: total,
            pageSize: 25,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* JSON Inspection Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Record #${selectedLog?.id || ''} Details`}
        size="lg"
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong>Action:</strong> <code style={{ background: '#F4F4F1', padding: '2px 4px' }}>{selectedLog.action}</code>
              </div>
              <div>
                <strong>Entity:</strong> {selectedLog.entity_type} ID: {selectedLog.entity_id}
              </div>
              <div>
                <strong>User:</strong> {selectedLog.user_name} ({selectedLog.user_email})
              </div>
              <div>
                <strong>Timestamp:</strong> {formatDateTime(selectedLog.created_at)}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>State Payload Snapshot (JSON):</div>
              <pre
                style={{
                  backgroundColor: '#171717',
                  color: '#F4F4F1',
                  padding: '1rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(
                  {
                    old_values: selectedLog.old_values ? JSON.parse(selectedLog.old_values) : null,
                    new_values: selectedLog.new_values ? JSON.parse(selectedLog.new_values) : null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;

