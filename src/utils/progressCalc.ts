import { Project } from '../store/types';

export function getProjectProgress(project: Project) {
  const total = project.totalTasksOverride || project.tickets.length;
  const done = project.tickets.filter(t => t.status === 'done').length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percentage };
}

export function getMemberProgress(project: Project, memberId: string) {
  const memberTickets = project.tickets.filter(t => t.memberId === memberId);
  const total = memberTickets.length;
  const done = memberTickets.filter(t => t.status === 'done').length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percentage };
}

export function getGroupProgress(project: Project, groupId: string) {
  const groupTickets = project.tickets.filter(t => t.groupId === groupId);
  const total = groupTickets.length;
  const done = groupTickets.filter(t => t.status === 'done').length;
  const totalHours = groupTickets.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percentage, totalHours };
}
