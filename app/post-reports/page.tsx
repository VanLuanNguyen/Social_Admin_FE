'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { AdminPostReportsResponse, Pagination, PostReport } from '@/lib/types';

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
  const [reports, setReports] = useState<PostReport[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<PostReport['status'] | ''>('');
  const [filterPostId, setFilterPostId] = useState('');
  const [filterUserId, setFilterUserId] = useState('');

  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<PostReport['status']>('pending');
  const [note, setNote] = useState('');

  const loadReports = async (page: number = 1) => {
    try {
      setLoading(true);
      const response: AdminPostReportsResponse = await api.adminGetPostReports(
        page,
        PAGE_LIMIT,
        (filterStatus || undefined) as any,
        filterPostId.trim() || undefined,
        filterUserId.trim() || undefined,
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

  const handleOpenDetail = async (report: PostReport) => {
    try {
      // Lấy chi tiết mới nhất từ backend
      const fresh = await api.adminGetPostReportById(report._id);
      setSelectedReport(fresh);
      setNewStatus(fresh.status);
      setNote('');
      setIsDetailOpen(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết báo cáo';
      toast.error(errorMessage);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;
    try {
      setUpdatingStatus(true);
      await api.adminUpdatePostReportStatus(selectedReport._id, newStatus, note || undefined);
      toast.success('Cập nhật trạng thái báo cáo thành công');
      setIsDetailOpen(false);
      setSelectedReport(null);
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
          className="grid gap-4 md:grid-cols-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4"
        >
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full bg-slate-900/60 border border-slate-700 text-white text-sm rounded-2xl px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đã xử lý</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Lọc theo postId
            </label>
            <Input
              type="text"
              placeholder="Nhập ID bài viết"
              value={filterPostId}
              onChange={(e) => setFilterPostId(e.target.value)}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Lọc theo userId (người báo cáo)
            </label>
            <Input
              type="text"
              placeholder="Nhập ID người dùng"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
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
                  <th className="px-6 py-4 font-medium">Bài viết</th>
                  <th className="px-6 py-4 font-medium">Người đăng</th>
                  <th className="px-6 py-4 font-medium">Người báo cáo</th>
                  <th className="px-6 py-4 font-medium">Lý do</th>
                  <th className="px-6 py-4 font-medium">Trạng thái</th>
                  <th className="px-6 py-4 font-medium">Thời gian</th>
                  <th className="px-6 py-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-200 divide-y divide-slate-800/80">
                {loading &&
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`} className="animate-pulse">
                      <td className="px-6 py-6">
                        <div className="h-3 w-48 rounded-full bg-slate-800" />
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
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800" />
                          <div className="space-y-2 w-full">
                            <div className="h-3 w-24 rounded-full bg-slate-800" />
                            <div className="h-3 w-32 rounded-full bg-slate-800" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-3 w-40 rounded-full bg-slate-800" />
                      </td>
                      <td className="px-6 py-6">
                        <div className="h-6 w-20 rounded-full bg-slate-800" />
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
                    const postOwner =
                      report.postId &&
                      typeof report.postId.userId === 'object'
                        ? report.postId.userId
                        : null;

                    return (
                      <tr
                        key={report._id}
                        className="hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white line-clamp-2">
                            {report.postId?.caption ||
                              'Bài viết không có nội dung'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
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
                                  ? postOwner.fullName
                                      .charAt(0)
                                      .toUpperCase()
                                  : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {postOwner?.fullName || 'Unknown'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {postOwner?.username
                                  ? `@${postOwner.username}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {report.userId?.avatarUrl ? (
                              <img
                                src={report.userId.avatarUrl}
                                alt={report.userId.fullName || 'User'}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                                {report.userId?.fullName
                                  ? report.userId.fullName
                                      .charAt(0)
                                      .toUpperCase()
                                  : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {report.userId?.fullName || 'Người dùng'}
                              </p>
                              <p className="text-xs text-slate-400">
                                {report.userId?.username
                                  ? `@${report.userId.username}`
                                  : ''}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <p className="text-sm text-slate-200 line-clamp-2">
                            {report.reason}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses[report.status]}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2" />
                            {statusLabels[report.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {new Date(report.createdAt).toLocaleString('vi-VN')}
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
                <p className="text-sm text-white line-clamp-3">
                  {selectedReport.postId?.caption || 'Bài viết không có nội dung'}
                </p>
                <p className="mt-2 text-[11px] text-slate-500">
                  ID: {selectedReport.postId?._id}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Người đăng</p>
                  <p className="text-sm text-white font-semibold">
                    {selectedReport.postId &&
                    typeof selectedReport.postId.userId === 'object'
                      ? selectedReport.postId.userId.fullName
                      : 'Unknown'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedReport.postId &&
                    typeof selectedReport.postId.userId === 'object'
                      ? `@${selectedReport.postId.userId.username}`
                      : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Người báo cáo</p>
                  <p className="text-sm text-white font-semibold">
                    {selectedReport.userId?.fullName || 'Người dùng'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedReport.userId?.username
                      ? `@${selectedReport.userId.username}`
                      : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <p className="text-xs text-slate-400">Lý do</p>
              <p className="text-sm text-white whitespace-pre-wrap">
                {selectedReport.reason}
              </p>
            </div>

            {selectedReport.description && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                <p className="text-xs text-slate-400">Mô tả chi tiết</p>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
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
                  <span className={`font-semibold ${statusClasses[selectedReport.status]}`}>
                    {statusLabels[selectedReport.status]}
                  </span>
                </p>
                <p>
                  Thời gian tạo báo cáo:{' '}
                  <span className="text-slate-300">
                    {new Date(selectedReport.createdAt).toLocaleString('vi-VN')}
                  </span>
                </p>
                <p>
                  Cập nhật lần cuối:{' '}
                  <span className="text-slate-300">
                    {new Date(selectedReport.updatedAt).toLocaleString('vi-VN')}
                  </span>
                </p>
                <p className="mt-3 text-[11px] text-slate-500">
                  Lưu ý: Hành động ẩn/xóa bài viết được thực hiện ở trang quản lý bài
                  viết. Ở đây chỉ cập nhật trạng thái xử lý báo cáo để theo dõi.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedReport(null);
                  setNote('');
                }}
                disabled={updatingStatus}
              >
                Đóng
              </Button>
              <Button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className="bg-blue-600 border border-blue-400/40 shadow-lg shadow-blue-500/25"
              >
                {updatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}


