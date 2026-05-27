'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Topbar } from '@/components/layout/Topbar';
import { EmptyState } from '@/components/assignments/EmptyState';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { useListAssignmentsQuery } from '@/store/api';
import { FaUsers, FaBrain, FaBook, FaHome } from 'react-icons/fa';

function DummyCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
      <div className="h-3 w-1/2 bg-gray-100 rounded mb-3" />
      <div className="font-medium text-sm mb-1">{title}</div>
      <div className="text-xs text-muted">{subtitle}</div>
    </div>
  );
}

function HomeTab() {
  return (
    <div className="px-4 sm:px-8 py-4">
      <h1 className="text-xl font-semibold mb-1">Home</h1>
      <p className="text-sm text-muted mb-6">Your dashboard overview.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[['Assignments Created', '12'], ['Students Reached', '340'], ['Avg. Score', '74%']].map(([label, val]) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
            <div className="text-2xl font-bold text-brand">{val}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>
      <h2 className="text-sm font-semibold mb-3">Recent Activity</h2>
      <div className="space-y-3">
        {['Physics Quiz — Grade 10', 'Math Test — Grade 8', 'Biology Assignment — Grade 11'].map((t) => (
          <DummyCard key={t} title={t} subtitle="Generated 2 days ago" />
        ))}
      </div>
    </div>
  );
}

function GroupsTab() {
  return (
    <div className="px-4 sm:px-8 py-4">
      <h1 className="text-xl font-semibold mb-1">My Groups</h1>
      <p className="text-sm text-muted mb-6">Manage your student groups.</p>
      <div className="space-y-3">
        {[
          ['Grade 10 – Science', '32 students'],
          ['Grade 8 – Mathematics', '28 students'],
          ['Grade 11 – Biology', '24 students'],
          ['Grade 9 – English', '30 students'],
        ].map(([name, count]) => (
          <div key={name} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{name}</div>
              <div className="text-xs text-muted mt-0.5">{count}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand text-sm">
              <FaUsers />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolkitTab() {
  return (
    <div className="px-4 sm:px-8 py-4">
      <h1 className="text-xl font-semibold mb-1">AI Teacher&apos;s Toolkit</h1>
      <p className="text-sm text-muted mb-6">AI-powered tools to assist your teaching.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          ['Question Generator', 'Create custom question papers in seconds.'],
          ['Lesson Planner', 'Generate structured lesson plans for any topic.'],
          ['Rubric Builder', 'Build grading rubrics tailored to your curriculum.'],
          ['Student Feedback', 'Produce personalised feedback reports automatically.'],
        ].map(([title, desc]) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent mb-3">
              <FaBrain />
            </div>
            <div className="font-medium text-sm mb-1">{title}</div>
            <div className="text-xs text-muted">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryTab() {
  return (
    <div className="px-4 sm:px-8 py-4">
      <h1 className="text-xl font-semibold mb-1">My Library</h1>
      <p className="text-sm text-muted mb-6">Saved question papers and resources.</p>
      <div className="space-y-3">
        {[
          ['Electricity & Magnetism — Grade 10', 'Physics · 20 questions'],
          ['Quadratic Equations — Grade 9', 'Mathematics · 15 questions'],
          ['Photosynthesis Deep Dive — Grade 11', 'Biology · 18 questions'],
          ['Mughal Empire — Grade 8', 'History · 12 questions'],
        ].map(([title, meta]) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{title}</div>
              <div className="text-xs text-muted mt-0.5">{meta}</div>
            </div>
            <FaBook className="text-gray-300 text-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [search, setSearch] = useState('');
  const { data, isLoading } = useListAssignmentsQuery();

  if (tab === 'home') return <><Topbar title="Home" /><HomeTab /></>;
  if (tab === 'groups') return <><Topbar title="My Groups" /><GroupsTab /></>;
  if (tab === 'toolkit') return <><Topbar title="AI Teacher's Toolkit" /><ToolkitTab /></>;
  if (tab === 'library') return <><Topbar title="My Library" /><LibraryTab /></>;

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

            <div className="hidden sm:flex justify-center mt-8">
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

      {/* Mobile FAB */}
      <button
        onClick={() => router.push('/assignments/new')}
        className="lg:hidden fixed bottom-[5.5rem] right-4 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] flex items-center justify-center text-2xl font-light"
        aria-label="Create assignment"
      >
        +
      </button>
    </>
  );
}
