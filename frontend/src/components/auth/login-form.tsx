'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCredentialFromError } from '@/lib/firebase/auth';
import { SocialButtons } from './social-buttons';
import { AccountLinkingDialog } from './account-linking-dialog';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithGitHub, setAccountLinking } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return 'Login failed. Please try again.';
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        const errorCode = (err as { code?: string }).code;
        setError(getErrorMessage(errorCode));
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSocialLoading(true);
      setError(null);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      const linkingInfo = getCredentialFromError(err);
      if (linkingInfo) {
        setAccountLinking({
          email: linkingInfo.email,
          pendingCredential: linkingInfo.credential,
          suggestedProvider: 'github',
        });
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        const errorCode = (err as { code?: string }).code;
        setError(getErrorMessage(errorCode));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setSocialLoading(true);
      setError(null);
      await signInWithGitHub();
      router.push('/dashboard');
    } catch (err) {
      const linkingInfo = getCredentialFromError(err);
      if (linkingInfo) {
        setAccountLinking({
          email: linkingInfo.email,
          pendingCredential: linkingInfo.credential,
          suggestedProvider: 'google',
        });
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else {
        const errorCode = (err as { code?: string }).code;
        setError(getErrorMessage(errorCode));
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || socialLoading}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <SocialButtons
        onGoogleClick={handleGoogleSignIn}
        onGitHubClick={handleGitHubSignIn}
        loading={isSubmitting || socialLoading}
      />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>

      <AccountLinkingDialog />
    </div>
  );
}
