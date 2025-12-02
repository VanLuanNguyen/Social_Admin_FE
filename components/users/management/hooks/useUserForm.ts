import { useState } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import type { UserFormData } from '../../types';
import { validateForm } from '../utils/validation';

const initialFormData: UserFormData = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  phoneNumber: '',
  bio: '',
  avatarUrl: '',
  dateOfBirth: '',
  gender: '',
  isActive: true,
};

export const useUserForm = (onSuccess: () => void) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditMode(false);
    setEditingUserId(null);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setIsEditMode(true);
    setEditingUserId(user.userId);
    setFormData({
      email: user.email || '',
      username: user.username || '',
      password: '',
      confirmPassword: '',
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || '',
      avatarUrl: user.avatarUrl || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user.gender || '',
      isActive: user.isActive,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async (currentPage: number) => {
    const mode: 'create' | 'edit' = isEditMode ? 'edit' : 'create';
    const validation = validateForm(formData, mode);

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      setIsCreating(true);

      const userData: any = {};

      if (formData.email.trim()) userData.email = formData.email.trim();
      if (formData.username.trim()) userData.username = formData.username.trim();
      if (formData.fullName.trim()) userData.fullName = formData.fullName.trim();
      if (formData.phoneNumber.trim()) userData.phoneNumber = formData.phoneNumber.trim();
      if (formData.bio.trim()) userData.bio = formData.bio.trim();
      if (formData.avatarUrl.trim()) userData.avatarUrl = formData.avatarUrl.trim();
      if (formData.dateOfBirth) userData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) userData.gender = formData.gender;
      userData.isActive = formData.isActive;

      if (mode === 'create') {
        userData.password = formData.password;
        userData.confirmPassword = formData.confirmPassword;
        await api.adminCreateUser(userData);
        toast.success('Tạo người dùng thành công!');
      } else {
        if (formData.password) {
          userData.password = formData.password;
          userData.confirmPassword = formData.confirmPassword;
        }

        if (!editingUserId) {
          throw new Error('Không xác định được người dùng cần chỉnh sửa');
        }

        await api.adminUpdateUser(editingUserId, userData);
        toast.success('Cập nhật người dùng thành công!');
      }

      setIsCreateModalOpen(false);
      resetForm();
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể tạo người dùng';
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreateModalOpen,
    isCreating,
    isEditMode,
    formData,
    setFormData,
    formErrors,
    handleCloseModal,
    openCreateModal,
    openEditModal,
    handleSubmit,
  };
};

