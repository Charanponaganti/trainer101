import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import type { ProblemStatus, RevisionInterval } from '../types';
import { cn } from '../utils/cn';
import { STATUS_LABEL, StatusBadge } from './StatusBadge';

export const REVISION_INTERVALS: RevisionInterval[] = [1, 3, 7, 14, 30];
const OPTIONS: ProblemStatus[] = ['not_started', 'attempted', 'solved', 'needs_revision'];

interface StatusSelectProps {
  problemId: string;
  className?: string;
  /** render as full-width button with caret (drawer) */
  block?: boolean;
}

export function StatusSelect({ problemId, className, block }: StatusSelectProps) {
  const { getProgress, setStatus } = useProgress();
  const status = getProgress(problemId).status;
  const [open, setOpen] = useState(false);
  const [pickInterval, setPickInterval] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const close = useCallback(() => {
    setOpen(false);
    setPickInterval(false);
  }, []);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuH = pickInterval ? 120 : 150;
    const top = r.bottom + 4 + menuH > window.innerHeight ? Math.max(8, r.top - menuH - 4) : r.bottom + 4;
    setPos({ top, left: Math.min(r.left, window.innerWidth - 200) });
  }, [open, pickInterval]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open, close]);

  const choose = (s: ProblemStatus) => {
    if (s === 'needs_revision') {
      setPickInterval(true);
      return;
    }
    setStatus(problemId, s);
    close();
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          setPickInterval(false);
        }}
        className={cn(
          'inline-flex items-center gap-1 rounded-md',
          block && 'w-full justify-between border border-border bg-surface-2 px-2 py-1 hover:bg-surface-3',
          className,
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <StatusBadge status={status} className={block ? 'border-transparent bg-transparent' : undefined} />
        <ChevronDown size={12} className="text-subtle" />
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            onClick={(e) => e.stopPropagation()}
            className="anim-pop-in fixed z-[80] w-48 rounded-lg border border-border bg-surface-2 p-1 shadow-xl shadow-black/40"
            style={{ top: pos.top, left: pos.left }}
          >
            {!pickInterval ? (
              OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="menuitem"
                  onClick={() => choose(s)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] text-fg hover:bg-surface-3"
                >
                  <span>{STATUS_LABEL[s]}</span>
                  {status === s && <Check size={13} className="text-accent" />}
                </button>
              ))
            ) : (
              <div className="p-1.5">
                <div className="mb-2 text-xs text-muted">Revisit in how many days?</div>
                <div className="flex gap-1">
                  {REVISION_INTERVALS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setStatus(problemId, 'needs_revision', { interval: d });
                        close();
                      }}
                      className="btn btn-sm mono flex-1 px-0"
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
