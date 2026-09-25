import React from 'react';
import { ListChecks, CheckCircle2, XCircle, FlaskConical, Database, Plug, BookOpen, StickyNote, CalendarDays, Link2, Square, CheckSquare } from 'lucide-react';

interface Props {
  notes: string;
  onChange?: (next: string) => void;
}

const SECTION_STYLE: Record<string, { icon: React.ElementType; tone: string }> = {
  subtasks: { icon: ListChecks, tone: 'text-primary' },
  'acceptance criteria': { icon: CheckCircle2, tone: 'text-nexus-green' },
  'rejection criteria': { icon: XCircle, tone: 'text-nexus-red' },
  'test scenarios': { icon: FlaskConical, tone: 'text-nexus-yellow' },
  'data model': { icon: Database, tone: 'text-nexus-blue' },
  'api endpoints': { icon: Plug, tone: 'text-nexus-purple' },
  'reference notes': { icon: BookOpen, tone: 'text-txt-secondary' },
};

// Highlight path / endpoint / code-like tokens
const renderInline = (text: string): React.ReactNode[] =>
  text.split(/(`[^`]+`|(?:GET|POST|PUT|PATCH|DELETE)\s+\/\S+|\b[\w.-]*\/[\w./{}:-]+|\b\w+\(\))/g).map((part, i) => {
    if (!part) return null;
    if (i % 2 === 1) {
      return <code key={i} className="font-code text-[12px] px-1 py-0.5 rounded bg-surface-card-hover text-txt-primary border border-brd-subtle">{part.replace(/`/g, '')}</code>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });

const NotesView: React.FC<Props> = ({ notes, onChange }) => {
  const lines = notes.split('\n');
  const intro: { text: string; idx: number }[] = [];
  const sections: { title: string; items: { text: string; idx: number }[] }[] = [];
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;
    const h = line.match(/^#{1,4}\s+(.*)$/);
    if (h) { sections.push({ title: h[1], items: [] }); return; }
    (sections.length ? sections[sections.length - 1].items : intro).push({ text: line, idx });
  });

  const toggle = (idx: number) => {
    if (!onChange) return;
    const next = [...lines];
    next[idx] = next[idx].replace(/\[( |x)\]/, m => (m === '[x]' ? '[ ]' : '[x]'));
    onChange(next.join('\n'));
  };

  const metaLine = intro.find(l => /^Sprint:/i.test(l.text));
  const introText = intro.filter(l => l !== metaLine);

  return (
    <div className="space-y-3">
      {(introText.length > 0 || metaLine) && (
        <div className="rounded-lg border border-brd-subtle bg-surface-card p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-txt-muted"><StickyNote size={12} /> Overview</div>
          {introText.map(l => <p key={l.idx} className="text-sm text-txt-primary leading-relaxed">{renderInline(l.text)}</p>)}
          {metaLine && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metaLine.text.split('·').map((chunk, i) => {
                const [k, ...v] = chunk.split(':');
                const val = v.join(':').trim();
                const Icon = /ref/i.test(k) ? Link2 : CalendarDays;
                return (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md bg-surface-card-hover border border-brd-subtle text-txt-secondary">
                    <Icon size={11} />
                    {val ? <><span className="text-txt-muted">{k.trim()}</span><span className="font-code text-txt-primary">{val}</span></> : chunk.trim()}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {sections.map((s, si) => {
        const style = SECTION_STYLE[s.title.toLowerCase()] || { icon: BookOpen, tone: 'text-txt-secondary' };
        const Icon = style.icon;
        const checks = s.items.filter(it => /^-\s*\[( |x)\]/.test(it.text));
        const done = checks.filter(it => /\[x\]/.test(it.text)).length;
        return (
          <div key={si} className="rounded-lg border border-brd-subtle bg-surface-card p-3">
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-1.5 text-xs font-semibold ${style.tone}`}><Icon size={13} /> {s.title}</div>
              <span className="text-[10px] text-txt-muted font-code">{checks.length ? `${done}/${checks.length}` : s.items.length}</span>
            </div>
            <ul className="space-y-1.5">
              {s.items.map(it => {
                const cb = it.text.match(/^-\s*\[( |x)\]\s*(?:\d+\.\s*)?(.*)$/);
                if (cb) {
                  const checked = cb[1] === 'x';
                  return (
                    <li key={it.idx}>
                      <button type="button" onClick={() => toggle(it.idx)} className="w-full flex items-start gap-2 text-left text-sm group">
                        {checked ? <CheckSquare size={15} className="mt-0.5 flex-shrink-0 text-nexus-green" /> : <Square size={15} className="mt-0.5 flex-shrink-0 text-txt-muted group-hover:text-primary" />}
                        <span className={checked ? 'line-through text-txt-muted' : 'text-txt-primary'}>{renderInline(cb[2])}</span>
                      </button>
                    </li>
                  );
                }
                const text = it.text.replace(/^[-*]\s*/, '');
                return (
                  <li key={it.idx} className="flex items-start gap-2 text-sm text-txt-primary leading-relaxed">
                    <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-current ${style.tone}`} />
                    <span className="break-words min-w-0">{renderInline(text)}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default NotesView;
