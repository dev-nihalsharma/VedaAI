'use client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { FaBell } from 'react-icons/fa6';

export function Topbar({ title, onBack }: { title?: string; onBack?: () => void }) {
  const user = useSelector((s: RootState) => s.auth.user);
  return (
    <header className="no-print sticky top-3 z-10 mx-3 mb-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm shrink-0"
            aria-label="Back"
          >
            ←
          </button>
        )}
        <span className="text-sm text-muted truncate">{title || 'Assignment'}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center" aria-label="Notifications">
          <FaBell />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
            {(user?.name || 'JD').split(' ').map((p) => p[0]).slice(0, 2).join('')}
          </div>
          <span className="text-sm hidden sm:inline">{user?.name || 'John Doe'}</span>
        </div>
      </div>
    </header>
  );
}
