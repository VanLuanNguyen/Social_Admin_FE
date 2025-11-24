// TypeScript types cho User và API responses

export interface User {
  userId: string;
  fullName: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: string;
  role: 'admin' | 'user';
  lastActiveAt?: string;
}

export type ActivityType = 'post' | 'story' | 'comment' | 'reaction';

export interface ReactionPayload {
  targetType: 'post' | 'story';
  targetId?: string;
  target?: Post | Story;
  emoji?: {
    _id?: string;
    label?: string;
    icon?: string;
    name?: string;
  };
}

export interface ActivityTimelineItem {
  type: ActivityType;
  id: string;
  createdAt: string;
  payload: Post | Story | Comment | ReactionPayload;
}

export interface UserActivity {
  posts: Post[];
  stories: Story[];
  comments: Comment[];
  reactions?: {
    posts?: any[];
    stories?: any[];
  };
  activity?: ActivityTimelineItem[];
  lastActive?: string | null;
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

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalStories: number;
  totalComments: number;
  newUsersThisMonth: number;
  newPostsThisMonth: number;
  recentActivity?: {
    posts: Post[];
    stories: Story[];
    comments: Comment[];
  };
}

export interface UserGrowthDataPoint {
  date: string;
  count: number;
  total: number;
}

export interface UserGrowthData {
  data: UserGrowthDataPoint[];
  totalUsers: number;
}

export interface PostStatsDataPoint {
  date: string;
  count: number;
}

export interface PostStatsData {
  data: PostStatsDataPoint[];
  totalPosts: number;
}
