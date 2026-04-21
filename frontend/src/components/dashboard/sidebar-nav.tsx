'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarNavProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export function SidebarNav({ icon: Icon, label, href, isActive, isCollapsed }: SidebarNavProps) {
  return (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start transition-colors',
          isActive && 'bg-accent text-accent-foreground',
          !isActive && 'hover:bg-accent/50',
          isCollapsed && 'justify-center'
        )}
        title={isCollapsed ? label : undefined}
      >
        <Icon className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
        {!isCollapsed && <span className="transition-opacity duration-200">{label}</span>}
      </Button>
    </Link>
  );
}
