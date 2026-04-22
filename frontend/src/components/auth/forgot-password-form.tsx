'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setError(null);
      if (auth) {
        await sendPasswordResetEmail(auth, data.email);
      }
      setSent(true);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        // Silently succeed to prevent email enumeration
        setSent(true);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
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
        <CardTitle className="text-xl font-semibold text-center">Forgot your password?</CardTitle>
        <CardDescription className="text-center text-sm text-muted-foreground pt-1">
          Enter your email and we&apos;ll send you a reset link.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {sent ? (
          <Alert>
            <AlertDescription>
              If an account exists for that email, a reset link has been sent. Check your inbox.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
