'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import UserManagementColumn from '@/components/users/UserManagementColumn';
import UserProfileColumn from '@/components/users/UserProfileColumn';

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <UserManagementColumn />
            <UserProfileColumn />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}





