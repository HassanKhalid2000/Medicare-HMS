'use client';

import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/error-boundary';
import { useSession } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar
        userRole={session?.user?.role || 'admin'}
        user={session?.user ? {
          name: session.user.fullName,
          email: session.user.email,
        } : undefined}
      />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}