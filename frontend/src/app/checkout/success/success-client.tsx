'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Receipt, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DEFAULT_TIERS, type BillingCycle } from '@/components/marketing/pricing-cards';

export function CheckoutSuccessClient() {
  const params = useSearchParams();
  const planId = params.get('plan') ?? 'pro';
  const cycle = (params.get('cycle') ?? 'monthly') as BillingCycle;
  const tier = DEFAULT_TIERS.find((t) => t.id === planId);

  const price = tier
    ? cycle === 'yearly'
      ? tier.yearlyPrice! * 12
      : tier.monthlyPrice!
    : 0;

  // Generate a pseudo-receipt id and date once per mount.
  const [receiptId] = useState(
    () => `rcpt_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  );
  const [now] = useState(() =>
    new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-dialog)] p-10 space-y-6 text-center">
        <div className="flex items-center justify-center">
          <div
            className="flex items-center justify-center w-16 h-16 rounded-full"
            style={{ backgroundColor: 'var(--color-success-surface)', color: 'var(--color-success)' }}
          >
            <CheckCircle2 className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Payment successful</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Welcome to FormSnap <span className="font-medium text-foreground">{tier?.name ?? 'Pro'}</span>.
            A receipt has been sent to your email.
          </p>
        </div>

        <div className="bg-muted/50 border border-border rounded-md p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Receipt className="size-4 text-primary" />
            <span>Receipt</span>
          </div>
          <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="text-right font-mono text-foreground">{receiptId}</dd>
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-right text-foreground">{now}</dd>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="text-right text-foreground">
              {tier?.name ?? 'Pro'} ({cycle === 'yearly' ? 'Annual' : 'Monthly'})
            </dd>
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="text-right font-semibold text-foreground">
              ${price.toFixed(2)}
            </dd>
          </dl>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/dashboard">
            <Button className="h-10 px-6 btn-gradient w-full sm:w-auto">
              Go to dashboard
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button variant="outline" className="h-10 px-6 w-full sm:w-auto">
              View billing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
