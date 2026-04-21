'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormSnippet } from '@/components/dashboard/form-snippet';
import { FormSettingsForm } from '@/components/dashboard/form-settings-form';
import { listForms } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

export const dynamic = 'force-dynamic';

export default function FormDetailPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;

  const [form, setForm] = useState<FormListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <Skeleton className="h-8 w-64" />
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
  // html_snippet is not available from FormListItem; the snippet component builds
  // a representative snippet from the submit_url for display purposes.
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{form.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {form.submission_count}{' '}
          {form.submission_count === 1 ? 'submission' : 'submissions'}
        </p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="snippet">Embed snippet</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="pt-4">
          {/* Batch-4: Submission inbox comes in the next batch */}
          <div
            data-testid="inbox-placeholder"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center"
          >
            <p className="text-base font-medium text-foreground">
              Inbox coming next batch
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Submission inbox will be available in the next release.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="snippet" className="pt-4">
          <FormSnippet submitUrl={submitUrl} htmlSnippet={htmlSnippet} />
        </TabsContent>

        <TabsContent value="settings" className="pt-4">
          <FormSettingsForm
            form={form}
            onSaved={(updated) => {
              setForm((prev) =>
                prev ? { ...prev, ...updated } : prev
              );
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
