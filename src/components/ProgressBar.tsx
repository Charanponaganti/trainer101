import { cn } from '../utils/cn';

type Tone = 'accent' | 'easy' | 'medium' | 'hard' | 'link';

const toneClass: Record<Tone, string> = {
  accent: 'bg-accent',
  easy: 'bg-easy',
  medium: 'bg-medium',
  hard: 'bg-hard',
  link: 'bg-link',
};

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  className?: string;
  height?: number;
  label?: string;
}

export function ProgressBar({ value, max = 100, tone = 'accent', className, height = 4, label }: ProgressBarProps) {
  const pct = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('w-full overflow-hidden rounded-full bg-surface-3', className)}
      style={{ height }}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-300', toneClass[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
