import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Bookmark, CalendarCheck, CheckCircle2, CircleDashed, Flame, RotateCcw, Target } from 'lucide-react';
import { ChartCard, CHART_COLORS, axisTick, tooltipProps } from '../components/ChartCard';
import { Heatmap } from '../components/Heatmap';
import { PageHeader } from '../components/PageHeader';
import { ProblemMiniList } from '../components/ProblemMiniList';
import type { MiniItem } from '../components/ProblemMiniList';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { problems } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import {
  allTopicStats,
  bookmarkedProblems,
  computeStreaks,
  dateCounts,
  difficultyStats,
  lastNDays,
  monthlyProgress,
  recentlyWorked,
  recommendedUnsolved,
  relativeDay,
  revisionQueues,
  solvedCount,
  sumRange,
  thisWeekRange,
  todayStr,
} from '../utils/stats';

export function Dashboard() {
  const { progress, settings } = useProgress();

  const counts = useMemo(() => dateCounts(progress), [progress]);
  const streaks = useMemo(() => computeStreaks(counts), [counts]);
  const solved = useMemo(() => solvedCount(progress), [progress]);
  const attempted = useMemo(
    () => Object.values(progress).filter((p) => p.status === 'attempted' || p.status === 'needs_revision').length,
    [progress],
  );
  const remaining = problems.length - solved;
  const completion = problems.length === 0 ? 0 : Math.round((solved / problems.length) * 100);
  const monthPrefix = format(new Date(), 'yyyy-MM');
  const monthCount = useMemo(
    () => Object.entries(counts).reduce((n, [d, c]) => (d.startsWith(monthPrefix) ? n + c : n), 0),
    [counts, monthPrefix],
  );
  const diff = useMemo(() => difficultyStats(progress), [progress]);
  const topicStats = useMemo(() => allTopicStats(progress), [progress]);
  const queues = useMemo(() => revisionQueues(progress), [progress]);
  const week = thisWeekRange();
  const today = todayStr();
  const todayCount = counts[today] ?? 0;
  const weekCount = sumRange(counts, week.from, week.to);
  const bookmarks = useMemo(() => bookmarkedProblems(progress), [progress]);
  const recent = useMemo(() => recentlyWorked(progress, 6), [progress]);
  const recommended = useMemo(() => recommendedUnsolved(progress, ['blind-75', 'neetcode-150'], 6), [progress]);
  const dueNow = queues.overdue.length + queues.dueToday.length;

  const diffData = diff.map((d) => ({ name: d.difficulty, value: d.solved, total: d.total }));
  const diffColor: Record<string, string> = { Easy: CHART_COLORS.easy, Medium: CHART_COLORS.medium, Hard: CHART_COLORS.hard };
  const hasSolves = solved > 0;

  const topicData = [...topicStats]
    .filter((t) => t.total > 0)
    .sort((a, b) => b.solved - a.solved || b.total - a.total)
    .slice(0, 8)
    .map((t) => ({ name: t.topic.name.length > 16 ? `${t.topic.name.slice(0, 15)}…` : t.topic.name, solved: t.solved, remaining: t.total - t.solved }));

  const weekly = lastNDays(counts, 7);
  const monthly = monthlyProgress(counts, 6);

  const recentItems: MiniItem[] = recent.map((r) => ({ problem: r.problem }));
  const revisionItems: MiniItem[] = [...queues.overdue, ...queues.dueToday].slice(0, 6).map((r) => ({
    problem: r.problem,
    right: <span className={`mono text-[11px] ${r.daysOverdue > 0 ? 'text-hard' : 'text-medium'}`}>{relativeDay(r.progress.nextRevisionAt ?? today)}</span>,
  }));

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${format(new Date(), 'EEEE, MMMM d')} · ${solved} of ${problems.length.toLocaleString()} problems solved`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total" value={problems.length.toLocaleString()} sub="in catalog" icon={CircleDashed} />
        <StatCard label="Solved" value={solved} sub={`${completion}% complete`} icon={CheckCircle2} tone="accent" />
        <StatCard label="Attempted" value={attempted} sub="in progress / revise" />
        <StatCard label="Remaining" value={remaining} sub="not solved yet" />
        <StatCard label="Streak" value={`${streaks.current}d`} sub={`Longest ${streaks.longest}d`} icon={Flame} tone={streaks.current > 0 ? 'medium' : 'default'} />
        <StatCard
          label="Revision due"
          value={dueNow}
          sub={queues.overdue.length > 0 ? `${queues.overdue.length} overdue` : 'on track'}
          icon={RotateCcw}
          tone={queues.overdue.length > 0 ? 'hard' : 'default'}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today" value={`${todayCount}/${settings.dailyTarget}`} sub="daily target" icon={Target} />
        <StatCard label="This week" value={`${weekCount}/${settings.weeklyTarget}`} sub="weekly target" icon={CalendarCheck} />
        <StatCard label="This month" value={monthCount} sub={format(new Date(), 'MMMM')} />
        <StatCard
          label="Difficulty"
          value={
            <span className="text-base">
              <span className="text-easy">{diff[0]?.solved ?? 0}E</span>
              {' · '}
              <span className="text-medium">{diff[1]?.solved ?? 0}M</span>
              {' · '}
              <span className="text-hard">{diff[2]?.solved ?? 0}H</span>
            </span>
          }
          sub="easy · medium · hard solved"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-header">Activity</div>
          <div className="card-body">
            <Heatmap counts={counts} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">Targets</div>
          <div className="card-body space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted">Today</span>
                <span className="mono text-fg">
                  {todayCount}/{settings.dailyTarget}
                </span>
              </div>
              <ProgressBar value={todayCount} max={settings.dailyTarget} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted">This week</span>
                <span className="mono text-fg">
                  {weekCount}/{settings.weeklyTarget}
                </span>
              </div>
              <ProgressBar value={weekCount} max={settings.weeklyTarget} tone="link" />
            </div>
            <div className="space-y-2.5 border-t border-border-soft pt-3">
              {diff.map((d) => (
                <div key={d.difficulty}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted">{d.difficulty}</span>
                    <span className="mono text-subtle">
                      {d.solved}/{d.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={d.solved}
                    max={d.total}
                    tone={d.difficulty === 'Easy' ? 'easy' : d.difficulty === 'Medium' ? 'medium' : 'hard'}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ChartCard title="Difficulty" subtitle="solved">
          {hasSolves ? (
            <PieChart>
              <Pie data={diffData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
                {diffData.map((d) => (
                  <Cell key={d.name} fill={diffColor[d.name]} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-subtle">Solve a problem to see the split</div>
          )}
        </ChartCard>
        <ChartCard title="Top topics" subtitle="solved / remaining">
          <BarChart data={topicData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={92} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="solved" stackId="a" fill={CHART_COLORS.accent} radius={[2, 0, 0, 2]} />
            <Bar dataKey="remaining" stackId="a" fill="var(--surface-3)" radius={[0, 2, 2, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Last 7 days" subtitle="solves">
          <BarChart data={weekly} margin={{ left: -24, right: 4, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="count" name="Solved" fill={CHART_COLORS.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Monthly progress" subtitle="cumulative">
          <LineChart data={monthly} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Line type="monotone" dataKey="total" name="Total solved" stroke={CHART_COLORS.link} strokeWidth={2} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="count" name="This month" stroke={CHART_COLORS.accent} strokeWidth={2} dot={{ r: 2.5 }} />
          </LineChart>
        </ChartCard>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-fg">Continue practicing</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <span>Recent</span>
          </div>
          <ProblemMiniList items={recentItems} showStatus emptyText="Problems you work on will show up here." />
        </div>
        <div className="card">
          <div className="card-header">
            <span className="flex items-center gap-1.5">
              <RotateCcw size={13} className="text-medium" /> Revision due
            </span>
            <Link to="/revision" className="text-xs font-normal text-link hover:underline">
              View all
            </Link>
          </div>
          <ProblemMiniList items={revisionItems} emptyText="Nothing due. Schedule revisions from any problem." />
        </div>
        <div className="card">
          <div className="card-header">
            <span className="flex items-center gap-1.5">
              <Bookmark size={13} className="text-link" /> Bookmarked
            </span>
            <Link to="/bookmarks" className="text-xs font-normal text-link hover:underline">
              View all
            </Link>
          </div>
          <ProblemMiniList
            items={bookmarks.slice(0, 6).map((p) => ({ problem: p }))}
            showStatus
            emptyText="Bookmark problems to find them quickly."
          />
        </div>
        <div className="card">
          <div className="card-header">
            <span>Recommended next</span>
            <span className="text-xs font-normal text-subtle">Blind 75 · NeetCode 150</span>
          </div>
          <ProblemMiniList items={recommended.map((p) => ({ problem: p }))} emptyText="You have cleared the recommended sheets." />
        </div>
      </div>
    </div>
  );
}
