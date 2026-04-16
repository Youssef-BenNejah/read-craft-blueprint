import React, { useState } from 'react';
import NexusModal from '../nexus-ui/NexusModal';
import { useProjectStore } from '../../store/projectStore';
import { Project, TeamMember } from '../../store/types';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Rocket } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_COLORS = ['#4ade80','#60a5fa','#f87171','#fb923c','#c084fc','#22d3ee','#facc15','#f472b6','#a78bfa','#34d399','#fb7185','#94a3b8'];
const EMOJIS = ['🚀','🛠️','📱','💻','🎨','📊','🔬','🏗️','🎯','🧠','🔐','📡','⚡','🌐','📦','🎮'];

interface Props { open: boolean; onClose: () => void; }

const CreateProjectModal: React.FC<Props> = ({ open, onClose }) => {
  const { addProject } = useProjectStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🚀');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [members, setMembers] = useState<Omit<TeamMember, 'id' | 'joinedAt'>[]>([]);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', responsibilities: '', color: PRESET_COLORS[1], avatarEmoji: '💻' });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setStep(1); setName(''); setDescription(''); setEmoji('🚀'); setColor(PRESET_COLORS[0]);
    setTags([]); setTagInput(''); setStartDate(''); setEndDate(''); setMembers([]); setErrors({});
    setShowMemberForm(false);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 10) { setTags([...tags, t]); setTagInput(''); }
  };

  const addMember = () => {
    if (!memberForm.name || !memberForm.role) return;
    setMembers([...members, { ...memberForm }]);
    setMemberForm({ name: '', role: '', responsibilities: '', color: PRESET_COLORS[(members.length + 2) % PRESET_COLORS.length], avatarEmoji: '💻' });
    setShowMemberForm(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1 && name.length < 2) e.name = 'Name must be at least 2 characters';
    if (step === 2 && !startDate) e.startDate = 'Start date is required';
    if (step === 2 && !endDate) e.endDate = 'End date is required';
    if (step === 2 && startDate && endDate && new Date(endDate) <= new Date(startDate)) e.endDate = 'End date must be after start date';
    if (step === 3 && members.length === 0) e.members = 'At least 1 team member required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => { if (validate()) setStep(step + 1); };

  const handleCreate = () => {
    if (!validate()) return;
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(), name, description, color, emoji, status: 'not_started',
      startDate, endDate, tags,
      members: members.map(m => ({ ...m, id: crypto.randomUUID(), joinedAt: now })),
      tickets: [], groups: [], documents: [], createdAt: now, updatedAt: now,
    };
    addProject(project);
    toast.success(`Project '${name}' created successfully! 🚀`);
    reset();
    onClose();
    navigate(`/project/${project.id}`);
  };

  const duration = startDate && endDate ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <NexusModal open={open} onClose={() => { reset(); onClose(); }} title="✨ New Project" wide>
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-6">
        {['Basics', 'Timeline', 'Team', 'Documents'].map((s, i) => (
          <div key={s} className={`flex items-center gap-1 text-xs font-mono ${step === i + 1 ? 'text-primary' : step > i + 1 ? 'text-nexus-green' : 'text-txt-muted'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === i + 1 ? 'bg-primary text-primary-foreground' : step > i + 1 ? 'bg-nexus-green/20 text-nexus-green' : 'bg-surface-card'}`}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Project Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mobile App Redesign"
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary font-mono outline-none focus:border-primary transition-colors placeholder:text-txt-muted" />
            {errors.name && <p className="text-xs text-nexus-red mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, 300))} rows={3} placeholder="Brief description..."
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary transition-colors placeholder:text-txt-muted resize-none" />
            <p className="text-[10px] text-txt-muted text-right">{description.length}/300</p>
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-lg ${emoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface-card hover:bg-surface-card-hover'} transition-colors`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface-modal scale-110' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Tags</label>
            <div className="flex items-center gap-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                placeholder="Type and press Enter" className="flex-1 px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map(t => (
                <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-secondary text-xs text-txt-secondary border border-brd-subtle">
                  {t} <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-txt-muted hover:text-nexus-red">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Timeline */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-txt-secondary mb-1">Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary" />
            {errors.startDate && <p className="text-xs text-nexus-red mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-xs text-txt-secondary mb-1">End Date *</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary" />
            {errors.endDate && <p className="text-xs text-nexus-red mt-1">{errors.endDate}</p>}
          </div>
          {duration > 0 && <p className="text-sm text-txt-secondary">📅 Duration: <strong className="text-txt-primary">{duration} days</strong></p>}
        </div>
      )}

      {/* Step 3: Team */}
      {step === 3 && (
        <div className="space-y-4">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-surface-card border border-brd-subtle rounded-lg">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
              <span className="text-sm text-txt-primary font-medium">{m.name}</span>
              <span className="font-code text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-txt-muted">{m.role}</span>
              <button onClick={() => setMembers(members.filter((_, j) => j !== i))} className="ml-auto text-txt-muted hover:text-nexus-red"><X size={14} /></button>
            </div>
          ))}
          {errors.members && <p className="text-xs text-nexus-red">{errors.members}</p>}

          {showMemberForm ? (
            <div className="p-4 bg-surface-secondary border border-brd-subtle rounded-lg space-y-3">
              <input value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Member Name *"
                className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
              <input value={memberForm.role} onChange={e => setMemberForm({ ...memberForm, role: e.target.value })} placeholder="Role (e.g. DEV-A) *"
                className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted" />
              <textarea value={memberForm.responsibilities} onChange={e => setMemberForm({ ...memberForm, responsibilities: e.target.value })} placeholder="Responsibilities" rows={2}
                className="w-full px-3 py-2 bg-surface-card border border-brd-subtle rounded-md text-sm text-txt-primary outline-none focus:border-primary placeholder:text-txt-muted resize-none" />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setMemberForm({ ...memberForm, color: c })}
                    className={`w-5 h-5 rounded-full ${memberForm.color === c ? 'ring-2 ring-offset-1 ring-offset-surface-secondary' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addMember} className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold">Add Member</button>
                <button onClick={() => setShowMemberForm(false)} className="px-4 py-1.5 bg-surface-card text-txt-secondary rounded-md text-xs border border-brd-subtle">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowMemberForm(true)}
              className="flex items-center gap-2 px-4 py-2 border border-dashed border-brd-medium rounded-lg text-xs text-txt-secondary hover:text-primary hover:border-primary transition-colors w-full justify-center">
              <Plus size={14} /> Add Team Member
            </button>
          )}
        </div>
      )}

      {/* Step 4: Documents */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-brd-medium rounded-xl p-8 text-center">
            <p className="text-sm text-txt-secondary mb-1">Drop your project documents here, or click to browse</p>
            <p className="text-xs text-txt-muted">PDF, DOCX, TXT, MD — Documents are optional</p>
          </div>
          <p className="text-xs text-txt-muted text-center">You can add documents later from the project view</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-brd-subtle">
        <button onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-xs text-txt-secondary hover:text-txt-primary">Cancel</button>
        <div className="flex gap-2">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-4 py-2 bg-surface-card border border-brd-subtle rounded-md text-xs text-txt-secondary hover:text-txt-primary">← Back</button>
          )}
          {step < 4 ? (
            <button onClick={handleNext} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold">Next →</button>
          ) : (
            <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-semibold flex items-center gap-1">
              <Rocket size={14} /> Create Project
            </button>
          )}
        </div>
      </div>
    </NexusModal>
  );
};

export default CreateProjectModal;
