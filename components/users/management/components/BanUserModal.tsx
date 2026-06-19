import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import type { User } from '@/lib/types';

interface BanUserModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (banUntil: string | null, banReason: string) => Promise<void>;
}

export default function BanUserModal({
  isOpen,
  user,
  onClose,
  onConfirm,
}: BanUserModalProps) {
  const [duration, setDuration] = useState<'3' | '7' | '30' | 'custom' | 'permanent'>('3');
  const [customDays, setCustomDays] = useState<string>('14');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let banUntilIso: string | null = null;
      if (duration !== 'permanent') {
        const days = duration === 'custom' ? parseInt(customDays, 10) : parseInt(duration, 10);
        if (isNaN(days) || days <= 0) {
          throw new Error('Số ngày cấm không hợp lệ');
        }
        const banUntilDate = new Date();
        banUntilDate.setDate(banUntilDate.getDate() + days);
        banUntilIso = banUntilDate.toISOString();
      }
      await onConfirm(banUntilIso, reason);
      setReason('');
      setDuration('3');
      setCustomDays('14');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cấm tài khoản người dùng"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-slate-300 text-sm mb-4">
            Bạn đang thực hiện cấm tài khoản của{' '}
            <strong className="text-white">
              {user.fullName || user.username}
            </strong>{' '}
            ({user.email}). Vui lòng chọn thời hạn cấm và nêu rõ lý do.
          </p>
        </div>

        {/* Thời hạn cấm */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Thời hạn cấm <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: '3', label: '3 Ngày' },
              { value: '7', label: '7 Ngày' },
              { value: '30', label: '30 Ngày' },
              { value: 'permanent', label: 'Vĩnh viễn' },
              { value: 'custom', label: 'Tùy chỉnh' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  duration === opt.value
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="banDuration"
                  value={opt.value}
                  checked={duration === opt.value}
                  onChange={() => setDuration(opt.value as any)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Days Input */}
        {duration === 'custom' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Số ngày cấm <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập số ngày cấm"
              required
            />
          </div>
        )}

        {/* Lý do cấm */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">
            Lý do cấm
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Nêu rõ lý do cấm (ví dụ: đăng tải nội dung không lành mạnh, spam...)"
            rows={4}
          />
        </div>

        {/* Actions */}
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
            isLoading={isSubmitting}
            variant="danger"
          >
            Xác nhận cấm
          </Button>
        </div>
      </form>
    </Modal>
  );
}
