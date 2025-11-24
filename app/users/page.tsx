'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import UserManagementColumn from '@/components/users/UserManagementColumn';
import UserProfileColumn from '@/components/users/UserProfileColumn';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-slate-500">
              Bảng điều khiển
            </p>
            <h1 className="text-3xl font-semibold text-white mt-1">
              Quản lý người dùng
            </h1>
            <p className="text-slate-400 mt-2">
              Quản lý tất cả người dùng trong hệ thống.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <UserManagementColumn />
            <UserProfileColumn />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}





