import React from 'react';
import type { Pagination } from '@/lib/types';

interface PaginationControlsProps {
  pagination: Pagination | null;
  displayRange: string;
  pageButtons: number[];
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({
  pagination,
  displayRange,
  pageButtons,
  loading,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="p-6 border-t border-slate-800 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-400">{displayRange}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange((pagination?.currentPage || 1) - 1)}
          disabled={!pagination?.hasPrevPage || loading}
          className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
        >
          Trước
        </button>

        {pageButtons.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-xl text-sm ${
              page === pagination?.currentPage
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 border border-transparent hover:border-slate-600'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange((pagination?.currentPage || 1) + 1)}
          disabled={!pagination?.hasNextPage || loading}
          className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
}










