'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Topbar } from '@/components/layout/Topbar';
import { FileDropzone, PickedFile } from '@/components/form/FileDropzone';
import { QuestionTypeRow } from '@/components/form/QuestionTypeRow';
import { ProgressOverlay } from '@/components/form/ProgressOverlay';
import { useAssignmentSocket } from '@/hooks/useSocket';
import { useCreateAssignmentMutation } from '@/store/api';
import type { QuestionTypeKind, QuestionTypeSpec } from '@shared/types';
import type { RootState } from '@/store';

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('Quiz on Electricity');
  const [file, setFile] = useState<PickedFile | null>(null);
  const [dueDate, setDueDate] = useState(todayISO());
  const [rows, setRows] = useState<QuestionTypeSpec[]>([
    { type: 'mcq', count: 4, marks: 1 },
    { type: 'short', count: 3, marks: 2 },
  ]);
  const [instructions, setInstructions] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [create, { isLoading }] = useCreateAssignmentMutation();
  useAssignmentSocket(submittedId);

  const job = useSelector((s: RootState) =>
    submittedId ? s.jobs.byAssignment[submittedId] : null
  );

  useEffect(() => {
    if (job?.status === 'completed' && submittedId) {
      router.push(`/assignments/${submittedId}`);
    }
  }, [job?.status, submittedId, router]);

  const totals = useMemo(
    () => ({
      q: rows.reduce((s, r) => s + r.count, 0),
      m: rows.reduce((s, r) => s + r.count * r.marks, 0),
    }),
    [rows]
  );

  const taken: QuestionTypeKind[] = rows.map((r) => r.type);
  const allTypes: QuestionTypeKind[] = ['mcq', 'short', 'long', 'diagram', 'numerical'];

  function addRow() {
    const next = allTypes.find((t) => !taken.includes(t));
    if (!next) return;
    setRows([...rows, { type: next, count: 5, marks: 2 }]);
  }

  async function submit() {
    setFormError(null);
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!dueDate) {
      setFormError('Due date is required');
      return;
    }
    if (new Date(dueDate) < new Date(todayISO())) {
      setFormError('Due date cannot be in the past');
      return;
    }
    if (rows.length === 0) {
      setFormError('At least one question type is required');
      return;
    }
    if (rows.some((r) => r.count < 1 || r.marks < 1)) {
      setFormError('Counts and marks must be positive integers');
      return;
    }
    if (new Set(rows.map((r) => r.type)).size !== rows.length) {
      setFormError('Question types must be distinct');
      return;
    }
    if (totals.q > 100 || totals.m > 500) {
      setFormError('Limit: 100 questions / 500 marks');
      return;
    }
    try {
      const res = await create({
        title: title.trim(),
        dueDate: new Date(dueDate).toISOString(),
        questionTypes: rows,
        additionalInstructions: instructions.trim() || undefined,
        fileMeta: file || undefined,
      }).unwrap();
      setSubmittedId(res._id);
    } catch (err: any) {
      setFormError(err?.data?.error || 'Failed to create assignment');
    }
  }

  return (
    <>
      <Topbar title="Assignment" onBack={() => router.back()} />
      <div className="px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-easy" />
          <h1 className="text-xl font-semibold">Create Assignment</h1>
        </div>
        <p className="text-sm text-muted ml-5 mb-6">Set up a new assignment for your students.</p>

        <div className="bg-card rounded-2xl shadow-soft p-5 sm:p-8 max-w-3xl mx-auto">
          <h2 className="font-semibold">Assignment Details</h2>
          <p className="text-sm text-muted mb-5">Basic information about your assignment.</p>

          <label className="block mb-4">
            <span className="text-sm font-medium">Assignment Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <FileDropzone value={file} onChange={setFile} />

          <div className="mt-5 mb-4">
            <label className="block">
              <span className="text-sm font-medium">Due Date</span>
              <input
                type="date"
                value={dueDate}
                min={todayISO()}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>
          </div>

          <div className="mb-2">
            <span className="text-sm font-medium underline underline-offset-2">Question Type</span>
          </div>
          {rows.map((row, i) => (
            <QuestionTypeRow
              key={i}
              value={row}
              takenTypes={taken}
              onChange={(v) => {
                const next = [...rows];
                next[i] = v;
                setRows(next);
              }}
              onRemove={() => setRows(rows.filter((_, idx) => idx !== i))}
            />
          ))}
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 5}
            className="text-sm font-medium flex items-center gap-2 mt-1 disabled:opacity-40"
          >
            <span className="w-7 h-7 rounded-full bg-brand text-white flex items-center justify-center">+</span>
            Add Question Type
          </button>

          <div className="text-right text-sm mt-4 space-y-1">
            <div><span className="font-medium">Total Questions :</span> {totals.q}</div>
            <div><span className="font-medium">Total Marks :</span> {totals.m}</div>
          </div>

          <label className="block mt-5">
            <span className="text-sm font-medium underline underline-offset-2">
              Additional Information (For better output)
            </span>
            <textarea
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Generate a question paper for 3 hour exam duration…"
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          {formError && <div className="mt-3 text-sm text-hard">{formError}</div>}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white border border-gray-200 rounded-full px-5 py-2 text-sm flex items-center gap-2"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isLoading}
              className="bg-brand text-white rounded-full px-6 py-2 text-sm font-medium flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? 'Creating…' : 'Next →'}
            </button>
          </div>
        </div>
      </div>

      {submittedId && <ProgressOverlay assignmentId={submittedId} />}
    </>
  );
}
