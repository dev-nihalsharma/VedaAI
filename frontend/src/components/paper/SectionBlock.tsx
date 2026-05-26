import type { PaperSection } from '@shared/types';
import { DifficultyBadge } from './DifficultyBadge';

export function SectionBlock({ section }: { section: PaperSection }) {
  return (
    <section className="mt-8">
      <h3 className="text-center font-semibold mb-2">Section {section.id}</h3>
      <div className="text-sm font-medium">{section.title}</div>
      <div className="text-xs text-muted italic mb-3">{section.instruction}</div>
      <ol className="space-y-1.5 text-sm list-decimal list-outside pl-5">
        {section.questions.map((q) => (
          <li key={q.id} className="leading-relaxed">
            <span className="mr-1.5"><DifficultyBadge level={q.difficulty} /></span>
            <span>{q.text}</span>
            <span className="text-muted"> [{q.marks} Mark{q.marks === 1 ? '' : 's'}]</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
