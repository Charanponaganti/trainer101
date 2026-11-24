import type { ReactNode } from 'react';
import { useProblemDrawer } from '../context/DrawerContext';
import { useProgress } from '../context/ProgressContext';
import type { Problem } from '../types';
import { DifficultyBadge } from './DifficultyBadge';
import { StatusBadge } from './StatusBadge';

export interface MiniItem {
  problem: Problem;
  right?: ReactNode;
}

interface ProblemMiniListProps {
  items: MiniItem[];
  emptyText?: string;
  showStatus?: boolean;
}

export function ProblemMiniList({ items, emptyText = 'Nothing here yet.', showStatus = false }: ProblemMiniListProps) {
  const { open } = useProblemDrawer();
  const { getProgress } = useProgress();
  if (items.length === 0) return <div className="px-4 py-6 text-center text-xs text-subtle">{emptyText}</div>;
  return (
    <ul className="divide-y divide-border-soft">
      {items.map(({ problem, right }) => (
        <li key={problem.id}>
          <button
            type="button"
            onClick={() => open(problem.id)}
            className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-2"
          >
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg">{problem.name}</span>
            {showStatus && <StatusBadge status={getProgress(problem.id).status} className="hidden sm:inline-flex" />}
            {right}
            <DifficultyBadge difficulty={problem.difficulty} />
          </button>
        </li>
      ))}
    </ul>
  );
}
