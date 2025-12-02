import React from 'react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';
import type { Story } from '@/lib/types';

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  loading: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function StoryDetailModal({
  isOpen,
  onClose,
  story,
  loading,
  isPlaying,
  onTogglePlay,
  audioRef,
}: StoryDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết Story" size="xl">
      {loading ? (
        <div className="text-center py-8 text-slate-400">Đang tải...</div>
      ) : story ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <p className="text-sm text-slate-400 mb-2">Người đăng</p>
            <div className="flex items-center gap-3">
              {typeof story.userId === 'object' && story.userId.avatarUrl ? (
                <img
                  src={story.userId.avatarUrl}
                  alt={typeof story.userId === 'object' ? story.userId.fullName : 'User'}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-700"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-lg font-semibold text-white">
                  {typeof story.userId === 'object' && story.userId
                    ? (story.userId.fullName || story.userId.username || 'U').charAt(0).toUpperCase()
                    : 'U'}
                </div>
              )}
              <div>
                <p className="text-lg text-white font-semibold">
                  {typeof story.userId === 'object' ? story.userId.fullName : 'Unknown'}
                </p>
                <p className="text-sm text-slate-400">
                  {typeof story.userId === 'object' ? `@${story.userId.username}` : ''}
                </p>
              </div>
            </div>
          </div>

          {story.title && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <p className="text-sm text-slate-400">Tiêu đề</p>
              <p className="text-base text-white whitespace-pre-wrap">{story.title}</p>
            </div>
          )}

          {story.mediaUrl && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <p className="text-sm text-slate-400">Media</p>
              <div className="rounded-xl overflow-hidden border border-slate-700">
                {story.mediaType === 'VIDEO' || story.mediaUrl.match(/\.(mp4|mov|avi|webm)$/i) ? (
                  <video
                    src={story.mediaUrl}
                    controls
                    className="w-full max-h-[500px] object-contain"
                    autoPlay
                    muted={!story.music}
                  />
                ) : (
                  <img
                    src={story.mediaUrl}
                    alt={story.title || 'Story media'}
                    className="w-full max-h-[500px] object-contain"
                  />
                )}
              </div>
            </div>
          )}

          {story.music && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Nhạc nền</p>
                {story.music.preview && (
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
                        onTogglePlay();
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                      {isPlaying ? '⏸ Tạm dừng' : '▶ Phát'}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                {story.music.album?.cover && (
                  <img
                    src={story.music.album.cover}
                    alt={story.music.album.title}
                    className="w-24 h-24 rounded-lg object-cover border border-slate-700"
                  />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-lg font-semibold text-white">{story.music.title}</p>
                  <p className="text-sm text-slate-400">
                    {story.music.artist?.name || 'Unknown artist'}
                  </p>
                  {story.music.album && (
                    <p className="text-xs text-slate-500">
                      Album: {story.music.album.title}
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
                {story.privacy_type?.toUpperCase() || 'PUBLIC'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400">Ngày tạo</p>
              <p className="text-base text-white font-semibold">
                {new Date(story.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-sm text-slate-400">Hết hạn</p>
              <p className="text-base text-white font-semibold">
                {story.expireAt ? new Date(story.expireAt).toLocaleString('vi-VN') : '-'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">Không có dữ liệu</div>
      )}
    </Modal>
  );
}

