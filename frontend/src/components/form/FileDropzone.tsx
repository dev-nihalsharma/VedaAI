'use client';
import { useRef, useState } from 'react';

export interface PickedFile {
  name: string;
  sizeBytes: number;
  mimeType: string;
}

export function FileDropzone({
  value,
  onChange,
}: {
  value: PickedFile | null;
  onChange: (f: PickedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function accept(f: File) {
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setError(null);
    onChange({ name: f.name, sizeBytes: f.size, mimeType: f.type });
  }

  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/60 p-6 text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) accept(f);
        }}
      >
        <div className="text-3xl text-muted mb-2">⬆</div>
        <div className="text-sm font-medium mb-1">Choose a file or drag &amp; drop it here</div>
        <div className="text-xs text-muted mb-3">PDF, JPEG, PNG, upto 10MB</div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) accept(f);
          }}
        />
        {value && (
          <div className="mt-3 text-xs text-ink/80 flex items-center justify-center gap-2">
            <span>📄 {value.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-muted hover:text-hard"
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}
        {error && <div className="mt-2 text-xs text-hard">{error}</div>}
      </div>
      <p className="text-xs text-muted text-center mt-1">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
