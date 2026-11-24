import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

interface StatCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: LucideIcon;
  tone?: 'default' | 'accent' | 'medium' | 'hard' | 'link';
  className?: string;
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-fg',
  accent: 'text-accent',
  medium: 'text-medium',
  hard: 'text-hard',
  link: 'text-link',
};

export function StatCard({ label, value, sub, icon: Icon, tone = 'default', className }: StatCardProps) {
  return (
    <div className={cn('card px-4 py-3', className)}>
      <div className="flex items-center justify-between text-xs text-subtle">
        <span className="font-medium">{label}</span>
        {Icon && <Icon size={14} />}
      </div>
      <div className={cn('mono mt-1.5 text-2xl font-semibold leading-none tracking-tight', toneText[tone])}>{value}</div>
      {sub !== undefined && <div className="mt-1.5 text-xs text-subtle">{sub}</div>}
    </div>
  );
}
