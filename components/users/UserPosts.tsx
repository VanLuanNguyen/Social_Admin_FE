'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Post } from '@/lib/types';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import PostReactsComments from './PostReactsComments';

interface UserPostsProps {
  userId: string;
}

const PAGE_SIZE = 5;

export default function UserPosts({ userId }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPosts = async (pageParam = 1, append = false) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      const response = await api.getUserPostsByAdmin(userId, pageParam, PAGE_SIZE);
      setHasNext(response?.hasNext ?? false);
      setPage(pageParam);

      const newPosts = response?.data ?? [];
      setPosts((prev) => (append ? [...prev, ...newPosts] : newPosts));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Không thể tải danh sách bài viết';
      toast.error(message);
    } finally {
      append ? setLoadingMore(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadPosts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleLoadMore = () => {
    if (hasNext && !loadingMore) {
      loadPosts(page + 1, true);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Đang tải danh sách bài viết...
      </div>
    );
  }

  if (!posts.length) {
    return <p className="text-gray-500">Người dùng chưa có bài viết nào.</p>;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post._id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base font-semibold text-gray-900">
                {post.caption || 'Không có nội dung'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(post.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {formatPrivacy(post.privacy_type)}
            </span>
          </div>

          {post.urls && post.urls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.urls.slice(0, 6).map((media) => (
                <div
                  key={media._id}
                  className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
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

          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-4">
            <span>
              Bố cục: <strong>{post.layout || 'classic'}</strong>
            </span>
            <span>
              Reacts: <strong>{post.reacts?.length ?? 0}</strong>
            </span>
          </div>

          <PostReactsComments postId={post._id} />
        </article>
      ))}

      {hasNext && (
        <div className="flex justify-center pt-2">
          <Button onClick={handleLoadMore} isLoading={loadingMore} variant="outline">
            Tải thêm bài viết
          </Button>
        </div>
      )}
    </div>
  );
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


