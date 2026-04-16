export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
export type TicketPriority = 'blocker' | 'critical' | 'high' | 'medium' | 'low';
export type TicketStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  avatarEmoji?: string;
  responsibilities: string;
  joinedAt: string;
}

export interface Ticket {
  id: string;
  code: string;
  name: string;
  description: string;
  memberId: string;
  projectId: string;
  groupId?: string;
  priority: TicketPriority;
  status: TicketStatus;
  estimatedHours?: number;
  folderPath?: string;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  notes?: string;
}

export interface TicketGroup {
  id: string;
  projectId: string;
  label: string;
  description?: string;
  color?: string;
  order: number;
  totalHours?: number;
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'md' | 'other';
  uploadedAt: string;
  size: number;
  dataUrl?: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  emoji?: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  members: TeamMember[];
  tickets: Ticket[];
  groups: TicketGroup[];
  documents: ProjectDocument[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  totalTasksOverride?: number;
}
