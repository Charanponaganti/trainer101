import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  BookOpen,
  ExternalLink,
  Layers,
  Link2,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import { ProgressBar } from '../components/ProgressBar';
import {
  cfClassicSet,
  cfCp31Sets,
  cfProblemSetMap,
  cfRankColor,
  cfResources,
  cfTopicSets,
  cfLadders,
  cfRatingSets,
  ratingBucketLabel,
} from '../data/codeforces';
import { codeforcesProblems } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import type { CfProblemSet, CfResource } from '../types';
import { cn } from '../utils/cn';
import { listProgress, resolveProblems } from '../utils/stats';

type Tab = 'overview' | 'cp31' | 'topics' | 'resources' | 'all';

const RESOURCE_LABEL: Record<NonNullable<CfResource['category']>, string> = {
  sheet: 'Sheet',
  course: 'Course',
  blog: 'Blog',
  book: 'Book',
  tool: 'Tool',
  editorial: 'Editorial',
};

function SetCard({ set, to }: { set: CfProblemSet; to: string }) {
  const { progress } = useProgress();
  const p = listProgress(progress, set.problemIds);
  return (
    <Link to={to} className="cf-set-card group">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold leading-snug text-fg">{set.name}</h3>
        {set.minRating !== undefined && (
          <span className="mono tag shrink-0">
            {set.minRating}
            {set.maxRating !== undefined && set.maxRating !== set.minRating
              ? set.maxRating >= 3000
                ? '+'
                : `–${set.maxRating}`
              : ''}
          </span>
        )}
      </div>
      <p className="mt-1.5 line-clamp-2 text-xs text-muted">{set.description}</p>
      <div className="mt-4 mb-1.5 flex justify-between text-xs">
        <span className="mono text-fg">
          {p.solved}
          <span className="text-subtle">/{p.total}</span>
        </span>
        <span className={cn('mono', p.percent === 100 ? 'text-accent' : 'text-subtle')}>{p.percent}%</span>
      </div>
      <ProgressBar value={p.percent} />
      {set.source && <p className="mt-2 truncate text-[10px] text-subtle">{set.source}</p>}
    </Link>
  );
}

