'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import UserDetail from '@/components/users/UserDetail';

export default function UserDetailPage() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết người dùng
          </h1>
        </div>

        <UserDetail />
      </div>
    </DashboardLayout>
  );
}










