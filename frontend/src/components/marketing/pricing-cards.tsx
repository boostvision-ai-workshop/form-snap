'use client';

import { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface PricingTier {
  id: string;
  name: string;
  priceLabel: string;
  priceSuffix?: string;
  description: string;
  features: string[];
  ctaLabel: string;
  highlighted?: boolean;
  badge?: string;
}

export const DEFAULT_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Hobby',
    priceLabel: '$0',
    priceSuffix: '/ forever',
    description: 'Perfect for personal sites and weekend projects.',
    features: [
      '1 form',
      '100 submissions / month',
      'Email notifications',
      'CSV export',
      'Community support',
    ],
    ctaLabel: 'Current plan',
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '$12',
    priceSuffix: '/ month',
    description: 'For indie makers shipping real products.',
    features: [
      '10 forms',
      '10,000 submissions / month',
      'Custom redirect per form',
      'Spam filter + honeypot',
      'Email + chat support',
    ],
    ctaLabel: 'Upgrade to Pro',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'business',
    name: 'Business',
    priceLabel: '$49',
    priceSuffix: '/ month',
    description: 'For teams with multiple sites and heavier traffic.',
    features: [
      'Unlimited forms',
      '100,000 submissions / month',
      'Webhooks & integrations',
      'Priority email delivery',
      'SSO + audit logs',
    ],
    ctaLabel: 'Upgrade to Business',
  },
];

interface PricingCardsProps {
  tiers?: PricingTier[];
}

export function PricingCards({ tiers = DEFAULT_TIERS }: PricingCardsProps) {
  const [pendingTier, setPendingTier] = useState<PricingTier | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.id}
            data-testid={`pricing-card-${tier.id}`}
            className={
              tier.highlighted
                ? 'relative border-[var(--color-accent-blue)] shadow-md'
                : 'relative'
            }
          >
            {tier.badge && (
              <Badge
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-accent-blue)] text-[var(--color-accent-blue-foreground)]"
              >
                <Sparkles className="mr-1 size-3" />
                {tier.badge}
              </Badge>
            )}
            <CardHeader className="space-y-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold">{tier.name}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {tier.description}
                </CardDescription>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{tier.priceLabel}</span>
                {tier.priceSuffix && (
                  <span className="text-sm text-muted-foreground">{tier.priceSuffix}</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-blue)]" />
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                data-testid={`pricing-cta-${tier.id}`}
                onClick={() => setPendingTier(tier)}
                className={
                  tier.highlighted
                    ? 'w-full bg-[var(--color-accent-blue)] text-[var(--color-accent-blue-foreground)] hover:bg-[var(--color-accent-blue-hover)]'
                    : 'w-full'
                }
                variant={tier.highlighted ? 'default' : 'outline'}
              >
                {tier.ctaLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={pendingTier !== null} onOpenChange={(open) => !open && setPendingTier(null)}>
        <DialogContent data-testid="pricing-coming-soon-dialog">
          <DialogHeader>
            <DialogTitle>
              {pendingTier ? `${pendingTier.name} — coming soon` : 'Coming soon'}
            </DialogTitle>
            <DialogDescription>
              Billing is not wired up yet — this is a demo build. Your account keeps
              access to all currently-available features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setPendingTier(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
