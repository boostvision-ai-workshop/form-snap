import type { Metadata } from 'next';
import { Inbox } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Submissions — FormSnap',
};

export default function SubmissionsPage() {
  return (
    <ComingSoon
      title="Submissions"
      description="Every response from every form, in one place"
      icon={Inbox}
      bullets={[
        'Cross-form inbox with unified filters and search',
        'Bulk actions — mark as read, archive, export',
        'Saved views and smart folders',
      ]}
    />
  );
}
