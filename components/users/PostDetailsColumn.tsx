'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useUsers } from '@/context/UsersContext';
import type { Comment as CommentType, React as ReactType } from '@/lib/types';
import CommentCard from './CommentCard';
import ReactionGroup from './ReactionGroup';
import toast from 'react-hot-toast';

export default function PostDetailsColumn() {
  const { selectedPostId } = useUsers();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [reacts, setReacts] = useState<ReactType[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingReacts, setLoadingReacts] = useState(false);

  useEffect(() => {
    if (selectedPostId) {
      loadPostDetails();
    } else {
      setComments([]);
      setReacts([]);
    }
  }, [selectedPostId]);

  const loadPostDetails = async () => {
    if (!selectedPostId) return;

    try {
      setLoadingComments(true);
      setLoadingReacts(true);

      const [commentsData, reactsData] = await Promise.all([
        api.getPostComments(selectedPostId),
        api.getPostReacts(selectedPostId),
      ]);

      setComments(commentsData || []);
      setReacts(reactsData || []);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết bài viết';
      toast.error(errorMessage);
    } finally {
      setLoadingComments(false);
      setLoadingReacts(false);
    }
  };

  if (!selectedPostId) {
    return (
      <div className="h-full flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-1">Post Details</h2>
          <p className="text-sm text-gray-400">
            Comments and reactions for the selected post.
          </p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Chọn một bài viết để xem chi tiết</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-1">Post Details</h2>
        <p className="text-sm text-gray-400">
          Comments and reactions for the selected post.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Comments Section */}
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Comments ({comments.length})
          </h3>
          {loadingComments ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Chưa có bình luận nào
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard key={comment._id} comment={comment} />
              ))}
            </div>
          )}
        </div>

        {/* Reactions Section */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Reactions ({reacts.length})
          </h3>
          {loadingReacts ? (
            <div className="text-center py-8 text-gray-400">Đang tải...</div>
          ) : (
            <ReactionGroup reacts={reacts} />
          )}
        </div>
      </div>
    </div>
  );
}

