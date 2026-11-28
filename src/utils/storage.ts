import type {
  AppData,
  AppSettings,
  PlannerEntry,
  ProblemProgress,
  ProblemStatus,
  RevisionInterval,
  ThemeMode,
} from '../types';

export const STORAGE_KEY = 'placement-os-v1';
export const DATA_VERSION = 1;

export const defaultSettings: AppSettings = {
  theme: 'dark',
  defaultLanguage: 'C++',
  dailyTarget: 3,
  weeklyTarget: 15,
  leetcodeUsername: '',
  leetcodeAutoSync: true,
  codeforcesHandle: '',
  codeforcesAutoSync: true,
};

export const DEFAULT_PROGRESS: ProblemProgress = {
  status: 'not_started',
  bookmarked: false,
  notes: '',
  approach: '',
  bruteForce: '',
  optimized: '',
  timeComplexity: '',
  spaceComplexity: '',
  mistakes: '',
  observations: '',
  solutionLink: '',
  revisionNotes: '',
  code: '',
  revisionCount: 0,
  solvedDates: [],
};

export function createDefaultProgress(): ProblemProgress {
  return { ...DEFAULT_PROGRESS, solvedDates: [] };
}

export function createDefaultData(): AppData {
  return {
    version: DATA_VERSION,
    progress: {},
    settings: { ...defaultSettings },
    planner: {},
  };
}

const STATUSES: ProblemStatus[] = ['not_started', 'attempted', 'solved', 'needs_revision', 'bookmarked'];
const INTERVALS: RevisionInterval[] = [1, 3, 7, 14, 30];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v.length > 0 ? v : undefined);

export function normalizeProgress(raw: unknown): ProblemProgress {
  const base = createDefaultProgress();
  if (!isObj(raw)) return base;
  const status = STATUSES.includes(raw.status as ProblemStatus) ? (raw.status as ProblemStatus) : 'not_started';
  const interval = INTERVALS.includes(raw.revisionInterval as RevisionInterval)
    ? (raw.revisionInterval as RevisionInterval)
    : undefined;
  return {
    status,
    bookmarked: raw.bookmarked === true,
    notes: str(raw.notes),
    approach: str(raw.approach),
    bruteForce: str(raw.bruteForce),
    optimized: str(raw.optimized),
    timeComplexity: str(raw.timeComplexity),
    spaceComplexity: str(raw.spaceComplexity),
    mistakes: str(raw.mistakes),
    observations: str(raw.observations),
    solutionLink: str(raw.solutionLink),
    revisionNotes: str(raw.revisionNotes),
    code: str(raw.code),
    lastSolvedAt: optStr(raw.lastSolvedAt),
    lastAttemptedAt: optStr(raw.lastAttemptedAt),
    revisionCount: Math.max(0, Math.floor(num(raw.revisionCount))),
    nextRevisionAt: optStr(raw.nextRevisionAt),
    revisionInterval: interval,
    solvedDates: Array.isArray(raw.solvedDates)
      ? Array.from(new Set(raw.solvedDates.filter((d): d is string => typeof d === 'string')))
      : [],
  };
}

function normalizePlannerEntry(date: string, raw: unknown): PlannerEntry {
  const r = isObj(raw) ? raw : {};
  return {
    date: str(r.date, date),
    notes: str(r.notes),
    target: Math.max(0, Math.floor(num(r.target, defaultSettings.dailyTarget))),
    completed: Math.max(0, Math.floor(num(r.completed))),
    sessionMinutes: Math.max(0, Math.floor(num(r.sessionMinutes))),
  };
}

export function normalizeSettings(raw: unknown): AppSettings {
  const r = isObj(raw) ? raw : {};
  const theme: ThemeMode = r.theme === 'light' ? 'light' : 'dark';
  return {
    theme,
    defaultLanguage: str(r.defaultLanguage, defaultSettings.defaultLanguage) || defaultSettings.defaultLanguage,
    dailyTarget: Math.max(1, Math.floor(num(r.dailyTarget, defaultSettings.dailyTarget))),
    weeklyTarget: Math.max(1, Math.floor(num(r.weeklyTarget, defaultSettings.weeklyTarget))),
    leetcodeUsername: str(r.leetcodeUsername).replace(/^@/, '').slice(0, 40),
    leetcodeAutoSync: r.leetcodeAutoSync !== false,
    leetcodeLastSyncAt: optStr(r.leetcodeLastSyncAt),
    codeforcesHandle: str(r.codeforcesHandle).replace(/^@/, '').slice(0, 24),
    codeforcesAutoSync: r.codeforcesAutoSync !== false,
    codeforcesLastSyncAt: optStr(r.codeforcesLastSyncAt),
    codeforcesRating: typeof r.codeforcesRating === 'number' && Number.isFinite(r.codeforcesRating) ? r.codeforcesRating : undefined,
    codeforcesMaxRating:
      typeof r.codeforcesMaxRating === 'number' && Number.isFinite(r.codeforcesMaxRating) ? r.codeforcesMaxRating : undefined,
    codeforcesRank: optStr(r.codeforcesRank),
  };
}

/** Returns a sanitized AppData or null when the input is not a plausible AppData object. */
export function normalizeData(raw: unknown): AppData | null {
  if (!isObj(raw)) return null;
  if (!isObj(raw.progress)) return null;
  const progress: Record<string, ProblemProgress> = {};
  for (const [id, value] of Object.entries(raw.progress)) {
    progress[id] = normalizeProgress(value);
  }
  const planner: Record<string, PlannerEntry> = {};
  if (isObj(raw.planner)) {
    for (const [date, value] of Object.entries(raw.planner)) {
      planner[date] = normalizePlannerEntry(date, value);
    }
  }
  return {
    version: DATA_VERSION,
    progress,
    settings: normalizeSettings(raw.settings),
    planner,
  };
}

export function loadData(): AppData {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return createDefaultData();
    return normalizeData(JSON.parse(text)) ?? createDefaultData();
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable; ignore
  }
}

export function clearStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
