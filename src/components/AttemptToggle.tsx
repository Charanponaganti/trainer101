import { Check } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import type { RevisionInterval } from '../types';
import { cn } from '../utils/cn';

export const REVISION_INTERVALS: RevisionInterval[] = [1, 3, 7, 14, 30];

interface AttemptToggleProps {
  problemId: string;
  className?: string;
  /** show label beside the circle (drawer) */
  block?: boolean;
}

/**
 * Click the circle to mark Attempted (green). Click again for Unattempted.
 * Solved via LeetCode sync stays green with a check.
 */
export function AttemptToggle({ problemId, className, block }: AttemptToggleProps) {
  const { getProgress, setStatus } = useProgress();
  const { status } = getProgress(problemId);
  const solved = status === 'solved';
  const active = status === 'attempted' || status === 'needs_revision' || solved;

  const toggle = () => {
    setStatus(problemId, active ? 'not_started' : 'attempted');
  };

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggle();
      }}
      className={cn(
        'group inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        block && 'w-full',
        className,
      )}
      title={solved ? 'Solved on LeetCode' : active ? 'Mark unattempted' : 'Mark attempted'}
      aria-label={solved ? 'Solved' : active ? 'Attempted, click to mark unattempted' : 'Unattempted, click to mark attempted'}
      aria-pressed={active}
    >
      <span
        className={cn(
          'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          active
            ? 'border-easy bg-easy text-[#04130d]'
            : 'border-subtle bg-transparent group-hover:border-muted',
        )}
      >
        {active && <Check size={11} strokeWidth={3} />}
      </span>
      {block && (
        <span className={cn('text-[13px]', active ? 'text-easy' : 'text-subtle')}>
          {solved ? 'Solved' : active ? 'Attempted' : 'Unattempted'}
        </span>
      )}
    </button>
  );
}
