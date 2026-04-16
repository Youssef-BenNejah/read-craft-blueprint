import React, { useState } from 'react';
import NexusModal from '../nexus-ui/NexusModal';
import { useProjectStore } from '../../store/projectStore';
import { Ticket, TicketPriority, TicketStatus } from '../../store/types';
import { toast } from 'sonner';

const PRIORITIES: TicketPriority[] = ['blocker', 'critical', 'high', 'medium', 'low'];
const STATUSES: TicketStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

const priorityColors: Record<TicketPriority, string> = {
  blocker: 'bg-nexus-red/20 text-nexus-red border-nexus-red/30',
  critical: 'bg-nexus-orange/20 text-nexus-orange border-nexus-orange/30',
  high: 'bg-nexus-yellow/20 text-nexus-yellow border-nexus-yellow/30',
  medium: 'bg-nexus-blue/20 text-nexus-blue border-nexus-blue/30',
  low: 'bg-surface-card text-txt-muted border-brd-subtle',
};

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultMemberId?: string;
  defaultGroupId?: string;
  editTicket?: Ticket;
}

const CreateTicketModal: React.FC<Props> = ({ open, onClose, projectId, defaultMemberId, defaultGroupId, editTicket }) => {
  const { projects, addTicket, updateTicket, deleteTicket } = useProjectStore();
  const project = projects.find(p => p.id === projectId);

  const isEdit = !!editTicket;

  const getNextCode = (memberId: string) => {
    if (!project) return 'X-01';
    const member = project.members.find(m => m.id === memberId);
    if (!member) return 'X-01';
    const prefix = member.name[0].toUpperCase();
    const memberTickets = project.tickets.filter(t => t.code.startsWith(prefix + '-'));
    const maxNum = memberTickets.reduce((max, t) => {
      const num = parseInt(t.code.split('-')[1]);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return `${prefix}-${String(maxNum + 1).padStart(2, '0')}`;
  };

  const [code, setCode] = useState(editTicket?.code || (defaultMemberId ? getNextCode(defaultMemberId) : ''));
  const [name, setName] = useState(editTicket?.name || '');
  const [description, setDescription] = useState(editTicket?.description || '');
  const [memberId, setMemberId] = useState(editTicket?.memberId || defaultMemberId || project?.members[0]?.id || '');
  const [groupId, setGroupId] = useState(editTicket?.groupId || defaultGroupId || '');
  const [priority, setPriority] = useState<TicketPriority>(editTicket?.priority || 'medium');
  const [status, setStatus] = useState<TicketStatus>(editTicket?.status || 'todo');
  const [estimatedHours, setEstimatedHours] = useState(editTicket?.estimatedHours?.toString() || '');
  const [folderPath, setFolderPath] = useState(editTicket?.folderPath || '');
  const [depInput, setDepInput] = useState('');
  const [dependencies, setDependencies] = useState<string[]>(editTicket?.dependencies || []);
  const [subtasksTotal, setSubtasksTotal] = useState(editTicket?.subtasksTotal?.toString() || '');
  const [subtasksDone, setSubtasksDone] = useState(editTicket?.subtasksDone?.toString() || '');
  const [notes, setNotes] = useState(editTicket?.notes || '');

  if (!project) return null;

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;
    const now = new Date().toISOString();

    if (isEdit && editTicket) {
      updateTicket(projectId, editTicket.id, {
        code, name, description, memberId, groupId: groupId || undefined, priority, status,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        folderPath: folderPath || undefined,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        subtasksTotal: subtasksTotal ? Number(subtasksTotal) : undefined,
        subtasksDone: subtasksDone ? Number(subtasksDone) : undefined,
        notes: notes || undefined,
        completedAt: status === 'done' ? now : undefined,
      });
      toast.success('Ticket updated');
    } else {
      const ticket: Ticket = {
        id: crypto.randomUUID(), code, name, description, memberId, projectId,
        groupId: groupId || undefined, priority, status,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
        folderPath: folderPath || undefined,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        subtasksTotal: subtasksTotal ? Number(subtasksTotal) : undefined,
        subtasksDone: subtasksDone ? Number(subtasksDone) : undefined,
        notes: notes || undefined,
        createdAt: now, updatedAt: now,
      };
      addTicket(projectId, ticket);
      toast.success('Ticket created');
    }
    onClose();
  };

  const handleDelete = () => {
    if (editTicket && confirm('Delete this ticket?')) {
      deleteTicket(projectId, editTicket.id);
      toast.success('Ticket deleted');
      onClose();
    }
  };

  return (
    <NexusModal open={open} onClose={onClose} title={isEdit ? `✏️ Edit Ticket — ${editTicket?.code}` : '🎫 Create Ticket'} wide>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Ticket Code *</label>
            <input value={code} onChange={e => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm font-code text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Assigned Member *</label>
            <select value={memberId} onChange={e => { setMemberId(e.target.value); if (!isEdit) setCode(getNextCode(e.target.value)); }}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary">
              {project.members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">Ticket Name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Short title"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Detailed description..."
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">Group</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)}
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary">
            <option value="">Ungrouped</option>
            {project.groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">Priority</label>
          <div className="flex gap-1">
            {PRIORITIES.map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase border transition-all ${
                  priority === p ? priorityColors[p] + ' ring-1' : 'bg-surface-card text-txt-muted border-brd-subtle hover:border-brd-medium'
                }`}>{p}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">Status</label>
          <div className="flex gap-1">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-mono uppercase border transition-all ${
                  status === s ? 'bg-primary/20 text-primary border-primary/30 ring-1 ring-primary/30' : 'bg-surface-card text-txt-muted border-brd-subtle hover:border-brd-medium'
                }`}>{s.replace('_', ' ')}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-txt-secondary mb-1">⏱ Est. Hours</label>
            <input type="number" min="0" value={estimatedHours} onChange={e => setEstimatedHours(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Subtasks Done</label>
            <input type="number" min="0" value={subtasksDone} onChange={e => setSubtasksDone(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Subtasks Total</label>
            <input type="number" min="0" value={subtasksTotal} onChange={e => setSubtasksTotal(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">📁 Folder Path</label>
          <input value={folderPath} onChange={e => setFolderPath(e.target.value)} placeholder="e.g. auth/, domain/"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">↗ Dependencies</label>
          <div className="flex gap-2">
            <input value={depInput} onChange={e => setDepInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (depInput.trim()) { setDependencies([...dependencies, depInput.trim()]); setDepInput(''); } } }}
              placeholder="Ticket code, press Enter" className="flex-1 px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm font-code text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {dependencies.map(d => (
              <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-secondary text-xs font-code text-txt-secondary border border-brd-subtle">
                {d} <button onClick={() => setDependencies(dependencies.filter(x => x !== d))} className="text-txt-muted hover:text-nexus-red">×</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-txt-secondary mb-1">📝 Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Private notes..."
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-brd-subtle">
        <div>
          {isEdit && (
            <button onClick={handleDelete} className="px-4 py-2 text-xs text-nexus-red hover:bg-nexus-red/10 rounded-md transition-colors">
              Delete Ticket
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs text-txt-secondary hover:text-txt-primary">Cancel</button>
          <button onClick={handleSubmit} disabled={!name.trim() || !code.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold disabled:opacity-50">
            {isEdit ? 'Update Ticket' : 'Create Ticket'}
          </button>
        </div>
      </div>

      {isEdit && editTicket && (
        <div className="mt-3 text-[10px] text-txt-muted">
          Created: {new Date(editTicket.createdAt).toLocaleString()} · Updated: {new Date(editTicket.updatedAt).toLocaleString()}
        </div>
      )}
    </NexusModal>
  );
};

export default CreateTicketModal;
