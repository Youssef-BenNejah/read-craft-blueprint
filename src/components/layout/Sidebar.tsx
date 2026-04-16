import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { getProjectProgress } from '../../utils/progressCalc';
import {
  LayoutDashboard, FolderOpen, Users,
  ChevronLeft, ChevronRight, Dot, Target, ClipboardList, FileText
} from 'lucide-react';

const Sidebar = () => {
  const { projects, currentView, setCurrentView, setSelectedProjectId, selectedProjectId } = useProjectStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderOpen, label: 'All Projects', path: '/projects' },
    { icon: Users, label: 'Team Overview', path: '/team', badge: undefined },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface-secondary border-r border-brd-subtle flex flex-col z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-brd-subtle">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-sm font-bold text-txt-primary tracking-wider">NEXUS PM</span>
          </div>
        )}
        {sidebarCollapsed && <span className="w-2 h-2 rounded-full bg-primary animate-pulse mx-auto" />}
        <button onClick={toggleSidebar} className="ml-auto text-txt-muted hover:text-txt-primary transition-colors">
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Back to projects when in project view */}
      {isProjectView && !sidebarCollapsed && (
        <Link to="/" className="flex items-center gap-2 px-4 py-2 text-xs text-txt-secondary hover:text-txt-primary transition-colors border-b border-brd-subtle">
          <ChevronLeft size={14} /> All Projects
        </Link>
      )}

      {/* Project context */}
      {isProjectView && currentProject && !sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-brd-subtle">
          <div className="flex items-center gap-2">
            <FolderOpen size={18} style={{ color: currentProject.color }} />
            <span className="font-mono text-xs font-semibold text-txt-primary truncate">{currentProject.name}</span>
          </div>
          <div className="mt-3 space-y-1">
            <Link to={`/project/${currentProjectId}`}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors ${
                !location.pathname.includes('/list') && !location.pathname.includes('/docs')
                  ? 'text-primary bg-primary/10' : 'text-txt-secondary hover:text-txt-primary'
              }`}>
              <Target size={14} /> Board
            </Link>
            <Link to={`/project/${currentProjectId}/list`}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors ${
                location.pathname.includes('/list') ? 'text-primary bg-primary/10' : 'text-txt-secondary hover:text-txt-primary'
              }`}>
              <ClipboardList size={14} /> List
            </Link>
            <Link to={`/project/${currentProjectId}/docs`}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors ${
                location.pathname.includes('/docs') ? 'text-primary bg-primary/10' : 'text-txt-secondary hover:text-txt-primary'
              }`}>
              <FileText size={14} /> Documents
            </Link>
          </div>
          {/* Members list */}
          <div className="mt-3 space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-txt-muted">Team</span>
            {currentProject.members.map(m => {
              const prog = getProjectProgress(currentProject);
              return (
                <div key={m.id} className="flex items-center gap-2 px-2 py-1 text-xs text-txt-secondary">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="truncate">{m.name}</span>
                  <span className="ml-auto font-code text-[10px] text-txt-muted">{m.role}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav items */}
      {!isProjectView && (
        <nav className="flex-1 py-2 space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            const isDisabled = !!item.badge;
            return (
              <Link key={item.label} to={isDisabled ? '#' : item.path}
                onClick={isDisabled ? (e: React.MouseEvent) => e.preventDefault() : undefined}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10 border-l-2 border-primary'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                }`}
              >
                <item.icon size={18} />
                {!sidebarCollapsed && (
                  <>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-brd-subtle text-txt-muted">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Recent projects on dashboard */}
      {!isProjectView && !sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-brd-subtle">
          <span className="text-[10px] uppercase tracking-wider text-txt-muted">Recent Projects</span>
          <div className="mt-2 space-y-1">
            {projects.slice(0, 5).map(p => {
              const { percentage } = getProjectProgress(p);
              return (
                <Link key={p.id} to={`/project/${p.id}`}
                  className="flex items-center gap-2 px-2 py-1 text-xs text-txt-secondary hover:text-txt-primary rounded transition-colors">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="truncate">{p.name}</span>
                  <span className="ml-auto font-code text-[10px] text-txt-muted">{percentage}%</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Version */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-t border-brd-subtle">
          <p className="text-[10px] text-txt-muted">v1.0.0 · Built with NEXUS</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
