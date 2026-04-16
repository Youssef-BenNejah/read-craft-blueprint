import { Project, Ticket, TeamMember, TicketGroup } from '../store/types';

function uid() { return crypto.randomUUID(); }
const now = new Date().toISOString();

export function generateSeedData(): Project[] {
  const projectId = uid();
  const memberA: TeamMember = { id: uid(), name: 'Alice', role: 'DEV-A', color: '#60a5fa', avatarEmoji: '💻', responsibilities: 'Frontend + API Integration', joinedAt: now };
  const memberB: TeamMember = { id: uid(), name: 'Bob', role: 'DEV-B', color: '#f87171', avatarEmoji: '🔧', responsibilities: 'Backend + Database', joinedAt: now };
  const memberC: TeamMember = { id: uid(), name: 'Carol', role: 'PM', color: '#c084fc', avatarEmoji: '📋', responsibilities: 'Project Management + QA', joinedAt: now };

  const group1: TicketGroup = { id: uid(), projectId, label: 'DAY 1 — SETUP', order: 1 };
  const group2: TicketGroup = { id: uid(), projectId, label: 'DAY 2 — CORE FEATURES', order: 2 };

  const tickets: Ticket[] = [
    { id: uid(), code: 'A-01', name: 'Project scaffolding & config', description: 'Set up the project structure, linting, CI/CD', memberId: memberA.id, projectId, groupId: group1.id, priority: 'high', status: 'done', estimatedHours: 2, folderPath: 'core/', createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'A-02', name: 'Design system implementation', description: 'Implement color tokens, typography, components', memberId: memberA.id, projectId, groupId: group1.id, priority: 'critical', status: 'done', estimatedHours: 3, folderPath: 'ui/', createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'A-03', name: 'Dashboard layout', description: 'Build the main dashboard with project cards', memberId: memberA.id, projectId, groupId: group2.id, priority: 'high', status: 'in_progress', estimatedHours: 4, folderPath: 'pages/', createdAt: now, updatedAt: now },
    { id: uid(), code: 'B-01', name: 'Database schema design', description: 'Design and implement the database schema', memberId: memberB.id, projectId, groupId: group1.id, priority: 'blocker', status: 'done', estimatedHours: 3, folderPath: 'db/', createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'B-02', name: 'API endpoints - auth', description: 'Authentication and authorization endpoints', memberId: memberB.id, projectId, groupId: group1.id, priority: 'critical', status: 'done', estimatedHours: 4, folderPath: 'auth/', dependencies: ['B-01'], createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'B-03', name: 'API endpoints - CRUD', description: 'Core CRUD operations for all entities', memberId: memberB.id, projectId, groupId: group2.id, priority: 'high', status: 'in_progress', estimatedHours: 6, folderPath: 'api/', dependencies: ['B-01', 'B-02'], createdAt: now, updatedAt: now },
    { id: uid(), code: 'B-04', name: 'Real-time websocket setup', description: 'Set up WebSocket connections for live updates', memberId: memberB.id, projectId, groupId: group2.id, priority: 'medium', status: 'todo', estimatedHours: 3, folderPath: 'ws/', createdAt: now, updatedAt: now },
    { id: uid(), code: 'C-01', name: 'Requirements document', description: 'Finalize and review all requirements', memberId: memberC.id, projectId, groupId: group1.id, priority: 'high', status: 'done', estimatedHours: 2, createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'C-02', name: 'Sprint planning', description: 'Plan sprints and assign tasks', memberId: memberC.id, projectId, groupId: group1.id, priority: 'medium', status: 'done', estimatedHours: 1, createdAt: now, updatedAt: now, completedAt: now },
    { id: uid(), code: 'C-03', name: 'QA test plan', description: 'Create comprehensive test plan', memberId: memberC.id, projectId, groupId: group2.id, priority: 'medium', status: 'todo', estimatedHours: 3, createdAt: now, updatedAt: now },
    { id: uid(), code: 'A-04', name: 'User auth flow UI', description: 'Login, register, forgot password screens', memberId: memberA.id, projectId, groupId: group2.id, priority: 'blocker', status: 'blocked', estimatedHours: 5, folderPath: 'auth/', dependencies: ['B-02'], createdAt: now, updatedAt: now },
  ];

  return [{
    id: projectId,
    name: 'Sample Project — App Launch',
    description: 'Demonstration project to showcase NEXUS PM features',
    color: '#4ade80',
    emoji: '🚀',
    status: 'in_progress',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    members: [memberA, memberB, memberC],
    tickets,
    groups: [group1, group2],
    documents: [],
    tags: ['frontend', 'backend', 'launch'],
    createdAt: now,
    updatedAt: now,
  }];
}
