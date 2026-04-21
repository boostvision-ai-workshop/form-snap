'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Trash2, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CopyButton } from '@/components/dashboard/copy-button';
import type { FormListItem } from '@/lib/api/forms';

interface FormRowProps {
  form: FormListItem;
  onDelete: (form: FormListItem) => void;
}

export function FormRow({ form, onDelete }: FormRowProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div
      data-testid="form-row"
      className="rounded-lg border border-border bg-card"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Form name + stats */}
        <button
          type="button"
          className="flex-1 text-left min-w-0"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <p className="font-medium text-foreground truncate">{form.name}</p>
          <p className="text-sm text-muted-foreground">
            {form.submission_count}{' '}
            {form.submission_count === 1 ? 'submission' : 'submissions'}
            {form.last_submission_at && (
              <>
                {' '}
                &middot; last{' '}
                {new Date(form.last_submission_at).toLocaleDateString()}
              </>
            )}
          </p>
        </button>

        {/* Copy URL */}
        <CopyButton
          text={form.submit_url}
          label="Copy URL"
          data-testid="copy-snippet-button"
        />

        {/* Row menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            data-testid="row-menu"
            aria-label="Form actions"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/forms/${form.id}`)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(form)}
                data-testid="delete-form-button"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded: show submit URL */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Submit URL
          </p>
          <code className="block rounded-md border border-[var(--color-code-border)] bg-[var(--color-code-surface)] px-3 py-2 text-sm text-[var(--color-code-foreground)] break-all">
            {form.submit_url}
          </code>
        </div>
      )}
    </div>
  );
}
