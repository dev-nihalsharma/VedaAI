'use client';
import { useRouter } from 'next/navigation';

export function EmptyState() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-44 h-44 rounded-full bg-white/70 shadow-soft flex items-center justify-center mb-6">
        <svg width="86" height="86" viewBox="0 0 100 100" fill="none">
          <rect x="22" y="18" width="48" height="58" rx="4" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
          <line x1="30" y1="30" x2="58" y2="30" stroke="#d1d5db" strokeWidth="2" />
          <line x1="30" y1="40" x2="62" y2="40" stroke="#e5e7eb" strokeWidth="2" />
          <line x1="30" y1="50" x2="55" y2="50" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx="62" cy="60" r="14" stroke="#a78bfa" strokeWidth="3" fill="#fff" />
          <line x1="72" y1="70" x2="84" y2="82" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
          <path d="M55 53 L69 67 M69 53 L55 67" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold mb-2">No assignments yet</h2>
      <p className="text-sm text-muted max-w-md mb-6">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>
      <button
        onClick={() => router.push('/assignments/new')}
        className="bg-brand text-white rounded-full px-6 py-2.5 text-sm font-medium flex items-center gap-2 hover:opacity-90"
      >
        <span>+</span> Create Your First Assignment
      </button>
    </div>
  );
}
