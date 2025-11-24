'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { React as ReactType } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface StoryReactsProps {
  storyId: string;
}

export default function StoryReacts({ storyId }: StoryReactsProps) {
  const [showModal, setShowModal] = useState(false);
  const [reacts, setReacts] = useState<ReactType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadReacts = async () => {
    try {
      setLoading(true);
      const data = await api.getStoryReacts(storyId);
      setReacts(data || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách reacts';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      loadReacts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, storyId]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="mt-2"
      >
        Xem reacts ({reacts.length || 0})
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Danh sách Reacts của Story"
        size="lg"
      >
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
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
          )}
        </div>
      </Modal>
    </>
  );
}

