'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const isVerifyEmailPage = pathname === '/verify-email';

  useEffect(() => {
    if (loading) return;
    if (user && !isVerifyEmailPage) {
      // Authenticated and not on verify-email — send to dashboard
      router.push('/dashboard');
    }
  }, [user, loading, router, isVerifyEmailPage]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Sign-in / sign-up: redirect if already logged in
  if (user && !isVerifyEmailPage) {
    return null;
  }

  // Verify-email page: require login (must have a Firebase user)
  if (isVerifyEmailPage && !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {children}
    </div>
  );
}
