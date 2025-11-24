'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Pagination, User } from '@/lib/types';
import { useUsers } from '@/context/UsersContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

type RoleFilter = 'all' | User['role'];
type StatusFilter = 'all' | 'active' | 'suspended';

const PAGE_LIMIT = 10;

const roleConfigs: Record<User['role'], { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-blue-500/15 text-blue-200 border border-blue-500/40',
  },
  user: {
    label: 'User',
    className: 'bg-slate-500/15 text-slate-100 border border-slate-500/30',
  },
};

export default function UserManagementColumn() {
  const { selectedUserId, setSelectedUserId } = useUsers();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.adminGetAllUsers(
        page,
        PAGE_LIMIT,
        searchQuery.trim() || undefined,
        roleFilter !== 'all' ? roleFilter : undefined,
        statusFilter === 'active' ? true : statusFilter === 'suspended' ? false : undefined
      );

      setUsers(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách người dùng';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    if (users.length === 0) {
      if (selectedUserId) {
        setSelectedUserId(null);
      }
      return;
    }

    if (!selectedUserId || !users.some((user) => user.userId === selectedUserId)) {
      setSelectedUserId(users[0].userId);
    }
  }, [users, selectedUserId, setSelectedUserId]);

  const displayRange = useMemo(() => {
    if (!pagination || users.length === 0) {
      return 'Không có dữ liệu';
    }

    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const tentativeEnd = start + users.length - 1;
    const total = pagination.totalItems || tentativeEnd;
    const end = Math.min(tentativeEnd, total);
    return `Hiển thị ${start}-${end} của ${total}`;
  }, [pagination, users.length]);

  const pageButtons = useMemo(() => {
    if (!pagination) return [1];
    const start = Math.max(1, pagination.currentPage - 1);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages.length > 0 ? pages : [1];
  }, [pagination]);

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    fetchUsers(1);
  };

  const handlePageChange = (page: number) => {
    if (!pagination || page === pagination.currentPage || page < 1 || page > pagination.totalPages) {
      return;
    }
    fetchUsers(page);
  };

  const selectClasses =
    'flex-1 min-w-[160px] px-4 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <section className="rounded-3xl border border-slate-800 bg-[#0d1628] shadow-2xl shadow-black/20 flex flex-col">
      <div className="p-6 border-b border-slate-800 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Quản lý tất cả người dùng trong hệ thống.</p>
          <h2 className="text-2xl font-semibold text-white mt-1">Quản lý người dùng</h2>
        </div>
        <Button
          onClick={() => toast.success('Tính năng thêm mới sẽ sớm khả dụng')}
          className="bg-blue-600 hover:bg-blue-500 border border-blue-400/30 shadow-lg shadow-blue-500/25"
        >
          + Thêm người dùng mới
        </Button>
      </div>

      <div className="border-b border-slate-800 p-6 space-y-4">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Tìm theo tên, email, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
            className={selectClasses}
          >
            <option value="all">Vai trò: Tất cả</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className={selectClasses}
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="suspended">Bị cấm</option>
          </select>

          <select className={`${selectClasses} md:w-48`}>
            <option value="any">Thời gian: Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-left">
            <thead className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/30">
              <tr>
                <th className="px-6 py-4 font-medium">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 rounded border-slate-600 bg-transparent text-blue-500"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Tên người dùng</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Ngày tham gia</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-200 divide-y divide-slate-800/80">
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
                    users.map((user) => {
                      const isSelected = selectedUserId === user.userId;
                      const roleInfo = roleConfigs[user.role] || roleConfigs.user;

                      return (
                        <tr
                          key={user.userId}
                          onClick={() => setSelectedUserId(user.userId)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-500/10' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => setSelectedUserId(user.userId)}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4 rounded border-slate-600 bg-transparent text-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {user.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.fullName}
                                  className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-800"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold">
                                  {user.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-white">{user.fullName}</p>
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
                            <button
                              type="button"
                              className="text-slate-400 hover:text-white transition-colors"
                              onClick={(event) => {
                                event.stopPropagation();
                                toast('Tính năng chỉnh sửa đang phát triển');
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
                          </td>
                        </tr>
                      );
                    })
                  )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-800 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-400">{displayRange}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
              disabled={!pagination?.hasPrevPage || loading}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
            >
              Trước
            </button>

            {pageButtons.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
              disabled={!pagination?.hasNextPage || loading}
              className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

