import type { User } from '@/lib/types';

export const PAGE_LIMIT = 10;

export const roleConfigs: Record<User['role'], { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-blue-500/15 text-blue-200 border border-blue-500/40',
  },
  user: {
    label: 'User',
    className: 'bg-slate-500/15 text-slate-100 border border-slate-500/30',
  },
};

export const SELECT_CLASSES =
  'flex-1 min-w-[160px] px-4 py-2.5 text-sm bg-slate-900/60 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500';

