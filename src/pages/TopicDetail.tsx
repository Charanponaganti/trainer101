import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemMiniList } from '../components/ProblemMiniList';
import { ProblemTable } from '../components/ProblemTable';
import { ProgressBar } from '../components/ProgressBar';
import { topicMap, topics } from '../data/topics';
import { useProgress } from '../context/ProgressContext';
import { DIFFICULTY_ORDER, topicProblems, topicStat } from '../utils/stats';

export function TopicDetail() {
  const { topicId } = useParams();
  const { progress } = useProgress();
  const topic = topicId ? topicMap[topicId] : undefined;

  const list = useMemo(() => (topic ? topicProblems(topic.id) : []), [topic]);
  const stat = useMemo(() => (topic ? topicStat(topic, progress) : null), [topic, progress]);

  if (!topic || !stat) {
    return (
      <EmptyState
        title="Topic not found"
        action={
          <Link to="/topics" className="btn">
            All topics
          </Link>
        }
      />
    );
  }

  const sorted = [...topics].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? sorted[idx - 1] : undefined;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : undefined;

  // recommended order: unsolved first-pass by difficulty (Easy -> Hard), keeping data order within a difficulty
  const nextUp = list
    .filter((p) => (progress[p.id]?.status ?? 'not_started') !== 'solved')
    .map((p, i) => ({ p, i }))
    .sort((a, b) => DIFFICULTY_ORDER[a.p.difficulty] - DIFFICULTY_ORDER[b.p.difficulty] || a.i - b.i)
    .slice(0, 8)
    .map((x) => x.p);

  const bars = [
    { label: 'Easy', solved: stat.solvedEasy, total: stat.easy, tone: 'easy' as const },
    { label: 'Medium', solved: stat.solvedMedium, total: stat.medium, tone: 'medium' as const },
    { label: 'Hard', solved: stat.solvedHard, total: stat.hard, tone: 'hard' as const },
  ];

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'Topic Roadmap', to: '/topics' }, { label: topic.name }]}
        title={topic.name}
        description={topic.description}
        actions={<span className="tag capitalize">{topic.level}</span>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="card-header">Progress</div>
          <div className="card-body">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="mono text-xl font-semibold">
                {stat.solved}
                <span className="text-sm text-subtle">/{stat.total}</span>
              </span>
              <span className="mono text-xs text-subtle">{stat.percent}%</span>
            </div>
            <ProgressBar value={stat.percent} height={6} />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {bars.map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted">{b.label}</span>
                    <span className="mono text-subtle">
                      {b.solved}/{b.total}
                    </span>
                  </div>
                  <ProgressBar value={b.solved} max={b.total} tone={b.tone} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Prerequisites</div>
          <div className="card-body">
            {topic.prerequisites.length === 0 ? (
              <p className="text-xs text-subtle">None. This is a starting point.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {topic.prerequisites.map((id) => (
                  <Link key={id} to={`/topics/${id}`} className="tag !h-6 !px-2 text-xs hover:text-fg">
                    {topicMap[id]?.name ?? id}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-between gap-2 border-t border-border-soft pt-3 text-xs">
              {prev ? (
                <Link to={`/topics/${prev.id}`} className="flex min-w-0 items-center gap-1 text-muted hover:text-fg">
                  <ArrowLeft size={12} /> <span className="truncate">{prev.name}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/topics/${next.id}`} className="flex min-w-0 items-center gap-1 text-muted hover:text-fg">
                  <span className="truncate">{next.name}</span> <ArrowRight size={12} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">Key concepts</div>
          <ol className="space-y-2 p-4">
            {topic.concepts.map((c, i) => (
              <li key={c} className="flex gap-3 text-[13px] text-muted">
                <span className="mono mt-0.5 text-[11px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="card">
          <div className="card-header">
            <span>Recommended next</span>
            <span className="text-xs font-normal text-subtle">Easy → Hard</span>
          </div>
          <ProblemMiniList items={nextUp.map((p) => ({ problem: p }))} emptyText="Everything in this topic is solved." />
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold">Problems</h2>
      {list.length === 0 ? (
        <div className="card">
          <EmptyState title="No problems tagged with this topic yet" />
        </div>
      ) : (
        <ProblemTable
          problems={list}
          filterKeys={['difficulty', 'status', 'platform']}
          initialSort={{ key: 'difficulty', dir: 'asc' }}
          pageSize={25}
        />
      )}
    </div>
  );
}
