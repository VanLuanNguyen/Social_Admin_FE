import React from 'react';
import type { User } from '@/lib/types';

interface UserFriendsTabProps {
  friends: User[];
  loading: boolean;
}

export default function UserFriendsTab({ friends, loading }: UserFriendsTabProps) {
  if (loading) {
    return <p className="text-slate-400 text-center py-4">Đang tải...</p>;
  }

  if (friends.length === 0) {
    return <p className="text-slate-400 text-center py-4">Chưa có bạn bè</p>;
  }

  return (
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
              {(friend.fullName || friend.username || 'U').charAt(0).toUpperCase()}
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
  );
}










