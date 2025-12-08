'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Pagination, Post } from '@/lib/types';

const PAGE_LIMIT = 10;

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.adminGetAllPosts(
        page,
        PAGE_LIMIT,
        searchQuery.trim() || undefined,
      );
      setPosts(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách bài viết';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    loadPosts(1);
  };

  const handlePageChange = (page: number) => {
    if (!pagination || page === pagination.currentPage) return;
    if (page < 1 || page > pagination.totalPages) return;
    loadPosts(page);
  };

  const handleOpenDetail = async (postId: string) => {
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await api.adminGetPostById(postId);
      setSelectedPost(detail);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết bài viết';
      toast.error(errorMessage);
      setSelectedPost(null);
    } finally {
      setLoadingDetail(false);
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
            <p className="text-sm text-slate-400">Quản lý nội dung do người dùng tạo</p>
            <h1 className="text-2xl font-semibold text-white mt-1">Quản lý bài viết</h1>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <div className="relative md:col-span-2">
            <Input
              type="text"
              placeholder="Tìm theo nội dung bài viết"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 pl-11 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </span>
          </div>
          <Button type="submit" className="px-6 rounded-2xl w-full md:w-auto">
            Tìm
          </Button>
        </form>

        <div className="rounded-3xl border border-slate-800 bg-[#0d1628] shadow-2xl shadow-black/20">
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Bài viết</th>
                  <th className="px-6 py-4 font-medium">Người đăng</th>
                  <th className="px-6 py-4 font-medium">Cảm xúc</th>
                  <th className="px-6 py-4 font-medium">Quyền riêng tư</th>
                  <th className="px-6 py-4 font-medium">Ngày đăng</th>
                  <th className="px-6 py-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-200 divide-y divide-slate-800/80">
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-6">
                          <div className="h-3 w-48 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800" />
                            <div className="space-y-2 w-full">
                              <div className="h-3 w-24 rounded-full bg-slate-800" />
                              <div className="h-3 w-32 rounded-full bg-slate-800" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-12 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-16 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-20 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="h-3 w-12 rounded-full bg-slate-800 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : posts.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                          Không có bài viết nào
                        </td>
                      </tr>
                      )
                    : (
                      posts.map((post) => (
                        <tr key={post._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white line-clamp-2">{post.caption || 'Bài viết không có nội dung'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {typeof post.userId === 'object' && post.userId.avatarUrl ? (
                                <img
                                  src={post.userId.avatarUrl}
                                  alt={post.userId.fullName || 'User'}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                                  {typeof post.userId === 'object' && post.userId?.fullName
                                    ? post.userId.fullName.charAt(0).toUpperCase()
                                    : 'U'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {typeof post.userId === 'object' ? post.userId.fullName : 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {typeof post.userId === 'object' ? `@${post.userId.username}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-300">{post.reacts?.length || 0} cảm xúc</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                              {post.privacy_type?.toUpperCase() || 'PUBLIC'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {new Date(post.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              className="border-slate-700 text-white hover:text-white hover:bg-slate-800"
                              onClick={() => handleOpenDetail(post._id)}
                            >
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
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
          setSelectedPost(null);
        }}
        title="Chi tiết bài viết"
        size="xl"
      >
        {loadingDetail ? (
          <div className="text-center py-8 text-slate-400">Đang tải...</div>
        ) : !selectedPost ? (
          <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-2">Người đăng</p>
              <div className="flex items-center gap-3">
                {typeof selectedPost.userId === 'object' && selectedPost.userId.avatarUrl ? (
                  <img
                    src={selectedPost.userId.avatarUrl}
                    alt={selectedPost.userId.fullName || 'User'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-white">
                    {typeof selectedPost.userId === 'object' && selectedPost.userId?.fullName
                      ? selectedPost.userId.fullName.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                )}
                <div>
                  <p className="text-lg text-white font-semibold">
                    {typeof selectedPost.userId === 'object' ? selectedPost.userId.fullName : 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {typeof selectedPost.userId === 'object' ? `@${selectedPost.userId.username}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <p className="text-sm text-slate-400">Nội dung</p>
              <p className="text-base text-white whitespace-pre-wrap">
                {selectedPost.caption || 'Bài viết không có nội dung'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-sm text-slate-400">Quyền riêng tư</p>
                <p className="text-base text-white font-semibold">{selectedPost.privacy_type?.toUpperCase() || 'PUBLIC'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-sm text-slate-400">Ngày tạo</p>
                <p className="text-base text-white font-semibold">
                  {new Date(selectedPost.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {selectedPost.urls && selectedPost.urls.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400">Media</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectedPost.urls.map((media) => (
                    <div key={media._id} className="rounded-xl border border-slate-800 overflow-hidden">
                      {media.url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                        <video controls className="w-full">
                          <source src={media.url} />
                        </video>
                      ) : (
                        <img src={media.url} alt={media.title || 'Post media'} className="w-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Bình luận ({selectedPost.comments?.length || 0})</p>
                {selectedPost.comments && selectedPost.comments.length > 3 && (
                  <span className="text-xs text-slate-500">Hiển thị mới nhất</span>
                )}
              </div>
              {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                <p className="text-sm text-slate-500">Chưa có bình luận nào cho bài viết này.</p>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {selectedPost.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                    >
                      <div className="flex items-center gap-3">
                        {comment.userId?.avatarUrl ? (
                          <img
                            src={comment.userId.avatarUrl}
                            alt={comment.userId.fullName || 'User'}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                            {comment.userId?.fullName
                              ? comment.userId.fullName.charAt(0).toUpperCase()
                              : 'U'}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">
                            {comment.userId?.fullName || 'Người dùng'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-slate-200 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

