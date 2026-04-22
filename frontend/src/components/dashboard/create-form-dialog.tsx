'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createForm } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
});

type CreateFormValues = z.infer<typeof createSchema>;

interface CreateFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (form: FormListItem) => void;
}

export function CreateFormDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateFormDialogProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
  });

  async function onSubmit(values: CreateFormValues) {
    setCreating(true);
    setError(null);
    try {
      const response = await createForm({ name: values.name });
      // Convert FormResponse to FormListItem shape for the list
      const listItem: FormListItem = {
        id: response.id,
        name: response.name,
        redirect_url: response.redirect_url,
        submission_count: 0,
        last_submission_at: null,
        submit_url: response.submit_url,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };
      reset();
      onCreated(listItem);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setCreating(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    if (!creating) {
      reset();
      setError(null);
      onOpenChange(newOpen);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new form</DialogTitle>
          <DialogDescription>
            Give your form a name. You can add a custom redirect URL later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-form-name">Form name</Label>
            <Input
              id="new-form-name"
              data-testid="form-name-input"
              placeholder="e.g. Contact page"
              {...register('name')}
              disabled={creating}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

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
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="create-form-submit"
              disabled={creating}
            >
              {creating ? 'Creating…' : 'Create form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
