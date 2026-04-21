'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmailVerificationGate } from '@/components/dashboard/email-verification-gate';
import { FormList } from '@/components/dashboard/form-list';
import { CreateFormDialog } from '@/components/dashboard/create-form-dialog';
import { useProfile } from '@/contexts/profile-context';
import { listForms } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { profile } = useProfile();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const isVerified = profile?.email_verified ?? false;

  useEffect(() => {
    if (!profile) return;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await listForms();
        setForms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load forms');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [profile]);

  function handleFormCreated(form: FormListItem) {
    setForms((prev) => [form, ...prev]);
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
              onClick={() => verified && setCreateOpen(true)}
            >
              New form
            </Button>
          )}
        </EmailVerificationGate>
      </div>

      <FormList
        forms={forms}
        loading={loading}
        error={error}
        isVerified={isVerified}
        onCreateClick={() => setCreateOpen(true)}
        onFormsChange={setForms}
      />

      <CreateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleFormCreated}
      />
    </div>
  );
}
