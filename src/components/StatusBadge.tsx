import type { ProblemStatus } from '../types';
import { cn } from '../utils/cn';

export const STATUS_LABEL: Record<ProblemStatus, string> = {
  not_started: 'Unattempted',
  attempted: 'Attempted',
  solved: 'Solved',
  needs_revision: 'Needs revision',
  bookmarked: 'Bookmarked',
};

const styles: Record<ProblemStatus, string> = {
  not_started: 'chip-notstarted',
  attempted: 'chip-attempted',
  solved: 'chip-solved',
  needs_revision: 'chip-revision',
  bookmarked: 'chip-bookmarked',
};

export function StatusBadge({ status, className }: { status: ProblemStatus; className?: string }) {
  return (
    <span className={cn('chip', styles[status] ?? 'chip-notstarted', className)}>
      <span className="chip-dot" />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
