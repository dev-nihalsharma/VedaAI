'use client';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export function ProgressOverlay({ assignmentId }: { assignmentId: string }) {
  const job = useSelector((s: RootState) => s.jobs.byAssignment[assignmentId]);
  if (!job) return null;
  const isError = job.status === 'failed';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-soft">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${isError ? 'bg-hard' : 'bg-accent animate-pulse'}`} />
          <h3 className="font-semibold capitalize">{job.status.replace('_', ' ')}</h3>
        </div>
        <p className="text-sm text-muted mb-4">
          {job.message || (isError ? 'Generation failed' : 'AI is generating your question paper…')}
        </p>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${isError ? 'bg-hard' : 'bg-brand'} transition-all`}
            style={{ width: `${job.progress}%` }}
          />
        </div>
        <div className="text-xs text-muted text-right mt-1">{job.progress}%</div>
        {job.error && <div className="text-xs text-hard mt-3">{job.error}</div>}
      </div>
    </div>
  );
}
