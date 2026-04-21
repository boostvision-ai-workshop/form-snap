'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function VerifyEmailCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cooldownSeconds = 60;
  const isResendDisabled =
    resending || (resentAt !== null && Date.now() - resentAt < cooldownSeconds * 1000);

  async function handleResend() {
    if (!user) return;
    try {
      setResending(true);
      setAlert(null);
      await sendEmailVerification(user);
      setResentAt(Date.now());
      setAlert({ type: 'success', message: 'Verification email sent — check your inbox.' });
    } catch {
      setAlert({ type: 'error', message: 'Failed to resend. Please try again shortly.' });
    } finally {
      setResending(false);
    }
  }

  async function handleCheckVerified() {
    if (!user) return;
    try {
      setChecking(true);
      setAlert(null);
      await user.reload();
      if (user.emailVerified) {
        router.push('/dashboard');
      } else {
        setAlert({ type: 'error', message: 'Email not yet verified. Check your inbox and try again.' });
      }
    } catch {
      setAlert({ type: 'error', message: 'Could not verify status. Please try again.' });
    } finally {
      setChecking(false);
    }
  }

  return (
    <Card className="w-full max-w-md" data-testid="verify-email-card">
      <CardHeader>
        <CardTitle>Check your inbox</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-foreground">{user?.email ?? 'your email'}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Click the link in that email to verify your address. Once verified, you&apos;ll be
          able to create forms. If you don&apos;t see it, check your spam folder.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={handleResend}
            disabled={isResendDisabled}
          >
            {resending ? 'Sending…' : resentAt !== null ? 'Resend email' : 'Resend verification email'}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={handleCheckVerified}
            disabled={checking}
          >
            {checking ? 'Checking…' : "I've verified — go to dashboard"}
          </Button>
        </div>

        {alert && (
          <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
