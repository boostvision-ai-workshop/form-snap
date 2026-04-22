'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { assetPath } from '@/lib/asset-path';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { authProvider } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const isMock = process.env.NEXT_PUBLIC_AUTH_PROVIDER === 'mock';

export function VerifyEmailCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [resentAt, setResentAt] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [marking, setMarking] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const cooldownSeconds = 60;
  const isResendDisabled =
    resending || (resentAt !== null && Date.now() - resentAt < cooldownSeconds * 1000);

  async function handleResend() {
    if (!user) return;
    try {
      setResending(true);
      setAlert(null);
      await authProvider.sendEmailVerification(user);
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

  /** Mock-only: instantly flip emailVerified and redirect to dashboard. */
  async function handleMarkVerified() {
    try {
      setMarking(true);
      setAlert(null);
      if (authProvider.markEmailVerified) {
        await authProvider.markEmailVerified();
      }
      router.push('/dashboard');
    } catch {
      setAlert({ type: 'error', message: 'Could not mark email as verified.' });
    } finally {
      setMarking(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-[var(--shadow-dialog)] border border-border" data-testid="verify-email-card">
      <CardHeader className="p-6 pb-0 space-y-0 text-center">
        <div className="flex justify-center mb-5">
          <Link href="/" className="flex items-center gap-2">
            <Image src={assetPath('/form-snap.svg')} alt="FormSnap logo" width={28} height={28} className="h-7 w-7" />
            <span className="text-base font-semibold text-foreground">FormSnap</span>
          </Link>
        </div>
        <div className="flex justify-center mb-3">
          <div className="rounded-full bg-secondary p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-xl font-semibold">Check your inbox</CardTitle>
        <CardDescription className="text-sm text-muted-foreground pt-1">
          We sent a link to{' '}
          <span className="font-medium text-foreground">{user?.email ?? 'your email'}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        <p className="text-sm text-muted-foreground leading-relaxed text-center">
          Click the link in your email to verify your account. If you don&apos;t see it, check your spam folder.
        </p>

        <div className="flex flex-col gap-3">
          {!isMock && (
            <Button
              className="w-full h-11 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]"
              onClick={handleResend}
              disabled={isResendDisabled}
            >
              {resending ? 'Sending…' : resentAt !== null ? 'Resend email' : 'Resend verification email'}
            </Button>
          )}

          <Button
            className="w-full h-11"
            variant="outline"
            onClick={handleCheckVerified}
            disabled={checking}
          >
            {checking ? 'Checking…' : "I've verified — go to dashboard"}
          </Button>

          {isMock && (
            <Button
              className="w-full h-11"
              variant="secondary"
              onClick={handleMarkVerified}
              disabled={marking}
              data-testid="mock-mark-verified"
            >
              {marking ? 'Marking…' : 'Local dev: mark email verified'}
            </Button>
          )}
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
