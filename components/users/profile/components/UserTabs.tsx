import React from 'react';
import type { TabType } from '../../types';

interface UserTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'info', label: 'Thông tin' },
  { id: 'friends', label: 'Bạn bè' },
  { id: 'activity', label: 'Hoạt động' },
];

export default function UserTabs({ activeTab, onTabChange }: UserTabsProps) {
  return (
    <div className="flex border-b border-slate-700">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}































