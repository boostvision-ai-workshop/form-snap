import type { Metadata } from 'next';
import { CreditCard } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Billing — FormSnap',
};

export default function BillingPage() {
  return (
    <ComingSoon
      title="Billing"
      description="Manage your plan, seats, and invoices"
      icon={CreditCard}
      bullets={[
        'Self-serve plan changes with proration',
        'Invoice history and receipt downloads',
        'Tax IDs and billing contacts',
      ]}
    />
  );
}
