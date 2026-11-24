import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import { ProgressBar } from '../components/ProgressBar';
import { CF_RATING_BUCKETS, cfLadders, cfResources, ratingBucketLabel } from '../data/codeforces';
import { codeforcesProblems } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import { cn } from '../utils/cn';
import { listProgress, resolveProblems, solvedCount } from '../utils/stats';

export function Codeforces() {
  const { ladderId } = useParams();
  const { progress } = useProgress();
  const ladder = ladderId ? cfLadders.find((l) => l.id === ladderId) : undefined;
  const ladderProblems = useMemo(() => (ladder ? resolveProblems(ladder.problemIds) : []), [ladder]);

  const ratingBuckets = useMemo(() => {
    return CF_RATING_BUCKETS.map((bucket) => {
      const list =
        bucket === 2000
          ? codeforcesProblems.filter((p) => (p.rating ?? 0) >= 2000)
          : codeforcesProblems.filter((p) => (p.rating ?? 0) >= bucket && (p.rating ?? 0) < bucket + 100);
      return {
        rating: bucket,
        label: ratingBucketLabel(bucket),
        total: list.length,
        solved: solvedCount(progress, list),
        problems: list,
      };
    }).filter((b) => b.total > 0);
  }, [progress]);

  if (ladderId && !ladder) {
    return (
      <EmptyState
        title="Ladder not found"
        action={
          <Link to="/codeforces" className="btn">
            Codeforces Arena
          </Link>
        }
      />
    );
  }

  if (ladder) {
    const p = listProgress(progress, ladder.problemIds);
    return (
      <div>
        <PageHeader
          breadcrumbs={[{ label: 'Codeforces Arena', to: '/codeforces' }, { label: ladder.name }]}
          title={ladder.name}
          description={ladder.description}
        />
        <div className="card mb-4 p-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted">
              <span className="mono text-sm font-semibold text-fg">{p.solved}</span> of {p.total} solved
            </span>
            <span className="mono text-fg">{p.percent}%</span>
          </div>
          <ProgressBar value={p.percent} height={6} />
        </div>
        <ProblemTable
          problems={ladderProblems}
          filterKeys={['difficulty', 'status', 'topic', 'rating']}
          initialSort={{ key: 'rating', dir: 'asc' }}
          pageSize={50}
          showRating
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Codeforces Arena"
        description="Rating-wise practice, six curated ladders, and core CP resources. Ratings and metadata are from verified Codeforces data."
      />

      <h2 className="mb-3 text-sm font-semibold">Practice ladders</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cfLadders.map((l) => {
          const p = listProgress(progress, l.problemIds);
          return (
            <Link key={l.id} to={`/codeforces/${l.id}`} className="card p-4 transition-colors hover:border-subtle">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13.5px] font-semibold text-fg">{l.name}</h3>
                <span className="mono tag shrink-0">
                  {l.minRating}
                  {l.maxRating >= 3000 ? '+' : `–${l.maxRating}`}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-xs text-muted">{l.description}</p>
              <div className="mt-4 mb-1.5 flex justify-between text-xs">
                <span className="mono text-fg">
                  {p.solved}
                  <span className="text-subtle">/{p.total}</span>
                </span>
                <span className={cn('mono', p.percent === 100 ? 'text-accent' : 'text-subtle')}>{p.percent}%</span>
              </div>
              <ProgressBar value={p.percent} />
            </Link>
          );
        })}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">By rating</h2>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ratingBuckets.map((b) => (
          <div key={b.rating} className="card px-3 py-2.5">
            <div className="mono text-xs text-subtle">{b.label}</div>
            <div className="mono mt-1 text-sm font-semibold">
              {b.solved}
              <span className="text-subtle">/{b.total}</span>
            </div>
            <ProgressBar className="mt-2" value={b.solved} max={b.total} height={3} />
          </div>
        ))}
      </div>

      <h2 className="mb-3 text-sm font-semibold">Resources</h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cfResources.map((r) => (
          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="card group p-4 transition-colors hover:border-subtle">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[13px] font-semibold text-fg">{r.name}</h3>
              <ExternalLink size={12} className="text-subtle group-hover:text-link" />
            </div>
            <p className="mt-1.5 line-clamp-3 text-xs text-muted">{r.description}</p>
          </a>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">All Codeforces problems</h2>
      <ProblemTable
        problems={codeforcesProblems}
        filterKeys={['rating', 'difficulty', 'status', 'topic']}
        initialSort={{ key: 'rating', dir: 'asc' }}
        pageSize={25}
        showRating
      />
    </div>
  );
}
