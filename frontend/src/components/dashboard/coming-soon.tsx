import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  bullets?: string[];
}

export function ComingSoon({ title, description, icon: Icon, bullets }: ComingSoonProps) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Empty-state card */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center py-16 px-6 space-y-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-brand-blue-surface)] text-primary">
            <Icon className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <Badge className="bg-primary text-primary-foreground">
              <Sparkles className="mr-1 size-3" />
              Coming soon
            </Badge>
            <h2 className="text-2xl font-semibold text-foreground">
              {title} is on the way
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This surface is part of the FormSnap roadmap. You&apos;re looking at a
              demo build — the real feature will ship with a future release.
            </p>
          </div>

          {bullets && bullets.length > 0 && (
            <ul className="text-sm text-muted-foreground space-y-1.5 text-left max-w-md w-full">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link href="/dashboard">
              <Button variant="outline" className="h-10 px-6">
                Back to dashboard
              </Button>
            </Link>
            <Link href="/dashboard/forms">
              <Button className="h-10 px-6 bg-primary text-primary-foreground hover:bg-[var(--color-brand-blue-hover)]">
                View forms
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
