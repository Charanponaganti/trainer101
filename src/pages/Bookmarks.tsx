import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ProblemTable } from '../components/ProblemTable';
import { useProgress } from '../context/ProgressContext';
import { bookmarkedProblems } from '../utils/stats';

export function Bookmarks() {
  const { progress } = useProgress();
  const list = useMemo(() => bookmarkedProblems(progress), [progress]);

  return (
    <div>
      <PageHeader title="Bookmarks" description={`${list.length} saved ${list.length === 1 ? 'problem' : 'problems'}`} />
      {list.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bookmark}
            title="No bookmarks yet"
            description="Use the bookmark icon on any problem to save it here."
            action={
              <Link to="/problems" className="btn">
                Browse problems
              </Link>
            }
          />
        </div>
      ) : (
        <ProblemTable problems={list} filterKeys={['difficulty', 'status', 'topic', 'platform']} showRating />
      )}
    </div>
  );
}
