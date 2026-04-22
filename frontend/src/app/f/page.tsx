import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PublicFormClient } from './public-form-client';

export const metadata: Metadata = {
  title: 'Submit — FormSnap',
};

export default function PublicFormPage() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <PublicFormClient />
    </Suspense>
  );
}
