'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'border-r bg-background flex flex-col h-screen transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-center px-4 border-b">
        {isCollapsed ? (
          <span className="text-xl font-bold">MSA</span>
        ) : (
          <span className="text-lg font-semibold transition-opacity duration-200">Micro SaaS Agent</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <SidebarNav
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      {/* Collapse Toggle */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="w-full"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 mr-2" />
              <span className="text-sm transition-opacity duration-200">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
