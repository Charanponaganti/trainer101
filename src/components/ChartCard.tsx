import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

export const CHART_COLORS = {
  easy: 'var(--easy)',
  medium: 'var(--medium)',
  hard: 'var(--hard)',
  accent: 'var(--accent)',
  link: 'var(--link)',
  grid: 'var(--border-soft)',
  axis: 'var(--subtle)',
};

export const SERIES_COLORS = ['#10b981', '#60a5fa', '#f59e0b', '#ef4444', '#a1a1aa', '#34d399', '#38bdf8', '#fbbf24'];

export const tooltipProps: {
  contentStyle: CSSProperties;
  itemStyle: CSSProperties;
  labelStyle: CSSProperties;
  cursor: { fill: string };
} = {
  contentStyle: {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    fontSize: 12,
    padding: '6px 10px',
    color: 'var(--fg)',
  },
  itemStyle: { color: 'var(--fg)', padding: 0 },
  labelStyle: { color: 'var(--muted)', marginBottom: 2 },
  cursor: { fill: 'color-mix(in srgb, var(--fg) 6%, transparent)' },
};

export const axisTick = { fill: 'var(--subtle)', fontSize: 11 };

interface ChartCardProps {
  title: string;
  subtitle?: ReactNode;
  height?: number;
  children: ReactElement;
  className?: string;
}

export function ChartCard({ title, subtitle, height = 220, children, className }: ChartCardProps) {
  return (
    <div className={`card ${className ?? ''}`}>
      <div className="card-header">
        <span>{title}</span>
        {subtitle && <span className="text-xs font-normal text-subtle">{subtitle}</span>}
      </div>
      <div className="p-3" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
