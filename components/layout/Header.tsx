'use client';

import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-end px-6 py-4">
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user.fullName}
                </p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/50 shadow-lg ring-2 ring-indigo-500/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center border-2 border-indigo-500/50 shadow-lg ring-2 ring-indigo-500/20">
                  <span className="text-white font-medium">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}





