import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import ErrorBoundary from '@/components/error-boundary';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
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