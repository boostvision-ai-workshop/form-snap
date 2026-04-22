'use client';

import type { SubmissionItem } from '@/lib/api/submissions';

interface SubmissionDetailProps {
  submission: SubmissionItem;
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const entries = Object.entries(submission.data);

  return (
    <tr data-testid={`submission-detail-${submission.id}`}>
      {/* colspan 4 to span all table columns */}
      <td colSpan={4} className="p-0">
        <div className="bg-muted/30 px-4 py-4 border-t border-border">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No data</p>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {entries.map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="font-medium text-foreground capitalize">{key}</dt>
                  <dd className="text-muted-foreground break-all">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value ?? '')}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </td>
    </tr>
  );
}
