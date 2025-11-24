'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import type { User, LoginResponse } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra token khi component mount
    const initAuth = async () => {
      const token = auth.getToken();
      if (token) {
        try {
          // Lấy thông tin user từ localStorage hoặc gọi API
          const savedUser = auth.getUser();
          if (savedUser) {
            setUser(savedUser);
          } else {
            // Nếu không có trong localStorage, gọi API để lấy profile
            const profile = await api.getUserProfile();
            setUser(profile);
            auth.setUser(profile);
          }
        } catch (error) {
          // Token không hợp lệ, xóa và logout
          auth.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const loginResponse: LoginResponse = await api.login(email, password);

      auth.setToken(loginResponse.accessToken);
      auth.setUser(loginResponse.user);
      setUser(loginResponse.user);

      // Kiểm tra nếu không phải admin thì logout
      if (loginResponse.user.role !== 'admin') {
        auth.logout();
        throw new Error('Chỉ admin mới được phép đăng nhập');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

