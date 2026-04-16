import { create } from 'zustand';
import { Project, TeamMember, Ticket, TicketGroup, ProjectDocument } from './types';
import { generateSeedData } from '../utils/seedData';

const STORAGE_KEY = 'nexuspm_v1';

function loadFromStorage(): Project[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch { /* corrupt data */ }
  return [];
}

function saveToStorage(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch { /* storage full */ }
}

interface AppState {
  projects: Project[];
  activeProjectId: string | null;
  sidebarCollapsed: boolean;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addMember: (projectId: string, member: TeamMember) => void;
  updateMember: (projectId: string, memberId: string, updates: Partial<TeamMember>) => void;
  removeMember: (projectId: string, memberId: string) => void;
  addTicket: (projectId: string, ticket: Ticket) => void;
  updateTicket: (projectId: string, ticketId: string, updates: Partial<Ticket>) => void;
  deleteTicket: (projectId: string, ticketId: string) => void;
  importTickets: (projectId: string, tickets: Ticket[]) => void;
  addGroup: (projectId: string, group: TicketGroup) => void;
  updateGroup: (projectId: string, groupId: string, updates: Partial<TicketGroup>) => void;
  deleteGroup: (projectId: string, groupId: string) => void;
  addDocument: (projectId: string, doc: ProjectDocument) => void;
  removeDocument: (projectId: string, docId: string) => void;
  setActiveProject: (id: string | null) => void;
  toggleSidebar: () => void;
}

const initialProjects = loadFromStorage();
const projects = initialProjects.length > 0 ? initialProjects : generateSeedData();
if (initialProjects.length === 0) saveToStorage(projects);

export const useProjectStore = create<AppState>((set, get) => ({
  projects,
  activeProjectId: null,
  sidebarCollapsed: false,

  addProject: (project) => set(s => {
    const next = [...s.projects, project];
    saveToStorage(next);
    return { projects: next };
  }),

  updateProject: (id, updates) => set(s => {
    const next = s.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  deleteProject: (id) => set(s => {
    const next = s.projects.filter(p => p.id !== id);
    saveToStorage(next);
    return { projects: next, activeProjectId: s.activeProjectId === id ? null : s.activeProjectId };
  }),

  addMember: (projectId, member) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, members: [...p.members, member] } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  updateMember: (projectId, memberId, updates) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, members: p.members.map(m => m.id === memberId ? { ...m, ...updates } : m) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  removeMember: (projectId, memberId) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, members: p.members.filter(m => m.id !== memberId) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  addTicket: (projectId, ticket) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, tickets: [...p.tickets, ticket] } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  updateTicket: (projectId, ticketId, updates) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, tickets: p.tickets.map(t => t.id === ticketId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  deleteTicket: (projectId, ticketId) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, tickets: p.tickets.filter(t => t.id !== ticketId) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  importTickets: (projectId, tickets) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, tickets: [...p.tickets, ...tickets] } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  addGroup: (projectId, group) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, groups: [...p.groups, group] } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  updateGroup: (projectId, groupId, updates) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, groups: p.groups.map(g => g.id === groupId ? { ...g, ...updates } : g) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  deleteGroup: (projectId, groupId) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? {
      ...p,
      groups: p.groups.filter(g => g.id !== groupId),
      tickets: p.tickets.map(t => t.groupId === groupId ? { ...t, groupId: undefined } : t),
    } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  addDocument: (projectId, doc) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, documents: [...p.documents, doc] } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  removeDocument: (projectId, docId) => set(s => {
    const next = s.projects.map(p => p.id === projectId ? { ...p, documents: p.documents.filter(d => d.id !== docId) } : p);
    saveToStorage(next);
    return { projects: next };
  }),

  setActiveProject: (id) => set({ activeProjectId: id }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