export function Codeforces() {
  const { ladderId } = useParams();
  const { progress, settings, updateSettings, syncCodeforces, codeforcesSyncing } = useProgress();
  const [tab, setTab] = useState<Tab>('overview');
  const [handleDraft, setHandleDraft] = useState(settings.codeforcesHandle);
  const [syncNotice, setSyncNotice] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    setHandleDraft(settings.codeforcesHandle);
  }, [settings.codeforcesHandle]);

  const set = ladderId ? cfProblemSetMap[ladderId] : undefined;
  const setProblems = useMemo(() => (set ? resolveProblems(set.problemIds) : []), [set]);

  const overall = useMemo(() => {
    const ids = codeforcesProblems.map((p) => p.id);
    return listProgress(progress, ids);
  }, [progress]);

  const ratingBuckets = useMemo(() => {
    return cfRatingSets.map((s) => {
      const p = listProgress(progress, s.problemIds);
      const bucket = s.minRating ?? 800;
      return {
        rating: bucket,
        id: s.id,
        label: ratingBucketLabel(bucket),
        total: p.total,
        solved: p.solved,
        percent: p.percent,
      };
    });
  }, [progress]);

  const cp31Overall = useMemo(() => {
    const ids = codeforcesProblems.filter((p) => p.sheetIds.includes('cp31')).map((p) => p.id);
    return listProgress(progress, ids);
  }, [progress]);

  if (ladderId && !set) {
    return (
      <EmptyState
        title="Set not found"
        action={
          <Link to="/codeforces" className="btn">
            Codeforces Arena
          </Link>
        }
      />
    );
  }

  if (set) {
    const p = listProgress(progress, set.problemIds);
    return (
      <div>
        <PageHeader
          breadcrumbs={[{ label: 'Codeforces Arena', to: '/codeforces' }, { label: set.name }]}
          title={set.name}
          description={set.description}
          actions={
            set.url ? (
              <a href={set.url} target="_blank" rel="noopener noreferrer" className="btn">
                <ExternalLink size={14} /> Source
              </a>
            ) : undefined
          }
        />
        <div className="cf-hero-strip mb-4">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-subtle">Progress</div>
            <div className="mono mt-0.5 text-lg font-semibold">
              {p.solved}
              <span className="text-subtle">/{p.total}</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted">{set.source ?? 'Curated set'}</span>
              <span className="mono text-fg">{p.percent}%</span>
            </div>
            <ProgressBar value={p.percent} height={6} />
          </div>
        </div>
        <ProblemTable
          problems={setProblems}
          filterKeys={['difficulty', 'status', 'topic', 'rating']}
          initialSort={{ key: 'rating', dir: 'asc' }}
          pageSize={50}
          showRating
        />
      </div>
    );
  }

  const runSync = () => {
    const handle = handleDraft.trim().replace(/^@/, '');
    updateSettings({ codeforcesHandle: handle });
    void syncCodeforces(handle).then((r) => setSyncNotice({ ok: r.ok, text: r.message }));
  };

  const tabs: { id: Tab; label: string; icon: typeof Trophy }[] = [
    { id: 'overview', label: 'Ladders', icon: Trophy },
    { id: 'cp31', label: 'CP-31', icon: Target },
    { id: 'topics', label: 'Topics', icon: Layers },
    { id: 'resources', label: 'Sheets & blogs', icon: BookOpen },
    { id: 'all', label: 'All problems', icon: Sparkles },
  ];

  return (
    <div>
      <PageHeader
        title="Codeforces Arena"
        description="Sync your handle, grind CP-31 and rating ladders, and open the best sheets, blogs and editorials in one place."
      />

      {/* Sync + stats hero */}
      <section className="cf-sync-panel mb-6">
        <div className="cf-sync-glow" aria-hidden />
        <div className="relative grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">
              <Link2 size={12} /> Account sync
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1">
                <label className="label" htmlFor="cf-handle">
                  Codeforces handle
                </label>
                <input
                  id="cf-handle"
                  className="input mono"
                  placeholder="your_handle"
                  value={handleDraft}
                  onChange={(e) => setHandleDraft(e.target.value)}
                  onBlur={() => updateSettings({ codeforcesHandle: handleDraft.trim().replace(/^@/, '') })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') runSync();
                  }}
                />
              </div>
              <button type="button" className="btn btn-primary" disabled={codeforcesSyncing} onClick={runSync}>
                <RefreshCw size={14} className={codeforcesSyncing ? 'animate-spin' : undefined} />
                {codeforcesSyncing ? 'Syncing…' : 'Sync now'}
              </button>
              <a
                href={
                  handleDraft.trim()
                    ? `https://codeforces.com/profile/${encodeURIComponent(handleDraft.trim().replace(/^@/, ''))}`
                    : 'https://codeforces.com/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
              >
                <ExternalLink size={14} /> Profile
              </a>
            </div>
            <label className="mt-3 flex items-center gap-2 text-[13px] text-muted">
              <input
                type="checkbox"
                checked={settings.codeforcesAutoSync}
                onChange={(e) => updateSettings({ codeforcesAutoSync: e.target.checked })}
              />
              Auto-sync every few minutes while this site is open
            </label>
            {settings.codeforcesLastSyncAt && (
              <p className="mt-2 text-xs text-subtle">
                Last sync: {format(parseISO(settings.codeforcesLastSyncAt), 'MMM d, yyyy HH:mm')}
              </p>
            )}
            {syncNotice && (
              <p className={cn('mt-2 text-xs', syncNotice.ok ? 'text-accent' : 'text-hard')}>{syncNotice.text}</p>
            )}
            <p className="mt-2 text-[11px] text-subtle">
              Uses the official Codeforces API (no password). Marks matching catalog problems as Solved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            <div className="cf-stat">
              <div className="text-[10px] uppercase tracking-wide text-subtle">Catalog</div>
              <div className="mono mt-1 text-xl font-semibold">
                {overall.solved}
                <span className="text-sm text-subtle">/{overall.total}</span>
              </div>
              <ProgressBar className="mt-2" value={overall.percent} height={3} />
            </div>
            <div className="cf-stat">
              <div className="text-[10px] uppercase tracking-wide text-subtle">CP-31</div>
              <div className="mono mt-1 text-xl font-semibold">
                {cp31Overall.solved}
                <span className="text-sm text-subtle">/{cp31Overall.total}</span>
              </div>
              <ProgressBar className="mt-2" value={cp31Overall.percent} height={3} />
            </div>
            <div className="cf-stat col-span-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-subtle">Linked profile</div>
                  {settings.codeforcesHandle ? (
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="mono text-sm font-semibold">@{settings.codeforcesHandle}</span>
                      {settings.codeforcesRank && (
                        <span className="text-xs font-medium capitalize" style={{ color: cfRankColor(settings.codeforcesRank) }}>
                          {settings.codeforcesRank}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-muted">Not linked yet</div>
                  )}
                </div>
                {settings.codeforcesRating !== undefined && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wide text-subtle">Rating</div>
                    <div className="mono text-lg font-semibold" style={{ color: cfRankColor(settings.codeforcesRank) }}>
                      {settings.codeforcesRating}
                    </div>
                    {settings.codeforcesMaxRating !== undefined && (
                      <div className="mono text-[10px] text-subtle">max {settings.codeforcesMaxRating}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} type="button" className="tab" data-active={tab === t.id} onClick={() => setTab(t.id)}>
              <Icon size={13} className="mr-1 inline-block opacity-70" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="anim-fade-in space-y-8">
          <div>
            <h2 className="mb-1 text-sm font-semibold">Practice ladders</h2>
            <p className="mb-3 text-xs text-muted">
              A2OJ-style rating bands filled with the most-solved problems in each range — good daily grind alongside contests.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {cfLadders.map((l) => (
                <SetCard
                  key={l.id}
                  to={`/codeforces/${l.id}`}
                  set={{
                    id: l.id,
                    name: l.name,
                    description: l.description,
                    kind: 'ladder',
                    minRating: l.minRating,
                    maxRating: l.maxRating,
                    problemIds: l.problemIds,
                    source: 'Popular rating-band practice',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-1 text-sm font-semibold">By rating</h2>
            <p className="mb-3 text-xs text-muted">
              Counts update after you sync your handle. Click a band to open its problems.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {ratingBuckets.map((b) => (
                <Link
                  key={b.id}
                  to={`/codeforces/${b.id}`}
                  className={cn('cf-rating-cell block hover:border-subtle', b.solved > 0 && 'cf-rating-cell-active')}
                >
                  <div className="mono text-xs text-subtle">{b.label}</div>
                  <div className="mono mt-1 text-sm font-semibold">
                    {b.solved}
                    <span className="text-subtle">/{b.total}</span>
                  </div>
                  <ProgressBar className="mt-2" value={b.solved} max={Math.max(b.total, 1)} height={3} />
                  {b.percent > 0 && <div className="mono mt-1 text-[10px] text-accent">{b.percent}%</div>}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Legendary classics</h2>
              <Link to={`/codeforces/${cfClassicSet.id}`} className="text-xs text-link hover:underline">
                Open set →
              </Link>
            </div>
            <SetCard set={cfClassicSet} to={`/codeforces/${cfClassicSet.id}`} />
          </div>
        </div>
      )}

      {tab === 'cp31' && (
        <div className="anim-fade-in">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">CP-31 by rating</h2>
              <p className="mt-1 max-w-2xl text-xs text-muted">
                TLE Eliminators’ sheet — 31 reusable-idea problems per rating from 800 to 1900. Finish a band before moving up.
              </p>
            </div>
            <a
              href="https://www.tle-eliminators.com/cp-sheet"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm"
            >
              <ExternalLink size={12} /> Official sheet
            </a>
          </div>
          <div className="mb-4 card p-3">
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="text-muted">
                Overall CP-31 · <span className="mono text-fg">{cp31Overall.solved}</span> / {cp31Overall.total}
              </span>
              <span className="mono">{cp31Overall.percent}%</span>
            </div>
            <ProgressBar value={cp31Overall.percent} height={6} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {cfCp31Sets.map((s) => (
              <SetCard key={s.id} set={s} to={`/codeforces/${s.id}`} />
            ))}
          </div>
        </div>
      )}

      {tab === 'topics' && (
        <div className="anim-fade-in">
          <h2 className="mb-1 text-sm font-semibold">Topic problem sets</h2>
          <p className="mb-3 text-xs text-muted">
            Built from Codeforces tags — most-solved problems per technique so you can drill after reading an editorial or EDU lesson.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cfTopicSets.map((s) => (
              <SetCard key={s.id} set={s} to={`/codeforces/${s.id}`} />
            ))}
          </div>
        </div>
      )}

      {tab === 'resources' && (
        <div className="anim-fade-in">
          <h2 className="mb-1 text-sm font-semibold">Sheets, blogs & editorials</h2>
          <p className="mb-3 text-xs text-muted">
            Community-vetted roadmaps — CP-31, Striver CP, Mostafa Saad, A2OJ, EDU, CSES, Um_nik / Radewoosh practice blogs, and more.
          </p>
          <div className="mb-3 flex flex-wrap gap-1">
            {(['sheet', 'course', 'blog', 'book', 'editorial', 'tool'] as const).map((cat) => (
              <span key={cat} className="tag">
                {RESOURCE_LABEL[cat]}
              </span>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {cfResources.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="cf-resource-card group">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-fg">{r.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {r.category && <span className="tag shrink-0">{RESOURCE_LABEL[r.category]}</span>}
                    <ExternalLink size={12} className="text-subtle group-hover:text-link" />
                  </div>
                </div>
                <p className="mt-1.5 line-clamp-3 text-xs text-muted">{r.description}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div className="anim-fade-in">
          <h2 className="mb-3 text-sm font-semibold">All Codeforces problems in catalog</h2>
          <ProblemTable
            problems={codeforcesProblems}
            filterKeys={['rating', 'difficulty', 'status', 'topic']}
            initialSort={{ key: 'rating', dir: 'asc' }}
            pageSize={25}
            showRating
          />
        </div>
      )}
    </div>
  );
}
