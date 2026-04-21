'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen">
        <div className="hidden md:block">
          <Sidebar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar isCollapsed={false} onToggleCollapse={() => setIsMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
