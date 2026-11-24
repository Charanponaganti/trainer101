import { useMemo } from 'react';
import { AlertTriangle, CalendarClock, Clock, RotateCcw } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemMiniList } from '../components/ProblemMiniList';
import type { MiniItem } from '../components/ProblemMiniList';
import { StatCard } from '../components/StatCard';
import { useProgress } from '../context/ProgressContext';
import { relativeDay, revisionQueues } from '../utils/stats';

export function Revision() {
  const { progress } = useProgress();
  const queues = useMemo(() => revisionQueues(progress), [progress]);

  const toItems = (items: typeof queues.overdue, showDue = true): MiniItem[] =>
    items.map((r) => ({
      problem: r.problem,
      right: showDue ? (
        <span className={`mono text-[11px] ${r.daysOverdue > 0 ? 'text-hard' : r.daysOverdue === 0 ? 'text-medium' : 'text-muted'}`}>
          {r.progress.nextRevisionAt ? relativeDay(r.progress.nextRevisionAt) : '—'}
        </span>
      ) : (
        <span className="mono text-[11px] text-muted">{r.progress.revisionCount}×</span>
      ),
    }));

  const empty =
    queues.overdue.length === 0 &&
    queues.dueToday.length === 0 &&
    queues.upcoming.length === 0 &&
    queues.frequent.length === 0;

  return (
    <div>
      <PageHeader
        title="Revision Center"
        description="Spaced revision for problems you marked to revisit. Overdue items are prioritized. Open a problem to mark Done or reschedule."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Overdue" value={queues.overdue.length} icon={AlertTriangle} tone={queues.overdue.length > 0 ? 'hard' : 'default'} />
        <StatCard label="Due today" value={queues.dueToday.length} icon={Clock} tone={queues.dueToday.length > 0 ? 'medium' : 'default'} />
        <StatCard label="Upcoming" value={queues.upcoming.length} icon={CalendarClock} />
        <StatCard label="Frequent fails" value={queues.frequent.length} icon={RotateCcw} />
      </div>

      {empty ? (
        <EmptyState
          icon={RotateCcw}
          title="Nothing to revise"
          description="Mark problems as Needs Revision or schedule an interval from a problem workspace."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="card overflow-hidden">
            <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold text-hard">Overdue</h2>
            <ProblemMiniList items={toItems(queues.overdue)} emptyText="You are caught up." showStatus />
          </section>
          <section className="card overflow-hidden">
            <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold text-medium">Due today</h2>
            <ProblemMiniList items={toItems(queues.dueToday)} emptyText="No revisions due today." showStatus />
          </section>
          <section className="card overflow-hidden">
            <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold">Upcoming</h2>
            <ProblemMiniList items={toItems(queues.upcoming.slice(0, 20))} emptyText="No upcoming revisions." showStatus />
          </section>
          <section className="card overflow-hidden">
            <h2 className="border-b border-border-soft px-4 py-3 text-sm font-semibold">Frequently revised</h2>
            <ProblemMiniList items={toItems(queues.frequent.slice(0, 20), false)} emptyText="No high-revision-count problems yet." showStatus />
          </section>
        </div>
      )}
    </div>
  );
}
