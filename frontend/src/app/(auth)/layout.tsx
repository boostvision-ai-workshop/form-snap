'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { MarketingHeader } from '@/components/marketing/marketing-header';

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
      <div className="flex min-h-screen items-center justify-center">
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
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <div className="flex flex-1 items-center justify-center p-4">
        {isVerifyEmailPage ? (
          // Verify-email renders its own Card; no wrapping needed
          children
        ) : (
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">{children}</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
