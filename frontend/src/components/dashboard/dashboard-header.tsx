'use client';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from './user-menu';

interface DashboardHeaderProps {
  onMobileMenuOpen: () => void;
}

export function DashboardHeader({ onMobileMenuOpen }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-background flex items-center justify-between h-16 px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 md:block hidden" />
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
