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

      {user.school && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Trường học</p>
          <p className="text-sm text-white">{user.school}</p>
        </div>
      )}

      {user.currentCity && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Thành phố hiện tại</p>
          <p className="text-sm text-white">{user.currentCity}</p>
        </div>
      )}

      {user.hometown && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Quê quán</p>
          <p className="text-sm text-white">{user.hometown}</p>
        </div>
      )}

      {user.workplace && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Nơi làm việc</p>
          <p className="text-sm text-white">{user.workplace}</p>
        </div>
      )}

      {user.relationshipStatus && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tình trạng quan hệ</p>
          <p className="text-sm text-white">
            {user.relationshipStatus === 'single' ? 'Độc thân' :
              user.relationshipStatus === 'in_relationship' ? 'Đang hẹn hò' :
                user.relationshipStatus === 'married' ? 'Đã kết hôn' :
                  user.relationshipStatus === 'complicated' ? 'Phức tạp' :
                    user.relationshipStatus}
          </p>
        </div>
      )}

      {user.coverUrl && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ảnh bìa</p>
          <div className="mt-2">
            <img
              src={user.coverUrl}
              alt="Cover"
              className="w-full h-32 object-cover rounded-lg border border-slate-700"
            />
          </div>
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
          {user.isBan ? 'Đã bị khóa' : 'Đang hoạt động'}
        </p>
      </div>

      {user.isBan && (
        <>
          <div>
            <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">Thời hạn khóa</p>
            <p className="text-sm text-rose-300 font-semibold">
              {user.banUntil ? new Date(user.banUntil).toLocaleString('vi-VN') : 'Vĩnh viễn'}
            </p>
          </div>
          {user.banReason && (
            <div>
              <p className="text-xs text-rose-400 uppercase tracking-wider mb-1">Lý do khóa</p>
              <p className="text-sm text-rose-300">{user.banReason}</p>
            </div>
          )}
        </>
      )}

      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày tạo</p>
        <p className="text-sm text-white">
          {new Date(user.createdAt).toLocaleString('vi-VN')}
        </p>
      </div>

      {user.updatedAt && (
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ngày cập nhật</p>
          <p className="text-sm text-white">
            {new Date(user.updatedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
}










