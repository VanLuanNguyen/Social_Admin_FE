'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { useUsers } from '@/context/UsersContext';
import type {
  ActivityTimelineItem,
  ReactionPayload,
  Comment,
  Post,
  Story,
  User,
  UserActivity,
} from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

type DetailTab = 'details' | 'friends';
type ActivityTab = 'timeline' | 'posts' | 'stories' | 'comments' | 'reactions';
interface ActivityItem {
  id: string;
  title: string;
  meta?: string;
  createdAt?: string;
  badge: string;
  color: string;
  type: 'post' | 'story' | 'comment' | 'reaction';
  targetType?: 'post' | 'story';
  targetId?: string;
}

interface FriendSummary {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  mutualFriendsCount?: number;
  friendsSince?: string;
}

const roleBadges: Record<User['role'], { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-blue-500/15 text-blue-200 border border-blue-400/30',
  },
  user: {
    label: 'User',
    className: 'bg-slate-500/15 text-slate-200 border border-slate-400/30',
  },
};

const normalizeFriend = (raw: any): FriendSummary | null => {
  if (!raw) return null;
  const candidate = raw.user || raw.friend || raw.friendId || raw.userId || raw;
  const id =
    raw.userId?.userId ||
    raw.userId?._id ||
    raw.friendId?.userId ||
    raw.friendId?._id ||
    candidate?.userId ||
    candidate?._id ||
    raw.userId ||
    raw.friendId ||
    raw.id ||
    raw._id;

  const fullName = candidate?.fullName || raw.fullName;
  if (!id || !fullName) {
    return null;
  }

  return {
    id: id.toString(),
    fullName,
    avatarUrl: candidate?.avatarUrl || raw.avatarUrl,
    bio: candidate?.bio || raw.bio,
    friendsSince: candidate?.friendsSince ?? raw.friendsSince,
    mutualFriendsCount: raw.mutualFriendsCount,
  };
};

