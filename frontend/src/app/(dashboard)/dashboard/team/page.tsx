import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { ComingSoon } from '@/components/dashboard/coming-soon';

export const metadata: Metadata = {
  title: 'Team — FormSnap',
};

export default function TeamPage() {
  return (
    <ComingSoon
      title="Team"
      description="Invite teammates and manage roles across your workspace"
      icon={Users}
      bullets={[
        'Role-based access (Owner / Admin / Editor / Viewer)',
        'Per-form sharing with external collaborators',
        'SCIM provisioning for Enterprise workspaces',
      ]}
    />
  );
}
