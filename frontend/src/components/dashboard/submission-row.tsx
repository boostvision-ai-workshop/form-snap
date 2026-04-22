'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { SubmissionItem } from '@/lib/api/submissions';
import { EmailStatusBadge } from './email-status-badge';
import { SubmissionDetail } from './submission-detail';

interface SubmissionRowProps {
  submission: SubmissionItem;
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(submission.created_at);
  const formattedDate = date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Show a brief summary: first 2 values from the data payload
  const dataEntries = Object.entries(submission.data);
  const preview =
    dataEntries
      .slice(0, 2)
      .map(([, v]) => String(v ?? ''))
      .join(' · ') || '(empty)';

  return (
    <div
      data-testid="submission-row"
      className="border-b border-border last:border-0"
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="text-muted-foreground">
            {expanded ? (
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          <span className="truncate text-sm text-foreground">{preview}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <EmailStatusBadge status={submission.email_status} />
          <time
            dateTime={submission.created_at}
            className="text-xs text-muted-foreground"
          >
            {formattedDate}
          </time>
        </div>
      </button>

      {expanded && <SubmissionDetail submission={submission} />}
    </div>
  );
}
