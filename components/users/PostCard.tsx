'use client';

import React from 'react';
import type { Post } from '@/lib/types';

interface PostCardProps {
  post: Post;
  isSelected: boolean;
  onClick: () => void;
}

export default function PostCard({ post, isSelected, onClick }: PostCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const formatPrivacy = (privacy?: string) => {
    switch (privacy) {
      case 'friends':
        return 'Bạn bè';
      case 'private':
        return 'Chỉ mình tôi';
      case 'friendsExcept':
        return 'Bạn bè ngoại trừ';
      case 'friendsDetail':
        return 'Bạn bè cụ thể';
      default:
        return 'Công khai';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'bg-slate-700 border-2 border-blue-500'
          : 'bg-slate-800 border-2 border-transparent hover:bg-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-white text-sm font-medium mb-1">
            {post.caption || 'Không có nội dung'}
          </p>
          <p className="text-gray-400 text-xs">{formatDate(post.createdAt)}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-gray-300">
          {formatPrivacy(post.privacy_type)}
        </span>
      </div>

      {/* Images */}
      {post.urls && post.urls.length > 0 && (
        <div className="mb-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {post.urls.slice(0, 6).map((media) => (
            <div
              key={media._id}
              className="w-full aspect-square bg-slate-700 rounded-lg overflow-hidden"
            >
              <img
                src={media.url}
                alt={media.title || 'Post media'}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-slate-700">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{post.reacts?.length || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>0</span>
          </span>
        </div>
        <span className="text-gray-500">Bố cục: {post.layout || 'classic'}</span>
      </div>
    </div>
  );
}






