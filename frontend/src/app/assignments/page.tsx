'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { useListAssignmentsQuery } from '@/store/api';

export default function AssignmentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useListAssignmentsQuery();

  const filtered = (data || []).filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Assignment" />
      <div className="px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-easy" />
          <h1 className="text-xl font-semibold">Assignments</h1>
        </div>
        <p className="text-sm text-muted ml-5 mb-6">
          Manage and create assignments for your classes.
        </p>

        {isLoading ? (
          <div className="text-sm text-muted py-10 text-center">Loading…</div>
        ) : (data || []).length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm flex items-center gap-2">
                ▾ Filter By
              </button>
              <div className="flex-1 relative">
                <input
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/20"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((a) => (
                <AssignmentCard key={a._id} assignment={a} />
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push('/assignments/new')}
                className="bg-brand text-white rounded-full px-6 py-2.5 text-sm font-medium flex items-center gap-2"
              >
                <span>+</span> Create Assignment
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
