'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableRow, TableCell } from '@/components/ui/table';
import type { SubmissionItem } from '@/lib/api/submissions';
import { EmailStatusBadge } from './email-status-badge';
import { SubmissionDetail } from './submission-detail';

interface SubmissionRowProps {
  submission: SubmissionItem;
}

/** Extract a display name from common name-like fields in submission data. */
function extractName(data: Record<string, unknown>): string {
  const nameKeys = ['name', 'full_name', 'fullName', 'first_name', 'firstName'];
  for (const key of nameKeys) {
    const val = data[key];
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  // Fallback: first string value
  for (const val of Object.values(data)) {
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '\u2014';
}

/** Extract an email from common email-like fields in submission data. */
function extractEmail(data: Record<string, unknown>): string {
  const emailKeys = ['email', 'email_address', 'emailAddress', 'e_mail'];
  for (const key of emailKeys) {
    const val = data[key];
    if (val && typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '\u2014';
}

/** Format a UTC ISO string as a relative label (e.g. "3 min ago", "2 days ago"). */
function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}

export function SubmissionRow({ submission }: SubmissionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const name = extractName(submission.data);
  const email = extractEmail(submission.data);
  const relative = relativeTime(submission.created_at);

  return (
    <>
      <TableRow
        data-testid="submission-row"
        className="h-12 cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {/* Name */}
        <TableCell className="px-4 py-3 text-sm font-medium text-foreground max-w-[180px] truncate">
          {name}
        </TableCell>

        {/* Email */}
        <TableCell className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate hidden sm:table-cell">
          {email}
        </TableCell>

        {/* Notification badge */}
        <TableCell className="px-4 py-3 hidden sm:table-cell">
          <EmailStatusBadge status={submission.email_status} />
        </TableCell>

        {/* Submitted (relative) */}
        <TableCell className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
          <div className="flex items-center justify-between gap-3">
            <time dateTime={submission.created_at}>{relative}</time>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={expanded ? 'Collapse row' : 'Expand row'}
            >
              {expanded ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {expanded && <SubmissionDetail submission={submission} />}
    </>
  );
}
