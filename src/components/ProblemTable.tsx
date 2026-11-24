import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Bookmark, BookmarkCheck, Check, ChevronLeft, ChevronRight, ExternalLink, Search, X } from 'lucide-react';
import { sheets } from '../data/sheets';
import { cfLadders } from '../data/codeforces';
import { topicMap } from '../data/topics';
import { useProblemDrawer } from '../context/DrawerContext';
import { useProgress } from '../context/ProgressContext';
import type { Problem, ProblemStatus } from '../types';
import { cn } from '../utils/cn';
import { DIFFICULTY_ORDER, topicName } from '../utils/stats';
import { DifficultyBadge } from './DifficultyBadge';
import { EmptyState } from './EmptyState';
import { StatusSelect } from './StatusSelect';

export type FilterKey = 'difficulty' | 'status' | 'topic' | 'platform' | 'sheet' | 'company' | 'rating';
export type SortKey = 'default' | 'name' | 'difficulty' | 'platform' | 'status' | 'rating';

export interface TableFilters {
  difficulty: string;
  status: string;
  topic: string;
  platform: string;
  sheet: string;
  company: string;
  rating: string;
}

const EMPTY_FILTERS: TableFilters = {
  difficulty: '',
  status: '',
  topic: '',
  platform: '',
  sheet: '',
  company: '',
  rating: '',
};

const STATUS_ORDER: Record<ProblemStatus, number> = {
  needs_revision: 0,
  attempted: 1,
  not_started: 2,
  bookmarked: 3,
  solved: 4,
};

interface ProblemTableProps {
  problems: Problem[];
  filterKeys?: FilterKey[];
  initialFilters?: Partial<TableFilters>;
  initialSort?: { key: SortKey; dir: 'asc' | 'desc' };
  pageSize?: number;
  showRating?: boolean;
  emptyTitle?: string;
  searchPlaceholder?: string;
}

const PAGE_SIZES = [25, 50, 100];

