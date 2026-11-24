import { useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, CalendarDays, Flame, Gauge, Trophy } from 'lucide-react';
import { ChartCard, CHART_COLORS, SERIES_COLORS, axisTick, tooltipProps } from '../components/ChartCard';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { StatCard } from '../components/StatCard';
import { companies } from '../data/companies';
import { sheets } from '../data/sheets';
import { useProgress } from '../context/ProgressContext';
import {
  allTopicStats,
  computeStreaks,
  cumulativeSeries,
  dateCounts,
  difficultyStats,
  listProgress,
  platformStats,
  sheetProgress,
  solvedCount,
  weekdayDistribution,
  weeklyBuckets,
} from '../utils/stats';

export function Analytics() {
  const { progress } = useProgress();
  const counts = useMemo(() => dateCounts(progress), [progress]);
  const streaks = useMemo(() => computeStreaks(counts), [counts]);
  const solved = useMemo(() => solvedCount(progress), [progress]);
  const diff = useMemo(() => difficultyStats(progress), [progress]);
  const topics = useMemo(() => allTopicStats(progress).filter((t) => t.total > 0), [progress]);
  const platforms = useMemo(() => platformStats(progress), [progress]);
  const cumulative = useMemo(() => cumulativeSeries(counts, 90), [counts]);
  const weekly = useMemo(() => weeklyBuckets(counts, 12), [counts]);
  const weekdays = useMemo(() => weekdayDistribution(counts), [counts]);

  const best = Math.max(0, ...Object.values(counts));
  const avg = streaks.activeDays > 0 ? (Object.values(counts).reduce((a, b) => a + b, 0) / streaks.activeDays).toFixed(1) : '0';
  const attempted = Object.values(progress).filter((p) => p.status !== 'not_started').length;
  const revising = Object.values(progress).filter((p) => p.status === 'needs_revision').length;

  const topicBars = topics.map((t) => ({
    name: t.topic.name.length > 14 ? `${t.topic.name.slice(0, 13)}…` : t.topic.name,
    Easy: t.solvedEasy,
    Medium: t.solvedMedium,
    Hard: t.solvedHard,
  }));

  const sheetRows = sheets
    .map((s) => ({ sheet: s, p: sheetProgress(s, progress) }))
    .filter((r) => r.p.total > 0)
    .sort((a, b) => b.p.percent - a.p.percent);
  const companyRows = companies
    .map((c) => ({ company: c, p: listProgress(progress, c.problemIds) }))
    .sort((a, b) => b.p.percent - a.p.percent);

  const platformPie = platforms.filter((p) => p.solved > 0);

  return (
    <div>
      <PageHeader title="Analytics" description="Trends and breakdowns across everything you have solved." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Solved" value={solved} sub={`${attempted} touched`} icon={Trophy} tone="accent" />
        <StatCard label="Active days" value={streaks.activeDays} sub={`${avg} per active day`} icon={CalendarDays} />
        <StatCard label="Best day" value={best} sub="solves in one day" icon={Activity} />
        <StatCard label="Longest streak" value={`${streaks.longest}d`} sub={`Current ${streaks.current}d`} icon={Flame} />
        <StatCard label="Needs revision" value={revising} icon={Gauge} tone={revising ? 'medium' : 'default'} className="col-span-2 lg:col-span-1" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Cumulative solved" subtitle="last 90 days" height={240}>
          <AreaChart data={cumulative} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="cum" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={14} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Area type="monotone" dataKey="total" name="Solved" stroke="#10b981" strokeWidth={2} fill="url(#cum)" />
          </AreaChart>
        </ChartCard>
        <ChartCard title="Weekly activity" subtitle="last 12 weeks" height={240}>
          <BarChart data={weekly} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} interval={1} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="count" name="Solved" fill={CHART_COLORS.link} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Difficulty" subtitle="solved vs total">
          <BarChart data={diff.map((d) => ({ name: d.difficulty, Solved: d.solved, Remaining: d.total - d.solved }))} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="Solved" stackId="a" fill={CHART_COLORS.accent} />
            <Bar dataKey="Remaining" stackId="a" fill="var(--surface-3)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
        <ChartCard title="Platforms" subtitle="solved">
          {platformPie.length > 0 ? (
            <PieChart>
              <Pie data={platformPie} dataKey="solved" nameKey="name" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none">
                {platformPie.map((_, i) => (
                  <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...tooltipProps} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
            </PieChart>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-subtle">No solves yet</div>
          )}
        </ChartCard>
        <ChartCard title="By weekday" subtitle="all time">
          <BarChart data={weekdays} margin={{ left: -24, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="label" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="count" name="Solved" fill={CHART_COLORS.accent} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard title="Topics by difficulty" subtitle="solved" height={300}>
          <BarChart data={topicBars} margin={{ left: -20, right: 8, top: 8, bottom: 24 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} interval={0} angle={-40} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipProps} />
            <Legend iconType="circle" iconSize={7} verticalAlign="top" wrapperStyle={{ fontSize: 11, color: 'var(--muted)' }} />
            <Bar dataKey="Easy" stackId="a" fill={CHART_COLORS.easy} />
            <Bar dataKey="Medium" stackId="a" fill={CHART_COLORS.medium} />
            <Bar dataKey="Hard" stackId="a" fill={CHART_COLORS.hard} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">Sheet completion</div>
          <ul className="max-h-[420px] space-y-3 overflow-y-auto p-4">
            {sheetRows.map(({ sheet, p }) => (
              <li key={sheet.id}>
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="truncate text-muted">{sheet.name}</span>
                  <span className="mono shrink-0 text-subtle">
                    {p.solved}/{p.total}
                  </span>
                </div>
                <ProgressBar value={p.percent} />
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-header">Company readiness</div>
          <ul className="max-h-[420px] space-y-3 overflow-y-auto p-4">
            {companyRows.map(({ company, p }) => (
              <li key={company.id}>
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="truncate text-muted">{company.name}</span>
                  <span className="mono shrink-0 text-subtle">
                    {p.solved}/{p.total}
                  </span>
                </div>
                <ProgressBar value={p.percent} tone="link" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
