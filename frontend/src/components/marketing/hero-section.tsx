import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Hero badge */}
          <Badge
            variant="secondary"
            className="rounded-full px-4 py-1 text-sm font-medium"
          >
            Free to start
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight mt-4 tracking-tight">
            The modern way to<br />
            collect anything
          </h1>

          {/* Sub-headline */}
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed max-w-2xl mx-auto">
            FormSnap gives your static site a real form backend in seconds. One URL, zero
            server configuration, instant email notifications, and a beautiful inbox.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg btn-gradient border-0 text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Get started free
            </Link>
            <Link
              href="#demo"
              className="inline-flex items-center justify-center h-11 px-8 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View demo
            </Link>
          </div>

          {/* Trust notes */}
          <p className="text-sm text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1">
              <span className="text-[var(--color-success)]">&#10003;</span>
              No credit card required
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--color-success)]">&#10003;</span>
              14-day free trial
            </span>
            <span className="hidden sm:inline text-border">·</span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--color-success)]">&#10003;</span>
              Easy setup
            </span>
          </p>

          {/* Product preview card */}
          <div className="mt-12">
            <div
              className="rounded-xl border bg-card shadow-[var(--shadow-dialog)] overflow-hidden"
            >
              {/* Mock dashboard preview */}
              <div className="bg-[var(--muted)] border-b px-4 py-3 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive opacity-60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-warning)] opacity-60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[var(--color-success)] opacity-60" />
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded border px-3 py-1 text-xs text-muted-foreground text-left max-w-xs mx-auto">
                    app.formsnap.io/dashboard
                  </div>
                </div>
              </div>
              <div className="p-6 text-left">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Total submissions', value: '2,342' },
                    { label: 'Form views', value: '18,430' },
                    { label: 'Completion rate', value: '25.4%' },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-card rounded-lg border p-4 shadow-[var(--shadow-card)]"
                    >
                      <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      <p className="text-xl font-semibold mt-1">{kpi.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card rounded-lg border p-4 shadow-[var(--shadow-card)]">
                  <p className="text-sm font-medium mb-3">Submissions over time</p>
                  <div className="h-24 flex items-end gap-1 px-1">
                    {[30, 45, 35, 60, 50, 70, 55, 80, 65, 90, 75, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          background: 'linear-gradient(to top, var(--sparkle-start), var(--sparkle-end))',
                          opacity: 0.7 + i * 0.025,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
