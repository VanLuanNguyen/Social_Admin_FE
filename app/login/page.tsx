'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white">
              <img 
                src="/assets/icons/logo.jpg" 
                alt="Logo" 
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Đăng nhập Admin
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Social Network Admin Panel
          </p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-8 px-6 shadow-2xl rounded-xl border border-slate-700/50">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

