import type { Difficulty } from '@shared/types';

const STYLES: Record<Difficulty, string> = {
  easy: 'bg-easy/10 text-easy border-easy/20',
  moderate: 'bg-moderate/10 text-moderate border-moderate/20',
  hard: 'bg-hard/10 text-hard border-hard/20',
};

const LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Challenging',
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={
        'badge-difficulty inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ' +
        STYLES[level]
      }
    >
      [{LABEL[level]}]
    </span>
  );
}
