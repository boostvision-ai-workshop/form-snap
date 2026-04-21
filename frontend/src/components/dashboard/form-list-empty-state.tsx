'use client';

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
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center"
    >
      <p className="text-lg font-medium text-foreground">No forms yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {isVerified
          ? 'Create your first form to start collecting submissions.'
          : 'Verify your email to create your first form.'}
      </p>
      {isVerified && (
        <button
          type="button"
          onClick={onCreateClick}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Create form
        </button>
      )}
    </div>
  );
}
