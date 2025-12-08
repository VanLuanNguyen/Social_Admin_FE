import React from 'react';
import type { User } from '@/lib/types';

interface UserInfoTabProps {
  user: User;
}

export default function UserInfoTab({ user }: UserInfoTabProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">ID người dùng</p>
        <p className="text-sm text-white font-mono">{user.userId}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tên đầy đủ</p>
        <p className="text-sm text-white">{user.fullName}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tên người dùng</p>
        <p className="text-sm text-white">@{user.username}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
        <p className="text-sm text-white">{user.email}</p>
      </div>

      {user.phoneNumber && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Số điện thoại</p>
          <p className="text-sm text-white">{user.phoneNumber}</p>
        </div>
      )}

      {user.dateOfBirth && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày sinh</p>
          <p className="text-sm text-white">
            {new Date(user.dateOfBirth).toLocaleDateString('vi-VN')}
          </p>
        </div>
      )}

      {user.gender && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Giới tính</p>
          <p className="text-sm text-white">
            {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender}
          </p>
        </div>
      )}

      {user.bio && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Giới thiệu</p>
          <p className="text-sm text-white whitespace-pre-wrap">{user.bio}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Vai trò</p>
        <p className="text-sm text-white">
          {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trạng thái</p>
        <p className="text-sm text-white">
          {user.isActive ? 'Đang hoạt động' : 'Đã bị khóa'}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày tạo</p>
        <p className="text-sm text-white">
          {new Date(user.createdAt).toLocaleString('vi-VN')}
        </p>
      </div>
    </div>
  );
}










