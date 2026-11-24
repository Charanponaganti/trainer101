import {
  BarChart3,
  Bookmark,
  Building2,
  CalendarDays,
  ClipboardList,
  Code2,
  LayoutDashboard,
  ListChecks,
  Map as MapIcon,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Settings as SettingsIcon,
  Terminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const MAIN: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/problems', label: 'All Problems', icon: ListChecks },
  { to: '/sheets', label: 'DSA Sheets', icon: ClipboardList },
  { to: '/topics', label: 'Topic Roadmap', icon: MapIcon },
  { to: '/codeforces', label: 'Codeforces Arena', icon: Code2 },
  { to: '/companies', label: 'Company Prep', icon: Building2 },
];

const TRACK: NavItem[] = [
  { to: '/revision', label: 'Revision Center', icon: RotateCcw },
  { to: '/planner', label: 'Study Planner', icon: CalendarDays },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

const SYSTEM: NavItem[] = [{ to: '/settings', label: 'Settings', icon: SettingsIcon }];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
  mobile?: boolean;
}

export function Sidebar({ collapsed = false, onToggle, onNavigate, mobile = false }: SidebarProps) {
  const narrow = collapsed && !mobile;

  const renderGroup = (items: NavItem[], title?: string) => (
    <div className="space-y-0.5">
      {title && !narrow && <div className="px-2.5 pb-1 pt-3 text-[10px] font-medium uppercase tracking-wider text-subtle">{title}</div>}
      {title && narrow && <div className="mx-2 my-2 border-t border-border-soft" />}
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          title={narrow ? item.label : undefined}
          className={({ isActive }) => cn('nav-link', isActive && 'active', narrow && 'justify-center px-0')}
        >
          <item.icon size={16} className="shrink-0" />
          {!narrow && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className={cn('flex h-12 shrink-0 items-center border-b border-border-soft px-3', narrow ? 'justify-center' : 'gap-2')}>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-[#04130d]">
          <Terminal size={14} strokeWidth={2.5} />
        </div>
        {!narrow && <span className="mono text-[13px] font-semibold tracking-tight">PLACEMENT OS</span>}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Main navigation">
        {renderGroup(MAIN)}
        {renderGroup(TRACK, 'Track')}
        {renderGroup(SYSTEM, 'System')}
      </nav>
      {!mobile && onToggle && (
        <div className="border-t border-border-soft p-2">
          <button
            type="button"
            onClick={onToggle}
            className={cn('nav-link w-full cursor-pointer', narrow && 'justify-center px-0')}
            title="Toggle sidebar ([)"
          >
            {narrow ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!narrow && (
              <>
                <span className="flex-1 text-left">Collapse</span>
                <span className="kbd">[</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
