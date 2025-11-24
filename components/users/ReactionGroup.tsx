'use client';

import React, { useMemo } from 'react';
import type { React as ReactType } from '@/lib/types';

interface ReactionGroupProps {
  reacts: ReactType[];
}

export default function ReactionGroup({ reacts }: ReactionGroupProps) {
  const groupedReacts = useMemo(() => {
    const groups: { [key: string]: { emoji: any; count: number; users: ReactType[] } } = {};

    reacts.forEach((react) => {
      const emojiId = react.emojiId?._id || 'unknown';
      const emoji = react.emojiId;

      if (!groups[emojiId]) {
        groups[emojiId] = {
          emoji,
          count: 0,
          users: [],
        };
      }

      groups[emojiId].count += 1;
      groups[emojiId].users.push(react);
    });

    return Object.values(groups);
  }, [reacts]);

  return (
    <div className="space-y-3">
      {groupedReacts.map((group, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{group.emoji?.icon || '👍'}</span>
            <div>
              <p className="text-sm font-medium text-white">
                {group.emoji?.label || 'Unknown'}
              </p>
              <p className="text-xs text-gray-400">{group.count} reacts</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="flex -space-x-2">
              {group.users.slice(0, 5).map((react) => (
                <div
                  key={react._id}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 overflow-hidden"
                  title={react.userId?.fullName || 'Unknown'}
                >
                  {react.userId?.avatarUrl ? (
                    <img
                      src={react.userId.avatarUrl}
                      alt={react.userId.fullName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="text-xs text-gray-300">
                        {react.userId?.fullName?.charAt(0).toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {group.users.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                  <span className="text-xs text-gray-300">+{group.users.length - 5}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-gray-400 max-w-[200px] text-right">
              {group.users.slice(0, 3).map((react, idx) => (
                <span key={react._id}>
                  {react.userId?.fullName || 'Unknown'}
                  {idx < Math.min(2, group.users.length - 1) && ', '}
                </span>
              ))}
              {group.users.length > 3 && (
                <span> và {group.users.length - 3} người khác</span>
              )}
            </div>
          </div>
        </div>
      ))}
      {groupedReacts.length === 0 && (
        <div className="text-center py-8 text-gray-400">Chưa có reacts nào</div>
      )}
    </div>
  );
}

