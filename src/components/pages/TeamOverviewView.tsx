import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useNavigate } from 'react-router-dom';
import TopBar from '../layout/TopBar';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import NexusModal from '../nexus-ui/NexusModal';
import { Users, FolderOpen, CheckCircle2, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface AggregatedMember {
  name: string;
  color: string;
  roles: string[];
  projects: { id: string; name: string; color: string; memberId: string }[];
  totalTickets: number;
  doneTickets: number;
  totalHours: number;
}

const MEMBER_COLORS = ['#60a5fa', '#f472b6', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#c084fc'];

const TeamOverviewView: React.FC = () => {
  const { projects, addMember, removeMember, loading } = useProjectStore();
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AggregatedMember | null>(null);
  const [form, setForm] = useState({ name: '', role: '', responsibilities: '', color: MEMBER_COLORS[0] });
  // Aggregate members across all projects by name
  const memberMap = new Map<string, AggregatedMember>();
  projects.forEach(project => {
    project.members.forEach(member => {
      const existing = memberMap.get(member.name);
      const memberTickets = project.tickets.filter(t => t.memberId === member.id);
      const done = memberTickets.filter(t => t.status === 'done').length;
      const hours = memberTickets.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);

      if (existing) {
        if (!existing.roles.includes(member.role)) existing.roles.push(member.role);
        existing.projects.push({ id: project.id, name: project.name, color: project.color });
        existing.totalTickets += memberTickets.length;
        existing.doneTickets += done;
        existing.totalHours += hours;
      } else {
        memberMap.set(member.name, {
          name: member.name,
          color: member.color,
          roles: [member.role],
          projects: [{ id: project.id, name: project.name, color: project.color }],
          totalTickets: memberTickets.length,
          doneTickets: done,
          totalHours: hours,
        });
      }
    });
  });

  const members = Array.from(memberMap.values()).sort((a, b) => b.totalTickets - a.totalTickets);
  const totalMembers = members.length;
  const totalTickets = members.reduce((s, m) => s + m.totalTickets, 0);
  const totalDone = members.reduce((s, m) => s + m.doneTickets, 0);
  const totalHours = members.reduce((s, m) => s + m.totalHours, 0);

  const handleAddMember = () => {
    if (!form.name.trim() || !form.role.trim()) return;
    projects.forEach(p => {
      addMember(p.id, { name: form.name, role: form.role, responsibilities: form.responsibilities, color: form.color });
    });
    toast.success(`${form.name} added to all ${projects.length} projects`);
    setForm({ name: '', role: '', responsibilities: '', color: MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)] });
    setAddOpen(false);
  };

  return (
    <div className="min-h-screen">
      <TopBar title="Team Overview" />
      <div className="p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-mono text-xl font-bold text-txt-primary">Team Overview</h1>
            <p className="text-xs text-txt-muted mt-1">All team members across {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold">
            <Plus size={16} /> Add Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Team Members', value: totalMembers, icon: Users, color: 'text-nexus-purple' },
            { label: 'Total Tickets', value: totalTickets, icon: FolderOpen, color: 'text-nexus-blue' },
            { label: 'Completed', value: totalDone, icon: CheckCircle2, color: 'text-nexus-green' },
            { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: 'text-nexus-orange' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface-card border border-brd-subtle rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs text-txt-muted">{stat.label}</span>
              </div>
              <span className="font-mono text-xl font-bold text-txt-primary">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Member cards */}
        <div className="space-y-3">
          {members.map(member => {
            const percentage = member.totalTickets > 0 ? Math.round((member.doneTickets / member.totalTickets) * 100) : 0;
            return (
              <div key={member.name} className="bg-surface-card border border-brd-subtle rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: member.color }}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-mono text-sm font-bold text-txt-primary">{member.name}</h3>
                      <p className="text-[11px] text-txt-muted mt-0.5">{member.roles.join(' · ')}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {member.projects.map(p => (
                          <button key={p.id} onClick={() => navigate(`/project/${p.id}`)}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] text-txt-secondary bg-surface-secondary rounded-md hover:text-primary transition-colors">
                            <FolderOpen size={10} style={{ color: p.color }} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-4 text-xs text-txt-muted">
                      <span>{member.doneTickets}/{member.totalTickets} tickets</span>
                      <span>{member.totalHours}h</span>
                    </div>
                    <div className="w-40">
                      <NexusProgressBar percentage={percentage} color={member.color} height={4} showLabel />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="text-center py-12 text-txt-muted text-sm">
              No team members yet. Add one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <NexusModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Team Member">
        <div className="space-y-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name *"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role (e.g. DEV-A, PM) *"
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
          <textarea value={form.responsibilities} onChange={e => setForm({ ...form, responsibilities: e.target.value })} placeholder="Responsibilities (optional)" rows={2}
            className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Color</label>
            <div className="flex gap-2">
              {MEMBER_COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={() => setAddOpen(false)} className="px-4 py-2 text-xs text-txt-secondary">Cancel</button>
            <button onClick={handleAddMember} disabled={!form.name.trim() || !form.role.trim() || projects.length === 0}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold disabled:opacity-50">Add to All Projects</button>
          </div>
        </div>
      </NexusModal>
    </div>
  );
};

export default TeamOverviewView;
