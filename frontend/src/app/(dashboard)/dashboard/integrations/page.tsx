import type { Metadata } from 'next';
import { Plug } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Integrations — FormSnap',
};

export default function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrations"
      description="Connect FormSnap to the tools your team already uses"
      icon={Plug}
      bullets={[
        'Slack, Notion, Airtable, Google Sheets',
        'Zapier and Make recipes with one-click setup',
        'OAuth apps and per-form scopes',
      ]}
    />
  );
}
