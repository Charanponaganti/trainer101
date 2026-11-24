import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { Bookmark, BookmarkCheck, CalendarClock, Check, ExternalLink, Save, X } from 'lucide-react';
import { problemMap } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import type { WorkspaceField } from '../context/ProgressContext';
import type { Problem, ProblemProgress } from '../types';
import { cn } from '../utils/cn';
import { relativeDay, topicName } from '../utils/stats';
import { DifficultyBadge } from './DifficultyBadge';
import { REVISION_INTERVALS, StatusSelect } from './StatusSelect';

type Draft = Record<WorkspaceField, string>;

const FIELDS: WorkspaceField[] = [
  'notes',
  'approach',
  'bruteForce',
  'optimized',
  'timeComplexity',
  'spaceComplexity',
  'mistakes',
  'observations',
  'solutionLink',
  'revisionNotes',
  'code',
];

const draftFrom = (p: ProblemProgress): Draft => {
  const d = {} as Draft;
  for (const f of FIELDS) d[f] = p[f];
  return d;
};

interface ProblemDrawerProps {
  problemId: string | null;
  onClose: () => void;
}

export function ProblemDrawer({ problemId, onClose }: ProblemDrawerProps) {
  const problem = problemId ? problemMap[problemId] : undefined;

  useEffect(() => {
    if (!problemId) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [problemId, onClose]);

  if (!problemId || !problem) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="anim-fade-in absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      <aside
        className="anim-slide-in relative flex h-full w-full max-w-[640px] flex-col border-l border-border bg-surface shadow-2xl shadow-black/50"
        role="dialog"
        aria-label={`Workspace for ${problem.name}`}
      >
        <DrawerBody key={problem.id} problem={problem} onClose={onClose} />
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function DrawerBody({ problem, onClose }: { problem: Problem; onClose: () => void }) {
  const { getProgress, updateProgress, toggleBookmark, scheduleRevision, clearRevision, settings } = useProgress();
  const progress = getProgress(problem.id);
  const [draft, setDraft] = useState<Draft>(() => draftFrom(progress));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const dirty = useRef(false);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const flush = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    updateProgress(problem.id, draftRef.current);
    setSavedAt(new Date());
  }, [problem.id, updateProgress]);

  const flushRef = useRef(flush);
  flushRef.current = flush;

  // debounce autosave
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => flushRef.current(), 700);
    return () => clearTimeout(t);
  }, [draft]);

  // flush on unmount
  useEffect(
    () => () => {
      if (dirty.current) {
        dirty.current = false;
        updateProgress(problem.id, draftRef.current);
      }
    },
    [problem.id, updateProgress],
  );

  const set = (field: WorkspaceField, value: string) => {
    dirty.current = true;
    setDraft((d) => ({ ...d, [field]: value }));
  };

  const onCodeKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: en } = el;
      const value = el.value.slice(0, s) + '    ' + el.value.slice(en);
      set('code', value);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = s + 4;
      });
    }
  };

  const text = (field: WorkspaceField, placeholder: string, rows = 3) => (
    <textarea
      className="textarea"
      rows={rows}
      value={draft[field]}
      placeholder={placeholder}
      onChange={(e) => set(field, e.target.value)}
      onBlur={flush}
    />
  );

  const safeLink = /^https?:\/\//i.test(draft.solutionLink.trim()) ? draft.solutionLink.trim() : undefined;

  return (
    <>
      <header className="shrink-0 border-b border-border px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-subtle">
              <span>{problem.platform}</span>
              <span className="mono">{problem.id}</span>
              {problem.rating !== undefined && <span className="mono">{problem.rating}</span>}
            </div>
            <h2 className="text-base font-semibold leading-snug text-fg">{problem.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <DifficultyBadge difficulty={problem.difficulty} />
              {problem.topics.map((t) => (
                <span key={t} className="tag">
                  {topicName(t)}
                </span>
              ))}
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon shrink-0" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="w-44">
            <StatusSelect problemId={problem.id} block />
          </div>
          <button
            type="button"
            className={cn('btn', progress.bookmarked && 'border-link/40 text-link')}
            onClick={() => toggleBookmark(problem.id)}
          >
            {progress.bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            {progress.bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <a href={problem.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open problem <ExternalLink size={13} />
          </a>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {/* Revision */}
        <section className="rounded-lg border border-border-soft bg-surface-2/50 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
            <CalendarClock size={14} /> Revision schedule
            {progress.nextRevisionAt && (
              <span className="ml-auto text-subtle">
                Next: {format(parseISO(progress.nextRevisionAt), 'MMM d')} ({relativeDay(progress.nextRevisionAt)})
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {REVISION_INTERVALS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => scheduleRevision(problem.id, d)}
                className={cn('btn btn-sm mono', progress.revisionInterval === d && progress.nextRevisionAt && 'border-accent/50 text-accent')}
              >
                {d}d
              </button>
            ))}
            {progress.nextRevisionAt && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => clearRevision(problem.id)}>
                Clear
              </button>
            )}
          </div>
          <div className="mt-2 flex gap-4 text-[11px] text-subtle">
            <span>Revision count: {progress.revisionCount}</span>
            {progress.lastSolvedAt && <span>Last solved: {format(parseISO(progress.lastSolvedAt), 'MMM d, yyyy')}</span>}
            <span>Solve days: {progress.solvedDates.length}</span>
          </div>
        </section>

        <Field label="Approach">{text('approach', 'Key insight, pattern, data structure…')}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brute force">{text('bruteForce', 'Naive solution…')}</Field>
          <Field label="Optimized">{text('optimized', 'Better solution…')}</Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time complexity">
            <input
              className="input mono"
              value={draft.timeComplexity}
              placeholder="O(n log n)"
              onChange={(e) => set('timeComplexity', e.target.value)}
              onBlur={flush}
            />
          </Field>
          <Field label="Space complexity">
            <input
              className="input mono"
              value={draft.spaceComplexity}
              placeholder="O(n)"
              onChange={(e) => set('spaceComplexity', e.target.value)}
              onBlur={flush}
            />
          </Field>
        </div>
        <Field label="Mistakes">{text('mistakes', 'What went wrong?', 2)}</Field>
        <Field label="Observations">{text('observations', 'Patterns, edge cases, tricks…', 2)}</Field>
        <Field label="General notes">{text('notes', 'Anything else…', 2)}</Field>
        <Field label="Solution link">
          <div className="flex gap-2">
            <input
              className="input"
              value={draft.solutionLink}
              placeholder="https://…"
              onChange={(e) => set('solutionLink', e.target.value)}
              onBlur={flush}
            />
            {safeLink && (
              <a href={safeLink} target="_blank" rel="noopener noreferrer" className="btn btn-icon shrink-0" aria-label="Open solution link">
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </Field>
        <Field label="Revision notes">{text('revisionNotes', 'What to remember next time…', 2)}</Field>
        <Field label={`Code (${settings.defaultLanguage})`}>
          <textarea
            className="textarea mono text-[12.5px] leading-relaxed"
            rows={14}
            spellCheck={false}
            value={draft.code}
            placeholder={'// paste or write your solution here (stored locally, not executed)'}
            onChange={(e) => set('code', e.target.value)}
            onKeyDown={onCodeKey}
            onBlur={flush}
            style={{ whiteSpace: 'pre', overflowX: 'auto', tabSize: 4 }}
          />
        </Field>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-border px-5 py-3">
        <span className="flex items-center gap-1.5 text-xs text-subtle">
          {savedAt ? (
            <>
              <Check size={13} className="text-accent" /> Saved locally at {format(savedAt, 'HH:mm:ss')}
            </>
          ) : (
            'Changes are saved locally in your browser'
          )}
        </span>
        <button type="button" className="btn" onClick={flush}>
          <Save size={13} /> Save
        </button>
      </footer>
    </>
  );
}
