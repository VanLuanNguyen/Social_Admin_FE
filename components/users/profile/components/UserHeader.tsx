import React from 'react';
import type { User } from '@/lib/types';

interface UserHeaderProps {
  user: User;
}

export default function UserHeader({ user }: UserHeaderProps) {
  return (
    <div className="border-b border-slate-700">
      {/* Cover Image */}
      {user.coverUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img
            src={user.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={`relative ${user.coverUrl ? '-mt-16' : ''}`}>
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-900"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-semibold text-white ring-4 ring-slate-900">
                {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 mt-2">
            <h3 className="text-xl font-semibold text-white">{user.fullName || user.username}</h3>
            <p className="text-sm text-slate-400">@{user.username}</p>
            {user.email && (
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            )}
            <div className="flex gap-2 mt-3">
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
    </div>
  );
}










