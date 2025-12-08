import React from 'react';
import type { User } from '@/lib/types';
import { roleConfigs } from '../../constants';

interface UserTableRowProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: string) => void;
  onEdit: (user: User) => void;
  onToggleBan: (user: User) => void;
}

export default function UserTableRow({
  user,
  isSelected,
  onSelect,
  onEdit,
  onToggleBan,
}: UserTableRowProps) {
  const roleInfo = roleConfigs[user.role] || roleConfigs.user;

  return (
    <tr
      onClick={() => onSelect(user.userId)}
      className={`cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-900/40'
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || user.username || 'User'}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
              {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-white">{user.fullName || user.username || 'Người dùng'}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${roleInfo.className}`}>
          {roleInfo.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-2 text-sm ${
            user.isActive ? 'text-emerald-300' : 'text-rose-300'
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              user.isActive ? 'bg-emerald-400' : 'bg-rose-500'
            }`}
          />
          {user.isActive ? 'Hoạt động' : 'Bị cấm'}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-300">
        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            className="text-slate-400 hover:text-white transition-colors"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(user);
            }}
            aria-label="Chỉnh sửa người dùng"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
          </button>

          <button
            type="button"
            className={`inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              user.isActive
                ? 'border-rose-500/60 text-rose-300 hover:bg-rose-500/10'
                : 'border-emerald-500/60 text-emerald-300 hover:bg-emerald-500/10'
            }`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleBan(user);
            }}
            title={user.isActive ? 'Cấm người dùng' : 'Bỏ cấm người dùng'}
            aria-label={user.isActive ? 'Cấm người dùng' : 'Bỏ cấm người dùng'}
          >
            {user.isActive ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="7" y1="17" x2="17" y2="7" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M7 11V8a5 5 0 0 1 9.33-2.5" />
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M12 15v2" />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}










