'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCredentialFromError } from '@/lib/firebase/auth';
import { SocialButtons } from './social-buttons';
import { AccountLinkingDialog } from './account-linking-dialog';

const signupSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGitHub, setAccountLinking } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters';
      default:
        return 'Registration failed. Please try again.';
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null);
      await signUp(data.email, data.password);
      router.push('/verify-email');
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
    <Card className="w-full max-w-md shadow-[var(--shadow-dialog)] border border-border">
      <CardHeader className="p-6 pb-0 space-y-0">
        <div className="flex justify-center mb-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/form-snap.svg" alt="FormSnap logo" width={28} height={28} className="h-7 w-7" />
            <span className="text-base font-semibold text-foreground">FormSnap</span>
          </Link>
        </div>
        <CardTitle className="text-xl font-semibold text-center">Create your account</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground pt-1">
          Start collecting form submissions in minutes.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* OAuth buttons first */}
        <SocialButtons
          onGoogleClick={handleGoogleSignIn}
          onGitHubClick={handleGitHubSignIn}
          loading={isSubmitting || socialLoading}
        />

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Registration form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]"
            disabled={isSubmitting || socialLoading}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>

        <AccountLinkingDialog />
      </CardContent>
    </Card>
  );
}
