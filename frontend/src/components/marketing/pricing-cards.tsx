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

export type BillingCycle = 'monthly' | 'yearly';

export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number | null; // null = custom
  yearlyPrice: number | null;
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
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    priceSuffix: '/month',
    description: 'For personal use',
    features: [
      'Unlimited forms',
      '100 submissions / month',
      'Basic templates',
      'Export responses (CSV)',
    ],
    ctaLabel: 'Get started',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 19,
    yearlyPrice: 13, // ~30% off
    priceSuffix: '/month',
    description: 'For small teams',
    features: [
      'Unlimited forms',
      '10,000 submissions / month',
      'Advanced templates',
      'File uploads',
      'Conditional logic',
      'Remove branding',
    ],
    ctaLabel: 'Start free trial',
    highlighted: true,
    badge: 'Most popular',
  },
  {
    id: 'team',
    name: 'Team',
    monthlyPrice: 49,
    yearlyPrice: 34,
    priceSuffix: '/month',
    description: 'For growing teams',
    features: [
      'Unlimited forms',
      '50,000 submissions / month',
      'Team collaboration',
      'SLA & uptime guarantees',
      'Priority support',
      'Advanced integrations',
    ],
    ctaLabel: 'Start free trial',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    yearlyPrice: null,
    description: 'For organizations',
    features: [
      'Unlimited everything',
      'SSO (SAML)',
      'Dedicated support',
      'Custom contract',
    ],
    ctaLabel: 'Contact sales',
  },
];

interface PricingCardsProps {
  tiers?: PricingTier[];
}

export function PricingCards({ tiers = DEFAULT_TIERS }: PricingCardsProps) {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [pendingTier, setPendingTier] = useState<PricingTier | null>(null);

  return (
    <>
      {/* Monthly / Yearly toggle */}
      <div className="flex items-center justify-center gap-2 mb-10">
        <div
          role="tablist"
          aria-label="Billing cycle"
          className="inline-flex items-center rounded-full border border-border bg-card p-1 shadow-[var(--shadow-card)]"
        >
          <button
            type="button"
            role="tab"
            aria-selected={cycle === 'monthly'}
            data-testid="pricing-toggle-monthly"
            onClick={() => setCycle('monthly')}
            className={`px-4 h-9 rounded-full text-sm font-medium transition-colors ${
              cycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={cycle === 'yearly'}
            data-testid="pricing-toggle-yearly"
            onClick={() => setCycle('yearly')}
            className={`px-4 h-9 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-2 ${
              cycle === 'yearly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                cycle === 'yearly'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-[var(--color-success-surface)] text-[var(--color-success)]'
              }`}
            >
              Save 30%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const price =
            cycle === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice;
          const priceLabel =
            price === null ? 'Custom' : price === 0 ? '$0' : `$${price}`;
          return (
            <Card
              key={tier.id}
              data-testid={`pricing-card-${tier.id}`}
              className={
                tier.highlighted
                  ? 'relative border-primary shadow-[var(--shadow-dialog)] ring-1 ring-primary/20'
                  : 'relative'
              }
            >
              {tier.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-sm"
                >
                  <Sparkles className="mr-1 size-3" />
                  {tier.badge}
                </Badge>
              )}
              <CardHeader className="space-y-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">{tier.name}</CardTitle>
                  <CardDescription className="leading-relaxed text-sm">
                    {tier.description}
                  </CardDescription>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{priceLabel}</span>
                  {tier.priceSuffix && price !== null && (
                    <span className="text-sm text-muted-foreground">{tier.priceSuffix}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <Button
                  data-testid={`pricing-cta-${tier.id}`}
                  onClick={() => setPendingTier(tier)}
                  className={
                    tier.highlighted
                      ? 'btn-gradient w-full h-10'
                      : 'w-full h-10'
                  }
                  variant={tier.highlighted ? 'default' : 'outline'}
                >
                  {tier.ctaLabel}
                </Button>
                <ul className="space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
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
