'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/auth-guard';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop sidebar — fixed w-60 */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile sidebar — Sheet */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-60">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
