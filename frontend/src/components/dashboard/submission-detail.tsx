'use client';

import type { SubmissionItem } from '@/lib/api/submissions';

interface SubmissionDetailProps {
  submission: SubmissionItem;
}

export function SubmissionDetail({ submission }: SubmissionDetailProps) {
  const entries = Object.entries(submission.data);

  return (
    <div
      data-testid={`submission-detail-${submission.id}`}
      className="px-4 pb-4 pt-2"
    >
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No data</p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {entries.map(([key, value]) => (
            <div key={key} className="contents">
              <dt className="font-medium text-foreground">{key}</dt>
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
  );
}