export function ProblemTable({
  problems,
  filterKeys = ['difficulty', 'status', 'topic', 'platform'],
  initialFilters,
  initialSort = { key: 'default', dir: 'asc' },
  pageSize: initialPageSize = 25,
  showRating = false,
  emptyTitle = 'No problems match these filters',
  searchPlaceholder = 'Search problems…',
}: ProblemTableProps) {
  const { progress, toggleBookmark, setStatus } = useProgress();
  const { open } = useProblemDrawer();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<TableFilters>({ ...EMPTY_FILTERS, ...initialFilters });
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const options = useMemo(() => {
    const topicIds = new Set<string>();
    const platforms = new Set<string>();
    const sheetIds = new Set<string>();
    const companySet = new Set<string>();
    for (const p of problems) {
      p.topics.forEach((t) => topicIds.add(t));
      platforms.add(p.platform);
      p.sheetIds.forEach((s) => sheetIds.add(s));
      p.companies?.forEach((c) => companySet.add(c));
    }
    return {
      topics: [...topicIds].sort((a, b) => (topicMap[a]?.order ?? 99) - (topicMap[b]?.order ?? 99)),
      platforms: [...platforms].sort(),
      sheets: sheets.filter((s) => sheetIds.has(s.id)),
      companies: [...companySet].sort(),
    };
  }, [problems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const [rMin, rMax] = filters.rating ? filters.rating.split('-').map(Number) : [0, 0];
    let list = problems.filter((p) => {
      if (filters.difficulty && p.difficulty !== filters.difficulty) return false;
      if (filters.topic && !p.topics.includes(filters.topic)) return false;
      if (filters.platform && p.platform !== filters.platform) return false;
      if (filters.sheet && !p.sheetIds.includes(filters.sheet)) return false;
      if (filters.company && !p.companies?.includes(filters.company)) return false;
      if (filters.rating && (p.rating === undefined || p.rating < rMin || p.rating > rMax)) return false;
      if (filters.status) {
        const pr = progress[p.id];
        if (filters.status === 'bookmarked') {
          if (!pr?.bookmarked) return false;
        } else if ((pr?.status ?? 'not_started') !== filters.status) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.id} ${p.tags?.join(' ') ?? ''} ${p.topics.map(topicName).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sort.key !== 'default') {
      const dir = sort.dir === 'asc' ? 1 : -1;
      const status = (p: Problem) => STATUS_ORDER[progress[p.id]?.status ?? 'not_started'];
      list = [...list].sort((a, b) => {
        let r = 0;
        switch (sort.key) {
          case 'name':
            r = a.name.localeCompare(b.name);
            break;
          case 'difficulty':
            r = DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty];
            break;
          case 'platform':
            r = a.platform.localeCompare(b.platform);
            break;
          case 'rating':
            r = (a.rating ?? 0) - (b.rating ?? 0);
            break;
          case 'status':
            r = status(a) - status(b);
            break;
        }
        return r * dir;
      });
    }
    return list;
  }, [problems, filters, query, sort, progress]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const activeFilters = Object.values(filters).filter(Boolean).length + (query ? 1 : 0);

  const setFilter = (key: keyof TableFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : { key: 'default', dir: 'asc' }) : { key, dir: 'asc' }));
    setPage(1);
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? sort.dir === 'asc' ? <ArrowUp size={11} className="ml-1 inline" /> : <ArrowDown size={11} className="ml-1 inline" /> : null;

  const has = (k: FilterKey) => filterKeys.includes(k);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-soft p-3">
        <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input
            className="input pl-8"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {has('difficulty') && (
          <select className="select !w-auto" value={filters.difficulty} onChange={(e) => setFilter('difficulty', e.target.value)} aria-label="Difficulty">
            <option value="">All difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        )}
        {has('status') && (
          <select className="select !w-auto" value={filters.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Status">
            <option value="">All statuses</option>
            <option value="not_started">Not started</option>
            <option value="attempted">Attempted</option>
            <option value="solved">Solved</option>
            <option value="needs_revision">Needs revision</option>
            <option value="bookmarked">Bookmarked</option>
          </select>
        )}
        {has('topic') && (
          <select className="select !w-auto max-w-[170px]" value={filters.topic} onChange={(e) => setFilter('topic', e.target.value)} aria-label="Topic">
            <option value="">All topics</option>
            {options.topics.map((t) => (
              <option key={t} value={t}>
                {topicName(t)}
              </option>
            ))}
          </select>
        )}
        {has('platform') && options.platforms.length > 1 && (
          <select className="select !w-auto" value={filters.platform} onChange={(e) => setFilter('platform', e.target.value)} aria-label="Platform">
            <option value="">All platforms</option>
            {options.platforms.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        )}
        {has('sheet') && (
          <select className="select !w-auto max-w-[170px]" value={filters.sheet} onChange={(e) => setFilter('sheet', e.target.value)} aria-label="Sheet">
            <option value="">All sheets</option>
            {options.sheets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}
        {has('company') && (
          <select className="select !w-auto max-w-[150px]" value={filters.company} onChange={(e) => setFilter('company', e.target.value)} aria-label="Company">
            <option value="">All companies</option>
            {options.companies.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
        {has('rating') && (
          <select className="select !w-auto" value={filters.rating} onChange={(e) => setFilter('rating', e.target.value)} aria-label="Rating">
            <option value="">All ratings</option>
            <option value="800-899">800</option>
            <option value="900-999">900</option>
            <option value="1000-1099">1000</option>
            <option value="1100-1199">1100</option>
            <option value="1200-1299">1200</option>
            <option value="1300-1399">1300</option>
            <option value="1400-1499">1400</option>
            <option value="1500-1599">1500</option>
            <option value="1600-1699">1600</option>
            <option value="1700-1799">1700</option>
            <option value="1800-1899">1800</option>
            <option value="1900-1999">1900</option>
            <option value="2000-3500">2000+</option>
            <optgroup label="Ladders">
              {cfLadders.map((l) => (
                <option key={l.id} value={`${l.minRating}-${l.maxRating}`}>
                  {l.name}
                </option>
              ))}
            </optgroup>
          </select>
        )}
        {activeFilters > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setFilters({ ...EMPTY_FILTERS });
              setQuery('');
              setPage(1);
            }}
          >
            <X size={12} /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-subtle">
          {filtered.length.toLocaleString()} {filtered.length === 1 ? 'problem' : 'problems'}
        </span>
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description="Try changing or clearing the filters." icon={Search} />
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="sortable w-[150px]" onClick={() => toggleSort('status')}>
                  Status
                  <SortIcon k="status" />
                </th>
                <th className="sortable" onClick={() => toggleSort('name')}>
                  Problem
                  <SortIcon k="name" />
                </th>
                <th className="sortable hidden md:table-cell" onClick={() => toggleSort('platform')}>
                  Platform
                  <SortIcon k="platform" />
                </th>
                {showRating && (
                  <th className="sortable hidden sm:table-cell" onClick={() => toggleSort('rating')}>
                    Rating
                    <SortIcon k="rating" />
                  </th>
                )}
                <th className="sortable" onClick={() => toggleSort('difficulty')}>
                  Difficulty
                  <SortIcon k="difficulty" />
                </th>
                <th className="hidden lg:table-cell">Topics</th>
                <th className="w-[104px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const pr = progress[p.id];
                const solved = pr?.status === 'solved';
                return (
                  <tr
                    key={p.id}
                    className="row-click"
                    tabIndex={0}
                    onClick={() => open(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target === e.currentTarget) open(p.id);
                    }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <StatusSelect problemId={p.id} />
                    </td>
                    <td className="max-w-[320px]">
                      <div className="truncate font-medium text-fg">{p.name}</div>
                      {pr?.nextRevisionAt && <div className="mono text-[11px] text-subtle">revise {pr.nextRevisionAt}</div>}
                    </td>
                    <td className="hidden text-muted md:table-cell">{p.platform}</td>
                    {showRating && <td className="mono hidden text-muted sm:table-cell">{p.rating ?? '—'}</td>}
                    <td>
                      <DifficultyBadge difficulty={p.difficulty} />
                    </td>
                    <td className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {p.topics.slice(0, 2).map((t) => (
                          <span key={t} className="tag">
                            {topicName(t)}
                          </span>
                        ))}
                        {p.topics.length > 2 && <span className="tag">+{p.topics.length - 2}</span>}
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          className={cn('btn btn-ghost btn-icon', solved && 'text-accent')}
                          title={solved ? 'Mark as not started' : 'Mark as solved'}
                          aria-label={solved ? 'Mark as not started' : 'Mark as solved'}
                          onClick={() => setStatus(p.id, solved ? 'not_started' : 'solved')}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          className={cn('btn btn-ghost btn-icon', pr?.bookmarked && 'text-link')}
                          title="Toggle bookmark"
                          aria-label="Toggle bookmark"
                          onClick={() => toggleBookmark(p.id)}
                        >
                          {pr?.bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                        </button>
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-icon"
                          title="Open problem"
                          aria-label="Open problem in new tab"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > PAGE_SIZES[0] && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-soft px-3 py-2 text-xs text-subtle">
          <div className="flex items-center gap-2">
            Rows
            <select
              className="select !h-6 !w-auto !py-0 text-xs"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono">
              {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}
            </span>
            <button type="button" className="btn btn-icon btn-sm" disabled={current <= 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
              <ChevronLeft size={14} />
            </button>
            <button type="button" className="btn btn-icon btn-sm" disabled={current >= pageCount} onClick={() => setPage(current + 1)} aria-label="Next page">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
