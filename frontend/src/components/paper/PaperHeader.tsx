import type { PaperMeta } from '@shared/types';

export function PaperHeader({ meta }: { meta: PaperMeta }) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold">{meta.schoolName}</h2>
      <div className="text-sm">Subject: {meta.subject}</div>
      <div className="text-sm">Class: {meta.className}</div>
      <div className="flex items-center justify-between mt-4 text-sm">
        <span>Time Allowed: {meta.timeAllowed}</span>
        <span>Maximum Marks: {meta.maxMarks}</span>
      </div>
      <p className="text-sm mt-3 text-left">{meta.generalInstructions}</p>
    </div>
  );
}
