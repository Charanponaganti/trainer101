import { Link, Route, Routes } from 'react-router-dom';
import { EmptyState } from './components/EmptyState';
import { AppLayout } from './layouts/AppLayout';
import { Analytics } from './pages/Analytics';
import { Bookmarks } from './pages/Bookmarks';
import { Codeforces } from './pages/Codeforces';
import { Companies } from './pages/Companies';
import { Dashboard } from './pages/Dashboard';
import { Planner } from './pages/Planner';
import { Problems } from './pages/Problems';
import { Revision } from './pages/Revision';
import { Settings } from './pages/Settings';
import { SheetDetail } from './pages/SheetDetail';
import { Sheets } from './pages/Sheets';
import { TopicDetail } from './pages/TopicDetail';
import { Topics } from './pages/Topics';

function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="That route does not exist."
      action={
        <Link to="/" className="btn">
          Back to dashboard
        </Link>
      }
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="problems" element={<Problems />} />
        <Route path="problems/:problemId" element={<Problems />} />
        <Route path="sheets" element={<Sheets />} />
        <Route path="sheets/:sheetId" element={<SheetDetail />} />
        <Route path="topics" element={<Topics />} />
        <Route path="topics/:topicId" element={<TopicDetail />} />
        <Route path="codeforces" element={<Codeforces />} />
        <Route path="codeforces/:ladderId" element={<Codeforces />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:companyId" element={<Companies />} />
        <Route path="revision" element={<Revision />} />
        <Route path="planner" element={<Planner />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
