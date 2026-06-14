'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { AdminUserReportsResponse, Pagination, UserReport, GroupedUserReport, UserReporter } from '@/lib/types';

const PAGE_LIMIT = 10;

const statusLabels: Record<UserReporter['status'], string> = {
  pending: 'Chờ xử lý',
  reviewed: 'Đã xử lý (Cấm)',
  rejected: 'Đã từ chối',
};

const statusClasses: Record<UserReporter['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  reviewed: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  rejected: 'bg-rose-500/10 text-rose-300 border border-rose-500/40',
};

export default function UserReportsPage() {
  const [reports, setReports] = useState<GroupedUserReport[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const [filterStatus, setFilterStatus] = useState<UserReporter['status'] | ''>('');

  const [selectedReport, setSelectedReport] = useState<GroupedUserReport | null>(null);
  const [selectedReporter, setSelectedReporter] = useState<UserReporter | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<UserReporter['status']>('pending');
  const [note, setNote] = useState('');

  // Bulk update states
  const [selectedReporters, setSelectedReporters] = useState<Set<string>>(new Set());
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<UserReporter['status']>('pending');
  const [bulkUpdateNote, setBulkUpdateNote] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const toggleExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const loadReports = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: AdminUserReportsResponse = await api.adminGetUserReports(
        page,
        PAGE_LIMIT,
        (filterStatus || undefined) as any,
      );
      setReports(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách báo cáo người dùng';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    loadReports(1);
  };

  const handlePageChange = (page: number) => {
    if (!pagination || page === pagination.currentPage) return;
    if (page < 1 || page > pagination.totalPages) return;
    loadReports(page);
  };

  const handleOpenDetail = (report: GroupedUserReport, reporter?: UserReporter) => {
    setSelectedReport(report);
    if (reporter) {
      setSelectedReporter(reporter);
      setNewStatus(reporter.status);
    } else {
      setSelectedReporter(null);
      setNewStatus('pending');
    }
    setNote('');
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !selectedReporter) return;
    try {
      setUpdatingStatus(true);
      await api.adminUpdateUserReportStatus(selectedReporter._id, newStatus, note || undefined);
      toast.success('Cập nhật trạng thái báo cáo người dùng thành công');
      setIsDetailOpen(false);
      setSelectedReport(null);
      setSelectedReporter(null);
      loadReports(pagination?.currentPage || 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật trạng thái báo cáo';
      toast.error(errorMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleSelectReporter = (reporterId: string) => {
    const newSelected = new Set(selectedReporters);
    if (newSelected.has(reporterId)) {
      newSelected.delete(reporterId);
    } else {
      newSelected.add(reporterId);
    }
    setSelectedReporters(newSelected);
  };

  const toggleSelectAllInUser = (report: GroupedUserReport) => {
    const reporterIds = report.reporters.map((r) => r._id);
    const allSelected = reporterIds.every((id) => selectedReporters.has(id));
    
    const newSelected = new Set(selectedReporters);
    if (allSelected) {
      reporterIds.forEach((id) => newSelected.delete(id));
    } else {
      reporterIds.forEach((id) => newSelected.add(id));
    }
    setSelectedReporters(newSelected);
  };

  const handleBulkUpdate = async () => {
    if (selectedReporters.size === 0) {
      toast.error('Vui lòng chọn ít nhất một báo cáo để cập nhật');
      return;
    }

    try {
      setBulkUpdating(true);
      const reportIds = Array.from(selectedReporters);
      const result = await api.adminBulkUpdateUserReportStatus(
        reportIds,
        bulkUpdateStatus,
        bulkUpdateNote || undefined,
      );
      toast.success(`Đã cập nhật ${result.updatedCount} báo cáo người dùng thành công`);
      setIsBulkUpdateOpen(false);
      setSelectedReporters(new Set());
      setBulkUpdateNote('');
      loadReports(pagination?.currentPage || 1);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật trạng thái báo cáo';
      toast.error(errorMessage);
    } finally {
      setBulkUpdating(false);
    }
  };

  const pageButtons = useMemo(() => {
    if (!pagination) return [1];
    const pages: number[] = [];
    const start = Math.max(1, pagination.currentPage - 1);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 1);
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages.length ? pages : [1];
  }, [pagination]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">
              Theo dõi và xử lý các người dùng bị báo cáo vi phạm cộng đồng
            </p>
            <h1 className="text-2xl font-semibold text-white mt-1">Báo cáo người dùng</h1>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-4 md:grid-cols-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Trạng thái báo cáo
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-2xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đã xử lý (Cấm)</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full rounded-2xl">
              Lọc
            </Button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-800 bg-[#0d1628] shadow-2xl shadow-black/20">
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 font-medium w-8"></th>
                  <th className="px-6 py-4 font-medium">Người dùng bị báo cáo</th>
                  <th className="px-6 py-4 font-medium">Tài khoản</th>
                  <th className="px-6 py-4 font-medium">Số lượng báo cáo</th>
                  <th className="px-6 py-4 font-medium">Người báo cáo</th>
                  <th className="px-6 py-4 font-medium">Thời gian báo cáo gần nhất</th>
                  <th className="px-6 py-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-200 divide-y divide-slate-800/80">
                {loading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-6">
                        <div className="h-5 w-5 rounded bg-slate-800" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-800" />
                          <div className="space-y-2 w-32">
                            <div className="h-3 rounded-full bg-slate-800" />
                            <div className="h-3 rounded-full bg-slate-800 w-20" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2 w-28">
                          <div className="h-3 rounded-full bg-slate-800" />
                          <div className="h-3 rounded-full bg-slate-800 w-16" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2 w-24">
                          <div className="h-3 rounded-full bg-slate-800" />
                          <div className="h-3 rounded-full bg-slate-800 w-14" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-2">
                          <div className="h-6 w-16 rounded bg-slate-800" />
                          <div className="h-6 w-16 rounded bg-slate-800" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-3 w-28 rounded-full bg-slate-800" />
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="h-3 w-16 rounded-full bg-slate-800 ml-auto" />
                      </td>
                    </tr>
                  ))}

                {!loading && reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      Không có báo cáo người dùng nào
                    </td>
                  </tr>
                )}

                {!loading &&
                  reports.length > 0 &&
                  reports.map((report) => {
                    const reportedUser = report.reportedUser;
                    if (!reportedUser) return null;
                    const userId = reportedUser._id?.toString() || '';
                    const isExpanded = expandedUsers.has(userId);

                    return (
                      <Fragment key={userId}>
                        <tr className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleExpand(userId)}
                              className="text-slate-400 hover:text-white transition-colors"
                            >
                              {isExpanded ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {reportedUser.avatarUrl ? (
                                <img
                                  src={reportedUser.avatarUrl}
                                  alt={reportedUser.fullName || 'User'}
                                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-semibold text-white">
                                  {reportedUser.fullName ? reportedUser.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">
                                  {reportedUser.fullName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  @{reportedUser.username || 'unknown'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <p className="text-xs text-slate-400 truncate">{reportedUser.email}</p>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                                    reportedUser.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                <span className="text-[11px] text-slate-400">
                                  {reportedUser.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                </span>
                                {reportedUser.role === 'admin' && (
                                  <span className="ml-1 px-1 py-0.5 text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {report.reportCounts ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">Tổng:</span>
                                  <span className="text-sm font-semibold text-white">
                                    {report.reportCounts.total}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-amber-400">Chờ xử lý:</span>
                                  <span
                                    className={`text-sm font-semibold ${
                                      report.reportCounts.pending >= 50
                                        ? 'text-red-400'
                                        : report.reportCounts.pending >= 20
                                        ? 'text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  >
                                    {report.reportCounts.pending}
                                    {report.reportCounts.pending >= 50 && (
                                      <span className="ml-1 text-[10px]" title="Đủ 50 báo cáo sẽ tự động bị cấm">⚠️</span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-emerald-400">Đã xử lý:</span>
                                  <span className="text-sm font-semibold text-emerald-300">
                                    {report.reportCounts.reviewed}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-rose-400">Đã từ chối:</span>
                                  <span className="text-sm font-semibold text-rose-300">
                                    {report.reportCounts.rejected}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Chưa có dữ liệu</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {report.reporters.slice(0, 2).map((reporter) => (
                                <div
                                  key={reporter._id}
                                  className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2 py-0.5"
                                >
                                  {reporter.userId?.avatarUrl ? (
                                    <img
                                      src={reporter.userId.avatarUrl}
                                      alt={reporter.userId.fullName}
                                      className="w-5 h-5 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-semibold text-white">
                                      {reporter.userId?.fullName ? reporter.userId.fullName.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                  <span className="text-xs text-slate-300 truncate max-w-[80px]">
                                    {reporter.userId?.fullName ? reporter.userId.fullName.split(' ').pop() : 'Reporter'}
                                  </span>
                                </div>
                              ))}
                              {report.reporters.length > 2 && (
                                <div className="flex items-center justify-center bg-slate-800/50 rounded-lg px-2 py-0.5">
                                  <span className="text-[11px] text-slate-400">
                                    +{report.reporters.length - 2}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {new Date(report.latestReportDate).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              className="border-slate-700 text-white hover:text-white hover:bg-slate-800"
                              onClick={() => handleOpenDetail(report)}
                            >
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && report.reporters.length > 0 && (
                          <tr className="bg-slate-900/60">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Danh sách chi tiết báo cáo ({report.reporters.length})
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={report.reporters.every((r) => selectedReporters.has(r._id))}
                                        onChange={() => toggleSelectAllInUser(report)}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-xs text-slate-400">Chọn tất cả</span>
                                    </label>
                                    {selectedReporters.size > 0 && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-xs"
                                        onClick={() => setIsBulkUpdateOpen(true)}
                                      >
                                        Cập nhật {selectedReporters.size} báo cáo
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="grid gap-3">
                                  {report.reporters.map((reporter) => (
                                    <div
                                      key={reporter._id}
                                      className={`flex items-start gap-4 p-3 rounded-lg border ${
                                        selectedReporters.has(reporter._id)
                                          ? 'bg-blue-500/10 border-blue-500/40'
                                          : 'bg-slate-800/40 border-slate-700/50'
                                      }`}
                                    >
                                      <div className="flex items-center pt-2">
                                        <input
                                          type="checkbox"
                                          checked={selectedReporters.has(reporter._id)}
                                          onChange={() => toggleSelectReporter(reporter._id)}
                                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]">
                                        {reporter.userId?.avatarUrl ? (
                                          <img
                                            src={reporter.userId.avatarUrl}
                                            alt={reporter.userId.fullName}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                                            {reporter.userId?.fullName ? reporter.userId.fullName.charAt(0).toUpperCase() : 'U'}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-white truncate">
                                            {reporter.userId?.fullName || 'Reporter'}
                                          </p>
                                          <p className="text-xs text-slate-400 truncate">
                                            @{reporter.userId?.username || 'unknown'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-slate-400 mb-1 font-medium">Lý do:</p>
                                        <p className="text-sm text-slate-200">{reporter.reason}</p>
                                        {reporter.description && (
                                          <>
                                            <p className="text-xs text-slate-400 mt-2 mb-1 font-medium">Mô tả:</p>
                                            <p className="text-sm text-slate-300 whitespace-pre-wrap">{reporter.description}</p>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <span
                                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClasses[reporter.status]}`}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                                          {statusLabels[reporter.status]}
                                        </span>
                                        <p className="text-xs text-slate-500">
                                          {new Date(reporter.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-slate-600 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
                                          onClick={() => handleOpenDetail(report, reporter)}
                                        >
                                          Xử lý
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              {pagination
                ? `Trang ${pagination.currentPage} / ${pagination.totalPages}`
                : 'Không có dữ liệu'}
            </p>
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
      </div>

      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedReport(null);
          setSelectedReporter(null);
          setNote('');
        }}
        title="Chi tiết báo cáo người dùng"
        size="xl"
      >
        {!selectedReport ? (
          <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Reported User Profile Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Người dùng bị báo cáo</p>
                <div className="flex items-center gap-4">
                  {selectedReport.reportedUser.avatarUrl ? (
                    <img
                      src={selectedReport.reportedUser.avatarUrl}
                      alt={selectedReport.reportedUser.fullName}
                      className="w-16 h-16 rounded-full object-cover border border-slate-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-xl font-semibold text-white">
                      {selectedReport.reportedUser.fullName ? selectedReport.reportedUser.fullName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {selectedReport.reportedUser.fullName || 'Unknown'}
                    </h3>
                    <p className="text-sm text-slate-400">@{selectedReport.reportedUser.username}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedReport.reportedUser.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Trạng thái hiện tại:</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        selectedReport.reportedUser.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {selectedReport.reportedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                    </span>
                  </div>
                </div>

                {selectedReport.reportCounts && (
                  <div className="pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Thống kê báo cáo</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-500">Tổng báo cáo:</span>
                        <span className="ml-1 font-semibold text-white block text-sm mt-0.5">
                          {selectedReport.reportCounts.total}
                        </span>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-amber-400">Chờ xử lý:</span>
                        <span
                          className={`ml-1 font-semibold block text-sm mt-0.5 ${
                            selectedReport.reportCounts.pending >= 50
                              ? 'text-red-400'
                              : 'text-amber-300'
                          }`}
                        >
                          {selectedReport.reportCounts.pending}
                        </span>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-emerald-400">Đã xử lý:</span>
                        <span className="ml-1 font-semibold text-emerald-300 block text-sm mt-0.5">
                          {selectedReport.reportCounts.reviewed}
                        </span>
                      </div>
                      <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                        <span className="text-rose-400">Đã từ chối:</span>
                        <span className="ml-1 font-semibold text-rose-300 block text-sm mt-0.5">
                          {selectedReport.reportCounts.rejected}
                        </span>
                      </div>
                    </div>
                    {selectedReport.reportCounts.pending >= 50 && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <p className="text-xs text-red-400">
                          ⚠️ Người dùng này có {selectedReport.reportCounts.pending} báo cáo đang chờ xử lý. Tài khoản đã tự động bị vô hiệu hóa / cấm tạm thời.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Status Update Form / Action Panel */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {selectedReporter ? 'Xử lý báo cáo đã chọn' : 'Chọn một báo cáo cụ thể bên dưới để xử lý'}
                </p>

                {selectedReporter ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">
                        Trạng thái mới
                      </label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as any)}
                        className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="reviewed">Đã xử lý (Ban tài khoản)</option>
                        <option value="rejected">Từ chối báo cáo</option>
                      </select>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        {newStatus === 'reviewed' && '⚠️ Xác nhận vi phạm: Tài khoản người dùng sẽ bị BAN ngay lập tức.'}
                        {newStatus === 'rejected' && '💡 Bỏ qua báo cáo này. Nếu toàn bộ báo cáo bị từ chối, tài khoản sẽ được Unban.'}
                        {newStatus === 'pending' && '💤 Trả về trạng thái chờ xử lý.'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 font-medium mb-1">
                        Ghi chú xử lý / Lý do (Gửi cho người dùng bị xử lý)
                      </label>
                      <textarea
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Nhập ghi chú hoặc lý do cấm tài khoản..."
                        className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdateStatus}
                        disabled={updatingStatus}
                        className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm py-2.5"
                      >
                        {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReporter(null)}
                        className="border-slate-700 hover:bg-slate-800 rounded-xl text-sm"
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[200px] text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-xl p-4">
                    <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p className="text-xs text-slate-400">
                      Chọn một người báo cáo trong danh sách bên dưới hoặc nhấn vào nút &quot;Xử lý&quot; tương ứng để tiến hành cấm/bỏ qua tài khoản.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* List of reports for the user in the modal */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chi tiết báo cáo từ người dùng ({selectedReport.reporters.length})
              </h4>
              <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                {selectedReport.reporters.map((reporter) => (
                  <div
                    key={reporter._id}
                    className={`flex items-start gap-4 p-3 rounded-xl border ${
                      selectedReporter?._id === reporter._id
                        ? 'bg-blue-500/10 border-blue-500/40'
                        : 'bg-slate-900/20 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-shrink-0 w-[200px]">
                      {reporter.userId?.avatarUrl ? (
                        <img
                          src={reporter.userId.avatarUrl}
                          alt={reporter.userId.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                          {reporter.userId?.fullName ? reporter.userId.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">
                          {reporter.userId?.fullName || 'Reporter'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          @{reporter.userId?.username || 'unknown'}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 font-medium">Lý do:</p>
                      <p className="text-xs text-slate-200 mt-0.5">{reporter.reason}</p>
                      {reporter.description && (
                        <>
                          <p className="text-xs text-slate-400 mt-1 font-medium">Mô tả:</p>
                          <p className="text-xs text-slate-300 mt-0.5 whitespace-pre-wrap">{reporter.description}</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${statusClasses[reporter.status]}`}
                      >
                        {statusLabels[reporter.status]}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(reporter.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {selectedReporter?._id !== reporter._id && (
                        <button
                          onClick={() => {
                            setSelectedReporter(reporter);
                            setNewStatus(reporter.status);
                            setNote('');
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                          Xử lý báo cáo này
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        isOpen={isBulkUpdateOpen}
        onClose={() => {
          setIsBulkUpdateOpen(false);
          setBulkUpdateNote('');
        }}
        title={`Cập nhật hàng loạt (${selectedReporters.size} báo cáo)`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">
              Trạng thái mới áp dụng cho các báo cáo đã chọn
            </label>
            <select
              value={bulkUpdateStatus}
              onChange={(e) => setBulkUpdateStatus(e.target.value as any)}
              className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đã xử lý (Cấm tài khoản)</option>
              <option value="rejected">Từ chối báo cáo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">
              Ghi chú xử lý / Lý do
            </label>
            <textarea
              rows={3}
              value={bulkUpdateNote}
              onChange={(e) => setBulkUpdateNote(e.target.value)}
              placeholder="Ghi chú áp dụng chung cho loạt báo cáo..."
              className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsBulkUpdateOpen(false)}
              className="border-slate-700 hover:bg-slate-800 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={bulkUpdating}
              className="bg-blue-600 hover:bg-blue-500 rounded-xl"
            >
              {bulkUpdating ? 'Đang cập nhật...' : 'Xác nhận cập nhật'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
