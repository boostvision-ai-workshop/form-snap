'use client';

import Link from 'next/link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/contexts/profile-context';

interface EmailVerificationGateProps {
  /** Render prop that receives whether the user is verified. */
  children: (verified: boolean) => React.ReactNode;
}

/**
 * EmailVerificationGate — reads email_verified from ProfileContext and:
 * 1. Shows an Alert banner when the email is unverified (AT-022).
 * 2. Passes `verified` boolean to its child render-prop so the parent can
 *    disable gated actions (e.g. "Create form" button).
 */
export function EmailVerificationGate({ children }: EmailVerificationGateProps) {
  const { profile, loading } = useProfile();

  // While the profile is loading, assume unverified (conservative) but don't
  // show the banner yet to avoid a flash.
  const verified = !loading && (profile?.email_verified ?? false);

  return (
    <>
      {!loading && !verified && (
        <Alert data-testid="verify-email-banner" className="mb-4">
          <AlertDescription>
            Please verify your email address before creating forms.{' '}
            <Link href="/verify-email">
              <Button variant="link" className="h-auto p-0 text-sm font-medium">
                Resend verification email
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {children(verified)}
    </>
  );
}
