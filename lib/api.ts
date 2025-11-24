// API client với Axios - có interceptors cho JWT authentication

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { auth } from './auth';
import type { 
  ApiError, 
  User, 
  PostList, 
  Story, 
  React, 
  Comment,
  AdminUsersResponse,
  AdminPostsResponse,
  AdminStoriesResponse,
  AdminCommentsResponse,
  DashboardStats,
  UserGrowthData,
  PostStatsData,
  UserActivity
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = auth.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi và logout khi token hết hạn
apiClient.interceptors.response.use(
  (response) => {
    // Backend trả về { success: true, data: ... }
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const status = error.response.status;
      
      // Unauthorized - token hết hạn hoặc không hợp lệ
      if (status === 401) {
        auth.logout();
      }
      
      // Forbidden - không có quyền truy cập
      if (status === 403) {
        // Redirect về login hoặc hiển thị thông báo
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    // Backend trả về { statusCode, message, data: { accessToken, refreshToken, user } }
    return response.data.data;
  },

  // Users (Legacy - có thể giữ để tương thích)
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/user');
    // Backend trả về { statusCode, message, data: User[] }
    return response.data.data || [];
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/user/${id}`);
    // Backend trả về { statusCode, message, data: User }
    return response.data.data;
  },

  getUserProfile: async (): Promise<User> => {
    const response = await apiClient.get('/user/profile');
    // Backend trả về { statusCode, message, data: User }
    return response.data.data;
  },

  searchUsers: async (query: string, page: number = 1, limit: number = 10) => {
    const response = await apiClient.get('/user/search', {
      params: { query, page, limit },
    });
    // Backend trả về { statusCode, message, data: ... }
    return response.data.data;
  },

  // ===== Admin APIs - User Management =====
  adminGetAllUsers: async (
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    role?: string, 
    isActive?: boolean
  ): Promise<AdminUsersResponse> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (role) params.role = role;
    if (isActive !== undefined) params.isActive = isActive;

    const response = await apiClient.get('/admin/users', { params });
    return response.data.data || response.data;
  },

  adminGetUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data.data || response.data;
  },

  adminGetUserFriends: async (userId: string): Promise<any[]> => {
    const response = await apiClient.get(`/admin/users/${userId}/friends`);
    return response.data.data || response.data || [];
  },

  adminGetUserActivity: async (userId: string): Promise<UserActivity> => {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data.data || response.data;
  },

  // ===== Admin APIs - User Content =====
  getUserPostsByAdmin: async (userId: string, page: number = 1, limit: number = 10): Promise<PostList> => {
    const response = await apiClient.get(`/admin/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data.data || response.data;
  },

  getUserStoriesByAdmin: async (userId: string): Promise<Story[]> => {
    const response = await apiClient.get(`/admin/users/${userId}/stories`);
    return response.data.data || response.data || [];
  },

  // ===== Admin APIs - Post Management =====
  adminGetAllPosts: async (
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    userId?: string
  ): Promise<AdminPostsResponse> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (userId) params.userId = userId;

    const response = await apiClient.get('/admin/posts', { params });
    return response.data.data || response.data;
  },

  adminGetPostById: async (postId: string): Promise<any> => {
    const response = await apiClient.get(`/admin/posts/${postId}`);
    return response.data.data || response.data;
  },

  getPostReacts: async (postId: string): Promise<React[]> => {
    const response = await apiClient.get(`/admin/posts/${postId}/reacts`);
    return response.data.data || response.data || [];
  },

  getPostComments: async (postId: string): Promise<Comment[]> => {
    const response = await apiClient.get(`/admin/posts/${postId}/comments`);
    return response.data.data || response.data || [];
  },

  // ===== Admin APIs - Story Management =====
  adminGetAllStories: async (
    page: number = 1, 
    limit: number = 10, 
    userId?: string, 
    dateFrom?: string, 
    dateTo?: string
  ): Promise<AdminStoriesResponse> => {
    const params: any = { page, limit };
    if (userId) params.userId = userId;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await apiClient.get('/admin/stories', { params });
    return response.data.data || response.data;
  },

  adminGetStoryById: async (storyId: string): Promise<Story> => {
    const response = await apiClient.get(`/admin/stories/${storyId}`);
    return response.data.data || response.data;
  },

  getStoryReacts: async (storyId: string): Promise<React[]> => {
    const response = await apiClient.get(`/admin/stories/${storyId}/reacts`);
    return response.data.data || response.data || [];
  },

  // ===== Admin APIs - Comment Management =====
  adminGetAllComments: async (
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    postId?: string, 
    userId?: string
  ): Promise<AdminCommentsResponse> => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (postId) params.postId = postId;
    if (userId) params.userId = userId;

    const response = await apiClient.get('/admin/comments', { params });
    return response.data.data || response.data;
  },

  adminGetCommentById: async (commentId: string): Promise<Comment> => {
    const response = await apiClient.get(`/admin/comments/${commentId}`);
    return response.data.data || response.data;
  },

  // ===== Admin APIs - Dashboard Stats =====
  adminGetDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data.data || response.data;
  },

  adminGetUsersGrowth: async (days: number = 30): Promise<UserGrowthData> => {
    const response = await apiClient.get('/admin/dashboard/users-growth', {
      params: { days },
    });
    return response.data.data || response.data;
  },

  adminGetPostsStats: async (
    groupBy: 'day' | 'month' = 'day', 
    days: number = 30
  ): Promise<PostStatsData> => {
    const response = await apiClient.get('/admin/dashboard/posts-stats', {
      params: { groupBy, days },
    });
    return response.data.data || response.data;
  },
};
