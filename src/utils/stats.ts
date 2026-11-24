import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from 'date-fns';
import { problemMap, problems } from '../data/problems';
import { topicMap, topics } from '../data/topics';
import type { Difficulty, Problem, ProblemProgress, Sheet, Topic } from '../types';

export type ProgressMap = Record<string, ProblemProgress>;

export const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
export const DIFFICULTY_ORDER: Record<Difficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

/* ---------- date helpers ---------- */
export const fmtDate = (d: Date): string => format(d, 'yyyy-MM-dd');
export const todayStr = (): string => fmtDate(new Date());
export const addDaysStr = (date: string, days: number): string => fmtDate(addDays(parseISO(date), days));
export const topicName = (id: string): string => topicMap[id]?.name ?? id;

/* ---------- basic counts ---------- */
export const isSolved = (p: ProblemProgress | undefined): boolean => p?.status === 'solved';

export function solvedCount(progress: ProgressMap, list: Problem[] = problems): number {
  let n = 0;
  for (const p of list) if (progress[p.id]?.status === 'solved') n++;
  return n;
}

export interface Ratio {
  solved: number;
  total: number;
  percent: number;
}

export function ratio(solved: number, total: number): Ratio {
  return { solved, total, percent: total === 0 ? 0 : Math.round((solved / total) * 100) };
}

export function listProgress(progress: ProgressMap, ids: string[]): Ratio {
  let total = 0;
  let solved = 0;
  for (const id of ids) {
    if (!problemMap[id]) continue;
    total++;
    if (progress[id]?.status === 'solved') solved++;
  }
  return ratio(solved, total);
}

export function sheetProgress(sheet: Sheet, progress: ProgressMap): Ratio {
  return listProgress(progress, sheet.problemIds);
}

export function resolveProblems(ids: string[]): Problem[] {
  const out: Problem[] = [];
  for (const id of ids) {
    const p = problemMap[id];
    if (p) out.push(p);
  }
  return out;
}

/* ---------- date counts, streaks, heatmap ---------- */
export type DateCounts = Record<string, number>;

export function dateCounts(progress: ProgressMap): DateCounts {
  const counts: DateCounts = {};
  for (const p of Object.values(progress)) {
    for (const d of p.solvedDates) counts[d] = (counts[d] ?? 0) + 1;
  }
  return counts;
}

export function computeStreaks(counts: DateCounts): { current: number; longest: number; activeDays: number } {
  const dates = Object.keys(counts)
    .filter((d) => counts[d] > 0)
    .sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of dates) {
    if (prev && differenceInCalendarDays(parseISO(d), parseISO(prev)) === 1) run++;
    else run = 1;
    if (run > longest) longest = run;
    prev = d;
  }
  const today = todayStr();
  let cursor = (counts[today] ?? 0) > 0 ? today : addDaysStr(today, -1);
  let current = 0;
  while ((counts[cursor] ?? 0) > 0) {
    current++;
    cursor = addDaysStr(cursor, -1);
  }
  return { current, longest, activeDays: dates.length };
}

export interface HeatCell {
  date: string;
  count: number;
  future: boolean;
}

export interface HeatmapData {
  weeks: HeatCell[][];
  monthLabels: { index: number; label: string }[];
  total: number;
}

export function buildHeatmap(counts: DateCounts, weekCount = 53): HeatmapData {
  const today = new Date();
  const start = startOfWeek(subWeeks(today, weekCount - 1), { weekStartsOn: 0 });
  const end = endOfWeek(today, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const todayKey = fmtDate(today);
  const weeks: HeatCell[][] = [];
  let total = 0;
  days.forEach((d, i) => {
    const key = fmtDate(d);
    const count = counts[key] ?? 0;
    if (key <= todayKey) total += count;
    const w = Math.floor(i / 7);
    if (!weeks[w]) weeks[w] = [];
    weeks[w].push({ date: key, count, future: key > todayKey });
  });
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, i) => {
    const m = parseISO(w[0].date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ index: i, label: format(parseISO(w[0].date), 'MMM') });
      lastMonth = m;
    }
  });
  return { weeks, monthLabels, total };
}

export const heatLevel = (count: number): number => (count <= 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4);

/* ---------- difficulty / topic / platform ---------- */
export interface DifficultyStat {
  difficulty: Difficulty;
  solved: number;
  total: number;
  percent: number;
}

