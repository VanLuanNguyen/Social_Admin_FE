import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import type { User, Post, Story } from '@/lib/types';
import toast from 'react-hot-toast';
import type { ActivityTimelineItem, TabType } from '../../types';

export const useUserProfile = (selectedUserId: string | null) => {
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

      let targetId: string | undefined;
      let type: 'post' | 'story' | null = null;

      if (item.type === 'post') {
        targetId = item.id;
        type = 'post';
      } else if (item.type === 'story') {
        targetId = item.id;
        type = 'story';
      } else if (item.type === 'comment') {
        targetId = item.payload?.postId?._id?.toString() || item.payload?.postId?.toString();
        type = 'post';
      } else if (item.type === 'reaction') {
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
        if (wasOpenedFromModal) {
          setShowActivityModal(true);
          setOpenedFromActivityModal(false);
        }
        return;
      }

      setDetailType(type);

      if (type === 'post') {
        const postIdString = typeof targetId === 'string' ? targetId : String(targetId);
        const postDetail = await api.adminGetPostById(postIdString);
        setSelectedPost(postDetail);
      } else if (type === 'story') {
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

  return {
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
  };
};































