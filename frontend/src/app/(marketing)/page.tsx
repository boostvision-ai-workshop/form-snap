import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { HeroSection } from '@/components/marketing/hero-section';
import { TrustStrip } from '@/components/marketing/trust-strip';
import { FeatureGrid } from '@/components/marketing/feature-grid';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <TrustStrip />

      <FeatureGrid />

      <Separator />

      {/* CTA Footer */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold">Start building for free</h2>
          <p className="mt-4 opacity-90">
            No credit card needed. Set up in under two minutes.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-11 px-8 rounded-lg btn-gradient border-0 text-sm font-medium transition-opacity hover:opacity-90 mt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Get started free
          </Link>
        </div>
      </section>
    </>
  );
}
