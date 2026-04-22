'use client';

import { LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormListEmptyStateProps {
  onCreateClick: () => void;
  isVerified: boolean;
}

export function FormListEmptyState({
  onCreateClick,
  isVerified,
}: FormListEmptyStateProps) {
  return (
    <div
      data-testid="form-list-empty"
      className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-dashed border-border bg-card"
    >
      {/* Icon container */}
      <div className="rounded-full bg-secondary p-4">
        <LayoutList className="h-8 w-8 text-primary" />
      </div>

      <h2 className="mt-4 text-lg font-semibold text-foreground">
        No forms yet
      </h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {isVerified
          ? 'Create your first form to start collecting submissions from your site.'
          : 'Verify your email address to create your first form.'}
      </p>

      {isVerified && (
        <Button
          type="button"
          onClick={onCreateClick}
          className="mt-6 h-11 px-6 btn-gradient border-0 hover:opacity-90"
        >
          Create your first form
        </Button>
      )}
    </div>
  );
}
