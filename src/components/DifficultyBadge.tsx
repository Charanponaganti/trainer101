import type { Difficulty } from '../types';
import { cn } from '../utils/cn';

const styles: Record<Difficulty, string> = {
  Easy: 'badge-easy',
  Medium: 'badge-medium',
  Hard: 'badge-hard',
};

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return <span className={cn('badge', styles[difficulty] ?? '', className)}>{difficulty}</span>;
}
