'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
          FormSnap
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm px-2"
          >
            Pricing
          </Link>
          <ThemeToggle />
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
