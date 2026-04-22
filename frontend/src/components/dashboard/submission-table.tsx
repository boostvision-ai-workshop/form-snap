'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { listSubmissions, type SubmissionPage } from '@/lib/api/submissions';
import { CsvExportButton } from './csv-export-button';
import { SubmissionRow } from './submission-row';

const PAGE_SIZE = 25;

interface SubmissionTableProps {
  formId: string;
  formName: string;
}

export function SubmissionTable({ formId, formName }: SubmissionTableProps) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SubmissionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await listSubmissions(formId, page, PAGE_SIZE);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load submissions');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [formId, page]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data ? (
            <>
              {data.total} {data.total === 1 ? 'submission' : 'submissions'} total
            </>
          ) : null}
        </p>
        <CsvExportButton formId={formId} formName={formName} />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {/* Rows */}
      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-base font-medium text-foreground">No submissions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Submissions will appear here once your form receives responses.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card">
              {data.items.map((submission) => (
                <SubmissionRow key={submission.id} submission={submission} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  data-testid="pagination-prev"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  data-testid="pagination-next"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
