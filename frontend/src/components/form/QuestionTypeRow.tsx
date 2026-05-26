'use client';
import type { QuestionTypeKind, QuestionTypeSpec } from '@shared/types';

const TYPE_OPTIONS: { value: QuestionTypeKind; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short', label: 'Short Questions' },
  { value: 'long', label: 'Long Questions' },
  { value: 'diagram', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
];

function Stepper({
  value,
  onChange,
  label,
  min = 1,
  max = 50,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex-1">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-9 text-muted"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          className="flex-1 bg-transparent text-center text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-9 text-muted"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function QuestionTypeRow({
  value,
  onChange,
  onRemove,
  takenTypes,
}: {
  value: QuestionTypeSpec;
  onChange: (v: QuestionTypeSpec) => void;
  onRemove: () => void;
  takenTypes: QuestionTypeKind[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-3">
      <div className="flex items-center gap-3 mb-3">
        <select
          value={value.type}
          onChange={(e) => onChange({ ...value, type: e.target.value as QuestionTypeKind })}
          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
        >
          {TYPE_OPTIONS.map((o) => (
            <option
              key={o.value}
              value={o.value}
              disabled={takenTypes.includes(o.value) && o.value !== value.type}
            >
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-muted hover:text-hard w-8 h-8 flex items-center justify-center"
          aria-label="Remove row"
        >
          ✕
        </button>
      </div>
      <div className="flex gap-3">
        <Stepper
          label="No. of Questions"
          value={value.count}
          onChange={(v) => onChange({ ...value, count: v })}
        />
        <Stepper
          label="Marks"
          value={value.marks}
          onChange={(v) => onChange({ ...value, marks: v })}
        />
      </div>
    </div>
  );
}
