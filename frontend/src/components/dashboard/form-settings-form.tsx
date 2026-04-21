'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { updateForm } from '@/lib/api/forms';
import type { FormListItem } from '@/lib/api/forms';

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  redirect_url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface FormSettingsFormProps {
  form: FormListItem;
  onSaved?: (updated: { name: string; redirect_url: string | null }) => void;
}

export function FormSettingsForm({ form, onSaved }: FormSettingsFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: form.name,
      redirect_url: form.redirect_url ?? '',
    },
  });

  async function onSubmit(values: SettingsFormValues) {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const payload: { name?: string; redirect_url?: string | null } = {};
      if (values.name !== form.name) payload.name = values.name;
      const newRedirect = values.redirect_url || null;
      if (newRedirect !== form.redirect_url) payload.redirect_url = newRedirect;

      if (Object.keys(payload).length === 0) {
        setSuccess(true);
        return;
      }

      await updateForm(form.id, payload);
      setSuccess(true);
      onSaved?.({ name: values.name, redirect_url: newRedirect });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label htmlFor="form-name">Form name</Label>
        <Input
          id="form-name"
          data-testid="form-name-settings-input"
          {...register('name')}
          disabled={saving}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="redirect-url">
          Redirect URL{' '}
          <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Input
          id="redirect-url"
          data-testid="redirect-url-input"
          placeholder="https://example.com/thanks"
          {...register('redirect_url')}
          disabled={saving}
        />
        {errors.redirect_url && (
          <p className="text-sm text-destructive">
            {errors.redirect_url.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Where to send visitors after they submit. Defaults to the FormSnap
          success page.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Settings saved.</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={saving || !isDirty}>
        {saving ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
