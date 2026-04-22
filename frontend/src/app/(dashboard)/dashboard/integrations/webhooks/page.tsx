import type { Metadata } from 'next';
import { Webhook } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Webhooks — FormSnap',
};

export default function WebhooksPage() {
  return (
    <ComingSoon
      title="Webhooks"
      description="Stream submissions to your own HTTPS endpoints"
      icon={Webhook}
      bullets={[
        'Per-form endpoints with HMAC signing',
        'Retry with exponential backoff and DLQ',
        'Delivery logs with replay from the dashboard',
      ]}
    />
  );
}
