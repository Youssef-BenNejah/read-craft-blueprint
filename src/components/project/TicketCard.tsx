import React, { useState } from 'react';
import { Ticket } from '../../store/types';
import { useProjectStore } from '../../store/projectStore';
import { PriorityBadge, StatusBadge } from '../nexus-ui/NexusBadge';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import { Clock, Folder, ArrowUpRight, Check, Square, CheckSquare, Download } from 'lucide-react';

interface Props {
  ticket: Ticket;
  projectId: string;
  memberColor: string;
  memberName: string;
  onEdit: () => void;
  selectMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const TicketCard: React.FC<Props> = ({ ticket, projectId, memberColor, memberName, onEdit, selectMode, selected, onToggleSelect }) => {
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

  const handleClick = () => {
    if (selectMode && onToggleSelect) {
      onToggleSelect(ticket.id);
    } else {
      onEdit();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/ticket-id', ticket.id);
    e.dataTransfer.setData('text/project-id', projectId);
    e.dataTransfer.setData('text/source-member-id', ticket.memberId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!selectMode}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`group relative rounded-lg border transition-colors duration-200 ${!selectMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${
        selected ? 'ring-2 ring-nexus-red border-nexus-red bg-nexus-red/5' :
        isDone ? 'bg-[hsl(142,69%,58%,0.04)] border-brd-subtle' :
        isBlocked ? 'bg-[hsl(0,91%,71%,0.04)] border-l-2 border-l-nexus-red border-brd-subtle' :
        'bg-surface-card border-brd-subtle hover:border-brd-medium hover:bg-surface-card-hover'
      }`}
    >
      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {selectMode && (
            <span className="flex-shrink-0 text-txt-muted">
              {selected ? <CheckSquare size={16} className="text-nexus-red" /> : <Square size={16} />}
            </span>
          )}
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

        {ticket.images && ticket.images.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-1">
            {ticket.images.slice(0, 4).map((url, i) => (
              <img key={i} src={url} alt="" className="w-12 h-12 object-cover rounded border border-brd-subtle" />
            ))}
            {ticket.images.length > 4 && (
              <span className="text-[10px] text-txt-muted self-end">+{ticket.images.length - 4}</span>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default TicketCard;
