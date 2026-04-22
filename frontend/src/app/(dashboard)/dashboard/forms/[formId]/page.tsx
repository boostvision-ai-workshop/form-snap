'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FormSnippet } from '@/components/dashboard/form-snippet';
import { FormSettingsForm } from '@/components/dashboard/form-settings-form';
import { DeleteFormDialog } from '@/components/dashboard/delete-form-dialog';
import { SubmissionTable } from '@/components/dashboard/submission-table';
import { CsvExportButton } from '@/components/dashboard/csv-export-button';
import { listForms } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

export const dynamic = 'force-dynamic';

export default function FormDetailPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const router = useRouter();

  const [form, setForm] = useState<FormListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // We fetch the full list and find this form.
        // Batch-4 will add a dedicated GET /api/v1/forms/:id endpoint.
        const forms = await listForms();
        const found = forms.find((f) => f.id === formId) ?? null;
        setForm(found);
        if (!found) setError('form_not_found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [formId]);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Breadcrumb skeleton */}
        <Skeleton className="h-4 w-40" />
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error === 'form_not_found' || !form) {
    return (
      <div
        data-testid="form-not-found"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <p className="text-lg font-medium text-foreground">Form not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This form may have been deleted or you do not have access.
        </p>
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

  // Build submit_url snippet for the Settings tab
  const submitUrl = form.submit_url;
  const htmlSnippet = [
    `<form action="${submitUrl}" method="POST">`,
    `  <input name="name" type="text" required />`,
    `  <input name="email" type="email" required />`,
    `  <textarea name="message"></textarea>`,
    `  <input type="text" name="_gotcha" style="display:none" />`,
    `  <button type="submit">Send</button>`,
    `</form>`,
  ].join('\n');

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1 text-sm text-muted-foreground"
      >
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          Forms
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-foreground font-medium truncate max-w-[240px]">
          {form.name}
        </span>
      </nav>

      {/* Page header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{form.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {form.submission_count}{' '}
            {form.submission_count === 1 ? 'submission' : 'submissions'}
          </p>
        </div>
        <CsvExportButton formId={formId} formName={form.name} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-4">
          <SubmissionTable formId={formId} formName={form.name} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="space-y-8 max-w-2xl">
            {/* Form settings card */}
            <FormSettingsForm
              form={form}
              onSaved={(updated) => {
                setForm((prev) =>
                  prev ? { ...prev, ...updated } : prev
                );
              }}
            />

            {/* Embed snippet card */}
            <FormSnippet submitUrl={submitUrl} htmlSnippet={htmlSnippet} />

            <Separator />

            {/* Danger zone */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Danger zone
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Deleting a form is irreversible and will permanently remove
                  all submissions.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                Delete form
              </Button>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete dialog */}
      <DeleteFormDialog
        form={form}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => {
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
