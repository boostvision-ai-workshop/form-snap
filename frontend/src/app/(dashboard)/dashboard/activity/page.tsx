import type { Metadata } from 'next';
import { Activity } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Activity Log — FormSnap',
};

export default function ActivityPage() {
  return (
    <ComingSoon
      title="Activity Log"
      description="An append-only audit trail for every action in your workspace"
      icon={Activity}
      bullets={[
        'Who changed what, when, and from where',
        'Filter by member, form, or event type',
        'Export to CSV for compliance reviews',
      ]}
    />
  );
}
