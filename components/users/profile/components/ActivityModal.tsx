import React from 'react';
import Modal from '@/components/ui/Modal';
import type { ActivityTimelineItem } from '../../types';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: any;
  loading: boolean;
  onActivityClick: (item: ActivityTimelineItem, fromModal: boolean) => void;
}

export default function ActivityModal({
  isOpen,
  onClose,
  activity,
  loading,
  onActivityClick,
}: ActivityModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hoạt động gần đây" size="xl">
      {loading ? (
        <p className="text-slate-400 text-center py-4">Đang tải...</p>
      ) : !activity?.activity || activity.activity.length === 0 ? (
        <p className="text-slate-400 text-center py-4">Chưa có hoạt động</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {activity.activity.map((item: ActivityTimelineItem, idx: number) => (
            <div
              key={`modal-activity-${item.type}-${item.id || idx}-${idx}`}
              onClick={() => onActivityClick(item, true)}
              className="p-4 rounded-lg border border-slate-700 bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActivityClick(item, true);
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
  );
}

