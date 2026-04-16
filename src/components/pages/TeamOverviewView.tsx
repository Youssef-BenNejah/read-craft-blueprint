import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useNavigate } from 'react-router-dom';
import TopBar from '../layout/TopBar';
import { getProjectProgress, getMemberProgress } from '../../utils/progressCalc';
import NexusProgressBar from '../nexus-ui/NexusProgressBar';
import { Users, FolderOpen, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

interface AggregatedMember {
  name: string;
  color: string;
  roles: string[];
  projects: { id: string; name: string; color: string }[];
  totalTickets: number;
  doneTickets: number;
  totalHours: number;
}

const TeamOverviewView: React.FC = () => {
  const { projects, loading } = useProjectStore();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className="p-6 animate-fade-up">
        <div className="mb-6">
          <h1 className="font-mono text-xl font-bold text-txt-primary">Team Overview</h1>
          <p className="text-xs text-txt-muted mt-1">All team members across {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
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
              No team members yet. Create a project and add members to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamOverviewView;
