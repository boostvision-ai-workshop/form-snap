'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deleteForm } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

interface DeleteFormDialogProps {
  form: FormListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: (formId: string) => void;
}

export function DeleteFormDialog({
  form,
  open,
  onOpenChange,
  onDeleted,
}: DeleteFormDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!form) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteForm(form.id);
      onDeleted(form.id);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete form');
    } finally {
      setDeleting(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!deleting) {
      setError(null);
      onOpenChange(newOpen);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete form</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{' '}
            <span className="font-medium">{form?.name}</span>? This will
            permanently delete all submissions. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            data-testid="confirm-delete"
          >
            {deleting ? 'Deleting…' : 'Delete form'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
