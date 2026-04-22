'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmailVerificationGate } from '@/components/dashboard/email-verification-gate';
import { FormList } from '@/components/dashboard/form-list';
import { CreateFormDialog } from '@/components/dashboard/create-form-dialog';
import { useProfile } from '@/contexts/profile-context';
import { listForms } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

export default function DashboardPage() {
  const { profile } = useProfile();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

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

  const filtered = search.trim()
    ? forms.filter((f) =>
        f.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : forms;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Forms</h1>
          <p className="text-sm text-muted-foreground">Manage your forms</p>
        </div>
        <EmailVerificationGate>
          {(verified) => (
            <Button
              data-testid="create-form-button"
              disabled={!verified}
              title={
                verified ? 'Create a new form' : 'Verify your email to create forms'
              }
              className="h-9 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]"
              onClick={() => verified && setCreateOpen(true)}
            >
              Create form
            </Button>
          )}
        </EmailVerificationGate>
      </div>

      {/* Search toolbar */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search forms…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <FormList
        forms={filtered}
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
