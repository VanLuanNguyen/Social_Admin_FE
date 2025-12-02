import React from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { UserFormData } from '../../types';

interface UserFormModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  isCreating: boolean;
  formData: UserFormData;
  formErrors: Record<string, string>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: UserFormData) => void;
}

export default function UserFormModal({
  isOpen,
  isEditMode,
  isCreating,
  formData,
  formErrors,
  onClose,
  onSubmit,
  onFormDataChange,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="user@example.com"
              error={formErrors.email}
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên người dùng <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="username123"
              error={formErrors.username}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mật khẩu{isEditMode ? '' : ' '} {!isEditMode && <span className="text-red-400">*</span>}
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="Tối thiểu 6 ký tự"
              error={formErrors.password}
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Xác nhận mật khẩu{isEditMode ? '' : ' '} {!isEditMode && <span className="text-red-400">*</span>}
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => onFormDataChange({ ...formData, confirmPassword: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="Nhập lại mật khẩu"
              error={formErrors.confirmPassword}
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tên đầy đủ
            </label>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => onFormDataChange({ ...formData, fullName: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Số điện thoại
            </label>
            <Input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => onFormDataChange({ ...formData, phoneNumber: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="0123456789"
              error={formErrors.phoneNumber}
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Ngày sinh
            </label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => onFormDataChange({ ...formData, dateOfBirth: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Giới tính
            </label>
            <select
              value={formData.gender}
              onChange={(e) => onFormDataChange({ ...formData, gender: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL Avatar
            </label>
            <Input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => onFormDataChange({ ...formData, avatarUrl: e.target.value })}
              className="bg-slate-900/60 border-slate-700 text-white placeholder-slate-500"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Giới thiệu
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => onFormDataChange({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Giới thiệu về người dùng..."
            rows={3}
          />
        </div>

        {/* Is Active */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => onFormDataChange({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
            Kích hoạt tài khoản ngay
          </label>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-slate-700 text-white hover:bg-slate-700"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {isCreating
              ? isEditMode
                ? 'Đang cập nhật...'
                : 'Đang tạo...'
              : isEditMode
                ? 'Lưu thay đổi'
                : 'Tạo người dùng'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

