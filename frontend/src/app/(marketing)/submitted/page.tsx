import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function SubmittedPage() {
  return (
    <main className="flex flex-1 items-center justify-center min-h-screen py-16">
      <div className="text-center max-w-sm px-4" data-testid="default-success">
        {/* Brand-blue filled check icon */}
        <div className="mx-auto mb-6 flex items-center justify-center">
          <CheckCircle
            className="h-12 w-12"
            style={{ color: 'var(--color-success)' }}
            aria-hidden="true"
            strokeWidth={1.5}
          />
        </div>

        <h1 className="text-2xl font-semibold">
          Thanks! Your submission was received.
        </h1>
        <p className="text-muted-foreground mt-3">
          You can close this tab or go back.
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Powered by FormSnap →
          </Link>
        </div>
      </div>
    </main>
  );
}
