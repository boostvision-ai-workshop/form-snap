'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DEFAULT_TIERS, type BillingCycle, type PricingTier } from '@/components/marketing/pricing-cards';

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CheckoutClient() {
  const router = useRouter();
  const params = useSearchParams();
  const planId = params.get('plan') ?? 'pro';
  const cycle = (params.get('cycle') ?? 'monthly') as BillingCycle;

  const tier = useMemo<PricingTier | undefined>(
    () => DEFAULT_TIERS.find((t) => t.id === planId),
    [planId],
  );

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!tier || tier.monthlyPrice === null || tier.monthlyPrice === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">Plan not available</h1>
        <p className="text-sm text-muted-foreground">
          The plan you&apos;re trying to check out isn&apos;t valid for self-serve billing.
        </p>
        <Button onClick={() => router.push('/pricing')}>Back to pricing</Button>
      </div>
    );
  }

  const price = cycle === 'yearly' ? tier.yearlyPrice! : tier.monthlyPrice;
  const totalLabel =
    cycle === 'yearly' ? `$${price * 12} billed yearly` : `$${price} billed monthly`;

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Light client-side validation — good enough for a demo.
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) {
      setError('Please enter a valid card number.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Expiry must be in MM/YY format.');
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setError('CVC must be 3 or 4 digits.');
      return;
    }
    if (cardName.trim().length < 2) {
      setError('Please enter the cardholder name.');
      return;
    }

    setProcessing(true);
    // Simulated network round-trip.
    await new Promise((resolve) => setTimeout(resolve, 900));
    router.push(`/checkout/success?plan=${tier!.id}&cycle=${cycle}`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Payment form */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Complete your subscription</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Secure checkout — your card is encrypted in transit.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-card)] p-6 space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on card</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="cc-name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    className="pl-9 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    className="font-mono"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    className="font-mono"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full h-11 btn-gradient text-base font-medium"
              >
                {processing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Processing…
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Lock className="size-4" />
                    Pay {totalLabel}
                  </span>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Demo mode — no real charge will be made.
              </p>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg shadow-[var(--shadow-card)] p-6 space-y-5 lg:sticky lg:top-20">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Order summary</h2>

            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">FormSnap {tier.name}</p>
              <p className="text-sm text-muted-foreground">{tier.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">
                  {cycle === 'yearly' ? 'Annual plan' : 'Monthly plan'}
                </span>
                <span className="text-sm font-medium text-foreground">${price}/mo</span>
              </div>
              {cycle === 'yearly' && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Billed annually</span>
                  <span className="text-sm font-medium text-foreground">${price * 12}/yr</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-3 border-t border-border">
                <span className="text-base font-semibold text-foreground">Due today</span>
                <span className="text-xl font-bold text-foreground">
                  ${cycle === 'yearly' ? price * 12 : price}
                </span>
              </div>
            </div>

            <ul className="space-y-2 pt-3 border-t border-border">
              {tier.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground pt-2 border-t border-border">
              Cancel any time from your dashboard. Prorated refunds for annual plans.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
