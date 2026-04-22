import Image from 'next/image';
import Link from 'next/link';
import { assetPath } from '@/lib/asset-path';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top-left brand chrome */}
      <header className="px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          <Image
            src={assetPath('/form-snap.svg')}
            alt="FormSnap logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-base font-semibold text-foreground">FormSnap</span>
        </Link>
      </header>

      {/* Centered card */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-dialog)] p-10 max-w-md w-full text-center space-y-6">
          {/* Display number */}
          <p className="text-6xl font-bold leading-tight text-primary">404</p>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center h-10 px-6 rounded-md btn-gradient text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to home
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center h-10 px-6 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
