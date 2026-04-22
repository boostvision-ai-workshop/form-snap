import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutSuccessClient } from './success-client';

export const metadata: Metadata = {
  title: 'Payment successful — FormSnap',
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="p-12" />}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
