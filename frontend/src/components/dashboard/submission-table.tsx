'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
} from '@/components/ui/table';
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
  // Search is client-side UI — filtering against loaded page data
  const [search, setSearch] = useState('');

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

  // Client-side search filter against the current page
  const filteredItems = data
    ? data.items.filter((item) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return JSON.stringify(item.data).toLowerCase().includes(q);
      })
    : [];

  // Pagination window calculations
  const pageStart = data && data.items.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = data ? Math.min(page * PAGE_SIZE, data.total) : 0;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search submissions\u2026"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
            aria-label="Search submissions"
          />
        </div>

        {/* Right-aligned export */}
        <div className="ml-auto">
          <CsvExportButton formId={formId} formName={formName} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card className="overflow-hidden shadow-[var(--shadow-card)]">
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 h-12">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 hidden sm:block" />
                <Skeleton className="h-5 w-16 rounded-full hidden sm:block" />
                <Skeleton className="h-4 w-20 ml-auto" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data */}
      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <Card className="p-12 text-center shadow-[var(--shadow-card)]">
              <p className="text-base font-semibold text-foreground">No submissions yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Submissions will appear here once your form receives responses.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden shadow-[var(--shadow-card)] border border-border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Name
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
                      Email
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
                      Notification
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Submitted
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No submissions match your search.
                      </td>
                    </TableRow>
                  ) : (
                    filteredItems.map((submission) => (
                      <SubmissionRow key={submission.id} submission={submission} />
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination footer */}
          {data.total > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {totalPages > 1
                  ? `Showing ${pageStart} to ${pageEnd} of ${data.total} ${data.total === 1 ? 'result' : 'results'}`
                  : `${data.total} ${data.total === 1 ? 'submission' : 'submissions'}`}
              </span>

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    data-testid="pagination-prev"
                    className="h-8 px-3"
                  >
                    Prev
                  </Button>

                  {/* Page number buttons — show at most 5 */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Center window around current page
                    let start = Math.max(1, page - 2);
                    const end = Math.min(totalPages, start + 4);
                    start = Math.max(1, end - 4);
                    return start + i;
                  }).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="h-8 w-8 p-0"
                      aria-current={pageNum === page ? 'page' : undefined}
                    >
                      {pageNum}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    data-testid="pagination-next"
                    className="h-8 px-3"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
