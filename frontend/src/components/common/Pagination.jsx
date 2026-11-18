import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  pageSize = 20,
}) => {
  if (totalPages <= 1 && totalItems <= pageSize) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className="pagination-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 0',
        fontSize: '0.8125rem',
        color: '#555550',
      }}
    >
      <div>
        {totalItems > 0 && (
          <span>
            Showing <strong style={{ color: '#171717' }}>{startItem}</strong> to{' '}
            <strong style={{ color: '#171717' }}>{endItem}</strong> of{' '}
            <strong style={{ color: '#171717' }}>{totalItems}</strong> entries
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #D8D8D4',
            backgroundColor: currentPage <= 1 ? '#F4F4F1' : '#FFFFFF',
            color: currentPage <= 1 ? '#B8B8B3' : '#171717',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{ padding: '0 8px', fontWeight: 500 }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid #D8D8D4',
            backgroundColor: currentPage >= totalPages ? '#F4F4F1' : '#FFFFFF',
            color: currentPage >= totalPages ? '#B8B8B3' : '#171717',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