export function difficultyStats(progress: ProgressMap, list: Problem[] = problems): DifficultyStat[] {
  return DIFFICULTIES.map((difficulty) => {
    const subset = list.filter((p) => p.difficulty === difficulty);
    const solved = solvedCount(progress, subset);
    return { difficulty, solved, total: subset.length, percent: ratio(solved, subset.length).percent };
  });
}

export interface TopicStat {
  topic: Topic;
  solved: number;
  total: number;
  percent: number;
  easy: number;
  medium: number;
  hard: number;
  solvedEasy: number;
  solvedMedium: number;
  solvedHard: number;
}

export function problemsByTopic(): Record<string, Problem[]> {
  const map: Record<string, Problem[]> = {};
  for (const p of problems) {
    for (const t of p.topics) (map[t] ??= []).push(p);
  }
  return map;
}

const topicIndex = problemsByTopic();

export function topicProblems(topicId: string): Problem[] {
  return topicIndex[topicId] ?? [];
}

export function topicStat(topic: Topic, progress: ProgressMap): TopicStat {
  const list = topicProblems(topic.id);
  const stat: TopicStat = {
    topic,
    solved: 0,
    total: list.length,
    percent: 0,
    easy: 0,
    medium: 0,
    hard: 0,
    solvedEasy: 0,
    solvedMedium: 0,
    solvedHard: 0,
  };
  for (const p of list) {
    const solved = progress[p.id]?.status === 'solved';
    if (solved) stat.solved++;
    if (p.difficulty === 'Easy') {
      stat.easy++;
      if (solved) stat.solvedEasy++;
    } else if (p.difficulty === 'Medium') {
      stat.medium++;
      if (solved) stat.solvedMedium++;
    } else {
      stat.hard++;
      if (solved) stat.solvedHard++;
    }
  }
  stat.percent = ratio(stat.solved, stat.total).percent;
  return stat;
}

export function allTopicStats(progress: ProgressMap): TopicStat[] {
  return [...topics].sort((a, b) => a.order - b.order).map((t) => topicStat(t, progress));
}

export interface GroupStat {
  name: string;
  solved: number;
  total: number;
  percent: number;
}

export function platformStats(progress: ProgressMap): GroupStat[] {
  const map = new Map<string, { solved: number; total: number }>();
  for (const p of problems) {
    const e = map.get(p.platform) ?? { solved: 0, total: 0 };
    e.total++;
    if (progress[p.id]?.status === 'solved') e.solved++;
    map.set(p.platform, e);
  }
  return [...map.entries()].map(([name, e]) => ({ name, ...e, percent: ratio(e.solved, e.total).percent }));
}

/* ---------- time series ---------- */
export interface DayPoint {
  date: string;
  label: string;
  count: number;
}

export function lastNDays(counts: DateCounts, n: number): DayPoint[] {
  const out: DayPoint[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const key = fmtDate(d);
    out.push({ date: key, label: n <= 7 ? format(d, 'EEE') : format(d, 'MMM d'), count: counts[key] ?? 0 });
  }
  return out;
}

export function monthlyProgress(counts: DateCounts, months = 6): { label: string; count: number; total: number }[] {
  const out: { label: string; count: number; total: number }[] = [];
  const now = new Date();
  let running = 0;
  for (let i = months - 1; i >= 0; i--) {
    const start = startOfMonth(subMonths(now, i));
    const prefix = format(start, 'yyyy-MM');
    let count = 0;
    for (const [d, c] of Object.entries(counts)) if (d.startsWith(prefix)) count += c;
    running += count;
    out.push({ label: format(start, 'MMM'), count, total: running });
  }
  // add everything before the window so the cumulative line is absolute
  const firstPrefix = format(startOfMonth(subMonths(now, months - 1)), 'yyyy-MM');
  let before = 0;
  for (const [d, c] of Object.entries(counts)) if (d.slice(0, 7) < firstPrefix) before += c;
  return out.map((o) => ({ ...o, total: o.total + before }));
}

export function weeklyBuckets(counts: DateCounts, weeks = 12): { label: string; count: number }[] {
  const out: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    let count = 0;
    for (let d = 0; d < 7; d++) count += counts[fmtDate(addDays(start, d))] ?? 0;
    out.push({ label: format(start, 'MMM d'), count });
  }
  return out;
}

