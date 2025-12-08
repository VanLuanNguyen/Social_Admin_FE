export type StatusFilter = 'all' | 'active' | 'suspended';
export type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
export type TabType = 'info' | 'friends' | 'activity';

export interface ActivityTimelineItem {
  type: 'post' | 'story' | 'comment' | 'reaction';
  id: string;
  createdAt: string;
  payload: any;
}

export interface UserFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  bio: string;
  avatarUrl: string;
  dateOfBirth: string;
  gender: string;
  isActive: boolean;
}










