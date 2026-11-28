import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  AppData,
  AppSettings,
  PlannerEntry,
  ProblemProgress,
  ProblemStatus,
  RevisionInterval,
} from '../types';
import { fetchCodeforcesSolved } from '../utils/codeforcesSync';
import { fetchLeetCodeSolved } from '../utils/leetcodeSync';
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

export interface SyncLeetCodeResult {
  ok: boolean;
  message: string;
  matchedCount?: number;
}

export interface SyncCodeforcesResult {
  ok: boolean;
  message: string;
  matchedCount?: number;
}

interface ProgressContextValue {
  data: AppData;
  progress: Record<string, ProblemProgress>;
  settings: AppSettings;
  planner: Record<string, PlannerEntry>;
  leetcodeSyncing: boolean;
  codeforcesSyncing: boolean;
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
  syncLeetCode: (usernameOverride?: string) => Promise<SyncLeetCodeResult>;
  syncCodeforces: (handleOverride?: string) => Promise<SyncCodeforcesResult>;
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

const AUTO_SYNC_MS = 3 * 60 * 1000;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [leetcodeSyncing, setLeetcodeSyncing] = useState(false);
  const [codeforcesSyncing, setCodeforcesSyncing] = useState(false);
  const lcSyncingRef = useRef(false);
  const cfSyncingRef = useRef(false);
  const settingsRef = useRef(data.settings);
  settingsRef.current = data.settings;

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

  const applySolvedIds = (progress: Record<string, ProblemProgress>, ids: string[], now: string, today: string) => {
    const next = { ...progress };
    for (const id of ids) {
      const prev = base(next[id]);
      if (prev.status === 'solved') {
        next[id] = {
          ...prev,
          lastSolvedAt: prev.lastSolvedAt ?? now,
          solvedDates: prev.solvedDates.includes(today) ? prev.solvedDates : [...prev.solvedDates, today],
        };
        continue;
      }
      next[id] = {
        ...prev,
        status: 'solved',
        lastSolvedAt: now,
        lastAttemptedAt: now,
        solvedDates: prev.solvedDates.includes(today) ? prev.solvedDates : [...prev.solvedDates, today],
      };
    }
    return next;
  };

  const syncLeetCode = useCallback(async (usernameOverride?: string): Promise<SyncLeetCodeResult> => {
    if (lcSyncingRef.current) return { ok: false, message: 'Sync already running.' };
    const username = (usernameOverride ?? settingsRef.current.leetcodeUsername).trim();
    if (!username) return { ok: false, message: 'Add your LeetCode username in Settings first.' };

    lcSyncingRef.current = true;
    setLeetcodeSyncing(true);
    try {
      const result = await fetchLeetCodeSolved(username);
      if (!result.ok) return { ok: false, message: result.error };

      const today = todayStr();
      const now = new Date().toISOString();
      setData((d) => ({
        ...d,
        progress: applySolvedIds(d.progress, result.matchedIds, now, today),
        settings: {
          ...d.settings,
          leetcodeUsername: result.username,
          leetcodeLastSyncAt: now,
        },
      }));

      return {
        ok: true,
        message: `Synced ${result.matchedCount} problem${result.matchedCount === 1 ? '' : 's'} from @${result.username} (${result.fetchedCount} recent ACs fetched).`,
        matchedCount: result.matchedCount,
      };
    } catch {
      return { ok: false, message: 'Sync failed. Check your network and try again.' };
    } finally {
      lcSyncingRef.current = false;
      setLeetcodeSyncing(false);
    }
  }, []);

  const syncCodeforces = useCallback(async (handleOverride?: string): Promise<SyncCodeforcesResult> => {
    if (cfSyncingRef.current) return { ok: false, message: 'Sync already running.' };
    const handle = (handleOverride ?? settingsRef.current.codeforcesHandle).trim();
    if (!handle) return { ok: false, message: 'Add your Codeforces handle in Settings or on this page first.' };

    cfSyncingRef.current = true;
    setCodeforcesSyncing(true);
    try {
      const result = await fetchCodeforcesSolved(handle);
      if (!result.ok) return { ok: false, message: result.error };

      const today = todayStr();
      const now = new Date().toISOString();
      setData((d) => ({
        ...d,
        progress: applySolvedIds(d.progress, result.matchedIds, now, today),
        settings: {
          ...d.settings,
          codeforcesHandle: result.handle,
          codeforcesLastSyncAt: now,
          codeforcesRating: result.rating,
          codeforcesMaxRating: result.maxRating,
          codeforcesRank: result.rank,
        },
      }));

      const ratingBit = result.rating !== undefined ? ` · rating ${result.rating}` : '';
      return {
        ok: true,
        message: `Synced ${result.matchedCount} catalog problem${result.matchedCount === 1 ? '' : 's'} from @${result.handle} (${result.fetchedCount} unique ACs)${ratingBit}.`,
        matchedCount: result.matchedCount,
      };
    } catch {
      return { ok: false, message: 'Codeforces sync failed. Check your network and try again.' };
    } finally {
      cfSyncingRef.current = false;
      setCodeforcesSyncing(false);
    }
  }, []);

  // Auto-sync while the app is open (polls every few minutes)
  useEffect(() => {
    const username = data.settings.leetcodeUsername.trim();
    if (!username || !data.settings.leetcodeAutoSync) return;

    const run = () => {
      void syncLeetCode(username);
    };

    const last = data.settings.leetcodeLastSyncAt ? Date.parse(data.settings.leetcodeLastSyncAt) : 0;
    if (!last || Date.now() - last > AUTO_SYNC_MS) run();

    const id = window.setInterval(run, AUTO_SYNC_MS);
    return () => window.clearInterval(id);
    // intentionally omit lastSyncAt so a successful sync does not restart the effect loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings.leetcodeUsername, data.settings.leetcodeAutoSync, syncLeetCode]);

  useEffect(() => {
    const handle = data.settings.codeforcesHandle.trim();
    if (!handle || !data.settings.codeforcesAutoSync) return;

    const run = () => {
      void syncCodeforces(handle);
    };

    const last = data.settings.codeforcesLastSyncAt ? Date.parse(data.settings.codeforcesLastSyncAt) : 0;
    if (!last || Date.now() - last > AUTO_SYNC_MS) run();

    const id = window.setInterval(run, AUTO_SYNC_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.settings.codeforcesHandle, data.settings.codeforcesAutoSync, syncCodeforces]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      progress: data.progress,
      settings: data.settings,
      planner: data.planner,
      leetcodeSyncing,
      codeforcesSyncing,
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
      syncLeetCode,
      syncCodeforces,
    }),
    [
      data,
      leetcodeSyncing,
      codeforcesSyncing,
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
      syncLeetCode,
      syncCodeforces,
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