export function cumulativeSeries(counts: DateCounts, days = 90): { label: string; total: number }[] {
  const start = subDays(new Date(), days - 1);
  const startKey = fmtDate(start);
  let running = 0;
  for (const [d, c] of Object.entries(counts)) if (d < startKey) running += c;
  const out: { label: string; total: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    running += counts[fmtDate(d)] ?? 0;
    out.push({ label: format(d, 'MMM d'), total: running });
  }
  return out;
}

export function weekdayDistribution(counts: DateCounts): { label: string; count: number }[] {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const arr = names.map((label) => ({ label, count: 0 }));
  for (const [d, c] of Object.entries(counts)) arr[parseISO(d).getDay()].count += c;
  return arr;
}

export function sumRange(counts: DateCounts, from: string, to: string): number {
  let n = 0;
  for (const [d, c] of Object.entries(counts)) if (d >= from && d <= to) n += c;
  return n;
}

export function thisWeekRange(): { from: string; to: string } {
  const now = new Date();
  return {
    from: fmtDate(startOfWeek(now, { weekStartsOn: 1 })),
    to: fmtDate(endOfWeek(now, { weekStartsOn: 1 })),
  };
}

export function thisMonthPrefix(): string {
  return format(new Date(), 'yyyy-MM');
}

/* ---------- revision ---------- */
export interface RevisionItem {
  problem: Problem;
  progress: ProblemProgress;
  /** days overdue (positive) or until due (negative) */
  daysOverdue: number;
}

export interface RevisionQueues {
  overdue: RevisionItem[];
  dueToday: RevisionItem[];
  upcoming: RevisionItem[];
  frequent: RevisionItem[];
}

export function revisionQueues(progress: ProgressMap): RevisionQueues {
  const today = todayStr();
  const overdue: RevisionItem[] = [];
  const dueToday: RevisionItem[] = [];
  const upcoming: RevisionItem[] = [];
  const frequent: RevisionItem[] = [];
  for (const [id, p] of Object.entries(progress)) {
    const problem = problemMap[id];
    if (!problem) continue;
    if (p.nextRevisionAt) {
      const diff = differenceInCalendarDays(parseISO(today), parseISO(p.nextRevisionAt));
      const item: RevisionItem = { problem, progress: p, daysOverdue: diff };
      if (diff > 0) overdue.push(item);
      else if (diff === 0) dueToday.push(item);
      else upcoming.push(item);
    }
    if (p.revisionCount >= 2) frequent.push({ problem, progress: p, daysOverdue: 0 });
  }
  overdue.sort((a, b) => b.daysOverdue - a.daysOverdue);
  dueToday.sort((a, b) => DIFFICULTY_ORDER[b.problem.difficulty] - DIFFICULTY_ORDER[a.problem.difficulty]);
  upcoming.sort((a, b) => b.daysOverdue - a.daysOverdue);
  frequent.sort((a, b) => b.progress.revisionCount - a.progress.revisionCount);
  return { overdue, dueToday, upcoming, frequent };
}

/* ---------- recommendation / recency ---------- */
export function recommendedUnsolved(progress: ProgressMap, sheetIds: string[], limit = 6): Problem[] {
  const seen = new Set<string>();
  const out: Problem[] = [];
  for (const sid of sheetIds) {
    for (const p of problems) {
      if (out.length >= limit) return out;
      if (!p.sheetIds.includes(sid) || seen.has(p.id)) continue;
      const status = progress[p.id]?.status ?? 'not_started';
      if (status === 'solved') continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

export function recentlyWorked(progress: ProgressMap, limit = 6): { problem: Problem; progress: ProblemProgress }[] {
  const items: { problem: Problem; progress: ProblemProgress; at: string }[] = [];
  for (const [id, p] of Object.entries(progress)) {
    const problem = problemMap[id];
    if (!problem) continue;
    const at = [p.lastAttemptedAt, p.lastSolvedAt].filter(Boolean).sort().pop();
    if (at) items.push({ problem, progress: p, at });
  }
  items.sort((a, b) => b.at.localeCompare(a.at));
  return items.slice(0, limit);
}

export function bookmarkedProblems(progress: ProgressMap): Problem[] {
  const out: Problem[] = [];
  for (const [id, p] of Object.entries(progress)) {
    if (p.bookmarked && problemMap[id]) out.push(problemMap[id]);
  }
  return out;
}

export function relativeDay(date: string): string {
  const diff = differenceInCalendarDays(parseISO(date), new Date());
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  return diff > 0 ? `in ${diff}d` : `${-diff}d ago`;
}
