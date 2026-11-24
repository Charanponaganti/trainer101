import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppData,
  AppSettings,
  PlannerEntry,
  ProblemProgress,
  ProblemStatus,
  RevisionInterval,
} from '../types';
import { clearStoredData, createDefaultData, DEFAULT_PROGRESS, loadData, normalizeData, saveData } from '../utils/storage';
import { addDaysStr, todayStr } from '../utils/stats';

export type WorkspaceField =
  | 'notes'
  | 'approach'
  | 'bruteForce'
  | 'optimized'
  | 'timeComplexity'
  | 'spaceComplexity'
  | 'mistakes'
  | 'observations'
  | 'solutionLink'
  | 'revisionNotes'
  | 'code';

export interface SetStatusOptions {
  interval?: RevisionInterval;
}

interface ProgressContextValue {
  data: AppData;
  progress: Record<string, ProblemProgress>;
  settings: AppSettings;
  planner: Record<string, PlannerEntry>;
  getProgress: (id: string) => ProblemProgress;
  updateProgress: (id: string, patch: Partial<ProblemProgress>) => void;
  setStatus: (id: string, status: ProblemStatus, options?: SetStatusOptions) => void;
  toggleBookmark: (id: string) => void;
  scheduleRevision: (id: string, interval: RevisionInterval) => void;
  clearRevision: (id: string) => void;
  completeRevision: (id: string, nextInterval?: RevisionInterval) => void;
  updateWorkspace: (id: string, field: WorkspaceField, value: string) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  updatePlanner: (date: string, patch: Partial<PlannerEntry>) => void;
  resetProgress: () => void;
  importData: (data: AppData) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

function base(prev: ProblemProgress | undefined): ProblemProgress {
  return prev ?? { ...DEFAULT_PROGRESS, solvedDates: [] };
}

function applyStatus(prev: ProblemProgress, status: ProblemStatus, interval?: RevisionInterval): ProblemProgress {
  const now = new Date().toISOString();
  const today = todayStr();
  const next: ProblemProgress = { ...prev, status };

  if (status === 'not_started') return next;
  next.lastAttemptedAt = now;

  if (status === 'solved') {
    next.lastSolvedAt = now;
    next.solvedDates = prev.solvedDates.includes(today) ? prev.solvedDates : [...prev.solvedDates, today];
    if (interval) {
      next.revisionInterval = interval;
      next.nextRevisionAt = addDaysStr(today, interval);
    } else if (prev.status === 'needs_revision') {
      next.nextRevisionAt = undefined;
    }
  } else if (status === 'needs_revision') {
    const chosen: RevisionInterval = interval ?? prev.revisionInterval ?? 3;
    next.revisionInterval = chosen;
    next.nextRevisionAt = addDaysStr(today, chosen);
    if (prev.status !== 'needs_revision') next.revisionCount = prev.revisionCount + 1;
  }
  return next;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', data.settings.theme === 'light');
    document.documentElement.classList.toggle('dark', data.settings.theme === 'dark');
  }, [data.settings.theme]);

  const mutate = useCallback((id: string, fn: (prev: ProblemProgress) => ProblemProgress) => {
    setData((d) => ({ ...d, progress: { ...d.progress, [id]: fn(base(d.progress[id])) } }));
  }, []);

  const getProgress = useCallback((id: string): ProblemProgress => data.progress[id] ?? DEFAULT_PROGRESS, [data.progress]);

  const updateProgress = useCallback(
    (id: string, patch: Partial<ProblemProgress>) => mutate(id, (p) => ({ ...p, ...patch })),
    [mutate],
  );

  const setStatus = useCallback(
    (id: string, status: ProblemStatus, options?: SetStatusOptions) =>
      mutate(id, (p) => applyStatus(p, status, options?.interval)),
    [mutate],
  );

  const toggleBookmark = useCallback(
    (id: string) => mutate(id, (p) => ({ ...p, bookmarked: !p.bookmarked })),
    [mutate],
  );

  const scheduleRevision = useCallback(
    (id: string, interval: RevisionInterval) =>
      mutate(id, (p) => ({ ...p, revisionInterval: interval, nextRevisionAt: addDaysStr(todayStr(), interval) })),
    [mutate],
  );

  const clearRevision = useCallback(
    (id: string) => mutate(id, (p) => ({ ...p, nextRevisionAt: undefined })),
    [mutate],
  );

  const completeRevision = useCallback(
    (id: string, nextInterval?: RevisionInterval) =>
      mutate(id, (p) => {
        const today = todayStr();
        const next: ProblemProgress = {
          ...p,
          status: 'solved',
          lastSolvedAt: new Date().toISOString(),
          lastAttemptedAt: new Date().toISOString(),
          solvedDates: p.solvedDates.includes(today) ? p.solvedDates : [...p.solvedDates, today],
        };
        if (nextInterval) {
          next.revisionInterval = nextInterval;
          next.nextRevisionAt = addDaysStr(today, nextInterval);
        } else {
          next.nextRevisionAt = undefined;
        }
        return next;
      }),
    [mutate],
  );

  const updateWorkspace = useCallback(
    (id: string, field: WorkspaceField, value: string) => mutate(id, (p) => ({ ...p, [field]: value })),
    [mutate],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...patch } })),
    [],
  );

  const updatePlanner = useCallback((date: string, patch: Partial<PlannerEntry>) => {
    setData((d) => {
      const prev: PlannerEntry = d.planner[date] ?? {
        date,
        notes: '',
        target: d.settings.dailyTarget,
        completed: 0,
        sessionMinutes: 0,
      };
      return { ...d, planner: { ...d.planner, [date]: { ...prev, ...patch, date } } };
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearStoredData();
    setData((d) => ({ ...createDefaultData(), settings: d.settings }));
  }, []);

  const importData = useCallback((incoming: AppData): boolean => {
    const clean = normalizeData(incoming);
    if (!clean) return false;
    setData(clean);
    return true;
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      progress: data.progress,
      settings: data.settings,
      planner: data.planner,
      getProgress,
      updateProgress,
      setStatus,
      toggleBookmark,
      scheduleRevision,
      clearRevision,
      completeRevision,
      updateWorkspace,
      updateSettings,
      updatePlanner,
      resetProgress,
      importData,
    }),
    [
      data,
      getProgress,
      updateProgress,
      setStatus,
      toggleBookmark,
      scheduleRevision,
      clearRevision,
      completeRevision,
      updateWorkspace,
      updateSettings,
      updatePlanner,
      resetProgress,
      importData,
    ],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside <ProgressProvider>');
  return ctx;
}
