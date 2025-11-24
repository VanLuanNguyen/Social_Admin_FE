'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UsersContextType {
  selectedUserId: string | null;
  selectedPostId: string | null;
  activeTab: 'posts' | 'stories' | 'comments' | 'reactions';
  setSelectedUserId: (userId: string | null) => void;
  setSelectedPostId: (postId: string | null) => void;
  setActiveTab: (tab: 'posts' | 'stories' | 'comments' | 'reactions') => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'posts' | 'stories' | 'comments' | 'reactions'
  >('posts');

  return (
    <UsersContext.Provider
      value={{
        selectedUserId,
        selectedPostId,
        activeTab,
        setSelectedUserId,
        setSelectedPostId,
        setActiveTab,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}






