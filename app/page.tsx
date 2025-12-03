'use client';

import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import type { DashboardStats, UserGrowthData, PostStatsData } from '@/lib/types';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [postStats, setPostStats] = useState<PostStatsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, userGrowthData, postStatsData] = await Promise.all([
        api.adminGetDashboardStats(),
        api.adminGetUsersGrowth(30),
        api.adminGetPostsStats('day', 30),
      ]);
      setStats(statsData);
      setUserGrowth(userGrowthData || []);
      setPostStats(postStatsData || []);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tải thống kê dashboard';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Chuẩn bị dữ liệu cho biểu đồ pie chart
  const pieChartData = stats
    ? [
        { name: 'Người dùng', value: stats.totalUsers },
        { name: 'Bài viết', value: stats.totalPosts },
        { name: 'Story', value: stats.totalStories },
        { name: 'Bình luận', value: stats.totalComments },
      ]
    : [];

  // Chuẩn bị dữ liệu cho biểu đồ bar chart so sánh
  const barChartData = stats
    ? [
        {
          name: 'Tổng số',
          'Người dùng': stats.totalUsers,
          'Bài viết': stats.totalPosts,
          'Story': stats.totalStories,
          'Bình luận': stats.totalComments,
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Chào mừng, {user?.fullName || 'Admin'}!
          </h1>
          <p className="mt-2 text-gray-400">
            Quản lý hệ thống Social Network từ đây.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Tổng người dùng
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-600 rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Tổng bài viết
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalPosts || 0}
                </p>
              </div>
              <div className="p-3 bg-green-600 rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Tổng story
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalStories || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-600 rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Tổng bình luận
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalComments || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-600 rounded-full">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Biểu đồ tăng trưởng người dùng */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Tăng trưởng người dùng (30 ngày qua)
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Đang tải...
            </div>
          ) : userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `Ngày: ${date.toLocaleDateString('vi-VN')}`;
                  }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Số người dùng mới"
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ tăng trưởng bài viết */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">
            Tăng trưởng bài viết (30 ngày qua)
          </h3>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Đang tải...
            </div>
          ) : postStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={postStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `Ngày: ${date.toLocaleDateString('vi-VN')}`;
                  }}
                />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Số bài viết mới"
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Chưa có dữ liệu
            </div>
          )}
        </div>

        {/* Biểu đồ so sánh tổng số liệu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Phân bổ tổng số liệu
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Đang tải...
              </div>
            ) : pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              So sánh tổng số liệu
            </h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Đang tải...
              </div>
            ) : barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="Người dùng" fill="#3b82f6" />
                  <Bar dataKey="Bài viết" fill="#10b981" />
                  <Bar dataKey="Story" fill="#8b5cf6" />
                  <Bar dataKey="Bình luận" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                Chưa có dữ liệu
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <Link href="/users">
                <Button className="w-full" variant="primary">
                  Quản lý người dùng
                </Button>
              </Link>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Thông tin hệ thống
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vai trò:</span>
                <span className="font-medium text-white">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="font-medium text-white">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trạng thái:</span>
                <span className="font-medium text-green-400">
                  {user?.isActive ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
