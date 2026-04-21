'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AccountLinkingDialog() {
  const router = useRouter();
  const { accountLinking, setAccountLinking, linkAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerName = accountLinking?.suggestedProvider === 'google' ? 'Google' : 'GitHub';

  const handleLink = async () => {
    try {
      setLoading(true);
      setError(null);
      await linkAccount();
      router.push('/dashboard');
    } catch {
      setError('Failed to link account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAccountLinking(null);
    setError(null);
  };

  return (
    <Dialog
      open={accountLinking !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Account already exists</DialogTitle>
          <DialogDescription>
            An account with{' '}
            <span className="font-medium text-foreground">{accountLinking?.email}</span>{' '}
            already exists using {providerName}. Sign in with {providerName} to link your accounts.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={loading}>
            {loading ? 'Linking...' : `Sign in with ${providerName}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
