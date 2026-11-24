import { useProgress } from '../context/ProgressContext';
import type { RevisionInterval } from '../types';
import { cn } from '../utils/cn';

export const REVISION_INTERVALS: RevisionInterval[] = [1, 3, 7, 14, 30];

interface AttemptToggleProps {
  problemId: string;
  className?: string;
  /** wider control for drawer */
  block?: boolean;
}

/**
 * Manual attempt tracking only: Unattempted ↔ Attempted.
 * Solved state comes from LeetCode sync and is shown as a badge.
 */
export function AttemptToggle({ problemId, className, block }: AttemptToggleProps) {
  const { getProgress, setStatus } = useProgress();
  const { status } = getProgress(problemId);
  const solved = status === 'solved';
  const attempted = status === 'attempted' || status === 'needs_revision' || solved;

  if (solved) {
    return (
      <span
        className={cn(
          'chip chip-solved inline-flex',
          block && 'w-full justify-center py-1.5',
          className,
        )}
        title="Marked solved via LeetCode sync"
      >
        <span className="chip-dot" />
        Solved
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex rounded-md border border-border bg-surface-2 p-0.5 text-[12px]',
        block && 'w-full',
        className,
      )}
      role="group"
      aria-label="Attempt status"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={cn(
          'flex-1 rounded px-2 py-1 transition-colors',
          !attempted ? 'bg-surface-3 text-fg' : 'text-subtle hover:text-fg',
        )}
        onClick={() => setStatus(problemId, 'not_started')}
      >
        Unattempted
      </button>
      <button
        type="button"
        className={cn(
          'flex-1 rounded px-2 py-1 transition-colors',
          attempted ? 'bg-medium/20 text-medium' : 'text-subtle hover:text-fg',
        )}
        onClick={() => setStatus(problemId, 'attempted')}
      >
        Attempted
      </button>
    </div>
  );
}
