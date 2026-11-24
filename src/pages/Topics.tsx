import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { useProgress } from '../context/ProgressContext';
import type { Topic } from '../types';
import { allTopicStats } from '../utils/stats';

const LEVELS: { id: Topic['level']; label: string; hint: string }[] = [
  { id: 'beginner', label: 'Beginner', hint: 'Foundations everything else builds on' },
  { id: 'intermediate', label: 'Intermediate', hint: 'Core interview patterns' },
  { id: 'advanced', label: 'Advanced', hint: 'Harder structures and algorithms' },
];

export function Topics() {
  const { progress } = useProgress();
  const stats = useMemo(() => allTopicStats(progress), [progress]);

  return (
    <div>
      <PageHeader title="Topic Roadmap" description="Work from beginner to advanced. Numbers show problems solved out of those tagged with each topic." />
      <div className="space-y-8">
        {LEVELS.map((level) => {
          const items = stats.filter((s) => s.topic.level === level.id);
          if (items.length === 0) return null;
          const solved = items.reduce((a, s) => a + s.solved, 0);
          const total = items.reduce((a, s) => a + s.total, 0);
          return (
            <section key={level.id}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-fg">{level.label}</h2>
                  <p className="text-xs text-subtle">{level.hint}</p>
                </div>
                <span className="mono text-xs text-subtle">
                  {solved}/{total}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((s) => (
                  <Link
                    key={s.topic.id}
                    to={`/topics/${s.topic.id}`}
                    className="card group p-3.5 transition-colors hover:border-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <span className="mono flex h-5 w-6 shrink-0 items-center justify-center rounded bg-surface-2 text-[10px] text-subtle">
                        {s.topic.order}
                      </span>
                      <h3 className="min-w-0 flex-1 truncate text-[13px] font-semibold text-fg">{s.topic.name}</h3>
                      <ChevronRight size={14} className="text-subtle transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="mt-1.5 line-clamp-2 min-h-[2rem] text-xs text-muted">{s.topic.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="mono text-fg">
                        {s.solved}
                        <span className="text-subtle">/{s.total}</span>
                      </span>
                      <span className="mono flex gap-2 text-[11px]">
                        <span className="text-easy">{s.easy}</span>
                        <span className="text-medium">{s.medium}</span>
                        <span className="text-hard">{s.hard}</span>
                      </span>
                    </div>
                    <ProgressBar value={s.percent} className="mt-1.5" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
