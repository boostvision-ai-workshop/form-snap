'use client';

import { CopyButton } from '@/components/dashboard/copy-button';

interface FormSnippetProps {
  submitUrl: string;
  htmlSnippet: string;
}

export function FormSnippet({ submitUrl, htmlSnippet }: FormSnippetProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Submit URL</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md border border-border bg-[var(--color-code-surface)] px-3 py-1.5 text-sm text-[var(--color-code-foreground)] break-all">
            {submitUrl}
          </code>
          <CopyButton
            text={submitUrl}
            label="Copy URL"
            data-testid="copy-url-button"
          />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">HTML Snippet</p>
        <div className="relative rounded-md border border-[var(--color-code-border)] bg-[var(--color-code-surface)]">
          <pre className="overflow-x-auto p-3 text-sm text-[var(--color-code-foreground)] whitespace-pre-wrap break-all">
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
      </div>
    </div>
  );
}
