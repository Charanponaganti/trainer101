import { Link, useParams } from 'react-router-dom';
import { Building2, CheckSquare, ExternalLink } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import { ProgressBar } from '../components/ProgressBar';
import { companies, companyMap, COMPANY_NOTE } from '../data/companies';
import { topicMap } from '../data/topics';
import { useProgress } from '../context/ProgressContext';
import { listProgress, resolveProblems } from '../utils/stats';

export function Companies() {
  const { companyId } = useParams();
  const { progress } = useProgress();

  if (companyId) {
    const company = companyMap[companyId];
    if (!company) {
      return <EmptyState icon={Building2} title="Company not found" description="That company id is not in the catalog." />;
    }
    const ratio = listProgress(progress, company.problemIds);
    const list = resolveProblems(company.problemIds);

    return (
      <div>
        <PageHeader
          title={company.name}
          description={company.note}
          breadcrumbs={[
            { label: 'Companies', to: '/companies' },
            { label: company.name },
          ]}
        />

        <div className="mb-4 rounded-md border border-medium/30 bg-medium/5 px-3 py-2 text-[12px] text-muted">
          {COMPANY_NOTE}
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-3">
          <section className="card p-4 lg:col-span-1">
            <div className="mb-2 flex items-center justify-between text-xs text-muted">
              <span>Prep progress</span>
              <span className="mono">{ratio.percent}%</span>
            </div>
            <ProgressBar value={ratio.percent} />
            <p className="mt-2 mono text-[11px] text-subtle">
              {ratio.solved}/{ratio.total} problems
            </p>

            <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-subtle">Important topics</h3>
            <div className="flex flex-wrap gap-1.5">
              {company.importantTopics.map((t) => (
                <Link key={t} to={`/topics/${t}`} className="chip hover:border-link hover:text-link">
                  {topicMap[t]?.name ?? t}
                </Link>
              ))}
            </div>

            <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-subtle">Common patterns</h3>
            <ul className="space-y-1.5 text-[13px] text-muted">
              {company.patterns.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-subtle">·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-4 lg:col-span-2">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CheckSquare size={15} /> Interview checklist
            </h3>
            <ul className="mb-5 space-y-2">
              {company.checklist.map((item) => (
                <li key={item} className="flex gap-2 text-[13px] text-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-3 text-xs text-subtle">
              Associated problems are community-reported prep recommendations, not verified interview logs.
            </p>
            <ProblemTable
              problems={list}
              filterKeys={['difficulty', 'status', 'topic']}
              emptyTitle="No mapped problems for this company"
            />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Preparation"
        description="Pattern-focused prep by company. Tags are community-reported recommendations — not verified interview logs."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => {
          const ratio = listProgress(progress, c.problemIds);
          return (
            <Link key={c.id} to={`/companies/${c.id}`} className="card group p-4 transition-colors hover:border-subtle">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold group-hover:text-link">{c.name}</h2>
                  <p className="mt-1 line-clamp-2 text-[12px] text-subtle">{c.patterns[0]}</p>
                </div>
                <ExternalLink size={14} className="mt-0.5 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <ProgressBar value={ratio.percent} />
              <div className="mt-2 flex justify-between mono text-[11px] text-subtle">
                <span>
                  {ratio.solved}/{ratio.total}
                </span>
                <span>{ratio.percent}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
