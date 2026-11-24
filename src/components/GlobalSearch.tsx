import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { problems } from '../data/problems';
import { useProblemDrawer } from '../context/DrawerContext';
import { useProgress } from '../context/ProgressContext';
import { cn } from '../utils/cn';
import { topicName } from '../utils/stats';
import { DifficultyBadge } from './DifficultyBadge';
import { StatusBadge } from './StatusBadge';

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  if (!open) return null;
  return <SearchPanel onClose={onClose} />;
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const { open } = useProblemDrawer();
  const { progress } = useProgress();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return problems.filter((p) => progress[p.id]?.bookmarked).slice(0, 8);
    const starts: typeof problems = [];
    const contains: typeof problems = [];
    for (const p of problems) {
      const name = p.name.toLowerCase();
      if (name.startsWith(q)) starts.push(p);
      else if (name.includes(q) || p.id.toLowerCase() === q) contains.push(p);
      if (starts.length >= 30) break;
    }
    return [...starts, ...contains].slice(0, 30);
  }, [query, progress]);

  useEffect(() => {
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (id: string) => {
    onClose();
    open(id);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(0, results.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r) choose(r.id);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
      <div className="anim-fade-in absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={onClose} />
      <div
        className="anim-pop-in relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/50"
        role="dialog"
        aria-label="Search problems"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search size={15} className="text-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search problems by name…"
            className="h-11 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-subtle"
          />
          <span className="kbd">Esc</span>
        </div>
        <ul ref={listRef} className="max-h-[50vh] overflow-y-auto p-1.5">
          {results.length === 0 ? (
            <li className="px-3 py-8 text-center text-xs text-subtle">
              {query ? `No problems match "${query}"` : 'Type to search all problems. Bookmarks appear here.'}
            </li>
          ) : (
            results.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(p.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left',
                    i === active ? 'bg-surface-3' : 'hover:bg-surface-2',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] text-fg">{p.name}</div>
                    <div className="truncate text-[11px] text-subtle">
                      {p.platform} · {p.topics.slice(0, 3).map(topicName).join(', ')}
                    </div>
                  </div>
                  <StatusBadge status={progress[p.id]?.status ?? 'not_started'} className="hidden sm:inline-flex" />
                  <DifficultyBadge difficulty={p.difficulty} />
                  {i === active && <CornerDownLeft size={12} className="text-subtle" />}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
