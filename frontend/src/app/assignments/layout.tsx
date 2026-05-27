'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { AuthGate } from '@/components/layout/AuthGate';

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex bg-page">
        <Sidebar />
        <div className="flex-1 min-w-0 pb-24 lg:pb-0">{children}</div>
      </div>
      <BottomNav />
    </AuthGate>
  );
}
