'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (IS_DEMO) {
        // Auto sign-in as demo user — no redirect needed.
        signIn('demo@formsnap.dev', 'demo').catch(() => {
          router.push('/sign-in');
        });
      } else {
        router.push('/sign-in');
      }
    }
  }, [user, loading, router, signIn]);

  if (loading || (!user && IS_DEMO)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
