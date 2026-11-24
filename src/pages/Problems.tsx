import { useEffect } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import type { TableFilters } from '../components/ProblemTable';
import { problemMap, problems } from '../data/problems';
import { useProblemDrawer } from '../context/DrawerContext';

const FILTER_PARAMS: (keyof TableFilters)[] = ['difficulty', 'status', 'topic', 'platform', 'sheet', 'company', 'rating'];

export function Problems() {
  const { problemId } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const { open } = useProblemDrawer();

  useEffect(() => {
    if (problemId && problemMap[problemId]) open(problemId);
  }, [problemId, open]);

  const initial: Partial<TableFilters> = {};
  for (const key of FILTER_PARAMS) {
    const v = params.get(key);
    if (v) initial[key] = v;
  }

  return (
    <div>
      <PageHeader
        title="All Problems"
        description={`${problems.length.toLocaleString()} problems across LeetCode, Codeforces and CSES. Status is shared across every sheet.`}
      />
      <ProblemTable
        key={location.search}
        problems={problems}
        filterKeys={['difficulty', 'topic', 'platform', 'sheet', 'company', 'status']}
        initialFilters={initial}
        pageSize={50}
        showRating
      />
    </div>
  );
}
