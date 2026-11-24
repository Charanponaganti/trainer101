import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import { ProgressBar } from '../components/ProgressBar';
import { sheetMap } from '../data/sheets';
import { useProgress } from '../context/ProgressContext';
import { difficultyStats, resolveProblems, sheetProgress } from '../utils/stats';
import { CATEGORY_LABEL } from './Sheets';

export function SheetDetail() {
  const { sheetId } = useParams();
  const { progress } = useProgress();
  const sheet = sheetId ? sheetMap[sheetId] : undefined;
  const list = useMemo(() => (sheet ? resolveProblems(sheet.problemIds) : []), [sheet]);

  if (!sheet) {
    return (
      <EmptyState
        title="Sheet not found"
        action={
          <Link to="/sheets" className="btn">
            All sheets
          </Link>
        }
      />
    );
  }

  const p = sheetProgress(sheet, progress);
  const diff = difficultyStats(progress, list);

  return (
    <div>
      <PageHeader
        breadcrumbs={[{ label: 'DSA Sheets', to: '/sheets' }, { label: sheet.name }]}
        title={sheet.name}
        description={sheet.description}
        actions={
          <a href={sheet.url} target="_blank" rel="noopener noreferrer" className="btn">
            Original source <ExternalLink size={13} />
          </a>
        }
      />
      <div className="card mb-4 grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted">
              <span className="mono text-sm font-semibold text-fg">{p.solved}</span> of {p.total} solved
              <span className="ml-2 text-subtle">· {CATEGORY_LABEL[sheet.category]} · {sheet.author}</span>
            </span>
            <span className="mono text-fg">{p.percent}%</span>
          </div>
          <ProgressBar value={p.percent} height={6} />
        </div>
        <div className="flex gap-5 text-xs">
          {diff.map((d) => (
            <div key={d.difficulty} className="text-center">
              <div className="mono text-sm font-semibold text-fg">
                {d.solved}
                <span className="text-subtle">/{d.total}</span>
              </div>
              <div className={d.difficulty === 'Easy' ? 'text-easy' : d.difficulty === 'Medium' ? 'text-medium' : 'text-hard'}>
                {d.difficulty}
              </div>
            </div>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <div className="card">
          <EmptyState title="No problems mapped to this sheet" description="Use the original source link to follow the list." />
        </div>
      ) : (
        <ProblemTable
          problems={list}
          filterKeys={['difficulty', 'status', 'topic', 'platform']}
          pageSize={50}
          showRating={list.some((x) => x.rating !== undefined)}
        />
      )}
    </div>
  );
}
