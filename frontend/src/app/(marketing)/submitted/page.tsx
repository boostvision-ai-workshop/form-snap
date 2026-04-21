import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SubmittedPage() {
  return (
    <main className="flex flex-1 items-center justify-center py-16">
      <div className="text-center max-w-sm px-4" data-testid="default-success">
        <div className="mb-4 flex justify-center">
          <svg
            className="h-12 w-12"
            style={{ color: 'var(--color-success)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Thanks! Your submission was received.</h1>
        <p className="text-muted-foreground mt-2">You can close this tab or go back.</p>
        <div className="mt-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Powered by FormSnap →
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
