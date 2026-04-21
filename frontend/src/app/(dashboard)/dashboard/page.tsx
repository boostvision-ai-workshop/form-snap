'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EmailVerificationGate } from '@/components/dashboard/email-verification-gate';
import { useProfile } from '@/contexts/profile-context';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
        <EmailVerificationGate>
          {(verified) => (
            <Button
              data-testid="create-form-button"
              disabled={!verified}
              title={
                verified ? 'Create a new form' : 'Verify your email to create forms'
              }
            >
              New form
            </Button>
          )}
        </EmailVerificationGate>
      </div>

      {/* EmailVerificationGate banner renders inline above for the full-page banner. */}
      {/* The FormList (Batch-2) will replace the placeholder below. */}
      <EmailVerificationGate>
        {() => (
          <div className="text-muted-foreground text-sm">
            {profile
              ? `Signed in as ${profile.email}`
              : 'Your forms will appear here.'}
          </div>
        )}
      </EmailVerificationGate>
    </div>
  );
}
