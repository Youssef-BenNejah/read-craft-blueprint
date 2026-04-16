import React, { useState } from 'react';
import { Ticket } from '../../store/types';
import { useProjectStore } from '../../store/projectStore';
import { PriorityBadge, StatusBadge } from '../nexus-ui/NexusBadge';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import { Clock, Folder, ArrowUpRight, Check } from 'lucide-react';

interface Props {
  ticket: Ticket;
  projectId: string;
  memberColor: string;
  memberName: string;
  onEdit: () => void;
}

const TicketCard: React.FC<Props> = ({ ticket, projectId, memberColor, memberName, onEdit }) => {
  const { updateTicket } = useProjectStore();
  const [bursting, setBursting] = useState(false);
  const isDone = ticket.status === 'done';
  const isBlocked = ticket.status === 'blocked';

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBursting(true);
    setTimeout(() => setBursting(false), 300);
    const newStatus = isDone ? 'todo' : 'done';
    updateTicket(projectId, ticket.id, {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined,
    });
  };

  const subtaskProgress = ticket.subtasksTotal && ticket.subtasksTotal > 0
    ? Math.round(((ticket.subtasksDone || 0) / ticket.subtasksTotal) * 100) : null;

  return (
    <div
      onClick={onEdit}
      className={`group relative rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
        isDone ? 'bg-[hsl(142,69%,58%,0.04)] border-brd-subtle' :
        isBlocked ? 'bg-[hsl(0,91%,71%,0.04)] border-l-2 border-l-nexus-red border-brd-subtle' :
        'bg-surface-card border-brd-subtle hover:border-brd-medium hover:bg-surface-card-hover'
      }`}
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {/* Completion circle */}
          <button onClick={toggleDone}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              bursting ? 'animate-check-burst' : ''
            } ${isDone ? 'bg-nexus-green border-nexus-green' : 'border-brd-strong hover:border-primary'}`}>
            {isDone && <Check size={10} className="text-primary-foreground" />}
          </button>

          <span className="font-code text-xs font-semibold" style={{ color: memberColor }}>{ticket.code}</span>
          <span className="text-[10px] text-txt-muted">{memberName}</span>

          <div className="ml-auto flex items-center gap-1">
            <PriorityBadge priority={ticket.priority} />
            {ticket.status !== 'todo' && <StatusBadge status={ticket.status} />}
          </div>
        </div>

        {/* Title */}
        <p className={`text-sm mb-2 ${isDone ? 'line-through text-[hsl(var(--done-text))]' : 'text-txt-primary'}`}>
          {ticket.name}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-txt-muted mb-2 flex-wrap">
          {ticket.estimatedHours && (
            <span className="flex items-center gap-1"><Clock size={10} />{ticket.estimatedHours}h</span>
          )}
          {ticket.folderPath && (
            <span className="flex items-center gap-1"><Folder size={10} />{ticket.folderPath}</span>
          )}
          {ticket.dependencies && ticket.dependencies.length > 0 && (
            <span className="flex items-center gap-1"><ArrowUpRight size={10} />{ticket.dependencies.join(', ')}</span>
          )}
        </div>

        {/* Progress bar */}
        {subtaskProgress !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <NexusProgressBar percentage={subtaskProgress} color={memberColor} height={3} />
            </div>
            <span className="font-code text-[10px] text-txt-muted">{ticket.subtasksDone}/{ticket.subtasksTotal}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCard;
