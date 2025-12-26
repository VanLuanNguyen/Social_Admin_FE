// TypeScript types cho User và API responses

export interface User {
  userId: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  coverUrl?: string;
  school?: string;
  currentCity?: string;
  hometown?: string;
  workplace?: string;
  relationshipStatus?: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  role: 'admin' | 'user';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
  error?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PostMedia {
  _id: string;
  url: string;
  title?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostUserSummary {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  username: string;
}

export interface Post {
  _id: string;
  caption?: string;
  userId: PostUserSummary | User;
  urls?: PostMedia[];
  layout?: string;
  privacy_type?: string;
  reacts?: any[];
  isReact?: any;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface PostList {
  data: Post[];
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
}

export interface Story {
  _id: string;
  title?: string;
  mediaUrl?: string;
  mediaType?: string;
  privacy_type?: string;
  music?: any;
  userId: PostUserSummary | User;
  createdAt: string;
  updatedAt: string;
  expireAt?: string;
}

export interface Emoji {
  _id: string;
  label: string;
  icon?: string;
  name?: string;
}

export interface React {
  _id: string;
  userId: PostUserSummary;
  emojiId: Emoji;
  createdAt: string;
  updatedAt: string;
  mutualFriendsCount?: number;
  isFriend?: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  userId: PostUserSummary;
  postId: string;
  parentId?: Comment | string;
  createdAt: string;
  updatedAt: string;
}

// ===== Admin API Types =====
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminUsersResponse {
  data: User[];
  pagination: Pagination;
}

export interface AdminPostsResponse {
  data: Post[];
  pagination: Pagination;
}

export interface AdminStoriesResponse {
  data: Story[];
  pagination: Pagination;
}

export interface AdminCommentsResponse {
  data: Comment[];
  pagination: Pagination;
}

export interface PostReport {
  _id: string;
  postId: Post;
  userId: PostUserSummary | User;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  reportCounts?: {
    total: number;
    pending: number;
    reviewed: number;
    rejected: number;
  };
}

export interface PostReporter {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    email?: string;
  };
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface GroupedPostReport {
  postId: Post;
  reporters: PostReporter[];
  reportCounts: {
    total: number;
    pending: number;
    reviewed: number;
    rejected: number;
  };
  latestReportDate: string;
}

export interface AdminPostReportsResponse {
  data: GroupedPostReport[];
  pagination: Pagination;
}

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalStories: number;
  totalComments: number;
  newUsersThisMonth: number;
  newPostsThisMonth: number;
}

export interface UserGrowthData {
  date: string;
  count: number;
}

export interface PostStatsData {
  date: string;
  count: number;
}
