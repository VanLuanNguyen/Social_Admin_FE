import type { UserFormData } from '../../types';

export const validateForm = (
  formData: UserFormData,
  mode: 'create' | 'edit' = 'create'
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!formData.email.trim()) {
    errors.email = 'Email là bắt buộc';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (!formData.username.trim()) {
    errors.username = 'Tên người dùng là bắt buộc';
  } else if (formData.username.length < 3) {
    errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
  }

  if (mode === 'create') {
    if (!formData.password) {
      errors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.confirmPassword.length < 6) {
      errors.confirmPassword = 'Mật khẩu xác nhận phải có ít nhất 6 ký tự';
    }

    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      errors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
    }
  } else if (mode === 'edit') {
    const hasPassword = !!formData.password;
    const hasConfirm = !!formData.confirmPassword;

    if (hasPassword || hasConfirm) {
      if (!formData.password) {
        errors.password = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.password.length < 6) {
        errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      } else if (formData.confirmPassword.length < 6) {
        errors.confirmPassword = 'Mật khẩu xác nhận phải có ít nhất 6 ký tự';
      }

      if (
        formData.password &&
        formData.confirmPassword &&
        formData.password !== formData.confirmPassword
      ) {
        errors.confirmPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
      }
    }
  }

  if (formData.phoneNumber && !/^[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};










