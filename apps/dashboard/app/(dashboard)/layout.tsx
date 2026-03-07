import DashboardShell from '@/components/layout/dashboard-shell';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell>
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 ml-64 overflow-auto p-8">
          {children}
        </main>
      </div>
    </DashboardShell>
  );
}