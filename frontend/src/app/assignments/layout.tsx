'use client';
import { Sidebar } from '@/components/layout/Sidebar';
import { AuthGate } from '@/components/layout/AuthGate';

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex bg-page">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </AuthGate>
  );
}