export default function UserProfileColumn() {
  const { selectedUserId } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('details');
  const [friends, setFriends] = useState<FriendSummary[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [activity, setActivity] = useState<UserActivity | null>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityTab, setActivityTab] = useState<ActivityTab>('timeline');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivityItem, setSelectedActivityItem] = useState<ActivityItem | null>(null);
  const [activityDetail, setActivityDetail] = useState<Post | Story | null>(null);
  const [activityDetailType, setActivityDetailType] = useState<'post' | 'story' | null>(null);
  const [showActivityDetailModal, setShowActivityDetailModal] = useState(false);
  const [loadingActivityDetail, setLoadingActivityDetail] = useState(false);

  useEffect(() => {
    if (!selectedUserId) {
      setUser(null);
      setActivity(null);
      setActiveTab('details');
      setFriends([]);
      return;
    }

    const loadUser = async () => {
      try {
        setLoadingUser(true);
        const data = await api.adminGetUserById(selectedUserId);
        setUser(data);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải thông tin người dùng';
        toast.error(errorMessage);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    const loadActivity = async () => {
      try {
        setLoadingActivity(true);
        const data = await api.adminGetUserActivity(selectedUserId);
        setActivity({
          posts: data?.posts || [],
          stories: data?.stories || [],
          comments: data?.comments || [],
          activity: data?.activity || [],
          lastActive: data?.lastActive || null,
        });
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải hoạt động người dùng';
        toast.error(errorMessage);
        setActivity(null);
      } finally {
        setLoadingActivity(false);
      }
    };

    loadUser();
    loadActivity();
  }, [selectedUserId]);

  useEffect(() => {
    if (activeTab !== 'friends' || !selectedUserId) {
      return;
    }

    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        const data = await api.adminGetUserFriends(selectedUserId);
        const normalized =
          (data || [])
            .map((item: any) => normalizeFriend(item))
            .filter(Boolean) as FriendSummary[];
        setFriends(normalized);
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Không thể tải danh sách bạn bè';
        toast.error(errorMessage);
        setFriends([]);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, [activeTab, selectedUserId]);

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderPlaceholder = (message: string) => (
    <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400 px-6 py-16">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-12 h-12 mb-4 text-slate-600"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 17v-6m0-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
        />
      </svg>
      <p>{message}</p>
    </div>
  );

  const lastActiveLabel = (activity?.lastActive || user?.lastActiveAt)
    ? new Date(activity?.lastActive || (user?.lastActiveAt as string)).toLocaleString('vi-VN')
    : 'Chưa có dữ liệu';

  const formatDateTime = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleActivityItemClick = async (item: ActivityItem) => {
    if (!item.targetType || !item.targetId) {
      toast.error('Hoạt động này không có dữ liệu chi tiết');
      return;
    }

    setSelectedActivityItem(item);
    setShowActivityModal(false);
    setShowActivityDetailModal(true);
    setActivityDetail(null);
    setActivityDetailType(item.targetType);
    setLoadingActivityDetail(true);

    try {
      const detail =
        item.targetType === 'post'
          ? await api.adminGetPostById(item.targetId)
          : await api.adminGetStoryById(item.targetId);
      setActivityDetail(detail);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết hoạt động';
      toast.error(errorMessage);
      setActivityDetail(null);
    } finally {
      setLoadingActivityDetail(false);
    }
  };

const buildPostItems = (postsData: Post[] = []): ActivityItem[] =>
    postsData.map((post) => ({
      id: post._id,
      title: post.caption || 'Bài viết không có tiêu đề',
      meta: `Đăng lúc ${formatDateTime(post.createdAt)}`,
      createdAt: post.createdAt,
      badge: 'Bài viết',
      color: 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30',
    type: 'post',
    targetType: 'post',
    targetId: post._id,
    }));

  const buildStoryItems = (storiesData: Story[] = []): ActivityItem[] =>
    storiesData.map((story) => ({
      id: story._id,
      title: story.title || 'Story không có tiêu đề',
      meta: story.mediaType ? `Loại: ${story.mediaType}` : undefined,
      createdAt: story.createdAt,
      badge: 'Story',
      color: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
    type: 'story',
    targetType: 'story',
    targetId: story._id,
    }));

  const buildCommentItems = (commentsData: Comment[] = []): ActivityItem[] =>
    commentsData.map((comment) => ({
      id: comment._id,
      title: comment.content || 'Bình luận không có nội dung',
      meta: comment.postId ? `Trong bài viết ${comment.postId}` : undefined,
      createdAt: comment.createdAt,
      badge: 'Bình luận',
      color: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
    type: 'comment',
    targetType: 'post',
    targetId: typeof comment.postId === 'string' ? comment.postId : (comment.postId as any)?._id?.toString(),
    }));

  const mapTimelineEntry = (entry: ActivityTimelineItem): ActivityItem => {
    switch (entry.type) {
      case 'post': {
        const payload = entry.payload as Post;
        return {
          id: entry.id,
          title: payload?.caption || 'Bài viết không có tiêu đề',
          meta: `Đăng lúc ${formatDateTime(entry.createdAt)}`,
          createdAt: entry.createdAt,
          badge: 'Bài viết',
          color: 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30',
          type: 'post',
          targetType: 'post',
          targetId: payload?._id || entry.id,
        };
      }
      case 'story': {
        const payload = entry.payload as Story;
        return {
          id: entry.id,
          title: payload?.title || 'Story không có tiêu đề',
          meta: payload?.mediaType ? `Loại: ${payload.mediaType}` : undefined,
          createdAt: entry.createdAt,
          badge: 'Story',
          color: 'bg-amber-500/15 text-amber-200 border border-amber-500/30',
          type: 'story',
          targetType: 'story',
          targetId: payload?._id || entry.id,
        };
      }
      case 'comment': {
        const payload = entry.payload as Comment;
        return {
          id: entry.id,
          title: payload?.content || 'Bình luận không có nội dung',
          meta: payload?.postId ? `Trong bài viết ${payload.postId}` : undefined,
          createdAt: entry.createdAt,
          badge: 'Bình luận',
          color: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
          type: 'comment',
          targetType: 'post',
          targetId:
            typeof payload?.postId === 'string'
              ? payload.postId
              : (payload?.postId as any)?._id?.toString(),
        };
      }
      case 'reaction': {
        const payload = entry.payload as ReactionPayload;
        const emojiLabel = payload?.emoji?.label || payload?.emoji?.name || payload?.emoji?.icon || '';
        const targetTitle =
          payload?.targetType === 'post'
            ? ((payload?.target as Post)?.caption || `Bài viết ${payload?.targetId ?? ''}`)
            : ((payload?.target as Story)?.title || `Story ${payload?.targetId ?? ''}`);

        return {
          id: entry.id,
          title:
            payload?.targetType === 'post'
              ? `Thả cảm xúc bài viết: ${targetTitle}`
              : `Thả cảm xúc story: ${targetTitle}`,
          meta: emojiLabel ? `Emoji: ${emojiLabel}` : undefined,
          createdAt: entry.createdAt,
          badge: 'Cảm xúc',
          color: 'bg-pink-500/15 text-pink-200 border border-pink-500/30',
          type: 'reaction',
          targetType: payload?.targetType,
          targetId: payload?.targetId,
        };
      }
      default: {
        return {
          id: entry.id,
          title: 'Hoạt động chưa xác định',
          meta: undefined,
          createdAt: entry.createdAt,
          badge: 'Hoạt động',
          color: 'bg-slate-500/15 text-slate-200 border border-slate-500/30',
          type: 'post',
        };
      }
    }
  };

  const timelineItems = useMemo<ActivityItem[]>(() => {
    if (activity?.activity && activity.activity.length > 0) {
      return activity.activity
        .map((entry) => mapTimelineEntry(entry))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }

    const legacyItems = [
      ...buildPostItems(activity?.posts || []),
      ...buildStoryItems(activity?.stories || []),
      ...buildCommentItems(activity?.comments || []),
    ];

    return legacyItems.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }, [activity]);

  const activityItems = useMemo<Record<ActivityTab, ActivityItem[]>>(
    () => ({
      timeline: timelineItems,
      posts: timelineItems.filter((item) => item.type === 'post'),
      stories: timelineItems.filter((item) => item.type === 'story'),
      comments: timelineItems.filter((item) => item.type === 'comment'),
      reactions: timelineItems.filter((item) => item.type === 'reaction'),
    }),
    [timelineItems]
  );

  const activityCounts = useMemo<Record<ActivityTab, number>>(
    () => ({
      timeline: activityItems.timeline.length,
      posts: activityItems.posts.length,
      stories: activityItems.stories.length,
      comments: activityItems.comments.length,
      reactions: activityItems.reactions.length,
    }),
    [activityItems]
  );

  return (
    <section className="rounded-3xl border border-slate-800 bg-[#090f1c] flex flex-col min-h-[640px]">
      {!selectedUserId
        ? renderPlaceholder('Chọn một người dùng ở bảng bên trái để xem chi tiết')
        : loadingUser
          ? renderPlaceholder('Đang tải thông tin người dùng...')
          : !user
            ? renderPlaceholder('Không tìm thấy người dùng')
            : (
              <>
                <div className="p-8 border-b border-slate-800 flex flex-col items-center text-center gap-4">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-semibold text-white ring-4 ring-blue-500/10">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3 className="text-2xl font-semibold text-white">{user.fullName}</h3>
                    <p className="text-sm text-slate-400 mt-1">{user.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium ${roleBadges[user.role].className}`}
                    >
                      {roleBadges[user.role].label}
                    </span>
                  </div>
                </div>

                <div className="px-8 border-b border-slate-800">
                  <div className="flex items-center gap-6">
                    {(['details', 'friends'] as DetailTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-4 text-sm font-semibold uppercase tracking-widest ${
                          activeTab === tab
                            ? 'text-white border-b-2 border-blue-500'
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {tab === 'details' ? 'Chi tiết' : 'Bạn bè'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-8 space-y-6">
                  {activeTab === 'details' ? (
                    <>
                      {/* Button Hoạt động */}
                      <button
                        type="button"
                        onClick={() => setShowActivityModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-900/70 text-white transition-colors w-full sm:w-auto"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium">Hoạt động</span>
                        {loadingActivity && (
                          <span className="text-xs text-slate-400">Đang tải...</span>
                        )}
                      </button>

                      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">ID Người dùng</p>
                            <p className="text-base text-white font-semibold mt-1">{user.userId}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Tên đầy đủ</p>
                            <p className="text-base text-white font-semibold mt-1">{user.fullName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Ngày tham gia</p>
                            <p className="text-base text-white font-semibold mt-1">{formatDate(user.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Ngày sinh</p>
                            <p className="text-base text-white font-semibold mt-1">
                              {user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Giới tính</p>
                            <p className="text-base text-white font-semibold mt-1">
                              {user.gender === 'male'
                                ? 'Nam'
                                : user.gender === 'female'
                                  ? 'Nữ'
                                  : user.gender || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">Hoạt động gần đây</p>
                            <p className="text-base text-white font-semibold mt-1">{lastActiveLabel}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm text-slate-400">Thông tin liên hệ</p>
                              <h4 className="text-lg font-semibold text-white mt-1">
                                Tài khoản & Bảo mật
                              </h4>
                            </div>
                          </div>
                          <div className="space-y-4 text-sm text-slate-300">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-slate-500">Email</p>
                              <p className="text-base text-white break-all">{user.email}</p>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">
                                  Username
                                </p>
                                <p className="text-base text-white break-all">@{user.username}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">
                                  Số điện thoại
                                </p>
                                <p className="text-base text-white break-all">
                                  {user.phoneNumber || 'Chưa cập nhật'}
                                </p>
                              </div>
                            </div>
                            {user.bio && (
                              <div>
                                <p className="text-xs uppercase tracking-widest text-slate-500">Tiểu sử</p>
                                <p className="text-base text-white mt-1 line-clamp-3">{user.bio}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                    </>
                  ) : (
                    <div>
                      {loadingFriends ? (
                        renderPlaceholder('Đang tải danh sách bạn bè...')
                      ) : friends.length === 0 ? (
                        renderPlaceholder('Người dùng chưa có bạn bè hoặc dữ liệu chưa khả dụng')
                      ) : (
                        <ul className="space-y-4">
                          {friends.map((friend) => (
                            <li
                              key={friend.id}
                              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/30 p-4"
                            >
                              <div className="flex items-center gap-3">
                                {friend.avatarUrl ? (
                                  <img
                                    src={friend.avatarUrl}
                                    alt={friend.fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold">
                                    {friend.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {friend.fullName}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {friend.bio || 'Không có tiểu sử'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p
                                  className={`text-xs font-medium ${
                                    friend.friendsSince
                                  }`}
                                >
                                  Ngày kết bạn: {friend.friendsSince ? formatDate(friend.friendsSince) : 'Không có ngày kết bạn'}
                                </p>
                                {typeof friend.mutualFriendsCount === 'number' && (
                                  <p className="text-[11px] text-slate-500 mt-1">
                                    {friend.mutualFriendsCount} bạn chung
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

      {/* Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Hoạt động gần đây"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-700 pb-4">
            {(['timeline', 'posts', 'stories', 'comments', 'reactions'] as ActivityTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivityTab(tab)}
                className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                  activityTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab === 'timeline' && 'Tất cả'}
                {tab === 'posts' && 'Bài viết'}
                {tab === 'stories' && 'Story'}
                {tab === 'comments' && 'Bình luận'}
                {tab === 'reactions' && 'Cảm xúc'}
                <span className="ml-2 text-xs bg-slate-800/50 px-2 py-0.5 rounded-full">
                  {activityCounts[tab] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {loadingActivity ? (
              <div className="text-center py-8 text-slate-400">Đang tải...</div>
            ) : activityItems[activityTab].length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                {activityTab === 'timeline'
                  ? 'Chưa có hoạt động nào gần đây'
                  : activityTab === 'posts'
                    ? 'Chưa có bài viết gần đây'
                    : activityTab === 'stories'
                      ? 'Chưa có story nào gần đây'
                      : activityTab === 'comments'
                        ? 'Chưa có bình luận nào gần đây'
                        : 'Chưa có cảm xúc nào gần đây'}
              </div>
            ) : (
              activityItems[activityTab].map((item) => (
                <button
                  key={`${activityTab}-${item.id}`}
                  type="button"
                  onClick={() => handleActivityItemClick(item)}
                  className="w-full flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-900/60 p-4 hover:bg-slate-900/80 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  disabled={!item.targetType || !item.targetId}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white line-clamp-2 flex-1">
                      {item.title}
                    </p>
                    <span className={`text-[11px] px-2 py-1 rounded-full whitespace-nowrap ${item.color}`}>
                      {item.badge}
                    </span>
                  </div>
                  {item.meta && (
                    <p className="text-xs text-slate-400">{item.meta}</p>
                  )}
                  <p className="text-[11px] text-slate-500">
                    {formatDateTime(item.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showActivityDetailModal && !!selectedActivityItem}
        onClose={() => {
          setShowActivityDetailModal(false);
          setSelectedActivityItem(null);
          setActivityDetail(null);
          setActivityDetailType(null);
        }}
        title={
          activityDetailType === 'post'
            ? 'Chi tiết bài viết'
            : activityDetailType === 'story'
              ? 'Chi tiết story'
              : 'Chi tiết hoạt động'
        }
        size="lg"
      >
        {renderActivityDetailContent(
          selectedActivityItem,
          activityDetail,
          activityDetailType,
          loadingActivityDetail,
          formatDateTime
        )}
      </Modal>
    </section>
  );
}

function renderActivityDetailContent(
  item: ActivityItem | null,
  detail: Post | Story | null,
  detailType: 'post' | 'story' | null,
  loading: boolean,
  formatDateTime: (value?: string) => string,
) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <svg className="animate-spin h-6 w-6 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Đang tải chi tiết hoạt động...
      </div>
    );
  }

  if (!item || !item.targetType || !item.targetId) {
    return <div className="text-center text-slate-400 py-6">Không có dữ liệu chi tiết</div>;
  }

  if (!detail || !detailType) {
    return <div className="text-center text-slate-400 py-6">Không thể tải chi tiết hoạt động</div>;
  }

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-widest text-slate-500">{title}</p>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-200">
        {content}
      </div>
    </div>
  );

  if (detailType === 'post') {
    const post = detail as Post;
    return (
      <div className="space-y-5">
        {renderSection('Nội dung bài viết', post.caption || 'Không có nội dung')}
        {renderSection('Thông tin bài viết', (
          <ul className="space-y-1">
            <li>Ngày đăng: {formatDateTime(post.createdAt)}</li>
            <li>Lần cập nhật cuối: {formatDateTime(post.updatedAt)}</li>
            <li>Quyền riêng tư: {post.privacy_type?.toUpperCase() || 'PUBLIC'}</li>
          </ul>
        ))}
        {post.urls && post.urls.length > 0 && renderSection('Media', (
          <div className="grid grid-cols-1 gap-3">
            {post.urls?.map((media) => (
              <div key={media._id} className="rounded-xl border border-slate-800 overflow-hidden">
                {media?.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
                  <video controls className="w-full">
                    <source src={media.url} />
                  </video>
                ) : (
                  <img src={media.url} alt={media.title || 'Post media'} className="w-full object-cover" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const story = detail as Story;
  return (
    <div className="space-y-5">
      {renderSection('Tiêu đề story', story.title || 'Story không có tiêu đề')}
      {story.mediaUrl && renderSection('Media', (
        <img src={story.mediaUrl} alt={story.title || 'Story media'} className="w-full rounded-xl object-cover" />
      ))}
      {renderSection('Thông tin story', (
        <ul className="space-y-1">
          <li>Ngày tạo: {formatDateTime(story.createdAt)}</li>
          <li>Loại: {story.mediaType || 'text'}</li>
          {story.expireAt && <li>Hết hạn: {formatDateTime(story.expireAt)}</li>}
        </ul>
      ))}
    </div>
  );
}

