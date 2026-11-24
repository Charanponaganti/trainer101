import { useMemo, useState } from 'react';
import { addDays, format, parseISO, startOfWeek } from 'date-fns';
import { CalendarDays, Target } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ProblemMiniList } from '../components/ProblemMiniList';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { useProgress } from '../context/ProgressContext';
import {
  dateCounts,
  relativeDay,
  revisionQueues,
  sumRange,
  thisWeekRange,
  todayStr,
} from '../utils/stats';

export function Planner() {
  const { progress, settings, planner, updatePlanner, updateSettings } = useProgress();
  const today = todayStr();
  const [selected, setSelected] = useState(today);
  const counts = useMemo(() => dateCounts(progress), [progress]);
  const week = thisWeekRange();
  const weekCount = sumRange(counts, week.from, week.to);
  const todayCount = counts[today] ?? 0;
  const queues = useMemo(() => revisionQueues(progress), [progress]);

  const entry = planner[selected] ?? {
    date: selected,
    notes: '',
    target: settings.dailyTarget,
    completed: counts[selected] ?? 0,
    sessionMinutes: 0,
  };

  const weekDays = useMemo(() => {
    const start = startOfWeek(parseISO(today), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, 'yyyy-MM-dd');
      return { key, label: format(d, 'EEE'), day: format(d, 'd'), count: counts[key] ?? 0 };
    });
  }, [counts, today]);

  const upcomingRevisions = [...queues.overdue, ...queues.dueToday, ...queues.upcoming].slice(0, 8);

  return (
    <div>
      <PageHeader title="Study Planner" description="Daily targets, session notes, and upcoming revision schedule." />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Today"
          value={`${todayCount}/${settings.dailyTarget}`}
          icon={Target}
          tone={todayCount >= settings.dailyTarget ? 'accent' : 'default'}
          sub={<ProgressBar value={Math.min(100, Math.round((todayCount / settings.dailyTarget) * 100))} />}
        />
        <StatCard
          label="This week"
          value={`${weekCount}/${settings.weeklyTarget}`}
          icon={CalendarDays}
          tone={weekCount >= settings.weeklyTarget ? 'accent' : 'default'}
          sub={<ProgressBar value={Math.min(100, Math.round((weekCount / settings.weeklyTarget) * 100))} />}
        />
        <StatCard label="Daily target" value={settings.dailyTarget} />
        <StatCard label="Weekly target" value={settings.weeklyTarget} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card p-4 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">This week</h2>
            <div className="flex gap-2">
              <label className="flex items-center gap-1.5 text-xs text-muted">
                Daily
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="input w-16"
                  value={settings.dailyTarget}
                  onChange={(e) => updateSettings({ dailyTarget: Math.max(1, Number(e.target.value) || 1) })}
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-muted">
                Weekly
                <input
                  type="number"
                  min={1}
                  max={200}
                  className="input w-16"
                  value={settings.weeklyTarget}
                  onChange={(e) => updateSettings({ weeklyTarget: Math.max(1, Number(e.target.value) || 1) })}
                />
              </label>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const active = d.key === selected;
              const isToday = d.key === today;
              return (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => setSelected(d.key)}
                  className={`rounded-md border px-1 py-2 text-center transition-colors ${
                    active ? 'border-accent bg-accent/10' : 'border-border hover:border-subtle'
                  }`}
                >
                  <div className="text-[10px] uppercase text-subtle">{d.label}</div>
                  <div className={`mono text-sm font-semibold ${isToday ? 'text-accent' : ''}`}>{d.day}</div>
                  <div className="mono text-[10px] text-muted">{d.count}</div>
                </button>
              );
            })}
          </div>

          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
            Notes · {format(parseISO(selected), 'MMM d, yyyy')}
          </h3>
          <textarea
            className="input min-h-28 resize-y"
            placeholder="What did you focus on today? Topics, mistakes, energy…"
            value={entry.notes}
            onChange={(e) => updatePlanner(selected, { notes: e.target.value, completed: counts[selected] ?? 0 })}
          />

          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs text-muted">Session minutes</span>
            <input
              type="number"
              min={0}
              max={600}
              className="input w-32"
              value={entry.sessionMinutes}
              onChange={(e) => updatePlanner(selected, { sessionMinutes: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold">Upcoming revisions</h2>
          <ProblemMiniList
            items={upcomingRevisions.map((r) => ({
              problem: r.problem,
              right: (
                <span className="mono text-[11px] text-muted">
                  {r.progress.nextRevisionAt ? relativeDay(r.progress.nextRevisionAt) : '—'}
                </span>
              ),
            }))}
            emptyText="No revisions scheduled."
          />
        </section>
      </div>
    </div>
  );
}
