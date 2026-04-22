import type { Metadata } from 'next';
import { PricingCards } from '@/components/marketing/pricing-cards';

export const metadata: Metadata = {
  title: 'Pricing — FormSnap',
  description: 'Simple, transparent pricing. Start free, upgrade when you outgrow it.',
};

export default function PricingPage() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Start free. Upgrade when you outgrow it. Cancel anytime.
          </p>
        </div>

        <PricingCards />

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include unlimited team members on the dashboard and a 99.9% uptime SLA.
        </p>
      </div>
    </section>
  );
}
