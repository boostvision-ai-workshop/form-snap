import Link from 'next/link';

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-8 text-sm text-muted-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} FormSnap. All rights reserved.</span>
        <nav className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </Link>
          <Link href="/sign-in" className="hover:text-foreground transition-colors">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
