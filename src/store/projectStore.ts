import { create } from 'zustand';
import { Project, TeamMember, Ticket, TicketGroup, ProjectDocument } from './types';
import { supabase } from '@/integrations/supabase/client';
import { generateSeedData } from '../utils/seedData';

interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  loading: boolean;
  initialized: boolean;

  // Init
  loadProjects: () => Promise<void>;

  // Project CRUD
  addProject: (project: Omit<Project, 'members' | 'tickets' | 'groups' | 'documents'>, members?: Omit<TeamMember, 'id' | 'joinedAt'>[], groups?: Omit<TicketGroup, 'id'>[]) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Member CRUD
  addMember: (projectId: string, member: Omit<TeamMember, 'id' | 'joinedAt'>) => Promise<void>;
  updateMember: (projectId: string, memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;

  // Ticket CRUD
  addTicket: (projectId: string, ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTicket: (projectId: string, ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  deleteTicket: (projectId: string, ticketId: string) => Promise<void>;
  deleteTickets: (projectId: string, ticketIds: string[]) => Promise<void>;
  deleteGroupWithTickets: (projectId: string, groupId: string) => Promise<void>;
  importTickets: (projectId: string, tickets: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>[]) => Promise<void>;

  // Group CRUD
  addGroup: (projectId: string, group: Omit<TicketGroup, 'id'>) => Promise<void>;
  updateGroup: (projectId: string, groupId: string, updates: Partial<TicketGroup>) => Promise<void>;
  deleteGroup: (projectId: string, groupId: string) => Promise<void>;

  // Document CRUD
  addDocument: (projectId: string, doc: Omit<ProjectDocument, 'id' | 'uploadedAt'>) => Promise<void>;
  removeDocument: (projectId: string, docId: string) => Promise<void>;

  setActiveProject: (id: string | null) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

// Helper to map DB row to app types
function mapProject(row: any, members: any[], tickets: any[], groups: any[], documents: any[]): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    emoji: row.emoji,
    status: row.status,
    startDate: row.start_date,
    endDate: row.end_date,
    tags: row.tags || [],
    totalTasksOverride: row.total_tasks_override,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    members: members.map(m => ({
      id: m.id, name: m.name, role: m.role, color: m.color,
      avatarEmoji: m.avatar_emoji, responsibilities: m.responsibilities, joinedAt: m.joined_at,
    })),
    tickets: tickets.map(t => ({
      id: t.id, code: t.code, name: t.name, description: t.description,
      memberId: t.member_id, projectId: t.project_id, groupId: t.group_id,
      priority: t.priority, status: t.status,
      estimatedHours: t.estimated_hours ? Number(t.estimated_hours) : undefined,
      folderPath: t.folder_path, dependencies: t.dependencies || [],
      tags: t.tags || [], notes: t.notes,
      createdAt: t.created_at, updatedAt: t.updated_at, completedAt: t.completed_at,
    })),
    groups: groups.map(g => ({
      id: g.id, projectId: g.project_id, label: g.label,
      description: g.description, color: g.color, order: g.sort_order,
    })),
    documents: documents.map(d => ({
      id: d.id, name: d.name, type: d.doc_type as any,
      uploadedAt: d.uploaded_at, size: d.size, dataUrl: d.data_url, url: d.url,
    })),
  };
}

export const useProjectStore = create<AppState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  loading: true,
  initialized: false,

  loadProjects: async () => {
    set({ loading: true });
    const { data: projectRows, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Failed to load projects', error); set({ loading: false, initialized: true }); return; }

    if (!projectRows || projectRows.length === 0) {
      // Seed data
      const seed = generateSeedData();
      for (const p of seed) {
        const { data: projData } = await supabase.from('projects').insert({
          id: p.id, name: p.name, description: p.description, color: p.color, emoji: p.emoji,
          status: p.status, start_date: p.startDate, end_date: p.endDate, tags: p.tags,
        }).select().single();

        if (projData) {
          // Insert members
          const memberInserts = p.members.map(m => ({
            id: m.id, project_id: projData.id, name: m.name, role: m.role, color: m.color,
            avatar_emoji: m.avatarEmoji, responsibilities: m.responsibilities,
          }));
          await supabase.from('team_members').insert(memberInserts);

          // Insert groups
          const groupInserts = p.groups.map(g => ({
            id: g.id, project_id: projData.id, label: g.label, sort_order: g.order,
          }));
          await supabase.from('ticket_groups').insert(groupInserts);

          // Insert tickets
          const ticketInserts = p.tickets.map(t => ({
            id: t.id, code: t.code, name: t.name, description: t.description,
            member_id: t.memberId, project_id: projData.id, group_id: t.groupId || null,
            priority: t.priority, status: t.status,
            estimated_hours: t.estimatedHours, folder_path: t.folderPath,
            dependencies: t.dependencies || [], tags: t.tags || [], notes: t.notes,
            completed_at: t.completedAt,
          }));
          await supabase.from('tickets').insert(ticketInserts);
        }
      }
      // Reload
      return get().loadProjects();
    }

    // Load all related data
    const projectIds = projectRows.map(p => p.id);
    const [membersRes, ticketsRes, groupsRes, docsRes] = await Promise.all([
      supabase.from('team_members').select('*').in('project_id', projectIds),
      supabase.from('tickets').select('*').in('project_id', projectIds),
      supabase.from('ticket_groups').select('*').in('project_id', projectIds).order('sort_order'),
      supabase.from('project_documents').select('*').in('project_id', projectIds),
    ]);

    const projects = projectRows.map(p => mapProject(
      p,
      (membersRes.data || []).filter(m => m.project_id === p.id),
      (ticketsRes.data || []).filter(t => t.project_id === p.id),
      (groupsRes.data || []).filter(g => g.project_id === p.id),
      (docsRes.data || []).filter(d => d.project_id === p.id),
    ));

    set({ projects, loading: false, initialized: true });
  },

  addProject: async (project, members = [], groups = []) => {
    const { data, error } = await supabase.from('projects').insert({
      name: project.name, description: project.description, color: project.color,
      emoji: project.emoji, status: project.status,
      start_date: project.startDate, end_date: project.endDate, tags: project.tags,
    }).select().single();

    if (error || !data) { console.error(error); return ''; }

    // Insert members
    if (members.length > 0) {
      await supabase.from('team_members').insert(members.map(m => ({
        project_id: data.id, name: m.name, role: m.role, color: m.color,
        avatar_emoji: m.avatarEmoji, responsibilities: m.responsibilities,
      })));
    }

    // Insert groups
    if (groups.length > 0) {
      await supabase.from('ticket_groups').insert(groups.map(g => ({
        project_id: data.id, label: g.label, sort_order: g.order,
        description: g.description, color: g.color,
      })));
    }

    await get().loadProjects();
    return data.id;
  },

  updateProject: async (id, updates) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.totalTasksOverride !== undefined) dbUpdates.total_tasks_override = updates.totalTasksOverride;

    // Optimistic update
    set(s => ({
      projects: s.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)
    }));

    await supabase.from('projects').update(dbUpdates).eq('id', id);
  },

  deleteProject: async (id) => {
    set(s => ({
      projects: s.projects.filter(p => p.id !== id),
      activeProjectId: s.activeProjectId === id ? null : s.activeProjectId,
    }));
    await supabase.from('projects').delete().eq('id', id);
  },

  addMember: async (projectId, member) => {
    const { data, error } = await supabase.from('team_members').insert({
      project_id: projectId, name: member.name, role: member.role, color: member.color,
      avatar_emoji: member.avatarEmoji, responsibilities: member.responsibilities,
    }).select().single();

    if (data) {
      set(s => ({
        projects: s.projects.map(p => p.id === projectId ? {
          ...p,
          members: [...p.members, {
            id: data.id, name: data.name, role: data.role, color: data.color,
            avatarEmoji: data.avatar_emoji, responsibilities: data.responsibilities, joinedAt: data.joined_at,
          }]
        } : p)
      }));
    }
  },

  updateMember: async (projectId, memberId, updates) => {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.color) dbUpdates.color = updates.color;
    if (updates.avatarEmoji) dbUpdates.avatar_emoji = updates.avatarEmoji;
    if (updates.responsibilities) dbUpdates.responsibilities = updates.responsibilities;

    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, members: p.members.map(m => m.id === memberId ? { ...m, ...updates } : m)
      } : p)
    }));

    await supabase.from('team_members').update(dbUpdates).eq('id', memberId);
  },

  removeMember: async (projectId, memberId) => {
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, members: p.members.filter(m => m.id !== memberId)
      } : p)
    }));
    await supabase.from('team_members').delete().eq('id', memberId);
  },

  addTicket: async (projectId, ticket) => {
    const { data, error } = await supabase.from('tickets').insert({
      code: ticket.code, name: ticket.name, description: ticket.description,
      member_id: ticket.memberId, project_id: projectId,
      group_id: ticket.groupId || null, priority: ticket.priority, status: ticket.status,
      estimated_hours: ticket.estimatedHours, folder_path: ticket.folderPath,
      dependencies: ticket.dependencies || [], tags: ticket.tags || [],
      notes: ticket.notes, completed_at: ticket.completedAt,
    }).select().single();

    if (data) {
      const newTicket: Ticket = {
        id: data.id, code: data.code, name: data.name, description: data.description,
        memberId: data.member_id, projectId: data.project_id, groupId: data.group_id || undefined,
        priority: data.priority, status: data.status,
        estimatedHours: data.estimated_hours ? Number(data.estimated_hours) : undefined,
        folderPath: data.folder_path || undefined, dependencies: data.dependencies || [],
        tags: data.tags || [], notes: data.notes || undefined,
        createdAt: data.created_at, updatedAt: data.updated_at, completedAt: data.completed_at || undefined,
      };
      set(s => ({
        projects: s.projects.map(p => p.id === projectId ? { ...p, tickets: [...p.tickets, newTicket] } : p)
      }));
    }
  },

  updateTicket: async (projectId, ticketId, updates) => {
    const dbUpdates: any = {};
    if (updates.code !== undefined) dbUpdates.code = updates.code;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.memberId !== undefined) dbUpdates.member_id = updates.memberId;
    if (updates.groupId !== undefined) dbUpdates.group_id = updates.groupId || null;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.estimatedHours !== undefined) dbUpdates.estimated_hours = updates.estimatedHours;
    if (updates.folderPath !== undefined) dbUpdates.folder_path = updates.folderPath;
    if (updates.dependencies !== undefined) dbUpdates.dependencies = updates.dependencies;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    // Optimistic
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, tickets: p.tickets.map(t => t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t)
      } : p)
    }));

    await supabase.from('tickets').update(dbUpdates).eq('id', ticketId);
  },

  deleteTicket: async (projectId, ticketId) => {
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, tickets: p.tickets.filter(t => t.id !== ticketId)
      } : p)
    }));
    await supabase.from('tickets').delete().eq('id', ticketId);
  },

  deleteTickets: async (projectId, ticketIds) => {
    if (ticketIds.length === 0) return;
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, tickets: p.tickets.filter(t => !ticketIds.includes(t.id))
      } : p)
    }));
    await supabase.from('tickets').delete().in('id', ticketIds);
  },

  deleteGroupWithTickets: async (projectId, groupId) => {
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p,
        groups: p.groups.filter(g => g.id !== groupId),
        tickets: p.tickets.filter(t => t.groupId !== groupId),
      } : p)
    }));
    await supabase.from('tickets').delete().eq('group_id', groupId);
    await supabase.from('ticket_groups').delete().eq('id', groupId);
  },

  importTickets: async (projectId, tickets) => {
    const inserts = tickets.map(t => ({
      code: t.code, name: t.name, description: t.description,
      member_id: t.memberId, project_id: projectId,
      group_id: t.groupId || null, priority: t.priority, status: t.status,
      estimated_hours: t.estimatedHours, folder_path: t.folderPath,
      dependencies: t.dependencies || [], tags: t.tags || [], notes: t.notes,
    }));

    const { data, error } = await supabase.from('tickets').insert(inserts).select();
    if (data) {
      const newTickets: Ticket[] = data.map(d => ({
        id: d.id, code: d.code, name: d.name, description: d.description,
        memberId: d.member_id, projectId: d.project_id, groupId: d.group_id || undefined,
        priority: d.priority, status: d.status,
        estimatedHours: d.estimated_hours ? Number(d.estimated_hours) : undefined,
        folderPath: d.folder_path || undefined, dependencies: d.dependencies || [],
        tags: d.tags || [], notes: d.notes || undefined,
        createdAt: d.created_at, updatedAt: d.updated_at,
      }));
      set(s => ({
        projects: s.projects.map(p => p.id === projectId ? { ...p, tickets: [...p.tickets, ...newTickets] } : p)
      }));
    }
  },

  addGroup: async (projectId, group) => {
    const { data } = await supabase.from('ticket_groups').insert({
      project_id: projectId, label: group.label, sort_order: group.order,
      description: group.description, color: group.color,
    }).select().single();

    if (data) {
      set(s => ({
        projects: s.projects.map(p => p.id === projectId ? {
          ...p, groups: [...p.groups, {
            id: data.id, projectId: data.project_id, label: data.label,
            description: data.description, color: data.color, order: data.sort_order,
          }]
        } : p)
      }));
    }
  },

  updateGroup: async (projectId, groupId, updates) => {
    const dbUpdates: any = {};
    if (updates.label) dbUpdates.label = updates.label;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.order !== undefined) dbUpdates.sort_order = updates.order;

    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, groups: p.groups.map(g => g.id === groupId ? { ...g, ...updates } : g)
      } : p)
    }));

    await supabase.from('ticket_groups').update(dbUpdates).eq('id', groupId);
  },

  deleteGroup: async (projectId, groupId) => {
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p,
        groups: p.groups.filter(g => g.id !== groupId),
        tickets: p.tickets.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t),
      } : p)
    }));

    // Unlink tickets first, then delete group
    await supabase.from('tickets').update({ group_id: null }).eq('group_id', groupId);
    await supabase.from('ticket_groups').delete().eq('id', groupId);
  },

  addDocument: async (projectId, doc) => {
    const { data } = await supabase.from('project_documents').insert({
      project_id: projectId, name: doc.name, doc_type: doc.type,
      size: doc.size, data_url: doc.dataUrl, url: doc.url,
    }).select().single();

    if (data) {
      set(s => ({
        projects: s.projects.map(p => p.id === projectId ? {
          ...p, documents: [...p.documents, {
            id: data.id, name: data.name, type: data.doc_type as any,
            uploadedAt: data.uploaded_at, size: data.size, dataUrl: data.data_url || undefined,
            url: data.url || undefined,
          }]
        } : p)
      }));
    }
  },

  removeDocument: async (projectId, docId) => {
    set(s => ({
      projects: s.projects.map(p => p.id === projectId ? {
        ...p, documents: p.documents.filter(d => d.id !== docId)
      } : p)
    }));
    await supabase.from('project_documents').delete().eq('id', docId);
  },

  setActiveProject: (id) => set({ activeProjectId: id }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
}));
