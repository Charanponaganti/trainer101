import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Flame, Menu, Moon, Search, Sun, X } from 'lucide-react';
import { GlobalSearch } from '../components/GlobalSearch';
import { ProblemDrawer } from '../components/ProblemDrawer';
import { Sidebar } from '../components/Sidebar';
import { DrawerProvider, useProblemDrawer } from '../context/DrawerContext';
import { useProgress } from '../context/ProgressContext';
import { cn } from '../utils/cn';
import { computeStreaks, dateCounts } from '../utils/stats';

const COLLAPSE_KEY = 'placement-os-sidebar';

function isTypingTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable;
}

function LayoutInner() {
  const { settings, updateSettings, progress } = useProgress();
  const { openId, close } = useProblemDrawer();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const streak = useMemo(() => computeStreaks(dateCounts(progress)).current, [progress]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
        return;
      }
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) {
        toggleCollapsed();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleDrawerClose = useCallback(() => {
    close();
    if (/^\/problems\/.+/.test(location.pathname)) navigate('/problems', { replace: true });
  }, [close, location.pathname, navigate]);

  const isLight = settings.theme === 'light';

  return (
    <div className="flex h-full bg-bg text-fg">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-border transition-[width] duration-150 md:block',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="anim-fade-in absolute inset-0" style={{ background: 'var(--overlay)' }} onClick={() => setMobileOpen(false)} />
          <div className="anim-slide-in absolute inset-y-0 left-0 w-64 border-r border-border">
            <button
              type="button"
              className="btn btn-ghost btn-icon absolute right-2 top-2.5 z-10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 sm:px-4">
          <button type="button" className="btn btn-ghost btn-icon md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={17} />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-8 w-full max-w-sm items-center gap-2 rounded-md border border-border bg-surface-2 px-2.5 text-left text-[13px] text-subtle hover:border-subtle"
          >
            <Search size={14} />
            <span className="flex-1 truncate">Search problems…</span>
            <span className="kbd hidden sm:inline">Ctrl K</span>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <span
              className="mono mr-1 hidden items-center gap-1 rounded-md px-2 py-1 text-xs text-muted sm:flex"
              title="Current streak"
            >
              <Flame size={14} className={streak > 0 ? 'text-medium' : 'text-subtle'} />
              {streak}d
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => updateSettings({ theme: isLight ? 'dark' : 'light' })}
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isLight ? <Moon size={15} /> : <Sun size={15} />}
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-5 sm:px-6 sm:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProblemDrawer problemId={openId} onClose={handleDrawerClose} />
    </div>
  );
}

export function AppLayout() {
  return (
    <DrawerProvider>
      <LayoutInner />
    </DrawerProvider>
  );
}
