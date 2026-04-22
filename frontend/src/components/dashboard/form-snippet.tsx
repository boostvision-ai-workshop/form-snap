'use client';

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
}

export function FormSnippet({ submitUrl, htmlSnippet }: FormSnippetProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Embed this form</CardTitle>
        <CardDescription>
          Paste the snippet below into any HTML page to start collecting
          submissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {/* Submit URL row */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-foreground">Submit URL</p>
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
