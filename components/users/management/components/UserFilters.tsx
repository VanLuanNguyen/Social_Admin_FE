import React from 'react';
import Input from '@/components/ui/Input';
import type { StatusFilter, TimeFilter } from '../../types';
import { SELECT_CLASSES } from '../../constants';

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  timeFilter: TimeFilter;
  onTimeFilterChange: (value: TimeFilter) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export default function UserFilters({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  statusFilter,
  onStatusFilterChange,
  timeFilter,
  onTimeFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: UserFiltersProps) {
  return (
    <div className="border-b border-slate-800 p-6 space-y-4">
      <form onSubmit={onSearchSubmit} className="relative">
        <Input
          type="text"
          placeholder="Tìm theo tên, email, ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 pl-11 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-5 h-5"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.65" y1="16.65" x2="21" y2="21" />
          </svg>
        </span>
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-xl"
        >
          Tìm kiếm
        </button>
      </form>

      <div className="flex flex-col gap-3 md:flex-row">
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
          className={SELECT_CLASSES}
        >
          <option value="all">Trạng thái: Tất cả</option>
          <option value="active">Hoạt động</option>
          <option value="suspended">Bị cấm</option>
        </select>

        <select
          value={timeFilter}
          onChange={(event) => {
            const value = event.target.value as TimeFilter;
            onTimeFilterChange(value);
            if (value !== 'custom') {
              onDateFromChange('');
              onDateToChange('');
            }
          }}
          className={SELECT_CLASSES}
        >
          <option value="all">Thời gian: Tất cả</option>
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
          <option value="custom">Tùy chọn</option>
        </select>

        {timeFilter === 'custom' && (
          <>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className={`${SELECT_CLASSES} md:w-48`}
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className={`${SELECT_CLASSES} md:w-48`}
              placeholder="Đến ngày"
            />
          </>
        )}
      </div>
    </div>
  );
}

