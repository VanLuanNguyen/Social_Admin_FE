'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col border border-slate-700/50`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">{title}</h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white focus:outline-none transition-colors rounded-lg p-1 hover:bg-slate-700/50"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>
        </div>
    </div>
  );
}



