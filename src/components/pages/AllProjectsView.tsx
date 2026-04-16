import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useNavigate } from 'react-router-dom';
import TopBar from '../layout/TopBar';
import { getProjectProgress } from '../../utils/progressCalc';
import { ProjectStatusBadge } from '../nexus-ui/NexusBadge';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import CreateProjectModal from '../modals/CreateProjectModal';
import { FolderOpen, Plus, Calendar, ArrowRight, Trash2, Search } from 'lucide-react';
import { ProjectStatus } from '../../store/types';
import { toast } from 'sonner';

const statusFilters: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Cancelled', value: 'cancelled' },
];

const AllProjectsView: React.FC = () => {
  const { projects, deleteProject, loading } = useProjectStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = projects
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen">
      <TopBar title="All Projects" />
      <div className="p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-mono text-xl font-bold text-txt-primary">All Projects</h1>
            <p className="text-xs text-txt-muted mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-surface-card border border-brd-subtle rounded-md">
            <Search size={14} className="text-txt-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="bg-transparent text-sm text-txt-primary outline-none w-48 placeholder:text-txt-muted" />
          </div>
          <div className="flex gap-1">
            {statusFilters.map(sf => (
              <button key={sf.value} onClick={() => setFilter(sf.value)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  filter === sf.value ? 'bg-primary text-primary-foreground' : 'text-txt-secondary hover:bg-surface-card'
                }`}>
                {sf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project list */}
        <div className="space-y-3">
          {filtered.map(project => {
            const prog = getProjectProgress(project);
            return (
              <div key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-surface-card border border-brd-subtle rounded-xl p-5 cursor-pointer hover:border-brd-medium transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FolderOpen size={20} style={{ color: project.color }} className="mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-mono text-sm font-bold text-txt-primary">{project.name}</h3>
                        <ProjectStatusBadge status={project.status} />
                      </div>
                      <p className="text-xs text-txt-muted line-clamp-2 mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-txt-muted">
                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
                        <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                        <span>{project.tickets.length} ticket{project.tickets.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <NexusProgressBar percentage={prog.percentage} color={project.color} height={4} showLabel />
                    </div>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${project.name}"?`)) {
                        deleteProject(project.id);
                        toast.success('Project deleted');
                      }
                    }} className="opacity-0 group-hover:opacity-100 p-1.5 text-txt-muted hover:text-nexus-red transition-all">
                      <Trash2 size={14} />
                    </button>
                    <ArrowRight size={16} className="text-txt-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-txt-muted text-sm">
              {search || filter !== 'all' ? 'No projects match your filters' : 'No projects yet. Create your first one!'}
            </div>
          )}
        </div>
      </div>

      {createOpen && <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />}
    </div>
  );
};

export default AllProjectsView;
