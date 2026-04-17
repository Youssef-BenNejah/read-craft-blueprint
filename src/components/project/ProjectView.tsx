import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { getProjectProgress, getMemberProgress, getGroupProgress } from '../../utils/progressCalc';
import TopBar from '../layout/TopBar';
import { ProjectStatusBadge, PriorityBadge, StatusBadge } from '../nexus-ui/NexusBadge';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import TicketCard from './TicketCard';
import CreateTicketModal from '../modals/CreateTicketModal';
import NexusModal from '../nexus-ui/NexusModal';
import { Calendar, Users, Ticket as TicketIcon, Plus, Upload, ChevronDown, ChevronRight, Settings, FileText, LayoutGrid, List, Filter, Search, X, MoreVertical, ArrowUpDown, Download, Trash2, File, FolderOpen, CheckSquare, Square } from 'lucide-react';
import { Ticket, TicketGroup, TicketPriority, TicketStatus, TeamMember } from '../../store/types';
import { toast } from 'sonner';

const ProjectView: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, updateTicket, addGroup, addMember, deleteGroup, deleteGroupWithTickets, deleteTickets, updateProject, removeMember, addDocument, removeDocument, loading } = useProjectStore();
  const project = projects.find(p => p.id === projectId);
  const isDocsView = location.pathname.includes('/docs');
  const isListView = location.pathname.includes('/list');
  const activeView: 'board' | 'list' | 'docs' = isDocsView ? 'docs' : isListView ? 'list' : 'board';

  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
  const [defaultMemberId, setDefaultMemberId] = useState<string>();
  const [defaultGroupId, setDefaultGroupId] = useState<string>();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addGroupOpen, setAddGroupOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importMemberId, setImportMemberId] = useState('');
  const [importGroupId, setImportGroupId] = useState<string | undefined>();
  const [importJson, setImportJson] = useState('');
  const [newGroupLabel, setNewGroupLabel] = useState('');
  const [memberFormData, setMemberFormData] = useState({ name: '', role: '', responsibilities: '', color: '#60a5fa', avatarEmoji: '💻' });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [dragOverMemberId, setDragOverMemberId] = useState<string | null>(null);

  const toggleTicketSelection = (ticketId: string) => {
    setSelectedTickets(prev => {
      const next = new Set(prev);
      if (next.has(ticketId)) next.delete(ticketId); else next.add(ticketId);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedTickets.size === 0) return;
    if (!confirm(`Delete ${selectedTickets.size} selected ticket(s)?`)) return;
    deleteTickets(project!.id, Array.from(selectedTickets));
    setSelectedTickets(new Set());
    setSelectMode(false);
    toast.success(`${selectedTickets.size} tickets deleted`);
  };

  const handleDeleteGroupWithTickets = (groupId: string, groupLabel: string) => {
    const ticketCount = project!.tickets.filter(t => t.groupId === groupId).length;
    if (!confirm(`Delete group "${groupLabel}" and its ${ticketCount} ticket(s)?`)) return;
    deleteGroupWithTickets(project!.id, groupId);
    toast.success(`Group and ${ticketCount} tickets deleted`);
  };

  // Filters
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'all'>('all');
  const [filterMember, setFilterMember] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort for list view
  const [sortColumn, setSortColumn] = useState<string>('code');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setCreateTicketOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="font-mono text-lg text-txt-primary mb-4">Project not found</h2>
      <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Back to Dashboard</button>
    </div>
  );

  const { done, total, percentage } = getProjectProgress(project);
  const days = Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24));
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filterTickets = (tickets: Ticket[]) => tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterMember !== 'all' && t.memberId !== filterMember) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleGroup = (id: string) => {
    const next = new Set(collapsedGroups);
    next.has(id) ? next.delete(id) : next.add(id);
    setCollapsedGroups(next);
  };

  const handleAddGroup = () => {
    if (!newGroupLabel.trim()) return;
    addGroup(project.id, {
      projectId: project.id, label: newGroupLabel,
      order: project.groups.length + 1,
    });
    setNewGroupLabel('');
    setAddGroupOpen(false);
    toast.success('Group added');
  };

  const handleAddMember = () => {
    if (!memberFormData.name || !memberFormData.role) return;
    addMember(project.id, memberFormData);
    setMemberFormData({ name: '', role: '', responsibilities: '', color: '#60a5fa', avatarEmoji: '💻' });
    setAddMemberOpen(false);
    toast.success('Member added');
  };

  const handleImportJson = () => {
    try {
      const tickets = JSON.parse(importJson);
      if (!Array.isArray(tickets)) throw new Error('Not array');
      const { importTickets } = useProjectStore.getState();
      const mapped = tickets.map((t: any) => ({
        code: t.code || 'X-00',
        name: t.name || 'Untitled',
        description: t.description || '',
        memberId: importMemberId || project.members[0]?.id || '',
        projectId: project.id,
        groupId: importGroupId,
        priority: t.priority || 'medium',
        status: t.status || 'todo',
        estimatedHours: t.estimatedHours,
        folderPath: t.folderPath,
        dependencies: t.dependencies,
        tags: t.tags,
        notes: t.notes,
      }));
      importTickets(project.id, mapped);
      toast.success(`${mapped.length} tickets imported`);
      setImportOpen(false);
      setImportJson('');
      setImportGroupId(undefined);
    } catch {
      toast.error('Invalid JSON format');
    }
  };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project exported');
  };

  // Groups + ungrouped
  const sortedGroups = [...project.groups].sort((a, b) => a.order - b.order);
  const ungroupedTickets = filterTickets(project.tickets.filter(t => !t.groupId));
  const hasFilters = filterStatus !== 'all' || filterPriority !== 'all' || filterMember !== 'all' || searchQuery;

  // List view sort
  const allFilteredTickets = filterTickets(project.tickets);
  const sortedTickets = [...allFilteredTickets].sort((a, b) => {
    let cmp = 0;
    if (sortColumn === 'code') cmp = a.code.localeCompare(b.code);
    if (sortColumn === 'name') cmp = a.name.localeCompare(b.name);
    if (sortColumn === 'priority') cmp = a.priority.localeCompare(b.priority);
    if (sortColumn === 'status') cmp = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (col: string) => {
    if (sortColumn === col) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortColumn(col); setSortDir('asc'); }
  };

  return (
    <div className="min-h-screen">
      <TopBar title={project.name} />

      <div className="p-6 animate-fade-up">
        {/* Project Header */}
        <div className="bg-surface-card border border-brd-subtle rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen size={24} style={{ color: project.color }} />
                <h1 className="font-mono text-xl font-bold text-txt-primary">{project.name}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="text-sm text-txt-secondary mb-3">{project.description}</p>
              <div className="flex items-center gap-4 text-xs text-txt-muted">
                <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(project.startDate)} – {formatDate(project.endDate)}</span>
                <span className="flex items-center gap-1"><Users size={12} />{project.members.length} Devs × {days} Days</span>
                <span className="flex items-center gap-1"><TicketIcon size={12} />{total} Tickets</span>
              </div>
            </div>

            <div className="text-right min-w-[200px]">
              <p className="text-[10px] uppercase tracking-wider text-txt-muted mb-1">Sprint Progress</p>
              <p className="font-mono text-3xl font-bold text-primary mb-2">{percentage}%</p>
              <NexusProgressBar percentage={percentage} color={project.color} height={6} />
              <p className="text-xs text-txt-muted mt-1">{done}/{total} tasks</p>
              <div className="flex items-center gap-2 mt-3 justify-end">
                <button onClick={exportProject} className="p-1.5 rounded border border-brd-subtle text-txt-muted hover:text-txt-primary text-xs"><FileText size={14} /></button>
                <button onClick={() => setEditProjectOpen(true)} className="p-1.5 rounded border border-brd-subtle text-txt-muted hover:text-txt-primary"><Settings size={14} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setAddMemberOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-txt-secondary border border-brd-subtle rounded-md hover:border-primary hover:text-primary transition-colors">
              <Plus size={12} /> Add Member
            </button>
            <button onClick={() => setAddGroupOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-xs text-txt-secondary border border-brd-subtle rounded-md hover:border-primary hover:text-primary transition-colors">
              <Plus size={12} /> Add Group
            </button>
            <button onClick={() => setCreateTicketOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold">
              <Plus size={12} /> New Ticket
            </button>
            <button onClick={() => { setSelectMode(!selectMode); setSelectedTickets(new Set()); }}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md transition-colors ${selectMode ? 'bg-nexus-red/10 border-nexus-red text-nexus-red' : 'text-txt-secondary border-brd-subtle hover:border-primary hover:text-primary'}`}>
              <CheckSquare size={12} /> {selectMode ? 'Cancel Select' : 'Select'}
            </button>
            {selectMode && selectedTickets.size > 0 && (
              <button onClick={handleBulkDelete}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-nexus-red text-white rounded-md font-semibold">
                <Trash2 size={12} /> Delete {selectedTickets.size} ticket{selectedTickets.size > 1 ? 's' : ''}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Filters */}
            <div className="flex items-center gap-1 px-2 py-1 bg-surface-card border border-brd-subtle rounded-md">
              <Search size={12} className="text-txt-muted" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter tickets..."
                className="bg-transparent text-xs text-txt-primary outline-none w-28 placeholder:text-txt-muted" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}
              className="bg-surface-card border border-brd-subtle text-txt-secondary text-xs rounded-md px-2 py-1.5 outline-none">
              <option value="all">All Status</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
              className="bg-surface-card border border-brd-subtle text-txt-secondary text-xs rounded-md px-2 py-1.5 outline-none">
              <option value="all">All Priority</option>
              <option value="blocker">Blocker</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            {hasFilters && (
              <button onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setFilterMember('all'); setSearchQuery(''); }}
                className="flex items-center gap-1 px-2 py-1.5 text-xs text-nexus-red hover:bg-nexus-red/10 rounded-md">
                <X size={12} /> Clear
              </button>
            )}
            <div className="flex border border-brd-subtle rounded-md overflow-hidden ml-2">
              <button onClick={() => navigate(`/project/${projectId}`)} className={`p-1.5 ${activeView === 'board' ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-txt-muted'}`}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => navigate(`/project/${projectId}/list`)} className={`p-1.5 ${activeView === 'list' ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-txt-muted'}`}>
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Board View — Parallel Group Columns */}
        {activeView === 'board' && (
          <div>
            {/* Member Summary Bar — Drop targets for reassignment */}
            <div className="flex items-center gap-3 mb-4 overflow-x-auto scrollbar-thin pb-2">
              <span className="text-[11px] uppercase tracking-wider text-txt-muted flex-shrink-0 font-semibold">Drop ticket on dev to reassign →</span>
              {project.members.map(member => {
                const mp = getMemberProgress(project, member.id);
                const isDropTarget = dragOverMemberId === member.id;
                return (
                  <div
                    key={member.id}
                    onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dragOverMemberId !== member.id) setDragOverMemberId(member.id); }}
                    onDragLeave={() => setDragOverMemberId(prev => prev === member.id ? null : prev)}
                    onDrop={(e) => {
                      e.preventDefault();
                      const ticketId = e.dataTransfer.getData('text/ticket-id');
                      const pid = e.dataTransfer.getData('text/project-id');
                      setDragOverMemberId(null);
                      if (!ticketId || pid !== project.id) return;
                      const t = project.tickets.find(x => x.id === ticketId);
                      if (!t || t.memberId === member.id) return;
                      updateTicket(project.id, ticketId, { memberId: member.id });
                      toast.success(`Reassigned to ${member.name}`);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-3 border-2 rounded-xl min-w-fit transition-all ${
                      isDropTarget
                        ? 'scale-110 ring-4 ring-offset-2 ring-offset-bg-primary shadow-2xl'
                        : 'bg-surface-card border-brd-subtle hover:border-brd-medium'
                    }`}
                    style={isDropTarget ? { borderColor: member.color, backgroundColor: `${member.color}25`, boxShadow: `0 0 0 4px ${member.color}40` } : undefined}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }} />
                    <span className="font-semibold text-sm text-txt-primary">{member.name}</span>
                    <span className="font-code text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-txt-muted">{member.role}</span>
                    <span className="text-[11px] text-txt-muted font-mono">{mp.done}/{mp.total}</span>
                  </div>
                );
              })}
            </div>

            {/* Parallel Columns */}
            <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-4" style={{ minHeight: '60vh' }}>
              {sortedGroups.map(group => {
                const gp = getGroupProgress(project, group.id);
                const collapsed = collapsedGroups.has(group.id);
                const groupTickets = filterTickets(project.tickets.filter(t => t.groupId === group.id));

                return (
                  <div key={group.id} className="min-w-[320px] flex-1 flex flex-col">
                    {/* Group Header */}
                    <div className="bg-surface-card border border-brd-subtle rounded-lg p-3 mb-3 flex-shrink-0">
                      <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => toggleGroup(group.id)}>
                        {collapsed ? <ChevronRight size={14} className="text-txt-muted" /> : <ChevronDown size={14} className="text-txt-muted" />}
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.color || project.color }} />
                        <h3 className="font-mono text-sm font-bold text-txt-primary truncate">{group.label}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-txt-muted mb-2">
                        <span>{gp.total} tickets</span><span>·</span>
                        <span>{gp.totalHours}h</span><span>·</span>
                        <span>{gp.done}/{gp.total} ({gp.percentage}%)</span>
                      </div>
                      <NexusProgressBar percentage={gp.percentage} color={group.color || project.color} height={3} />
                      <div className="flex items-center gap-1 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); setDefaultGroupId(group.id); setCreateTicketOpen(true); }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] text-primary border border-primary/30 rounded hover:bg-primary/10 transition-colors">
                          <Plus size={10} /> Ticket
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setImportGroupId(group.id); setImportMemberId(project.members[0]?.id || ''); setImportOpen(true); }}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] text-txt-muted border border-brd-subtle rounded hover:border-brd-medium transition-colors">
                          <Upload size={10} /> Import
                        </button>
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); deleteGroup(project.id, group.id); }}
                            className="text-txt-muted hover:text-nexus-red p-1" title="Remove group (keep tickets)">
                            <X size={12} />
                          </button>
                          {groupTickets.length > 0 && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGroupWithTickets(group.id, group.label); }}
                              className="text-txt-muted hover:text-nexus-red p-1" title="Delete group + all tickets">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Group Tickets */}
                    {!collapsed && (
                      <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin pr-1">
                        {groupTickets.length === 0 ? (
                          <div className="border border-dashed border-brd-medium rounded-lg p-6 flex flex-col items-center justify-center text-center">
                            <button onClick={() => { setDefaultGroupId(group.id); setCreateTicketOpen(true); }}
                              className="text-[10px] text-txt-muted hover:text-primary transition-colors">
                              <Plus size={14} className="mx-auto mb-1" /> Add Ticket
                            </button>
                          </div>
                        ) : (
                          groupTickets.map(ticket => {
                            const member = project.members.find(m => m.id === ticket.memberId);
                            return (
                              <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                projectId={project.id}
                                memberColor={member?.color || '#888'}
                                memberName={member?.name || 'Unknown'}
                                onEdit={() => { setEditingTicket(ticket); setCreateTicketOpen(true); }}
                                selectMode={selectMode}
                                selected={selectedTickets.has(ticket.id)}
                                onToggleSelect={toggleTicketSelection}
                              />
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped column */}
              {ungroupedTickets.length > 0 && (
                <div className="min-w-[320px] flex-1 flex flex-col">
                  <div className="bg-surface-card border border-brd-subtle rounded-lg p-3 mb-3 flex-shrink-0">
                    <h3 className="font-mono text-sm font-bold text-txt-muted">UNGROUPED</h3>
                    <span className="text-[10px] text-txt-muted">{ungroupedTickets.length} tickets</span>
                  </div>
                  <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin pr-1">
                    {ungroupedTickets.map(ticket => {
                      const member = project.members.find(m => m.id === ticket.memberId);
                      return (
                        <TicketCard
                          key={ticket.id} ticket={ticket} projectId={project.id}
                          memberColor={member?.color || '#888'} memberName={member?.name || 'Unknown'}
                          onEdit={() => { setEditingTicket(ticket); setCreateTicketOpen(true); }}
                          selectMode={selectMode}
                          selected={selectedTickets.has(ticket.id)}
                          onToggleSelect={toggleTicketSelection}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Empty state */}
            {project.tickets.length === 0 && project.members.length > 0 && (
              <div className="text-center py-12">
                <TicketIcon size={36} className="text-txt-muted mx-auto mb-3" />
                <p className="text-sm text-txt-secondary mb-3">No tickets yet. Create your first ticket!</p>
                <button onClick={() => setCreateTicketOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
                  <Plus size={14} className="inline mr-1" /> Create Ticket
                </button>
              </div>
            )}

            {project.members.length === 0 && (
              <div className="text-center py-12">
                <Users size={36} className="text-txt-muted mx-auto mb-3" />
                <p className="text-sm text-txt-secondary mb-3">Add your first team member to start organizing tickets</p>
                <button onClick={() => setAddMemberOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold">
                  <Plus size={14} className="inline mr-1" /> Add Member
                </button>
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {activeView === 'list' && (
          <div className="bg-surface-card border border-brd-subtle rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brd-subtle">
                  {['code', 'name', 'member', 'priority', 'status', 'hours', 'group'].map(col => (
                    <th key={col} className="text-left px-4 py-3 text-txt-muted font-mono uppercase tracking-wider cursor-pointer hover:text-txt-primary" onClick={() => toggleSort(col)}>
                      <span className="flex items-center gap-1">{col} <ArrowUpDown size={10} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedTickets.map(ticket => {
                  const member = project.members.find(m => m.id === ticket.memberId);
                  const group = project.groups.find(g => g.id === ticket.groupId);
                  return (
                    <tr key={ticket.id}
                      onClick={() => { setEditingTicket(ticket); setCreateTicketOpen(true); }}
                      className="border-b border-brd-subtle hover:bg-surface-card-hover cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-code" style={{ color: member?.color }}>{ticket.code}</td>
                      <td className={`px-4 py-3 text-txt-primary ${ticket.status === 'done' ? 'line-through text-[hsl(var(--done-text))]' : ''}`}>{ticket.name}</td>
                      <td className="px-4 py-3 text-txt-secondary">{member?.name || '—'}</td>
                      <td className="px-4 py-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="px-4 py-3"><StatusBadge status={ticket.status} /></td>
                      <td className="px-4 py-3 text-txt-muted">{ticket.estimatedHours ? `${ticket.estimatedHours}h` : '—'}</td>
                      <td className="px-4 py-3 text-txt-muted">{group?.label || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sortedTickets.length === 0 && (
              <div className="text-center py-8 text-txt-muted text-sm">No tickets match your filters</div>
            )}
          </div>
        )}

        {/* Documents View */}
        {activeView === 'docs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold text-txt-primary">Documents</h3>
              <label className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold cursor-pointer">
                <Upload size={12} /> Upload Document
                <input type="file" className="hidden" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const ext = file.name.split('.').pop()?.toLowerCase() || 'other';
                    const docType = ['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext) ? ext as any : 'other';
                    addDocument(project.id, {
                      name: file.name,
                      type: docType,
                      size: file.size,
                      dataUrl: reader.result as string,
                    });
                    toast.success(`"${file.name}" uploaded`);
                  };
                  reader.readAsDataURL(file);
                }} />
              </label>
            </div>
            {project.documents.length === 0 ? (
              <div className="bg-surface-card border border-dashed border-brd-medium rounded-xl p-12 text-center">
                <FileText size={32} className="mx-auto mb-3 text-txt-muted" />
                <p className="text-sm text-txt-muted">No documents yet</p>
                <p className="text-xs text-txt-muted mt-1">Upload files to attach them to this project</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.documents.map(doc => (
                  <div key={doc.id} className="bg-surface-card border border-brd-subtle rounded-lg p-4 flex items-start gap-3 group">
                    <File size={20} className="text-txt-muted flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-txt-primary truncate">{doc.name}</p>
                      <p className="text-[10px] text-txt-muted mt-1">
                        {doc.type.toUpperCase()} · {(doc.size / 1024).toFixed(1)} KB · {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.dataUrl && (
                        <a href={doc.dataUrl} download={doc.name} className="p-1 text-txt-muted hover:text-primary">
                          <Download size={14} />
                        </a>
                      )}
                      <button onClick={() => { removeDocument(project.id, doc.id); toast.success('Document removed'); }}
                        className="p-1 text-txt-muted hover:text-nexus-red">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Ticket Modal */}
      {createTicketOpen && (
        <CreateTicketModal
          open={createTicketOpen}
          onClose={() => { setCreateTicketOpen(false); setEditingTicket(undefined); setDefaultMemberId(undefined); setDefaultGroupId(undefined); }}
          projectId={project.id}
          defaultMemberId={defaultMemberId}
          defaultGroupId={defaultGroupId}
          editTicket={editingTicket}
        />
      )}

      {/* Add Member Modal */}
      <NexusModal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="👤 Add Member">
        <div className="space-y-3">
          <input value={memberFormData.name} onChange={e => setMemberFormData({ ...memberFormData, name: e.target.value })} placeholder="Name *"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          <input value={memberFormData.role} onChange={e => setMemberFormData({ ...memberFormData, role: e.target.value })} placeholder="Role (e.g. DEV-A) *"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          <textarea value={memberFormData.responsibilities} onChange={e => setMemberFormData({ ...memberFormData, responsibilities: e.target.value })} placeholder="Responsibilities" rows={2}
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setAddMemberOpen(false)} className="px-4 py-2 text-xs text-txt-secondary">Cancel</button>
            <button onClick={handleAddMember} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold">Add Member</button>
          </div>
        </div>
      </NexusModal>

      {/* Add Group Modal */}
      <NexusModal open={addGroupOpen} onClose={() => setAddGroupOpen(false)} title="Add Group">
        <div className="space-y-3">
          <input value={newGroupLabel} onChange={e => setNewGroupLabel(e.target.value)} placeholder="e.g. DAY 3 — DEPLOYMENT"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm font-mono text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setAddGroupOpen(false)} className="px-4 py-2 text-xs text-txt-secondary">Cancel</button>
            <button onClick={handleAddGroup} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold">Add Group</button>
          </div>
        </div>
      </NexusModal>

      {/* Import JSON Modal */}
      <NexusModal open={importOpen} onClose={() => { setImportOpen(false); setImportGroupId(undefined); }} title={`Import Tickets${importGroupId ? ` → ${project.groups.find(g => g.id === importGroupId)?.label || 'Group'}` : ''}`} wide>
        <div className="space-y-4">
          <p className="text-xs text-txt-secondary">Paste JSON array of tickets. Each ticket needs at least <code className="font-code text-primary">name</code> and <code className="font-code text-primary">code</code>.{importGroupId && <span className="text-primary ml-1">Tickets will be added to the selected group.</span>}</p>
          <details className="text-xs text-txt-muted">
            <summary className="cursor-pointer hover:text-txt-secondary">JSON Schema Reference</summary>
            <pre className="mt-2 p-3 bg-surface-secondary rounded-md overflow-x-auto font-code text-[10px]">{`[{
  "code": "A-01", "name": "Ticket Name",
  "priority": "critical", "status": "done",
  "estimatedHours": 3, "folderPath": "auth/"
}]`}</pre>
          </details>
          <textarea value={importJson} onChange={e => setImportJson(e.target.value)} rows={8} placeholder="Paste JSON here..."
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm font-code text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Assign to member:</label>
            <select value={importMemberId} onChange={e => setImportMemberId(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none">
              {project.members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setImportOpen(false)} className="px-4 py-2 text-xs text-txt-secondary">Cancel</button>
            <button onClick={handleImportJson} disabled={!importJson.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold disabled:opacity-50">Import Tickets</button>
          </div>
        </div>
      </NexusModal>

      {/* Edit Project Modal */}
      <NexusModal open={editProjectOpen} onClose={() => setEditProjectOpen(false)} title="⚙️ Project Settings" wide>
        <EditProjectForm project={project} onClose={() => setEditProjectOpen(false)} />
      </NexusModal>
    </div>
  );
};

// Inline Edit Project Form
const EditProjectForm: React.FC<{ project: any; onClose: () => void }> = ({ project, onClose }) => {
  const { updateProject, deleteProject } = useProjectStore();
  const navigate = useNavigate();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [status, setStatus] = useState(project.status);
  const [confirmDelete, setConfirmDelete] = useState('');

  const handleSave = () => {
    updateProject(project.id, { name, description, status });
    toast.success('Project updated');
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete === project.name) {
      deleteProject(project.id);
      toast.success('Project deleted');
      navigate('/');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-txt-secondary mb-1">Project Name</label>
        <input value={name} onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm font-mono text-txt-primary outline-none focus:border-primary" />
      </div>
      <div>
        <label className="block text-xs text-txt-secondary mb-1">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
          className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary resize-none" />
      </div>
      <div>
        <label className="block text-xs text-txt-secondary mb-1">Status</label>
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary">
          <option value="not_started">Not Started</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="px-4 py-2 text-xs text-txt-secondary">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold">Save Changes</button>
      </div>

      <div className="mt-6 pt-4 border-t border-nexus-red/30">
        <h4 className="text-xs font-semibold text-nexus-red mb-2">⚠️ Danger Zone</h4>
        <p className="text-xs text-txt-muted mb-2">Type "<strong>{project.name}</strong>" to confirm deletion</p>
        <input value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder="Type project name..."
          className="w-full px-3 py-2 bg-surface-card border border-nexus-red/30 rounded-md text-sm text-txt-primary outline-none mb-2 placeholder:text-txt-muted" />
        <button onClick={handleDelete} disabled={confirmDelete !== project.name}
          className="px-4 py-2 bg-nexus-red/20 text-nexus-red rounded-md text-xs font-semibold disabled:opacity-30">
          Delete Project
        </button>
      </div>
    </div>
  );
};

export default ProjectView;
