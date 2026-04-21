'use client';

import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
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
      <div className="space-y-3">
        {forms.map((form) => (
          <FormRow
            key={form.id}
            form={form}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>

      <DeleteFormDialog
        form={formToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={handleDeleted}
      />
    </>
  );
}
