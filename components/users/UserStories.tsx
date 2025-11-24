'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Story } from '@/lib/types';
import toast from 'react-hot-toast';
import StoryReacts from './StoryReacts';

interface UserStoriesProps {
  userId: string;
}

export default function UserStories({ userId }: UserStoriesProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStories = async () => {
    try {
      setLoading(true);
      const response = await api.getUserStoriesByAdmin(userId);
      setStories(response || []);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Không thể tải danh sách story';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadStories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading) {
    return (
      <div className="py-6 text-center text-gray-500">
        Đang tải danh sách story...
      </div>
    );
  }

  if (!stories.length) {
    return <p className="text-gray-500">Người dùng chưa có story nào.</p>;
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <article key={story._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-base font-semibold text-gray-900">
                {story.title || 'Story không có tiêu đề'}
              </p>
              <p className="text-sm text-gray-500">
                Tạo lúc: {new Date(story.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {formatMediaType(story.mediaType)}
            </span>
          </div>

          {story.mediaUrl && (
            <div className="w-full h-56 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={story.mediaUrl}
                alt={story.title || 'Story media'}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-4">
            <span>
              Riêng tư: <strong>{formatPrivacy(story.privacy_type)}</strong>
            </span>
            {story.expireAt && (
              <span>
                Hết hạn: <strong>{new Date(story.expireAt).toLocaleString('vi-VN')}</strong>
              </span>
            )}
          </div>

          <StoryReacts storyId={story._id} />
        </article>
      ))}
    </div>
  );
}

function formatMediaType(type?: string) {
  switch (type) {
    case 'image':
      return 'Hình ảnh';
    case 'video':
      return 'Video';
    case 'audio':
      return 'Âm thanh';
    default:
      return 'Văn bản';
  }
}

function formatPrivacy(privacy?: string) {
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
}


