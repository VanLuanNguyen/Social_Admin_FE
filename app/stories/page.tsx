'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import type { Pagination, Story } from '@/lib/types';

const PAGE_LIMIT = 10;

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [filterUserId, setFilterUserId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio ref để tự động phát nhạc
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadStories = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await api.adminGetAllStories(
        page,
        PAGE_LIMIT,
        filterUserId.trim() || undefined,
        dateFrom.trim() || undefined,
        dateTo.trim() || undefined,
      );
      setStories(response?.data || []);
      setPagination(response?.pagination || null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải danh sách story';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    loadStories(1);
  };

  const handlePageChange = (page: number) => {
    if (!pagination || page === pagination.currentPage) return;
    if (page < 1 || page > pagination.totalPages) return;
    loadStories(page);
  };

  const handleOpenDetail = async (storyId: string | any) => {
    // Đảm bảo storyId là string (xử lý cả ObjectId và string)
    let storyIdString: string;
    if (typeof storyId === 'string') {
      storyIdString = storyId;
    } else if (storyId?.toString) {
      storyIdString = storyId.toString();
    } else if (storyId?._id) {
      storyIdString = typeof storyId._id === 'string' ? storyId._id : storyId._id.toString();
    } else {
      storyIdString = String(storyId);
    }
    
    setIsDetailOpen(true);
    setLoadingDetail(true);
    try {
      const detail = await api.adminGetStoryById(storyIdString);
      setSelectedStory(detail);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải chi tiết story';
      toast.error(errorMessage);
      setSelectedStory(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetail = () => {
    // Dừng nhạc khi đóng modal
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsDetailOpen(false);
    setSelectedStory(null);
  };

  // Tự động phát nhạc khi mở modal và có nhạc
  useEffect(() => {
    if (isDetailOpen && selectedStory?.music?.preview && audioRef.current) {
      const audio = audioRef.current;
      
      // Xử lý sự kiện phát/dừng để cập nhật UI
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
      
      // Cập nhật src nếu thay đổi
      const currentSrc = audio.src;
      const newSrc = selectedStory.music.preview;
      
      if (!currentSrc || currentSrc !== newSrc) {
        audio.src = newSrc;
        audio.volume = 0.5;
        audio.load();
      }
      
      // Phát nhạc tự động
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error('Lỗi phát nhạc:', error);
            setIsPlaying(false);
            // Không hiển thị toast vì có thể do autoplay policy của browser
          });
      }
      
      return () => {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      };
    } else if (audioRef.current) {
      // Dừng nhạc nếu không có nhạc hoặc đóng modal
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }

    // Cleanup: dừng nhạc khi đóng modal
    return () => {
      if (audioRef.current && !isDetailOpen) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [isDetailOpen, selectedStory]);

  const pageButtons = useMemo(() => {
    if (!pagination) return [1];
    const pages: number[] = [];
    const start = Math.max(1, pagination.currentPage - 1);
    const end = Math.min(pagination.totalPages, pagination.currentPage + 1);
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages.length ? pages : [1];
  }, [pagination]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Quản lý nội dung story do người dùng tạo</p>
            <h1 className="text-2xl font-semibold text-white mt-1">Quản lý Stories</h1>
          </div>
          <Button
            variant="outline"
            className="border-slate-700 text-white hover:text-white hover:bg-slate-800"
            onClick={() => loadStories(pagination?.currentPage || 1)}
          >
            Làm mới
          </Button>
        </div>

        {/* Search and Filter */}
        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <Input
            type="text"
            placeholder="Lọc theo User ID"
            value={filterUserId}
            onChange={(e) => setFilterUserId(e.target.value)}
            className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Input
            type="date"
            placeholder="Từ ngày"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Input
            type="date"
            placeholder="Đến ngày"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button type="submit" className="px-6 rounded-2xl">
            Tìm kiếm
          </Button>
        </form>

        {/* Stories Table */}
        <div className="rounded-3xl border border-slate-800 bg-[#0d1628] shadow-2xl shadow-black/20">
          <div className="overflow-auto">
            <table className="min-w-full text-left">
              <thead className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Người đăng</th>
                  <th className="px-6 py-4 font-medium">Media</th>
                  <th className="px-6 py-4 font-medium">Nhạc nền</th>
                  <th className="px-6 py-4 font-medium">Quyền riêng tư</th>
                  <th className="px-6 py-4 font-medium">Ngày tạo</th>
                  <th className="px-6 py-4 font-medium">Hết hạn</th>
                  <th className="px-6 py-4 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-200 divide-y divide-slate-800/80">
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`skeleton-${index}`} className="animate-pulse">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800" />
                            <div className="space-y-2 w-full">
                              <div className="h-3 w-24 rounded-full bg-slate-800" />
                              <div className="h-3 w-32 rounded-full bg-slate-800" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="w-16 h-16 rounded-lg bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-32 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-16 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-24 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6">
                          <div className="h-3 w-24 rounded-full bg-slate-800" />
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="h-3 w-20 rounded-full bg-slate-800 ml-auto" />
                        </td>
                      </tr>
                    ))
                  : stories.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                          Không có story nào
                        </td>
                      </tr>
                      )
                    : (
                      stories.map((story) => {
                        const storyId = typeof story._id === 'string' ? story._id : String(story._id);
                        return (
                        <tr key={storyId} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {typeof story.userId === 'object' && story.userId.avatarUrl ? (
                                <img
                                  src={story.userId.avatarUrl}
                                  alt={typeof story.userId === 'object' ? story.userId.fullName : 'User'}
                                  className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-white">
                                  {typeof story.userId === 'object' && story.userId.fullName
                                    ? story.userId.fullName.charAt(0).toUpperCase()
                                    : 'U'}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {typeof story.userId === 'object' ? story.userId.fullName : 'Unknown'}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {typeof story.userId === 'object' ? `@${story.userId.username}` : ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {story.mediaUrl ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                                {story.mediaType === 'VIDEO' || story.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                                  <video src={story.mediaUrl} className="w-full h-full object-cover" muted />
                                ) : (
                                  <img src={story.mediaUrl} alt={story.title || 'Story media'} className="w-full h-full object-cover" />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Không có media</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {story.music ? (
                              <div className="text-sm text-slate-300 max-w-[200px]">
                                <p className="font-medium truncate">{story.music.title}</p>
                                <p className="text-xs text-slate-400 truncate">
                                  {story.music.artist?.name || 'Unknown artist'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Không có nhạc</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300">
                              {story.privacy_type?.toUpperCase() || 'PUBLIC'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {new Date(story.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-sm">
                            {story.expireAt ? new Date(story.expireAt).toLocaleString('vi-VN') : '-'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="outline"
                              className="border-slate-700 text-white hover:text-white hover:bg-slate-800"
                              onClick={() => handleOpenDetail(storyId)}
                            >
                              Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                        );
                      })
                    )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              {pagination
                ? `Trang ${pagination.currentPage} / ${pagination.totalPages}`
                : 'Không có dữ liệu'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange((pagination?.currentPage || 1) - 1)}
                disabled={!pagination?.hasPrevPage || loading}
                className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
              >
                Trước
              </button>
              {pageButtons.map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-xl text-sm ${
                    page === pagination?.currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 border border-transparent hover:border-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handlePageChange((pagination?.currentPage || 1) + 1)}
                disabled={!pagination?.hasNextPage || loading}
                className="px-4 py-2 rounded-xl border border-slate-700 text-sm text-white hover:bg-slate-900 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element cho nhạc nền */}
      <audio ref={audioRef} loop style={{ display: 'none' }} />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        title="Chi tiết Story"
        size="xl"
      >
        {loadingDetail ? (
          <div className="text-center py-8 text-slate-400">Đang tải...</div>
        ) : !selectedStory ? (
          <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
        ) : (
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
                      muted={!selectedStory.music} // Tắt tiếng video nếu có nhạc nền
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
        )}
      </Modal>
    </DashboardLayout>
  );
}

