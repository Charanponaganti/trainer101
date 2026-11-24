import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { ProgressBar } from '../components/ProgressBar';
import { sheets } from '../data/sheets';
import { useProgress } from '../context/ProgressContext';
import type { Sheet } from '../types';
import { cn } from '../utils/cn';
import { sheetProgress } from '../utils/stats';

export const CATEGORY_LABEL: Record<Sheet['category'], string> = {
  interview: 'Interview',
  course: 'Course',
  patterns: 'Patterns',
  sql: 'SQL',
  company: 'Company',
  cp: 'Competitive',
};

export function Sheets() {
  const { progress } = useProgress();
  const [category, setCategory] = useState<'all' | Sheet['category']>('all');

  const categories = useMemo(() => {
    const set = new Set<Sheet['category']>();
    sheets.forEach((s) => set.add(s.category));
    return [...set];
  }, []);

  const visible = sheets.filter((s) => category === 'all' || s.category === category);

  return (
    <div>
      <PageHeader title="DSA Sheets" description="Curated problem lists. Solving a problem in one sheet marks it solved everywhere." />
      <div className="mb-4 flex flex-wrap gap-1">
        <button type="button" className="tab" data-active={category === 'all'} onClick={() => setCategory('all')}>
          All
        </button>
        {categories.map((c) => (
          <button key={c} type="button" className="tab" data-active={category === c} onClick={() => setCategory(c)}>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((sheet) => {
          const p = sheetProgress(sheet, progress);
          return (
            <Link
              key={sheet.id}
              to={`/sheets/${sheet.id}`}
              className="card group flex flex-col p-4 transition-colors hover:border-subtle"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[13.5px] font-semibold leading-snug text-fg">{sheet.name}</h3>
                <span className="tag shrink-0">{CATEGORY_LABEL[sheet.category]}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-muted">{sheet.description}</p>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="mono text-fg">
                    {p.solved}
                    <span className="text-subtle">/{p.total}</span>
                  </span>
                  <span className={cn('mono', p.percent === 100 ? 'text-accent' : 'text-subtle')}>{p.percent}%</span>
                </div>
                <ProgressBar value={p.percent} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-subtle">
                <span className="truncate">{sheet.author}</span>
                <ExternalLink size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
