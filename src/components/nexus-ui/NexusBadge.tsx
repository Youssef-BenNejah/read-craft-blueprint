import React from 'react';
import { TicketPriority, TicketStatus, ProjectStatus } from '../../store/types';

const priorityStyles: Record<TicketPriority, string> = {
  blocker: 'bg-[hsl(0,63%,14%)] text-nexus-red animate-pulse-badge',
  critical: 'bg-[hsl(30,100%,8%)] text-nexus-orange',
  high: 'bg-[hsl(48,50%,12%)] text-nexus-yellow',
  medium: 'bg-[hsl(222,33%,14%)] text-nexus-blue',
  low: 'bg-surface-card text-txt-muted',
};

const statusStyles: Record<TicketStatus, string> = {
  done: 'bg-[hsl(142,40%,12%)] text-nexus-green',
  in_progress: 'bg-[hsl(30,50%,12%)] text-nexus-orange',
  blocked: 'bg-[hsl(0,40%,12%)] text-nexus-red',
  todo: 'bg-surface-card text-txt-muted',
};

const projectStatusStyles: Record<ProjectStatus, string> = {
  not_started: 'bg-surface-card text-txt-muted',
  in_progress: 'bg-[hsl(30,50%,12%)] text-nexus-orange',
  completed: 'bg-[hsl(142,40%,12%)] text-nexus-green',
  on_hold: 'bg-[hsl(48,50%,12%)] text-nexus-yellow',
  cancelled: 'bg-[hsl(0,40%,12%)] text-nexus-red',
};

const projectStatusLabels: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${priorityStyles[priority]}`}>
    {priority === 'blocker' && <span className="w-1.5 h-1.5 rounded-full bg-nexus-red mr-1" />}
    {priority}
  </span>
);

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider ${statusStyles[status]}`}>
    {status.replace('_', ' ')}
  </span>
);

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${projectStatusStyles[status]}`}>
    {projectStatusLabels[status]}
  </span>
);
