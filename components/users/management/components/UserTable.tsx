import React from 'react';
import type { User } from '@/lib/types';
import UserTableRow from './UserTableRow';

interface UserTableProps {
  users: User[];
  loading: boolean;
  searchQuery: string;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onToggleBanUser: (user: User) => void;
}

export default function UserTable({
  users,
  loading,
  searchQuery,
  selectedUserId,
  onSelectUser,
  onEditUser,
  onToggleBanUser,
}: UserTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-left">
        <thead className="text-xs uppercase tracking-widest text-slate-400 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50">
          <tr>
            <th className="w-[23%] px-6 py-4 font-medium">Tên người dùng</th>
            <th className="w-[15%] px-6 py-4 font-medium">Vai trò</th>
            <th className="w-[19%] px-6 py-4 font-medium">Trạng thái</th>
            <th className="w-[23%] px-6 py-4 font-medium">Ngày tham gia</th>
            <th className="w-[20%] px-6 py-4 font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-200 divide-y divide-slate-700/30">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="animate-pulse">
                  <td className="px-6 py-6">
                    <div className="h-4 w-4 rounded bg-slate-800" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800" />
                      <div className="space-y-2 w-full">
                        <div className="h-3 w-32 rounded-full bg-slate-800" />
                        <div className="h-3 w-48 rounded-full bg-slate-800" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-5 w-20 rounded-full bg-slate-800" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-5 w-24 rounded-full bg-slate-800" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="h-3 w-20 rounded-full bg-slate-800" />
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="h-3 w-8 rounded-full bg-slate-800 ml-auto" />
                  </td>
                </tr>
              ))
            : users.length === 0
              ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                      {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
                    </td>
                  </tr>
                )
              : (
                  users.map((user) => (
                    <UserTableRow
                      key={user.userId}
                      user={user}
                      isSelected={selectedUserId === user.userId}
                      onSelect={onSelectUser}
                      onEdit={onEditUser}
                      onToggleBan={onToggleBanUser}
                    />
                  ))
                )}
        </tbody>
      </table>
    </div>
  );
}































