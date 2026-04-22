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
        <div className="flex flex-col items-center gap-4 text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Choose the plan that&apos;s right for you. Start free, upgrade when you outgrow it.
          </p>
        </div>

        <PricingCards />

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
