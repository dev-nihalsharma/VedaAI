'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Assignment } from '@shared/types';
import { useDeleteAssignmentMutation } from '@/store/api';

function fmt(d: string) {
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${dt.getFullYear()}`;
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'bg-easy/10 text-easy',
  queued: 'bg-moderate/10 text-moderate',
  processing: 'bg-moderate/10 text-moderate',
  generating: 'bg-moderate/10 text-moderate',
  saving: 'bg-moderate/10 text-moderate',
  failed: 'bg-hard/10 text-hard',
  draft: 'bg-gray-100 text-muted',
};

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [del] = useDeleteAssignmentMutation();

  return (
    <div
      className="bg-white rounded-2xl shadow-soft p-5 hover:shadow-md cursor-pointer relative"
      onClick={() => router.push(`/assignments/${assignment._id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold underline underline-offset-2 decoration-2 decoration-ink/80 truncate">
          {assignment.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="p-1 rounded hover:bg-gray-100"
          aria-label="More"
        >
          ⋮
        </button>
        {open && (
          <div
            className="absolute right-4 top-12 bg-white shadow-lg rounded-lg border border-gray-100 z-10 min-w-[140px] py-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => router.push(`/assignments/${assignment._id}`)}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              View Assignment
            </button>
            <button
              onClick={async () => {
                setOpen(false);
                if (confirm('Delete this assignment?')) {
                  await del(assignment._id);
                }
              }}
              className="block w-full text-left px-3 py-1.5 text-sm text-hard hover:bg-gray-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex gap-4 text-ink/80">
          <div>
            <span className="font-semibold">Assigned on</span> : {fmt(assignment.createdAt)}
          </div>
          <div>
            <span className="font-semibold">Due</span> : {fmt(assignment.dueDate)}
          </div>
        </div>
        <span
          className={
            'px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ' +
            (STATUS_COLOR[assignment.status] || 'bg-gray-100 text-muted')
          }
        >
          {assignment.status}
        </span>
      </div>
    </div>
  );
}
