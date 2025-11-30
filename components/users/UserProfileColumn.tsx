'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { User, Post, Story, Comment } from '@/lib/types';
import { useUsers } from '@/context/UsersContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

type TabType = 'info' | 'friends' | 'activity';

interface ActivityTimelineItem {
  type: 'post' | 'story' | 'comment' | 'reaction';
  id: string;
  createdAt: string;
  payload: any;
}

export default function UserProfileColumn() {
  const { selectedUserId } = useUsers();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  
  // Friends data
  const [friends, setFriends] = useState<User[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  
  // Activity data
  const [activity, setActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Detail modal states
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailType, setDetailType] = useState<'post' | 'story' | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [openedFromActivityModal, setOpenedFromActivityModal] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails();
    } else {
      setUser(null);
      setActiveTab('info');
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (selectedUserId && activeTab === 'friends') {
      loadFriends();
    }
  }, [selectedUserId, activeTab]);

  useEffect(() => {
    if (selectedUserId && activeTab === 'activity') {
      loadActivity();
    }
  }, [selectedUserId, activeTab]);

  const loadUserDetails = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const userData = await api.adminGetUserById(selectedUserId);
      setUser(userData);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải thông tin người dùng';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    if (!selectedUserId) return;

    try {
      setLoadingFriends(true);
      const friendsData = await api.adminGetUserFriends(selectedUserId);
      setFriends(friendsData || []);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách bạn bè';
      toast.error(errorMessage);
    } finally {
      setLoadingFriends(false);
    }
  };

  const loadActivity = async () => {
    if (!selectedUserId) return;

    try {
      setLoadingActivity(true);
      const activityData = await api.adminGetUserActivity(selectedUserId);
      setActivity(activityData);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải hoạt động';
      toast.error(errorMessage);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleActivityClick = async (item: ActivityTimelineItem, fromModal: boolean = false) => {
    const wasOpenedFromModal = fromModal && showActivityModal;
    
    try {
      // Nếu mở từ modal hoạt động, đánh dấu và đóng modal hoạt động
      if (wasOpenedFromModal) {
        setOpenedFromActivityModal(true);
        setShowActivityModal(false);
      } else {
        setOpenedFromActivityModal(false);
      }

      setIsDetailOpen(true);
      setLoadingDetail(true);
      setDetailType(null);
      setSelectedPost(null);
      setSelectedStory(null);

      // Xác định loại hoạt động và lấy targetId
      let targetId: string | undefined;
      let type: 'post' | 'story' | null = null;

      if (item.type === 'post') {
        targetId = item.id;
        type = 'post';
      } else if (item.type === 'story') {
        targetId = item.id;
        type = 'story';
      } else if (item.type === 'comment') {
        // Với comment, điều hướng đến post chứa comment đó
        targetId = item.payload?.postId?._id?.toString() || item.payload?.postId?.toString();
        type = 'post';
      } else if (item.type === 'reaction') {
        // Với reaction, điều hướng đến target (post hoặc story)
        const targetType = item.payload?.targetType;
        targetId = item.payload?.targetId;
        
        if (targetType === 'post') {
          type = 'post';
        } else if (targetType === 'story') {
          type = 'story';
        }
      }

      if (!targetId || !type) {
        toast.error('Không thể tải chi tiết hoạt động này');
        setIsDetailOpen(false);
        setLoadingDetail(false);
        // Nếu đã đóng modal hoạt động, mở lại
        if (wasOpenedFromModal) {
          setShowActivityModal(true);
          setOpenedFromActivityModal(false);
        }
        return;
      }

      setDetailType(type);

      // Lấy chi tiết dựa vào type
      if (type === 'post') {
        // Đảm bảo targetId là string
        const postIdString = typeof targetId === 'string' ? targetId : String(targetId);
        const postDetail = await api.adminGetPostById(postIdString);
        setSelectedPost(postDetail);
      } else if (type === 'story') {
        // Đảm bảo targetId là string
        const storyIdString = typeof targetId === 'string' ? targetId : String(targetId);
        const storyDetail = await api.adminGetStoryById(storyIdString);
        setSelectedStory(storyDetail);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết';
      toast.error(errorMessage);
      setIsDetailOpen(false);
      setSelectedPost(null);
      setSelectedStory(null);
      setDetailType(null);
      // Nếu đã đóng modal hoạt động do lỗi, mở lại
      if (wasOpenedFromModal) {
        setShowActivityModal(true);
        setOpenedFromActivityModal(false);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsDetailOpen(false);
    setSelectedPost(null);
    setSelectedStory(null);
    setDetailType(null);
    
    if (openedFromActivityModal) {
      setShowActivityModal(true);
      setOpenedFromActivityModal(false);
    }
  };

  useEffect(() => {
    if (isDetailOpen && detailType === 'story' && selectedStory?.music?.preview && audioRef.current) {
      const audio = audioRef.current;
      
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      const currentSrc = audio.src;
      const newSrc = selectedStory.music.preview;
      
      if (!currentSrc || currentSrc !== newSrc) {
        audio.src = newSrc;
        audio.volume = 0.5;
        audio.load();
      }
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error('Lỗi phát nhạc:', error);
            setIsPlaying(false);
          });
      }
      
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    } else if (audioRef.current && (!isDetailOpen || detailType !== 'story')) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    return () => {
      if (audioRef.current && (!isDetailOpen || detailType !== 'story')) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [isDetailOpen, detailType, selectedStory]);

  if (!selectedUserId) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Chọn một người dùng để xem chi tiết</p>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Không tìm thấy người dùng</p>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'info', label: 'Thông tin' },
    { id: 'friends', label: 'Bạn bè' },
    { id: 'activity', label: 'Hoạt động' },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-semibold text-white">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{user.fullName}</h3>
            <p className="text-sm text-slate-400">@{user.username}</p>
            <div className="flex gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin'
                    ? 'bg-blue-500/15 text-blue-200 border border-blue-500/40'
                    : 'bg-slate-500/15 text-slate-100 border border-slate-500/30'
                }`}
              >
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  user.isActive
                    ? 'bg-green-500/15 text-green-200 border border-green-500/40'
                    : 'bg-red-500/15 text-red-200 border border-red-500/40'
                }`}
              >
                {user.isActive ? 'Hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ID người dùng</p>
              <p className="text-sm text-white font-mono">{user.userId}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tên đầy đủ</p>
              <p className="text-sm text-white">{user.fullName}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tên người dùng</p>
              <p className="text-sm text-white">@{user.username}</p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-white">{user.email}</p>
            </div>

            {user.phoneNumber && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Số điện thoại</p>
                <p className="text-sm text-white">{user.phoneNumber}</p>
              </div>
            )}

            {user.dateOfBirth && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày sinh</p>
                <p className="text-sm text-white">
                  {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}

            {user.gender && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Giới tính</p>
                <p className="text-sm text-white">
                  {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender}
                </p>
              </div>
            )}

            {user.bio && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Giới thiệu</p>
                <p className="text-sm text-white whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vai trò</p>
              <p className="text-sm text-white">
                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trạng thái</p>
              <p className="text-sm text-white">
                {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày tạo</p>
              <p className="text-sm text-white">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'friends' && (
          <div>
            {loadingFriends ? (
              <p className="text-slate-400 text-center py-4">Đang tải...</p>
            ) : friends.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Chưa có bạn bè</p>
            ) : (
              <div className="space-y-3">
                {friends.slice(0, 10).map((friend, index) => (
                  <div
                    key={friend.userId || `friend-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold text-white">
                        {friend.fullName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{friend.fullName}</p>
                      <p className="text-xs text-slate-400">@{friend.username}</p>
                    </div>
                  </div>
                ))}
                {friends.length > 10 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    và {friends.length - 10} người khác...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            {loadingActivity ? (
              <p className="text-slate-400 text-center py-4">Đang tải...</p>
            ) : !activity ? (
              <p className="text-slate-400 text-center py-4">Chưa có hoạt động</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-slate-400">
                    {activity.activity?.length || 0} hoạt động gần đây
                  </p>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-white hover:text-white hover:bg-slate-800 text-xs"
                    onClick={() => setShowActivityModal(true)}
                  >
                    Xem tất cả
                  </Button>
                </div>

                {activity.activity && activity.activity.length > 0 ? (
                  activity.activity.slice(0, 5).map((item: ActivityTimelineItem, idx: number) => (
                    <div
                      key={`activity-${item.type}-${item.id || idx}-${idx}`}
                      onClick={() => handleActivityClick(item)}
                      className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleActivityClick(item);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-400 mb-1">
                            {item.type === 'post' && '📝 Đã đăng bài viết'}
                            {item.type === 'story' && '📸 Đã đăng story'}
                            {item.type === 'comment' && '💬 Đã bình luận'}
                            {item.type === 'reaction' && '👍 Đã thả cảm xúc'}
                          </p>
                          <p className="text-sm text-white">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">Chưa có hoạt động</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Activity Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Hoạt động gần đây"
        size="xl"
      >
        {loadingActivity ? (
          <p className="text-slate-400 text-center py-4">Đang tải...</p>
        ) : !activity?.activity || activity.activity.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Chưa có hoạt động</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {activity.activity.map((item: ActivityTimelineItem, idx: number) => (
              <div
                key={`modal-activity-${item.type}-${item.id || idx}-${idx}`}
                onClick={() => handleActivityClick(item, true)}
                className="p-4 rounded-lg border border-slate-700 bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleActivityClick(item, true);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white mb-1">
                      {item.type === 'post' && '📝 Đã đăng bài viết'}
                      {item.type === 'story' && '📸 Đã đăng story'}
                      {item.type === 'comment' && '💬 Đã bình luận'}
                      {item.type === 'reaction' && '👍 Đã thả cảm xúc'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Audio element cho nhạc nền story */}
      <audio ref={audioRef} loop style={{ display: 'none' }} />

      {/* Detail Modal - Post/Story */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title={detailType === 'post' ? 'Chi tiết bài viết' : detailType === 'story' ? 'Chi tiết Story' : 'Chi tiết'}
        size="xl"
      >
        {loadingDetail ? (
          <div className="text-center py-8 text-slate-400">Đang tải...</div>
        ) : detailType === 'post' && selectedPost ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-2">Người đăng</p>
              <div className="flex items-center gap-3">
                {typeof selectedPost.userId === 'object' && selectedPost.userId.avatarUrl ? (
                  <img
                    src={selectedPost.userId.avatarUrl}
                    alt={typeof selectedPost.userId === 'object' ? selectedPost.userId.fullName : 'User'}
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
                <p className="text-base text-white font-semibold">
                  {selectedPost.privacy_type?.toUpperCase() || 'PUBLIC'}
                </p>
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
        ) : detailType === 'story' && selectedStory ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400 mb-2">Người đăng</p>
              <div className="flex items-center gap-3">
                {typeof selectedStory.userId === 'object' && selectedStory.userId.avatarUrl ? (
                  <img
                    src={selectedStory.userId.avatarUrl}
                    alt={typeof selectedStory.userId === 'object' ? selectedStory.userId.fullName : 'User'}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-white">
                    {typeof selectedStory.userId === 'object' && selectedStory.userId.fullName
                      ? selectedStory.userId.fullName.charAt(0).toUpperCase()
                      : 'U'}
                  </div>
                )}
                <div>
                  <p className="text-lg text-white font-semibold">
                    {typeof selectedStory.userId === 'object' ? selectedStory.userId.fullName : 'Unknown'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {typeof selectedStory.userId === 'object' ? `@${selectedStory.userId.username}` : ''}
                  </p>
                </div>
              </div>
            </div>

            {selectedStory.title && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
                <p className="text-sm text-slate-400">Tiêu đề</p>
                <p className="text-base text-white whitespace-pre-wrap">{selectedStory.title}</p>
              </div>
            )}

            {selectedStory.mediaUrl && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <p className="text-sm text-slate-400">Media</p>
                <div className="rounded-xl overflow-hidden border border-slate-700">
                  {selectedStory.mediaType === 'VIDEO' || selectedStory.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                    <video
                      src={selectedStory.mediaUrl}
                      controls
                      className="w-full max-h-[500px] object-contain"
                      autoPlay
                      muted={!selectedStory.music}
                    />
                  ) : (
                    <img
                      src={selectedStory.mediaUrl}
                      alt={selectedStory.title || 'Story media'}
                      className="w-full max-h-[500px] object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {selectedStory.music && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">Nhạc nền</p>
                  {selectedStory.music.preview && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            if (isPlaying) {
                              audioRef.current.pause();
                            } else {
                              audioRef.current.play().catch((error) => {
                                console.error('Lỗi phát nhạc:', error);
                                toast.error('Không thể phát nhạc');
                              });
                            }
                          }
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                      >
                        {isPlaying ? '⏸ Tạm dừng' : '▶ Phát'}
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  {selectedStory.music.album?.cover && (
                    <img
                      src={selectedStory.music.album.cover}
                      alt={selectedStory.music.album.title}
                      className="w-24 h-24 rounded-lg object-cover border border-slate-700"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-lg font-semibold text-white">{selectedStory.music.title}</p>
                    <p className="text-sm text-slate-400">
                      {selectedStory.music.artist?.name || 'Unknown artist'}
                    </p>
                    {selectedStory.music.album && (
                      <p className="text-xs text-slate-500">
                        Album: {selectedStory.music.album.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-sm text-slate-400">Quyền riêng tư</p>
                <p className="text-base text-white font-semibold">
                  {selectedStory.privacy_type?.toUpperCase() || 'PUBLIC'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-sm text-slate-400">Ngày tạo</p>
                <p className="text-base text-white font-semibold">
                  {new Date(selectedStory.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                <p className="text-sm text-slate-400">Hết hạn</p>
                <p className="text-base text-white font-semibold">
                  {selectedStory.expireAt ? new Date(selectedStory.expireAt).toLocaleString('vi-VN') : '-'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
        )}
      </Modal>
    </div>
  );
}
