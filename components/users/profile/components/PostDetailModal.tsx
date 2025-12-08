import React from 'react';
import Modal from '@/components/ui/Modal';
import type { Post } from '@/lib/types';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  loading: boolean;
}

export default function PostDetailModal({ isOpen, onClose, post, loading }: PostDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết bài viết" size="xl">
      {loading ? (
        <div className="text-center py-8 text-slate-400">Đang tải...</div>
      ) : post ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-400 mb-2">Người đăng</p>
            <div className="flex items-center gap-3">
              {typeof post.userId === 'object' && post.userId.avatarUrl ? (
                <img
                  src={post.userId.avatarUrl}
                  alt={typeof post.userId === 'object' ? post.userId.fullName : 'User'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-white">
                  {typeof post.userId === 'object' && post.userId
                    ? (post.userId.fullName || post.userId.username || 'U').charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
              <div>
                <p className="text-lg text-white font-semibold">
                  {typeof post.userId === 'object' ? post.userId.fullName : 'Unknown'}
                </p>
                <p className="text-sm text-slate-400">
                  {typeof post.userId === 'object' ? `@${post.userId.username}` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
            <p className="text-sm text-slate-400">Nội dung</p>
            <p className="text-base text-white whitespace-pre-wrap">
              {post.caption || 'Bài viết không có nội dung'}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400">Quyền riêng tư</p>
              <p className="text-base text-white font-semibold">
                {post.privacy_type?.toUpperCase() || 'PUBLIC'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400">Ngày tạo</p>
              <p className="text-base text-white font-semibold">
                {new Date(post.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {post.urls && post.urls.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400">Media</p>
              <div className="grid gap-3 md:grid-cols-2">
                {post.urls.map((media) => (
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
              <p className="text-sm text-slate-400">Bình luận ({post.comments?.length || 0})</p>
              {post.comments && post.comments.length > 3 && (
                <span className="text-xs text-slate-500">Hiển thị mới nhất</span>
              )}
            </div>
            {(!post.comments || post.comments.length === 0) ? (
              <p className="text-sm text-slate-500">Chưa có bình luận nào cho bài viết này.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {post.comments.map((comment) => (
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
                          {comment.userId
                            ? (comment.userId.fullName || comment.userId.username || 'U').charAt(0).toUpperCase()
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
      ) : (
        <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
      )}
    </Modal>
  );
}










