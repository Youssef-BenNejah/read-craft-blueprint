import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useNavigate } from 'react-router-dom';
import TopBar from '../layout/TopBar';
import { getProjectProgress } from '../../utils/progressCalc';
import { ProjectStatusBadge } from '../nexus-ui/NexusBadge';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import CreateProjectModal from '../modals/CreateProjectModal';
import { FolderOpen, Plus, Calendar, Users, ArrowRight, MoreVertical, Trash2, Copy, Archive, Edit, Rocket, LayoutGrid, List, RefreshCw, CheckCircle2, UsersRound } from 'lucide-react';
import { Project, ProjectStatus } from '../../store/types';

const statusFilters: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
];

const DashboardView: React.FC = () => {
  const { projects, deleteProject, loading } = useProjectStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'name' | 'progress'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'p' && !(e.target instanceof HTMLInputElement)) setCreateOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return getProjectProgress(b).percentage - getProjectProgress(a).percentage;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalMembers = new Set(projects.flatMap(p => p.members.map(m => m.name))).size;
  const inProgress = projects.filter(p => p.status === 'in_progress').length;
  const completed = projects.filter(p => p.status === 'completed').length;

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: FolderOpen, color: 'text-nexus-blue' },
    { label: 'In Progress', value: inProgress, icon: RefreshCw, color: 'text-nexus-orange' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-nexus-green' },
    { label: 'Team Members', value: totalMembers, icon: UsersRound, color: 'text-nexus-purple' },
  ];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar title="Dashboard" />
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-lg animate-shimmer" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-xl animate-shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Dashboard" />

      <div className="p-4 sm:p-6 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map(s => (
            <div key={s.label} className="bg-surface-card border border-brd-subtle rounded-lg p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:border-brd-medium transition-colors">
              <s.icon size={24} className={`${s.color} flex-shrink-0`} />
              <div className="min-w-0">
                <p className={`font-mono text-xl sm:text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[11px] sm:text-xs text-txt-secondary truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 lg:pb-0">
            {statusFilters.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  filter === f.value ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-txt-secondary hover:text-txt-primary border border-brd-subtle'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="bg-surface-card border border-brd-subtle text-txt-secondary text-xs rounded-md px-3 py-1.5 outline-none">
              <option value="latest">Sort: Latest</option>
              <option value="name">Sort: Name</option>
              <option value="progress">Sort: Progress</option>
            </select>
            <div className="flex border border-brd-subtle rounded-md overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-txt-muted'}`}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-txt-muted'}`}>
                <List size={14} />
              </button>
            </div>
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ml-auto">
              <Plus size={16} /> <span className="hidden xs:inline">New Project</span><span className="xs:hidden">New</span>
            </button>
          </div>
        </div>

        {/* Projects */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Rocket size={48} className="text-txt-muted mb-4" />
            <h3 className="font-mono text-lg text-txt-primary mb-2">No projects yet</h3>
            <p className="text-sm text-txt-secondary mb-6">Create your first project to get started</p>
            <button onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus size={16} /> New Project
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
            {filtered.map(project => {
              const { done, total, percentage } = getProjectProgress(project);
              return (
                <div key={project.id}
                  className="group bg-surface-card border border-brd-subtle rounded-xl hover:border-brd-medium hover:scale-[1.01] transition-all duration-200 relative overflow-hidden"
                  style={{ borderTopColor: project.color, borderTopWidth: '3px' }}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FolderOpen size={20} style={{ color: project.color }} />
                        <h3 className="font-mono text-sm font-bold text-txt-primary">{project.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProjectStatusBadge status={project.status} />
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === project.id ? null : project.id); }}
                            className="p-1 rounded text-txt-muted hover:text-txt-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={14} />
                          </button>
                          {menuOpen === project.id && (
                            <div className="absolute right-0 top-6 w-36 bg-surface-modal border border-brd-medium rounded-lg shadow-lg z-20 py-1 animate-modal-in">
                              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-txt-secondary hover:bg-surface-card transition-colors">
                                <Edit size={12} /> Edit
                              </button>
                              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-txt-secondary hover:bg-surface-card transition-colors">
                                <Copy size={12} /> Duplicate
                              </button>
                              <button onClick={() => { deleteProject(project.id); setMenuOpen(null); }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-nexus-red hover:bg-surface-card transition-colors">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-txt-secondary line-clamp-2 mb-3">{project.description}</p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-surface-secondary text-[10px] text-txt-muted border border-brd-subtle">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Date + Team */}
                    <div className="flex items-center justify-between mb-3 text-xs text-txt-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-1">
                          {project.members.slice(0, 4).map(m => (
                            <span key={m.id} className="w-5 h-5 rounded-full border-2 border-surface-card flex items-center justify-center text-[9px] font-bold text-white"
                              style={{ backgroundColor: m.color }}>
                              {m.name[0]}
                            </span>
                          ))}
                        </div>
                        <span className="ml-1">{project.members.length} Devs</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <NexusProgressBar percentage={percentage} color={project.color} />
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-txt-muted">{done}/{total} tasks</span>
                        <span className="font-mono text-sm font-bold" style={{ color: project.color }}>{percentage}%</span>
                      </div>
                    </div>

                    {/* Action */}
                    <button onClick={() => navigate(`/project/${project.id}`)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-brd-subtle text-xs text-txt-secondary hover:text-txt-primary hover:border-brd-medium transition-colors">
                      Open Project <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};

export default DashboardView;
