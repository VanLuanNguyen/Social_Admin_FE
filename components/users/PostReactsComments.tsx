'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { React as ReactType, Comment as CommentType } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PostReactsCommentsProps {
  postId: string;
}

export default function PostReactsComments({ postId }: PostReactsCommentsProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'reacts' | 'comments'>('reacts');
  const [reacts, setReacts] = useState<ReactType[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loadingReacts, setLoadingReacts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const loadReacts = async () => {
    try {
      setLoadingReacts(true);
      const data = await api.getPostReacts(postId);
      setReacts(data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách reacts';
      toast.error(message);
    } finally {
      setLoadingReacts(false);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const data = await api.getPostComments(postId);
      setComments(data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách bình luận';
      toast.error(message);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      if (activeTab === 'reacts') {
        loadReacts();
      } else {
        loadComments();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, activeTab, postId]);

  return (
    <>
      <div className="flex gap-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActiveTab('reacts');
            setShowModal(true);
          }}
        >
          Xem reacts
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setActiveTab('comments');
            setShowModal(true);
          }}
        >
          Xem bình luận
        </Button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={activeTab === 'reacts' ? 'Danh sách Reacts' : 'Danh sách Bình luận'}
        size="lg"
      >
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'reacts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('reacts')}
            >
              Reacts ({reacts.length})
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Bình luận ({comments.length})
            </button>
          </div>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'reacts' ? (
            loadingReacts ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : reacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Chưa có reacts nào</div>
            ) : (
              <div className="space-y-3">
                {reacts.map((react) => (
                  <div
                    key={react._id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {react.userId.avatarUrl ? (
                      <img
                        src={react.userId.avatarUrl}
                        alt={react.userId.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {react.userId.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {react.userId.fullName}
                      </p>
                      <p className="text-xs text-gray-500">@{react.userId.username}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{react.emojiId?.icon || '👍'}</span>
                      <span className="text-sm text-gray-600">{react.emojiId?.label}</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(react.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingComments ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Chưa có bình luận nào</div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`p-4 bg-gray-50 rounded-lg ${
                      comment.parentId ? 'ml-8 border-l-2 border-gray-300' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {comment.userId.avatarUrl ? (
                        <img
                          src={comment.userId.avatarUrl}
                          alt={comment.userId.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-xs">
                            {comment.userId.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900">
                            {comment.userId.fullName}
                          </p>
                          <p className="text-xs text-gray-500">@{comment.userId.username}</p>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                        {comment.parentId && typeof comment.parentId === 'object' && (
                          <div className="mt-2 p-2 bg-white rounded border-l-2 border-blue-400">
                            <p className="text-xs text-gray-500">
                              Trả lời{' '}
                              {comment.parentId.userId?.fullName || 'người dùng'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {comment.parentId.content}
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(comment.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </Modal>
    </>
  );
}

