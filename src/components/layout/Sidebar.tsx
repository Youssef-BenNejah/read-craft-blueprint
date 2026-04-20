import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { getProjectProgress } from '../../utils/progressCalc';
import { useIsMobile } from '../../hooks/use-mobile';
import {
  LayoutDashboard, FolderOpen, Users,
  ChevronLeft, ChevronRight, Target, ClipboardList, FileText, X
} from 'lucide-react';

const Sidebar = () => {
  const { projects, sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useProjectStore();
  const location = useLocation();
  const { projectId: currentProjectId } = useParams();
  const isMobile = useIsMobile();

  const isProjectView = !!currentProjectId;
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Close mobile sidebar on route change
  useEffect(() => {
    if (isMobile) setMobileSidebarOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isMobile]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderOpen, label: 'All Projects', path: '/projects' },
    { icon: Users, label: 'Team Overview', path: '/team' },
  ];

  // On mobile: show as overlay drawer; on desktop: show as fixed sidebar with collapse
  const onMobile = isMobile;
  const visible = onMobile ? mobileSidebarOpen : true;
  const widthClass = onMobile
    ? 'w-64'
    : sidebarCollapsed ? 'w-16' : 'w-56';
  const translateClass = onMobile && !mobileSidebarOpen ? '-translate-x-full' : 'translate-x-0';
  const collapsed = onMobile ? false : sidebarCollapsed;

  return (
    <>
      {/* Backdrop on mobile */}
      {onMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          aria-hidden
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-surface-secondary border-r border-brd-subtle flex flex-col z-50 transition-all duration-300 ${widthClass} ${translateClass}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-brd-subtle">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-sm font-bold text-txt-primary tracking-wider">NEXUS PM</span>
            </div>
          )}
          {collapsed && <span className="w-2 h-2 rounded-full bg-primary animate-pulse mx-auto" />}
          {onMobile ? (
            <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto text-txt-muted hover:text-txt-primary transition-colors" aria-label="Close menu">
              <X size={18} />
            </button>
          ) : (
            <button onClick={toggleSidebar} className="ml-auto text-txt-muted hover:text-txt-primary transition-colors" aria-label="Toggle sidebar">
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Back to projects when in project view */}
          {isProjectView && !collapsed && (
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-xs text-txt-secondary hover:text-txt-primary transition-colors border-b border-brd-subtle">
              <ChevronLeft size={14} /> All Projects
            </Link>
          )}

          {/* Project context */}
          {isProjectView && currentProject && !collapsed && (
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
                {currentProject.members.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-2 py-1 text-xs text-txt-secondary">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                    <span className="truncate">{m.name}</span>
                    <span className="ml-auto font-code text-[10px] text-txt-muted">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nav items */}
          {(!isProjectView || onMobile) && (
            <nav className="py-2 space-y-0.5 px-2">
              {navItems.map((item) => {
                const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
                return (
                  <Link key={item.label} to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'text-primary bg-primary/10 border-l-2 border-primary'
                        : 'text-txt-secondary hover:text-txt-primary hover:bg-surface-card'
                    }`}
                  >
                    <item.icon size={18} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Recent projects on dashboard */}
          {!isProjectView && !collapsed && (
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
        </div>

        {/* Version */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-brd-subtle">
            <p className="text-[10px] text-txt-muted">v1.0.0 · Built with NEXUS</p>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
