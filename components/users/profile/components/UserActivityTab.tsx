import React from 'react';
import Button from '@/components/ui/Button';
import type { ActivityTimelineItem } from '../../types';

interface UserActivityTabProps {
  activity: any;
  loading: boolean;
  onActivityClick: (item: ActivityTimelineItem) => void;
  onShowAllClick: () => void;
}

export default function UserActivityTab({
  activity,
  loading,
  onActivityClick,
  onShowAllClick,
}: UserActivityTabProps) {
  if (loading) {
    return <p className="text-slate-400 text-center py-4">Đang tải...</p>;
  }

  if (!activity) {
    return <p className="text-slate-400 text-center py-4">Chưa có hoạt động</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          {activity.activity?.length || 0} hoạt động gần đây
        </p>
        <Button
          variant="outline"
          className="border-slate-700 text-white hover:text-white hover:bg-slate-800 text-xs"
          onClick={onShowAllClick}
        >
          Xem tất cả
        </Button>
      </div>

      {activity.activity && activity.activity.length > 0 ? (
        activity.activity.slice(0, 5).map((item: ActivityTimelineItem, idx: number) => (
          <div
            key={`activity-${item.type}-${item.id || idx}-${idx}`}
            onClick={() => onActivityClick(item)}
            className="p-3 rounded-lg border border-slate-700 bg-slate-900/40 cursor-pointer hover:bg-slate-900/60 transition-colors"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onActivityClick(item);
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
  );
}































