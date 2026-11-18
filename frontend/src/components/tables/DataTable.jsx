import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import LoadingSkeleton from '../common/LoadingSkeleton';
import Pagination from '../common/Pagination';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  pagination = null,
  sortKey = null,
  sortDir = 'asc',
  onSort = null,
  className = '',
}) => {
  const handleSort = (key) => {
    if (onSort) onSort(key);
  };

  return (
    <div className={`table-container ${className}`.trim()} style={{ width: '100%', overflowX: 'auto' }}>
      <table
        className="data-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#F4F4F1', borderBottom: '1px solid #D8D8D4' }}>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: 600,
                    color: '#171717',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: col.width || 'auto',
                    whiteSpace: 'nowrap',
                  }}
                  className={col.className || ''}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span style={{ color: isSorted ? '#101010' : '#858580' }}>
                        {isSorted ? (
                          sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        ) : (
                          <ArrowUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid #EAEAE7' }}>
                {columns.map((col, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.75rem 1rem' }}>
                    <LoadingSkeleton height="1.25rem" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '2rem 1rem' }}>
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={row.id || rIdx}
                style={{
                  borderBottom: '1px solid #EAEAE7',
                  backgroundColor: rIdx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                  transition: 'background-color 150ms ease',
                }}
                className="data-table-row"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '0.75rem 1rem',
                      color: '#242424',
                      verticalAlign: 'middle',
                    }}
                    className={col.className || ''}
                  >
                    {col.render ? col.render(row[col.key], row, rIdx) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
        />
      )}
    </div>
  );
};

export default DataTable;

