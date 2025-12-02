'use client';

import React from 'react';
import { useUsers } from '@/context/UsersContext';
import { useUserProfile } from './profile/hooks/useUserProfile';
import UserHeader from './profile/components/UserHeader';
import UserTabs from './profile/components/UserTabs';
import UserInfoTab from './profile/components/UserInfoTab';
import UserFriendsTab from './profile/components/UserFriendsTab';
import UserActivityTab from './profile/components/UserActivityTab';
import ActivityModal from './profile/components/ActivityModal';
import PostDetailModal from './profile/components/PostDetailModal';
import StoryDetailModal from './profile/components/StoryDetailModal';

export default function UserProfileColumn() {
  const { selectedUserId } = useUsers();

  const {
    user,
    loading,
    activeTab,
    setActiveTab,
    friends,
    loadingFriends,
    activity,
    loadingActivity,
    showActivityModal,
    setShowActivityModal,
    selectedPost,
    selectedStory,
    isDetailOpen,
    loadingDetail,
    detailType,
    isPlaying,
    setIsPlaying,
    handleActivityClick,
    handleCloseDetail,
    audioRef,
  } = useUserProfile(selectedUserId);

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

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <UserHeader user={user} />

      <UserTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-6 max-h-[800px] overflow-y-auto">
        {activeTab === 'info' && <UserInfoTab user={user} />}
        {activeTab === 'friends' && (
          <UserFriendsTab friends={friends} loading={loadingFriends} />
        )}
        {activeTab === 'activity' && (
          <UserActivityTab
            activity={activity}
            loading={loadingActivity}
            onActivityClick={handleActivityClick}
            onShowAllClick={() => setShowActivityModal(true)}
          />
        )}
      </div>

      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activity={activity}
        loading={loadingActivity}
        onActivityClick={handleActivityClick}
      />

      <audio ref={audioRef} loop style={{ display: 'none' }} />

      {detailType === 'post' && (
        <PostDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          post={selectedPost}
          loading={loadingDetail}
        />
      )}

      {detailType === 'story' && (
        <StoryDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          story={selectedStory}
          loading={loadingDetail}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          audioRef={audioRef}
        />
      )}
    </div>
  );
}
