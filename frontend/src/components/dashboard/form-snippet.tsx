'use client';

import { useSyncExternalStore } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CopyButton } from '@/components/dashboard/copy-button';

interface FormSnippetProps {
  submitUrl: string;
  htmlSnippet: string;
  formId: string;
}

// No-op subscribe — the URL derives from a stable prop, not a browser event.
function subscribe() {
  return () => {};
}

export function FormSnippet({ submitUrl, htmlSnippet, formId }: FormSnippetProps) {
  // Build the public share URL on the client so we pick up the correct origin
  // on the deployed GitHub Pages site (with its basePath) automatically.
  // useSyncExternalStore handles the SSR/hydration split cleanly.
  const shareUrl = useSyncExternalStore(
    subscribe,
    () => {
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
      return `${window.location.origin}${base}/f?id=${formId}`;
    },
    () => '',
  );

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Share & embed</CardTitle>
        <CardDescription>
          Send the share link to collect responses, or paste the HTML snippet
          into any page.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* Public share URL row */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Public share link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 rounded-md border border-[var(--color-code-border)] bg-[var(--color-code-surface)] px-3 py-1.5 font-mono text-sm text-[var(--color-code-foreground)] break-all">
              {shareUrl || 'Loading…'}
            </code>
            <CopyButton
              text={shareUrl}
              label="Copy link"
              data-testid="copy-share-link-button"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Anyone with this link can submit a response. New submissions appear
            in the Inbox in real time.
          </p>
        </div>

        {/* Submit URL row */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Submit endpoint (for custom forms)</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 rounded-md border border-[var(--color-code-border)] bg-[var(--color-code-surface)] px-3 py-1.5 font-mono text-sm text-[var(--color-code-foreground)] break-all">
              {submitUrl}
            </code>
            <CopyButton
              text={submitUrl}
              label="Copy URL"
              data-testid="copy-url-button"
            />
          </div>
        </div>

        {/* HTML snippet block */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">HTML snippet</p>
          <div className="relative rounded-lg border border-[var(--color-code-border)] bg-[var(--color-code-surface)]">
            <pre className="overflow-x-auto p-4 font-mono text-sm text-[var(--color-code-foreground)] whitespace-pre-wrap break-all">
              {htmlSnippet}
            </pre>
            <div className="absolute top-2 right-2">
              <CopyButton
                text={htmlSnippet}
                label="Copy snippet"
                data-testid="copy-snippet-button"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Add, remove, or rename fields to match your form. The{' '}
            <code className="font-mono">_gotcha</code> field is a honeypot
            spam trap — keep it hidden.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
