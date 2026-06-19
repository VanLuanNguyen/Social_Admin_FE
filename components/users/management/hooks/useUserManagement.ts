import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Pagination, User } from '@/lib/types';
import { useUsers } from '@/context/UsersContext';
import toast from 'react-hot-toast';
import type { StatusFilter, TimeFilter } from '../../types';
import { PAGE_LIMIT } from '../../constants';
import { getDateRange } from '../utils/dateUtils';

export const useUserManagement = () => {
  const { selectedUserId, setSelectedUserId } = useUsers();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const { dateFrom: calculatedDateFrom, dateTo: calculatedDateTo } = getDateRange(
        timeFilter,
        dateFrom,
        dateTo
      );

      const response = await api.adminGetAllUsers(
        page,
        PAGE_LIMIT,
        searchQuery.trim() || undefined,
        statusFilter === 'active' ? false : statusFilter === 'suspended' ? true : undefined,
        calculatedDateFrom,
        calculatedDateTo
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
  }, [statusFilter, timeFilter, dateFrom, dateTo]);

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

  const handleToggleBanUser = async (user: User, banUntil?: string | null, banReason?: string) => {
    try {
      if (user.isBan) {
        // eslint-disable-next-line no-alert
        const confirmed = window.confirm('Bạn có chắc chắn muốn bỏ cấm người dùng này?');
        if (!confirmed) return;

        await api.adminUpdateUser(user.userId, { isBan: false });

        toast.success('Đã bỏ cấm người dùng');

        setUsers((prev) =>
          prev.map((u) => (u.userId === user.userId ? { ...u, isBan: false, banUntil: undefined, banReason: undefined } : u))
        );
      } else {
        await api.adminUpdateUser(user.userId, {
          isBan: true,
          banUntil: banUntil || undefined,
          banReason: banReason || undefined,
        });

        toast.success('Đã cấm người dùng');

        setUsers((prev) =>
          prev.map((u) => (u.userId === user.userId ? { ...u, isBan: true, banUntil: banUntil || undefined, banReason: banReason || undefined } : u))
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật trạng thái người dùng';
      toast.error(errorMessage);
      if (!user.isBan) throw error;
    }
  };

  return {
    users,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    pagination,
    displayRange,
    pageButtons,
    selectedUserId,
    setSelectedUserId,
    handleSearch,
    handlePageChange,
    handleToggleBanUser,
    fetchUsers,
  };
};











