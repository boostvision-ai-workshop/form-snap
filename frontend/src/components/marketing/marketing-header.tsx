'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <Image src="/form-snap.svg" alt="FormSnap logo" width={28} height={28} className="h-7 w-7" />
          <span className="text-base font-semibold text-foreground">FormSnap</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
