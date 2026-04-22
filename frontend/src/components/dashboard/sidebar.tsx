'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from './sidebar-nav';
import { UserMenu } from './user-menu';
import {
  LayoutDashboard,
  FileText,
  Inbox,
  BarChart2,
  Plug,
  Webhook,
  Settings,
  CreditCard,
  Users,
  Activity,
} from 'lucide-react';

const primaryNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Forms', href: '/dashboard/forms', icon: FileText },
  { label: 'Submissions', href: '/dashboard/submissions', icon: Inbox },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
];

const workflowNav = [
  { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { label: 'Webhooks', href: '/dashboard/integrations/webhooks', icon: Webhook },
];

const workspaceNav = [
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Activity Log', href: '/dashboard/activity', icon: Activity },
];

export function Sidebar() {
  return (
    <div className="w-60 border-r bg-card flex flex-col h-screen shrink-0" style={{ borderColor: 'var(--sidebar-border)' }}>
      {/* Brand header */}
      <div className="h-14 flex items-center px-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        <Link href="/dashboard" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          <Image src="/form-snap.svg" alt="FormSnap logo" width={24} height={24} className="h-6 w-6" />
          <span className="text-sm font-semibold text-foreground">FormSnap</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {primaryNav.map((item) => (
            <SidebarNav key={item.href} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </nav>

        <Separator className="my-2 mx-3" />

        <div className="px-3 mb-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Workflows</p>
        </div>
        <nav className="px-3 space-y-1">
          {workflowNav.map((item) => (
            <SidebarNav key={item.href} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </nav>

        <Separator className="my-2 mx-3" />

        <div className="px-3 mb-1">
          <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Workspace</p>
        </div>
        <nav className="px-3 space-y-1">
          {workspaceNav.map((item) => (
            <SidebarNav key={item.href} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </nav>
      </ScrollArea>

      {/* User menu — pinned at bottom */}
      <div className="border-t p-3" style={{ borderColor: 'var(--sidebar-border)' }}>
        <UserMenu variant="sidebar" />
      </div>
    </div>
  );
}
