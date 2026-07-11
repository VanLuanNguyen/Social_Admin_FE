'use client';

import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import type { DashboardStats, UserGrowthData, PostStatsData, User } from '@/lib/types';
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

const COLORS = ['#4f46e5', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [postStats, setPostStats] = useState<PostStatsData[]>([]);
  const [pendingPostReportsCount, setPendingPostReportsCount] = useState(0);
  const [pendingUserReportsCount, setPendingUserReportsCount] = useState(0);
  const [topSpammers, setTopSpammers] = useState<Array<{ reportCount: number; user: User }>>([]);
  const [topCreators, setTopCreators] = useState<Array<{ postCount: number; user: User }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, userGrowthData, postStatsData, postReportsData, userReportsData, rankingsData] = await Promise.all([
        api.adminGetDashboardStats(),
        api.adminGetUsersGrowth(30),
        api.adminGetPostsStats('day', 30),
        api.adminGetPostReports(1, 1, 'pending'),
        api.adminGetUserReports(1, 1, 'pending'),
        api.adminGetTopRankings(),
      ]);
      setStats(statsData);
      setUserGrowth(userGrowthData || []);
      setPostStats(postStatsData || []);
      setPendingPostReportsCount(postReportsData?.pagination?.totalItems || 0);
      setPendingUserReportsCount(userReportsData?.pagination?.totalItems || 0);
      setTopSpammers(rankingsData?.topSpammers || []);
      setTopCreators(rankingsData?.topCreators || []);
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
          <p className="mt-2 text-slate-400">
            Quản lý hệ thống Social Network từ đây.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Tổng người dùng
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalUsers || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
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

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Tổng bài viết
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalPosts || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
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

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Tổng story
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalStories || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
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

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Tổng bình luận
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {loading ? '-' : stats?.totalComments || 0}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
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

        {/* Moderation Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl border border-red-500/20 p-6 shadow-lg hover:shadow-red-500/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold uppercase tracking-wider text-red-400">
                  Báo cáo bài viết chờ xử lý
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-white">
                    {loading ? '-' : pendingPostReportsCount}
                  </p>
                  <span className="text-xs text-slate-400">bài viết bị báo cáo</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl shadow-lg bg-gradient-to-br ${pendingPostReportsCount > 0 ? 'from-red-500 to-rose-600 animate-pulse' : 'from-slate-800 to-slate-700 opacity-60'}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">Cần xử lý kịp thời để giữ môi trường sạch</span>
              <Link href="/post-reports?status=pending">
                <span className="text-xs text-red-400 hover:text-red-300 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer">
                  Đi đến hàng chờ &rarr;
                </span>
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 rounded-xl border border-amber-500/20 p-6 shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                  Báo cáo người dùng chờ xử lý
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-extrabold text-white">
                    {loading ? '-' : pendingUserReportsCount}
                  </p>
                  <span className="text-xs text-slate-400">tài khoản bị báo cáo</span>
                </div>
              </div>
              <div className={`p-3 rounded-xl shadow-lg bg-gradient-to-br ${pendingUserReportsCount > 0 ? 'from-amber-500 to-orange-600 animate-pulse' : 'from-slate-800 to-slate-700 opacity-60'}`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">Xác minh danh tính hoặc hành vi vi phạm</span>
              <Link href="/user-reports?status=pending">
                <span className="text-xs text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer">
                  Xem danh sách cấm &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Biểu đồ tăng trưởng người dùng */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 mb-8 shadow-lg">
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
                  stroke="#4f46e5"
                  strokeWidth={2}
                  name="Số người dùng mới"
                  dot={{ fill: '#4f46e5', r: 4 }}
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
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 mb-8 shadow-lg">
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

        {/* System Rankings Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Spammers */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white inline-flex items-center gap-2">
                🚨 Tài khoản bị báo cáo nhiều nhất (7 ngày qua)
              </h3>
              <Link href="/user-reports">
                <span className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer">
                  Xem tất cả
                </span>
              </Link>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Đang tải...</div>
            ) : topSpammers.length > 0 ? (
              <div className="space-y-4">
                {topSpammers.map((item, index) => (
                  <div
                    key={item.user.userId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/30 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {item.user.avatarUrl ? (
                          <img
                            src={item.user.avatarUrl}
                            alt={item.user.fullName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-750 flex items-center justify-center text-sm font-bold text-white">
                            {item.user.fullName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -top-1 -left-1 bg-red-500 text-[10px] font-bold text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-white">{item.user.fullName}</p>
                          {item.user.isBan && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-md">
                              Đã khóa
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">@{item.user.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">{item.reportCount} lượt</p>
                      <p className="text-[10px] text-slate-500">Bị báo cáo</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-555 text-sm">
                Không có tài khoản nào bị báo cáo trong tuần qua.
              </div>
            )}
          </div>

          {/* Top Creators */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700/50 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white inline-flex items-center gap-2">
                👑 Thành viên tích cực nhất (Tổng số bài viết)
              </h3>
              <Link href="/users">
                <span className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer">
                  Quản lý user
                </span>
              </Link>
            </div>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Đang tải...</div>
            ) : topCreators.length > 0 ? (
              <div className="space-y-4">
                {topCreators.map((item, index) => (
                  <div
                    key={item.user.userId}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/30 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.user.avatarUrl ? (
                        <img
                          src={item.user.avatarUrl}
                          alt={item.user.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-800"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-750 flex items-center justify-center text-sm font-bold text-white">
                          {item.user.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-white">{item.user.fullName}</p>
                        <p className="text-xs text-slate-400">@{item.user.username}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">{item.postCount} bài</p>
                      <p className="text-[10px] text-slate-500">Đã đăng tải</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-555 text-sm">
                Chưa có dữ liệu bài đăng.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
