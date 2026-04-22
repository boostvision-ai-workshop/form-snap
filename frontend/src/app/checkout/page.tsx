import { Suspense } from 'react';
import type { Metadata } from 'next';
import { CheckoutClient } from './checkout-client';

export const metadata: Metadata = {
  title: 'Checkout — FormSnap',
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12" />}>
      <CheckoutClient />
    </Suspense>
  );
}
