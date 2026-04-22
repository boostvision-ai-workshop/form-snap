'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FormRow } from '@/components/dashboard/form-row';
import { FormListEmptyState } from '@/components/dashboard/form-list-empty-state';
import { DeleteFormDialog } from '@/components/dashboard/delete-form-dialog';
import type { FormListItem } from '@/lib/api/forms';

interface FormListProps {
  forms: FormListItem[];
  loading: boolean;
  error: string | null;
  isVerified: boolean;
  onCreateClick: () => void;
  onFormsChange: (forms: FormListItem[]) => void;
}

export function FormList({
  forms,
  loading,
  error,
  isVerified,
  onCreateClick,
  onFormsChange,
}: FormListProps) {
  const [formToDelete, setFormToDelete] = useState<FormListItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDeleteRequest(form: FormListItem) {
    setFormToDelete(form);
    setDeleteOpen(true);
  }

  function handleDeleted(formId: string) {
    onFormsChange(forms.filter((f) => f.id !== formId));
    setFormToDelete(null);
  }

  if (loading) {
    return (
      <Card className="overflow-hidden shadow-[var(--shadow-card)] rounded-lg">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 px-4 h-12">
              <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-12 ml-auto" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-9 rounded-full" />
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (forms.length === 0) {
    return (
      <FormListEmptyState
        isVerified={isVerified}
        onCreateClick={onCreateClick}
      />
    );
  }

  return (
    <>
      <Card className="overflow-hidden shadow-[var(--shadow-card)] rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
              <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-auto">
                Name
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-28">
                Responses
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-24 hidden sm:table-cell">
                Views
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-32 hidden md:table-cell">
                Updated
              </TableHead>
              <TableHead className="px-4 py-3 text-xs font-medium text-muted-foreground w-24">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <FormRow key={form.id} form={form} onDelete={handleDeleteRequest} />
            ))}
          </TableBody>
        </Table>

        {/* Result count footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {forms.length} of {forms.length} form{forms.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      <DeleteFormDialog
        form={formToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
