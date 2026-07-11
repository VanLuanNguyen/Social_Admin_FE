'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { AdminPostReportsResponse, Pagination, PostReport, GroupedPostReport, PostReporter } from '@/lib/types';
import { formatTags } from '@/lib/utils';

const PAGE_LIMIT = 10;

const statusLabels: Record<PostReport['status'], string> = {
  pending: 'Chờ xử lý',
  reviewed: 'Đã xử lý',
  rejected: 'Đã từ chối',
};

const statusClasses: Record<PostReport['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  reviewed: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  rejected: 'bg-rose-500/10 text-rose-300 border border-rose-500/40',
};

export default function PostReportsPage() {
  const [reports, setReports] = useState<GroupedPostReport[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  const [filterStatus, setFilterStatus] = useState<PostReport['status'] | ''>('');

  const [selectedReport, setSelectedReport] = useState<GroupedPostReport | null>(null);
  const [selectedReporter, setSelectedReporter] = useState<PostReporter | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<PostReport['status']>('pending');
  const [note, setNote] = useState('');

  // Bulk update states
  const [selectedReporters, setSelectedReporters] = useState<Set<string>>(new Set());
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [bulkUpdateStatus, setBulkUpdateStatus] = useState<PostReport['status']>('pending');
  const [bulkUpdateNote, setBulkUpdateNote] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);

  const toggleExpand = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const loadReports = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: AdminPostReportsResponse = await api.adminGetPostReports(
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
        'Không thể tải danh sách báo cáo bài viết';
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

  const handleOpenDetail = (report: GroupedPostReport, reporter?: PostReporter) => {
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
      await api.adminUpdatePostReportStatus(selectedReporter._id, newStatus, note || undefined);
      toast.success('Cập nhật trạng thái báo cáo thành công');
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

  const toggleSelectAllInPost = (report: GroupedPostReport) => {
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
      const result = await api.adminBulkUpdatePostReportStatus(
        reportIds,
        bulkUpdateStatus,
        bulkUpdateNote || undefined,
      );
      toast.success(`Đã cập nhật ${result.updatedCount} báo cáo thành công`);
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
              Theo dõi và xử lý các bài viết bị người dùng báo cáo
            </p>
            <h1 className="text-2xl font-semibold text-white mt-1">Báo cáo bài viết</h1>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="flex flex-wrap items-end gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 max-w-md"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Trạng thái báo cáo
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đã xử lý</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <Button type="submit" className="px-6 py-2.5 rounded-xl h-[42px]">
            Lọc
          </Button>
        </form>

        <div className="rounded-3xl border border-slate-800 bg-[#0d1628] shadow-2xl shadow-black/20">
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 font-medium w-12"></th>
                  <th className="px-6 py-4 font-medium w-[30%] min-w-[280px] max-w-[350px]">Bài viết</th>
                  <th className="px-6 py-4 font-medium w-[15%] min-w-[150px]">Người đăng</th>
                  <th className="px-6 py-4 font-medium w-[22%] min-w-[200px]">Số lượng báo cáo</th>
                  <th className="px-6 py-4 font-medium w-[18%] min-w-[160px]">Người báo cáo</th>
                  <th className="px-6 py-4 font-medium w-[12%] min-w-[140px]">Thời gian báo cáo gần nhất</th>
                  <th className="px-6 py-4 font-medium text-right w-[10%] min-w-[120px]">Hành động</th>
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
                        <div className="flex items-start gap-3">
                          <div className="w-16 h-16 rounded-lg bg-slate-800" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 w-48 rounded-full bg-slate-800" />
                            <div className="h-3 w-32 rounded-full bg-slate-800" />
                            <div className="h-3 w-24 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800" />
                          <div className="space-y-2 w-full">
                            <div className="h-3 w-24 rounded-full bg-slate-800" />
                            <div className="h-3 w-32 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="h-3 w-16 rounded-full bg-slate-800" />
                          <div className="h-3 w-20 rounded-full bg-slate-800" />
                          <div className="h-3 w-18 rounded-full bg-slate-800" />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex gap-2">
                          <div className="h-8 w-20 rounded-lg bg-slate-800" />
                          <div className="h-8 w-20 rounded-lg bg-slate-800" />
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
                      Không có báo cáo nào
                    </td>
                  </tr>
                )}

                {!loading &&
                  reports.length > 0 &&
                  reports.map((report) => {
                    const postId = report.postId?._id?.toString() || '';
                    const isExpanded = expandedPosts.has(postId);
                    const postOwner =
                      report.postId &&
                      typeof report.postId.userId === 'object'
                        ? report.postId.userId
                        : null;

                    return (
                      <Fragment key={postId}>
                        <tr
                          className="hover:bg-slate-900/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleExpand(postId)}
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
                          <td className="px-6 py-4 w-[30%] min-w-[280px] max-w-[350px]">
                            <div className="flex items-start gap-3">
                              {report.postId?.urls && report.postId.urls.length > 0 && (
                                <div className="flex-shrink-0 relative">
                                  {report.postId.urls[0].url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                                      <video className="w-full h-full object-cover">
                                        <source src={report.postId.urls[0].url} />
                                      </video>
                                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z" />
                                        </svg>
                                      </div>
                                      {report.postId.urls.length > 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full px-1.5 py-0.5">
                                          <span className="text-[10px] text-slate-300">
                                            +{report.postId.urls.length - 1}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      <img
                                        src={report.postId.urls[0].url}
                                        alt={report.postId.urls[0].title || 'Post image'}
                                        className="w-16 h-16 rounded-lg object-cover border border-slate-700"
                                      />
                                      {report.postId.urls.length > 1 && (
                                        <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-700 rounded-full px-1.5 py-0.5">
                                          <span className="text-[10px] text-slate-300">
                                            +{report.postId.urls.length - 1}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex-1 min-w-0 space-y-1">
                                <p className="text-sm text-slate-200 font-medium leading-relaxed line-clamp-2 break-words">
                                  {formatTags(report.postId?.caption) ||
                                    'Bài viết không có nội dung'}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <code className="text-[10px] bg-slate-900/80 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800/80 font-mono">
                                    ID: {postId}
                                  </code>
                                  {report.postId?.urls && report.postId.urls.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-700/30">
                                      📁 {report.postId.urls.length} {report.postId.urls.length === 1 ? 'ảnh' : 'ảnh/video'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 w-[15%] min-w-[150px] max-w-[200px]">
                            <div className="flex items-center gap-3">
                              {postOwner?.avatarUrl ? (
                                <img
                                  src={postOwner.avatarUrl}
                                  alt={postOwner.fullName || 'User'}
                                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                                  {postOwner?.fullName
                                    ? postOwner.fullName.charAt(0).toUpperCase()
                                    : 'U'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate max-w-[140px]">
                                  {postOwner?.fullName || 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-[140px]">
                                  {postOwner?.username ? `@${postOwner.username}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {report.reportCounts ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                    {report.reportCounts.total}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">báo cáo</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium border ${
                                    report.reportCounts.pending >= 100
                                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  }`}>
                                    Chờ: {report.reportCounts.pending}
                                    {report.reportCounts.pending >= 100 && ' ⚠️'}
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Duyệt: {report.reportCounts.reviewed}
                                  </span>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Từ chối: {report.reportCounts.rejected}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Chưa có dữ liệu</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {report.reporters.slice(0, 3).map((reporter) => (
                                <div
                                  key={reporter._id}
                                  className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2 py-1"
                                >
                                  {reporter.userId.avatarUrl ? (
                                    <img
                                      src={reporter.userId.avatarUrl}
                                      alt={reporter.userId.fullName}
                                      className="w-6 h-6 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-white">
                                      {reporter.userId.fullName.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <span className="text-xs text-slate-300">
                                    {reporter.userId.fullName.split(' ').pop()}
                                  </span>
                                </div>
                              ))}
                              {report.reporters.length > 3 && (
                                <div className="flex items-center justify-center bg-slate-800/50 rounded-lg px-2 py-1">
                                  <span className="text-xs text-slate-400">
                                    +{report.reporters.length - 3} người khác
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                            {new Date(report.latestReportDate).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 p-2 rounded-xl inline-flex items-center justify-center shadow-md transition-all duration-200"
                              onClick={() => handleOpenDetail(report)}
                              title="Xem chi tiết"
                            >
                              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </td>
                        </tr>
                        {isExpanded && report.reporters.length > 0 && (
                          <tr className="bg-slate-900/60">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Danh sách người báo cáo ({report.reporters.length})
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={report.reporters.every((r) => selectedReporters.has(r._id))}
                                        onChange={() => toggleSelectAllInPost(report)}
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
                                      <div className="flex items-center gap-3 flex-1">
                                        {reporter.userId.avatarUrl ? (
                                          <img
                                            src={reporter.userId.avatarUrl}
                                            alt={reporter.userId.fullName}
                                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                                          />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                                            {reporter.userId.fullName.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex-1">
                                          <p className="text-sm font-semibold text-white">
                                            {reporter.userId.fullName}
                                          </p>
                                          <p className="text-xs text-slate-400">
                                            @{reporter.userId.username}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-slate-400 mb-1">Lý do:</p>
                                        <p className="text-sm text-slate-200">{reporter.reason}</p>
                                        {reporter.description && (
                                          <>
                                            <p className="text-xs text-slate-400 mt-2 mb-1">Mô tả:</p>
                                            <p className="text-sm text-slate-300">{reporter.description}</p>
                                          </>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end gap-2">
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
                onClick={() =>
                  handlePageChange((pagination?.currentPage || 1) - 1)
                }
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
                onClick={() =>
                  handlePageChange((pagination?.currentPage || 1) + 1)
                }
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
        title="Chi tiết báo cáo bài viết"
        size="xl"
      >
        {!selectedReport ? (
          <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
        ) : (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-xs text-slate-400 mb-2">Bài viết</p>
                {selectedReport.postId?.urls && selectedReport.postId.urls.length > 0 && (
                  <div className="mb-3">
                    {selectedReport.postId.urls[0].url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                      <div className="relative w-full rounded-lg overflow-hidden bg-slate-800 border border-slate-700 mb-2">
                        <video controls className="w-full max-h-48">
                          <source src={selectedReport.postId.urls[0].url} />
                        </video>
                      </div>
                    ) : (
                      <img
                        src={selectedReport.postId.urls[0].url}
                        alt={selectedReport.postId.urls[0].title || 'Post image'}
                        className="w-full max-h-48 rounded-lg object-cover border border-slate-700 mb-2"
                      />
                    )}
                    {selectedReport.postId.urls.length > 1 && (
                      <p className="text-xs text-slate-400">
                        +{selectedReport.postId.urls.length - 1} {selectedReport.postId.urls.length - 1 === 1 ? 'ảnh/video khác' : 'ảnh/video khác'}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-sm text-white line-clamp-3">
                  {formatTags(selectedReport.postId?.caption) || 'Bài viết không có nội dung'}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  ID: {selectedReport.postId?._id}
                </p>
                {selectedReport.reportCounts && (
                  <div className="mt-3 pt-3 border-t border-slate-800">
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
                            selectedReport.reportCounts.pending >= 100
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
                    {selectedReport.reportCounts.pending >= 100 && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/40 rounded-lg">
                        <p className="text-[11px] text-red-400 font-medium">
                          ⚠️ Bài viết này có {selectedReport.reportCounts.pending} báo cáo đang chờ xử lý và đã được tự động ẩn.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Người đăng bài viết</p>
                  {selectedReport.postId && typeof selectedReport.postId.userId === 'object' ? (
                    <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      {selectedReport.postId.userId.avatarUrl ? (
                        <img
                          src={selectedReport.postId.userId.avatarUrl}
                          alt={selectedReport.postId.userId.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                          {selectedReport.postId.userId.fullName ? selectedReport.postId.userId.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {selectedReport.postId.userId.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          @{selectedReport.postId.userId.username}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">Không rõ người đăng</p>
                  )}
                </div>
                {selectedReporter && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wider">Người báo cáo (Đang chọn)</p>
                    <div className="flex items-center gap-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      {selectedReporter.userId.avatarUrl ? (
                        <img
                          src={selectedReporter.userId.avatarUrl}
                          alt={selectedReporter.userId.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                          {selectedReporter.userId.fullName ? selectedReporter.userId.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {selectedReporter.userId.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          @{selectedReporter.userId.username}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedReporter && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lý do báo cáo</p>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-sm text-amber-200 font-medium whitespace-pre-wrap">
                      {selectedReporter.reason}
                    </p>
                  </div>
                </div>

                {selectedReporter.description && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Mô tả chi tiết</p>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {selectedReporter.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedReport.reporters && selectedReport.reporters.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tất cả người báo cáo ({selectedReport.reporters.length})
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedReport.reporters.map((reporter) => (
                    <div
                      key={reporter._id}
                      className={`p-3 rounded-lg border ${
                        selectedReporter?._id === reporter._id
                          ? 'bg-blue-500/10 border-blue-500/40'
                          : 'bg-slate-800/40 border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {reporter.userId.avatarUrl ? (
                            <img
                              src={reporter.userId.avatarUrl}
                              alt={reporter.userId.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-white">
                              {reporter.userId.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {reporter.userId.fullName}
                            </p>
                            <p className="text-xs text-slate-400">@{reporter.userId.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClasses[reporter.status]}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                            {statusLabels[reporter.status]}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-xs text-slate-300 hover:text-white hover:bg-slate-700"
                            onClick={() => {
                              setSelectedReporter(reporter);
                              setNewStatus(reporter.status);
                            }}
                          >
                            Chọn
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                        {reporter.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport.postId?.urls &&
              selectedReport.postId.urls.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Ảnh / video bài viết</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedReport.postId.urls.map((media) => (
                      <div
                        key={media._id}
                        className="rounded-xl border border-slate-800 overflow-hidden"
                      >
                        {media.url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                          <video controls className="w-full">
                            <source src={media.url} />
                          </video>
                        ) : (
                          <img
                            src={media.url}
                            alt={media.title || 'Post media'}
                            className="w-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {selectedReporter && (
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                  <p className="text-xs text-slate-400 mb-1">Cập nhật trạng thái</p>
                  <div className="flex flex-wrap gap-2">
                    {(['pending', 'reviewed', 'rejected'] as PostReport['status'][]).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={updatingStatus}
                          onClick={() => setNewStatus(status)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                            newStatus === status
                              ? statusClasses[status]
                              : 'border-slate-700 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ),
                    )}
                  </div>
                  <div className="space-y-2 mt-3">
                    <label className="text-xs text-slate-400">
                      Ghi chú nội bộ (không bắt buộc)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-900/60 border border-slate-700 text-sm text-white rounded-2xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Ví dụ: Đã ẩn bài viết và cảnh cáo người dùng..."
                    />
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2 text-xs text-slate-400">
                  <p className="font-semibold text-slate-300 mb-1">Thông tin hệ thống</p>
                  <p>
                    Trạng thái hiện tại:{' '}
                    <span className={`font-semibold ${statusClasses[selectedReporter.status]}`}>
                      {statusLabels[selectedReporter.status]}
                    </span>
                  </p>
                  <p>
                    Thời gian tạo báo cáo:{' '}
                    <span className="text-slate-300">
                      {new Date(selectedReporter.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </p>
                  <p>
                    Cập nhật lần cuối:{' '}
                    <span className="text-slate-300">
                      {new Date(selectedReporter.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  </p>
                  <p className="mt-3 text-[11px] text-slate-500">
                    Lưu ý: Hành động ẩn/xóa bài viết được thực hiện ở trang quản lý bài
                    viết. Ở đây chỉ cập nhật trạng thái xử lý báo cáo để theo dõi.
                  </p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    Hệ thống sẽ tự động ẩn bài viết khi có ≥ 100 báo cáo đang chờ xử lý.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedReport(null);
                  setSelectedReporter(null);
                  setNote('');
                }}
                disabled={updatingStatus}
              >
                Đóng
              </Button>
              {selectedReporter && (
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="bg-blue-600 border border-blue-400/40 shadow-lg shadow-blue-500/25"
                >
                  {updatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
                </Button>
              )}
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
        title={`Cập nhật ${selectedReporters.size} báo cáo`}
        size="md"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 mb-3">Chọn trạng thái</p>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'reviewed', 'rejected'] as PostReport['status'][]).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={bulkUpdating}
                    onClick={() => setBulkUpdateStatus(status)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      bulkUpdateStatus === status
                        ? statusClasses[status]
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {statusLabels[status]}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <label className="text-xs text-slate-400">
              Ghi chú nội bộ (không bắt buộc)
            </label>
            <textarea
              value={bulkUpdateNote}
              onChange={(e) => setBulkUpdateNote(e.target.value)}
              rows={3}
              className="w-full bg-slate-900/60 border border-slate-700 text-sm text-white rounded-2xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Ví dụ: Đã ẩn bài viết và cảnh cáo người dùng..."
              disabled={bulkUpdating}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
              onClick={() => {
                setIsBulkUpdateOpen(false);
                setBulkUpdateNote('');
              }}
              disabled={bulkUpdating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleBulkUpdate}
              disabled={bulkUpdating || selectedReporters.size === 0}
              className="bg-blue-600 border border-blue-400/40 shadow-lg shadow-blue-500/25"
            >
              {bulkUpdating ? 'Đang cập nhật...' : `Cập nhật ${selectedReporters.size} báo cáo`}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}


