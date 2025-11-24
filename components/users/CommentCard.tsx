'use client';

import React from 'react';
import type { Comment } from '@/lib/types';

interface CommentCardProps {
  comment: Comment;
}

export default function CommentCard({ comment }: CommentCardProps) {
  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}d trước`;
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div
      className={`p-3 rounded-lg bg-slate-800 border border-slate-700 ${
        comment.parentId ? 'ml-8 border-l-2 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {comment.userId.avatarUrl ? (
          <img
            src={comment.userId.avatarUrl}
            alt={comment.userId.fullName}
            className="w-8 h-8 rounded-full object-cover border border-slate-600"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
            <span className="text-gray-300 font-medium text-xs">
              {comment.userId.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-sm font-medium text-white">
              {comment.userId.fullName}
            </p>
            <p className="text-xs text-gray-400">@{comment.userId.username}</p>
          </div>
          <p className="text-sm text-gray-300 mb-2">{comment.content}</p>
          {comment.parentId && typeof comment.parentId === 'object' && (
            <div className="mt-2 p-2 bg-slate-900 rounded border-l-2 border-blue-500">
              <p className="text-xs text-gray-400 mb-1">
                Trả lời {comment.parentId.userId?.fullName || 'người dùng'}
              </p>
              <p className="text-xs text-gray-300">{comment.parentId.content}</p>
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
            <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}






